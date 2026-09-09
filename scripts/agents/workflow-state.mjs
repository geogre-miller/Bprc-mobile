#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { normalizePath, now, parseArgs, printJson, readJson, requiredArg, resolveInside, writeJson } from "./lib/common.mjs";
import { validateArtifact } from "./lib/artifact-validation.mjs";
import { computeArtifactFreshness } from "./lib/freshness.mjs";
import { applyFreshness, createArtifactIndex, createRunState, finalGate, hydrateImplementationOwnership, planRun, retryDecision, updateMetrics } from "./lib/scheduler.mjs";

const root = process.cwd();

function persist(runPath, run) {
  updateMetrics(run);
  const validation = validateArtifact(run, { root, semantic: true });
  if (!validation.valid) throw new Error(`Run state invalid: ${JSON.stringify(validation.errors)}`);
  writeJson(runPath, run);
}

try {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0];
  const screen = requiredArg(args, "screen");
  const artifactRoot = path.join("artifacts", "stitch", screen);
  const runPath = String(args.run ?? path.join(artifactRoot, "run.json"));
  const indexPath = String(args.index ?? path.join(artifactRoot, "index.json"));

  if (command === "init") {
    const target = { slug: screen, projectId: requiredArg(args, "project-id"), screenId: requiredArg(args, "screen-id") };
    const index = fs.existsSync(indexPath) ? readJson(indexPath) : createArtifactIndex(target);
    const indexValidation = validateArtifact(index, { root, semantic: true });
    if (!indexValidation.valid || index.screen.slug !== target.slug || index.screen.projectId !== target.projectId || index.screen.screenId !== target.screenId) {
      throw new Error(`Artifact index is invalid or targets another screen: ${JSON.stringify(indexValidation.errors)}`);
    }
    if (!fs.existsSync(indexPath)) writeJson(indexPath, index);
    const freshness = computeArtifactFreshness(index, { root, refresh: args.refresh === true });
    const healthPath = args.health ? resolveInside(root, String(args.health)) : null;
    const health = healthPath && fs.existsSync(healthPath) ? readJson(healthPath) : null;
    if (health) {
      const healthValidation = validateArtifact(health, { root, semantic: false });
      if (!healthValidation.valid || health.ok !== true) throw new Error(`Runtime health preflight failed: ${JSON.stringify(healthValidation.errors)}`);
    }
    const run = applyFreshness(createRunState(target, indexPath, freshness, health?.capabilities ?? {}));
    hydrateImplementationOwnership(run, index, root);
    if (health) run.tasks.health.status = "done";
    persist(runPath, run);
    printJson({ ok: true, runPath, indexPath, freshness, plan: planRun(run) });
  } else {
    const run = readJson(runPath);
    const index = readJson(indexPath);
    hydrateImplementationOwnership(run, index, root);

    if (command === "plan") {
      printJson({ ok: true, runPath, state: run.state, ...planRun(run) });
    } else if (command === "start") {
      const taskId = requiredArg(args, "task");
      const plan = planRun(run);
      if (!plan.ready.includes(taskId)) throw new Error(`Task is not ready: ${taskId}`);
      const task = run.tasks[taskId];
      if (task.worker) {
        const workerInstance = requiredArg(args, "worker-instance");
        if (task.requiredWorkerInstance && task.requiredWorkerInstance !== workerInstance) {
          throw new Error(`Task ${taskId} must resume worker instance ${task.requiredWorkerInstance}`);
        }
        if (taskId === "visual-verification" && task.workerInstanceHistory.includes(workerInstance)) {
          throw new Error("Fresh visual verification requires a new --worker-instance");
        }
        if (taskId === "implementation" && run.corrections > 0 && task.workerInstanceHistory.length && task.workerInstanceHistory[0] !== workerInstance) {
          throw new Error(`UI repair must resume migrator instance ${task.workerInstanceHistory[0]}`);
        }
        task.activeWorkerInstance = workerInstance;
        if (!task.workerInstanceHistory.includes(workerInstance)) task.workerInstanceHistory.push(workerInstance);
      }
      task.status = "running";
      task.attempts += 1;
      if (task.worker) run.metrics.workerCount += 1;
      run.state = stateForTask(taskId);
      persist(runPath, run);
      printJson({ ok: true, taskId, state: run.state, ownership: run.tasks[taskId].ownership });
    } else if (command === "complete") {
      const taskId = requiredArg(args, "task");
      const task = run.tasks[taskId];
      if (!task) throw new Error(`Unknown task: ${taskId}`);
      if (task.status !== "running") throw new Error(`Task ${taskId} is not running`);
      if (args.receipt) {
        const receiptPath = String(args.receipt);
        const receipt = readJson(resolveInside(root, receiptPath));
        const validation = validateArtifact(receipt, { root, semantic: true });
        const artifactErrors = validateReceiptArtifacts(receipt, taskId);
        if (!validation.valid || receipt.taskId !== taskId || artifactErrors.length) {
          printJson({
            ok: false,
            taskId,
            action: "correct-artifact",
            sameWorker: task.activeWorkerInstance ?? task.worker,
            reasonCode: "ARTIFACT_INVALID",
            errors: [...validation.errors, ...(receipt.taskId === taskId ? [] : [{ message: `Receipt taskId ${receipt.taskId} does not match ${taskId}` }]), ...artifactErrors],
          });
          process.exitCode = 1;
          process.exit();
        }
        task.receipt = receiptPath;
        task.status = receipt.status === "done" ? "done" : receipt.status === "blocked" ? "blocked" : "failed";
        task.reasonCodes = receipt.reasonCodes;
        if (task.status === "done" && receipt.artifact) {
          updateIndexForTask(index, indexPath, taskId, receipt.artifact);
          hydrateImplementationOwnership(run, index, root);
        }
      } else {
        const status = requiredArg(args, "status");
        if (!["done", "failed", "blocked"].includes(status)) throw new Error("--status must be done, failed, or blocked");
        task.status = status;
      }
      task.activeWorkerInstance = null;
      run.state = task.status === "blocked" ? "BLOCKED" : run.state;
      if (task.status === "done" && planRun(run).ready.includes("implementation")) run.state = "READY";
      persist(runPath, run);
      printJson({ ok: task.status === "done", taskId, status: task.status, plan: planRun(run) });
    } else if (command === "retry") {
      const taskId = requiredArg(args, "task");
      const reasonCode = requiredArg(args, "reason");
      const decision = retryDecision(run, taskId, reasonCode);
      run.reasonCodes = [...new Set([...run.reasonCodes, decision.reasonCode])];
      if (decision.action === "retry") run.tasks[taskId].status = "pending";
      if (decision.action === "retry" && decision.reuseWorkerInstance) {
        const retryTaskId = decision.taskId ?? taskId;
        const retryTask = run.tasks[retryTaskId];
        retryTask.status = "pending";
        retryTask.requiredWorkerInstance = retryTask.workerInstanceHistory[0] ?? null;
        if (reasonCode === "CHECK_FAILED") {
          run.tasks.check.status = "pending";
          run.tasks["visual-verification"].status = "pending";
        }
      }
      if (decision.action === "repair") {
        run.corrections = decision.correction;
        for (const id of ["implementation", "check", "visual-verification"]) run.tasks[id].status = "pending";
        run.tasks.implementation.requiredWorkerInstance = run.tasks.implementation.workerInstanceHistory[0] ?? null;
        run.state = "REPAIR";
      }
      if (decision.action === "block") run.state = "BLOCKED";
      if (decision.action === "replan") run.state = "REPLAN";
      persist(runPath, run);
      printJson({ ok: !["block", "replan"].includes(decision.action), decision });
    } else if (command === "metric") {
      const name = requiredArg(args, "name");
      const allowed = new Set(["stitchFetches", "stitchCacheHits", "artifactCacheHits", "rtkEstimatedTokensSaved"]);
      if (!allowed.has(name)) throw new Error(`Unsupported metric: ${name}`);
      const increment = Number(args.increment ?? 1);
      if (!Number.isInteger(increment) || increment < 0) throw new Error("--increment must be a non-negative integer");
      run.metrics[name] = (run.metrics[name] ?? 0) + increment;
      persist(runPath, run);
      printJson({ ok: true, metric: name, value: run.metrics[name] });
    } else if (command === "finalize") {
      const gate = finalGate(run, index, root);
      run.state = gate.pass ? "DONE" : "BLOCKED";
      if (gate.pass) run.metrics.completedAt = now();
      else run.reasonCodes = [...new Set([...run.reasonCodes, ...gate.errors.map((error) => error.reasonCode)])];
      persist(runPath, run);
      printJson({ ok: gate.pass, state: run.state, gate });
      if (!gate.pass) process.exitCode = 1;
    } else {
      throw new Error("Usage: workflow-state.mjs <init|plan|start|complete|retry|metric|finalize> --screen <slug> [arguments]");
    }
  }
} catch (error) {
  printJson({ ok: false, reasonCode: "ARTIFACT_INVALID", error: error.message });
  process.exitCode = 1;
}

