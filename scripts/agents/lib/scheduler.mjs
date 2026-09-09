import fs from "node:fs";
import path from "node:path";
import { normalizePath, now, readJson, resolveInside } from "./common.mjs";
import { validateArtifact } from "./artifact-validation.mjs";

const TASK_ORDER = ["health", "design", "repository", "implementation", "check", "visual-verification"];

export function createArtifactIndex(target) {
  return {
    schemaVersion: 2,
    artifactType: "ArtifactIndex",
    screen: target,
    updatedAt: now(),
    artifacts: {
      sourceManifest: null,
      designContract: null,
      designContractDiff: null,
      repoContract: null,
      implementation: null,
      verification: null,
      referenceScreenshot: null,
      actualScreenshot: null,
      comparison: null,
      captureMetadata: null,
      diffMetadata: null,
    },
    fingerprints: { stitch: null, repository: null },
  };
}

export function createRunState(target, artifactIndex, freshness, toolAvailability = {}) {
  const startedAt = now();
  const task = (kind, dependencies, worker, ownership = { exclusive: [], shared: [] }, maxAttempts = 2) => ({
    kind,
    status: "pending",
    dependencies,
    worker,
    activeWorkerInstance: null,
    requiredWorkerInstance: null,
    workerInstanceHistory: [],
    depth: worker ? 1 : 0,
    attempts: 0,
    maxAttempts,
    ownership,
    receipt: null,
    reasonCodes: [],
  });
  const artifactRoot = normalizePath(path.join("artifacts", "stitch", target.slug));
  const sourceRoot = normalizePath(path.join(".stitch", target.slug));
  return {
    schemaVersion: 2,
    artifactType: "RunState",
    workflow: "stitch-ui-v2",
    target,
    state: "INIT",
    limits: { maxParallelWorkers: 3, maxDelegationDepth: 1, maxRepairLoops: 2 },
    tasks: {
      health: task("health", [], null, { exclusive: [], shared: [] }, 1),
      design: task("design", ["health"], "stitch-inspector", { exclusive: [sourceRoot, `${artifactRoot}/design-contract.json`], shared: [] }),
      repository: task("repository", ["health"], "rn-context-scout", { exclusive: [`${artifactRoot}/repo-contract.json`], shared: [] }),
      implementation: task("implementation", ["design", "repository"], "rn-ui-migrator", { exclusive: [], shared: [] }, 4),
      check: task("check", ["implementation"], null, { exclusive: [], shared: [] }, 3),
      "visual-verification": task("visual-verification", ["check"], "visual-verifier", { exclusive: [`${artifactRoot}/qa`], shared: [] }, 3),
    },
    freshness: {
      needsDesign: freshness.needsDesign,
      needsRepo: freshness.needsRepo,
      branch: freshness.branch,
      designReason: freshness.design.reason,
      repoReason: freshness.repository.reason,
    },
    artifactIndex,
    corrections: 0,
    metrics: {
      startedAt,
      updatedAt: startedAt,
      completedAt: null,
      wallTimeMs: 0,
      workerCount: 0,
      peakParallelism: 0,
      correctionLoops: 0,
      stitchFetches: 0,
      stitchCacheHits: freshness.needsDesign ? 0 : 1,
      artifactCacheHits: Number(!freshness.needsDesign) + Number(!freshness.needsRepo),
      toolAvailability,
      rtkEstimatedTokensSaved: null,
    },
    reasonCodes: [],
  };
}

export function applyFreshness(run) {
  if (!run.freshness.needsDesign) run.tasks.design.status = "skipped";
  if (!run.freshness.needsRepo) run.tasks.repository.status = "skipped";
  return run;
}

