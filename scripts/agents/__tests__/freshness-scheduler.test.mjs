import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileEvidence, fingerprintFiles, writeJson } from "../lib/common.mjs";
import { computeArtifactFreshness } from "../lib/freshness.mjs";
import { createArtifactIndex, createRunState, ownershipConflicts, planRun, retryDecision } from "../lib/scheduler.mjs";

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "bprc-freshness-"));
  fs.mkdirSync(path.join(root, ".stitch", "screen"), { recursive: true });
  fs.mkdirSync(path.join(root, "artifacts", "stitch", "screen"), { recursive: true });
  fs.writeFileSync(path.join(root, ".stitch", "screen", "reference.png"), "image");
  fs.writeFileSync(path.join(root, "owner.tsx"), "export default null;\n");
  const screenshot = fileEvidence(".stitch/screen/reference.png", root);
  const manifest = {
    schemaVersion: 2,
    artifactType: "StitchSourceManifest",
    projectId: "project",
    screenId: "screen-id",
    retrievedAt: new Date().toISOString(),
    sourceFingerprint: "a".repeat(64),
    screenshot: { ...screenshot, width: 390, height: 844 },
    html: null,
    assets: [],
  };
  const design = {
    schemaVersion: 2,
    artifactType: "DesignContract",
    sourceFingerprint: manifest.sourceFingerprint,
    screen: { id: "screen-id", name: "Screen", slug: "screen" },
    layout: {},
    components: [],
    interactions: [],
    reference: { screenshotPath: screenshot.path, manifestPath: ".stitch/screen/manifest.json" },
    uncertainties: [],
  };
  const repo = {
    schemaVersion: 2,
    artifactType: "RepoContract",
    screenOwner: "owner.tsx",
    repository: { fingerprint: fingerprintFiles(["owner.tsx"], root), dependencies: ["owner.tsx"] },
    reuse: [],
    writeScope: ["owner.tsx"],
    checks: ["npm run typecheck"],
    risk: "low",
    riskResolved: true,
  };
  writeJson(path.join(root, ".stitch/screen/manifest.json"), manifest);
  writeJson(path.join(root, "artifacts/stitch/screen/design-contract.json"), design);
  writeJson(path.join(root, "artifacts/stitch/screen/repo-contract.json"), repo);
  const index = createArtifactIndex({ slug: "screen", projectId: "project", screenId: "screen-id" });
  index.artifacts.sourceManifest = ".stitch/screen/manifest.json";
  index.artifacts.designContract = "artifacts/stitch/screen/design-contract.json";
  index.artifacts.repoContract = "artifacts/stitch/screen/repo-contract.json";
  return { root, index };
}

test("freshness selects all four discovery branches", () => {
  const { root, index } = fixture();
  assert.equal(computeArtifactFreshness(index, { root }).branch, "00");

  fs.appendFileSync(path.join(root, "owner.tsx"), "// changed\n");
  assert.equal(computeArtifactFreshness(index, { root }).branch, "01");

  const restored = fixture();
  const design = JSON.parse(fs.readFileSync(path.join(restored.root, restored.index.artifacts.designContract), "utf8"));
  design.sourceFingerprint = "b".repeat(64);
  writeJson(path.join(restored.root, restored.index.artifacts.designContract), design);
  assert.equal(computeArtifactFreshness(restored.index, { root: restored.root }).branch, "10");

  fs.appendFileSync(path.join(restored.root, "owner.tsx"), "// changed\n");
  assert.equal(computeArtifactFreshness(restored.index, { root: restored.root }).branch, "11");
});

test("scheduler releases independent discovery tasks together", () => {
  const run = createRunState({ slug: "screen", projectId: "project", screenId: "screen-id" }, "index.json", {
    needsDesign: true,
    needsRepo: true,
    branch: "11",
    design: { reason: "missing" },
    repository: { reason: "missing" },
  });
  run.tasks.health.status = "done";
  assert.deepEqual(planRun(run).ready, ["design", "repository"]);
});

test("scheduler blocks implementation on unresolved design uncertainty", () => {
  const run = createRunState({ slug: "screen", projectId: "project", screenId: "screen-id" }, "index.json", {
    needsDesign: true,
    needsRepo: true,
    branch: "11",
    design: { reason: "missing" },
    repository: { reason: "missing" },
  });
  for (const taskId of ["health", "design", "repository"]) run.tasks[taskId].status = "done";
  run.tasks.implementation.ownership.exclusive = ["owner.tsx"];
  run.tasks.implementation.reasonCodes = ["DESIGN_UNCERTAINTY"];
  const plan = planRun(run);
  assert.deepEqual(plan.ready, []);
  assert.ok(plan.blocked.some((item) => item.reasonCode === "DESIGN_UNCERTAINTY"));
});

test("ownership gate serializes shared registry writes", () => {
  const conflicts = ownershipConflicts({
    first: { status: "running", ownership: { exclusive: ["app/routes.ts"], shared: [] } },
    second: { status: "candidate", ownership: { exclusive: [], shared: [{ path: "app/routes.ts", mode: "additive" }] } },
  });
  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].reasonCode, "WRITE_CONFLICT");
});

test("visual repair is bounded to two loops", () => {
  const run = createRunState({ slug: "screen", projectId: "project", screenId: "screen-id" }, "index.json", {
    needsDesign: true,
    needsRepo: true,
    branch: "11",
    design: { reason: "missing" },
    repository: { reason: "missing" },
  });
  assert.equal(retryDecision(run, "visual-verification", "VISUAL_MISMATCH").action, "repair");
  run.corrections = 2;
  assert.equal(retryDecision(run, "visual-verification", "VISUAL_MISMATCH").action, "replan");
});