function stateForTask(taskId) {
  return ({ health: "PREFLIGHT", design: "DISCOVER", repository: "DISCOVER", implementation: "IMPLEMENT", check: "CHECK", "visual-verification": "VISUAL_VERIFY" })[taskId];
}

function validateReceiptArtifacts(receipt, taskId) {
  const expectedTypes = { design: "DesignContract", repository: "RepoContract", implementation: "ImplementationResult", "visual-verification": "VerificationResult" };
  const candidates = [
    receipt.artifact ? { path: receipt.artifact, expectedType: expectedTypes[taskId] } : null,
    receipt.artifactIndex ? { path: receipt.artifactIndex, expectedType: "ArtifactIndex" } : null,
  ].filter(Boolean);
  const errors = [];
  for (const candidate of candidates) {
    try {
      const artifact = readJson(resolveInside(root, candidate.path));
      const result = validateArtifact(artifact, { root, semantic: true });
      if (!result.valid) errors.push(...result.errors.map((error) => ({ ...error, artifact: candidate.path })));
      if (candidate.expectedType && artifact.artifactType !== candidate.expectedType) errors.push({ artifact: candidate.path, message: `Expected ${candidate.expectedType}, received ${artifact.artifactType}` });
    } catch (error) {
      errors.push({ artifact: candidate.path, message: error.message });
    }
  }
  return errors;
}