export function hydrateImplementationOwnership(run, index, root = process.cwd()) {
  const blockingReasons = new Set(["DESIGN_UNCERTAINTY", "HIGH_RISK", "CRITICAL_RISK", "UNKNOWN_RISK"]);
  run.tasks.implementation.reasonCodes = run.tasks.implementation.reasonCodes.filter((reason) => !blockingReasons.has(reason));
  const designPath = index?.artifacts?.designContract;
  if (designPath) {
    const designAbsolute = resolveInside(root, designPath);
    if (fs.existsSync(designAbsolute)) {
      const design = readJson(designAbsolute);
      if ((design.uncertainties?.length ?? 0) > 0 && design.uncertaintiesAccepted !== true) run.tasks.implementation.reasonCodes.push("DESIGN_UNCERTAINTY");
    }
  }
  const contractPath = index?.artifacts?.repoContract;
  if (!contractPath) return run;
  const contractAbsolute = resolveInside(root, contractPath);
  if (!fs.existsSync(contractAbsolute)) return run;
  const contract = readJson(contractAbsolute);
  if (["high", "critical", "unknown"].includes(contract.risk) && contract.riskResolved !== true) run.tasks.implementation.reasonCodes.push(`${contract.risk.toUpperCase()}_RISK`);
  const sharedPaths = new Set((contract.sharedEdits ?? []).filter((edit) => edit.mode === "additive").map((edit) => normalizePath(edit.path)));
  run.tasks.implementation.ownership = {
    exclusive: contract.writeScope.map(normalizePath).filter((candidate) => !sharedPaths.has(candidate)),
    shared: [...sharedPaths].map((candidate) => ({ path: candidate, mode: "additive" })),
  };
  return run;
}

export function ownershipConflicts(tasks) {
  const claims = [];
  const conflicts = [];
  for (const [taskId, task] of Object.entries(tasks)) {
    if (!["running", "candidate"].includes(task.status)) continue;
    for (const candidate of task.ownership?.exclusive ?? []) addClaim(normalizePath(candidate), taskId, "exclusive");
    for (const candidate of task.ownership?.shared ?? []) addClaim(normalizePath(candidate.path), taskId, "additive");
  }
  return conflicts;

  function addClaim(file, taskId, mode) {
    const existing = claims.find((claim) => claim.taskId !== taskId && pathsOverlap(claim.file, file));
    if (existing) conflicts.push({ path: commonClaimPath(existing.file, file), tasks: [existing.taskId, taskId], modes: [existing.mode, mode], reasonCode: "WRITE_CONFLICT" });
    else claims.push({ file, taskId, mode });
  }
}

function pathsOverlap(left, right) {
  return left === right || left.startsWith(`${right}/`) || right.startsWith(`${left}/`);
}

function commonClaimPath(left, right) {
  if (left === right) return left;
  return left.length < right.length ? left : right;
}

export function planRun(run) {
  const running = Object.entries(run.tasks).filter(([, task]) => task.status === "running");
  const slots = Math.max(0, run.limits.maxParallelWorkers - running.filter(([, task]) => task.worker).length);
  const gateBlocked = [];
  const implementation = run.tasks.implementation;
  if (implementation.status === "pending" && implementation.dependencies.every((dependency) => ["done", "skipped"].includes(run.tasks[dependency]?.status))) {
    if (implementation.ownership.exclusive.length + implementation.ownership.shared.length === 0) gateBlocked.push({ taskId: "implementation", reasonCode: "ARTIFACT_INVALID", message: "Implementation write scope is empty" });
    for (const reasonCode of implementation.reasonCodes) if (["DESIGN_UNCERTAINTY", "HIGH_RISK", "CRITICAL_RISK", "UNKNOWN_RISK"].includes(reasonCode)) gateBlocked.push({ taskId: "implementation", reasonCode });
  }
  const candidates = TASK_ORDER.filter((taskId) => {
    const task = run.tasks[taskId];
    if (task.status !== "pending") return false;
    if (!task.dependencies.every((dependency) => ["done", "skipped"].includes(run.tasks[dependency]?.status))) return false;
    if (taskId === "implementation" && (task.ownership.exclusive.length + task.ownership.shared.length === 0)) return false;
    if (taskId === "implementation" && gateBlocked.length) return false;
    return true;
  });

  const ready = [];
  const blocked = [...gateBlocked];
  for (const taskId of candidates) {
    const task = run.tasks[taskId];
    const simulated = Object.fromEntries([
      ...running,
      ...ready.map((id) => [id, { ...run.tasks[id], status: "candidate" }]),
      [taskId, { ...task, status: "candidate" }],
    ]);
    const conflicts = ownershipConflicts(simulated);
    if (conflicts.length) {
      blocked.push({ taskId, reasonCode: "WRITE_CONFLICT", conflicts });
      continue;
    }
    if (task.worker && ready.filter((id) => run.tasks[id].worker).length >= slots) continue;
    ready.push(taskId);
  }
  return { ready, blocked, running: running.map(([taskId]) => taskId), slots };
}

export function retryDecision(run, taskId, reasonCode) {
  const task = run.tasks[taskId];
  if (!task) return { action: "block", reasonCode: "ARTIFACT_INVALID", detail: `Unknown task ${taskId}` };
  if (["HIGH_RISK", "CRITICAL_RISK", "UNKNOWN_RISK"].includes(reasonCode)) return { action: "block", reasonCode };
  if (reasonCode === "RTK_UNAVAILABLE") return { action: "fallback", fallback: "raw-shell", reasonCode };
  if (reasonCode === "VISUAL_MISMATCH") {
    return run.corrections < run.limits.maxRepairLoops
      ? { action: "repair", worker: "rn-ui-migrator", reuseMigratorInstance: true, freshVerifierRequired: true, correction: run.corrections + 1, reasonCode }
      : { action: "replan", reasonCode: "RETRY_EXHAUSTED" };
  }
  if (reasonCode === "CHECK_FAILED") return { action: "retry", taskId: "implementation", worker: "rn-ui-migrator", reuseWorkerInstance: true, reasonCode };
  if (["MCP_UNAVAILABLE", "ARTIFACT_INVALID"].includes(reasonCode)) {
    return task.attempts < task.maxAttempts ? { action: "retry", worker: task.worker, reuseWorkerInstance: true, reasonCode } : { action: "block", reasonCode: "RETRY_EXHAUSTED" };
  }
  return { action: "block", reasonCode };
}

export function finalGate(run, index, root = process.cwd()) {
  const errors = [];
  for (const taskId of TASK_ORDER) {
    if (!["done", "skipped"].includes(run.tasks[taskId]?.status)) errors.push({ taskId, reasonCode: "CHECK_FAILED", message: "Task is not complete" });
  }
  if (Object.values(run.tasks).filter((task) => task.kind === "implementation").length !== 1) errors.push({ reasonCode: "WRITE_CONFLICT", message: "One screen must have exactly one implementation writer" });
  if (run.tasks.implementation.workerInstanceHistory.length !== 1) errors.push({ reasonCode: "WRITE_CONFLICT", message: "One screen must have exactly one implementation worker instance" });
  if (run.tasks["visual-verification"].workerInstanceHistory.length !== run.tasks["visual-verification"].attempts) errors.push({ reasonCode: "CHECK_FAILED", message: "Every visual verification attempt must use a fresh verifier instance" });
  const verificationPath = index?.artifacts?.verification;
  if (!verificationPath || !fs.existsSync(resolveInside(root, verificationPath))) errors.push({ reasonCode: "ARTIFACT_INVALID", message: "Verification artifact is missing" });
  else {
    const verification = readJson(resolveInside(root, verificationPath));
    const validation = validateArtifact(verification, { root, semantic: true });
    if (!validation.valid) errors.push({ reasonCode: "ARTIFACT_INVALID", message: "Verification artifact is invalid", errors: validation.errors });
    else if (verification.status !== "pass") errors.push({ reasonCode: "VISUAL_MISMATCH", message: `Verification status is ${verification.status}` });
  }
  return { pass: errors.length === 0, errors };
}

export function updateMetrics(run) {
  run.metrics.updatedAt = now();
  run.metrics.wallTimeMs = Math.max(0, Date.parse(run.metrics.updatedAt) - Date.parse(run.metrics.startedAt));
  const runningWorkers = Object.values(run.tasks).filter((task) => task.status === "running" && task.worker).length;
  run.metrics.peakParallelism = Math.max(run.metrics.peakParallelism, runningWorkers);
  run.metrics.correctionLoops = run.corrections;
  return run;
}