function updateIndexForTask(index, indexPath, taskId, artifactPath) {
  const artifact = readJson(resolveInside(root, artifactPath));
  if (taskId === "design") {
    index.artifacts.designContract = artifactPath;
    index.artifacts.sourceManifest = artifact.reference.manifestPath ?? index.artifacts.sourceManifest;
    index.artifacts.referenceScreenshot = artifact.reference.screenshotPath;
    index.fingerprints.stitch = artifact.sourceFingerprint;
    const diffPath = normalizePath(path.join(path.dirname(artifactPath), "design-contract-diff.json"));
    if (fs.existsSync(resolveInside(root, diffPath))) index.artifacts.designContractDiff = diffPath;
  } else if (taskId === "repository") {
    index.artifacts.repoContract = artifactPath;
    index.fingerprints.repository = artifact.repository.fingerprint;
  } else if (taskId === "implementation") {
    index.artifacts.implementation = artifactPath;
  } else if (taskId === "visual-verification") {
    index.artifacts.verification = artifactPath;
    index.artifacts.actualScreenshot = artifact.actual ?? null;
    index.artifacts.comparison = artifact.comparison ?? null;
    const qaRoot = path.dirname(artifactPath);
    for (const [key, filename] of [["captureMetadata", "capture.json"], ["diffMetadata", "diff.json"]]) {
      const candidate = normalizePath(path.join(qaRoot, filename));
      if (fs.existsSync(resolveInside(root, candidate))) index.artifacts[key] = candidate;
    }
  }
  index.updatedAt = now();
  const validation = validateArtifact(index, { root, semantic: true });
  if (!validation.valid) throw new Error(`Artifact index update is invalid: ${JSON.stringify(validation.errors)}`);
  writeJson(indexPath, index);
}
