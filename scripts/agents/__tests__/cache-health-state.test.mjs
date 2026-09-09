import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { PNG } from "pngjs";
import { createArtifactIndex, createRunState } from "../lib/scheduler.mjs";
import { fileEvidence, writeJson } from "../lib/common.mjs";

const repositoryRoot = path.resolve(import.meta.dirname, "../../..");

function runScript(script, args, cwd, env = process.env) {
  return spawnSync(process.execPath, [path.join(repositoryRoot, script), ...args], { cwd, env, encoding: "utf8" });
}

test("Stitch cache is reusable until evidence changes or refresh is explicit", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "bprc-cache-"));
  const source = path.join(root, "source.png");
  const png = new PNG({ width: 24, height: 40 });
  png.data.fill(255);
  fs.writeFileSync(source, PNG.sync.write(png));
  const targetArgs = ["--screen", "screen", "--project-id", "project", "--screen-id", "screen-id"];

  const store = runScript("scripts/stitch/cache.mjs", ["store", ...targetArgs, "--screenshot", source], root);
  assert.equal(store.status, 0, store.stderr || store.stdout);
  const hit = JSON.parse(runScript("scripts/stitch/cache.mjs", ["status", ...targetArgs], root).stdout);
  assert.equal(hit.hit, true);
  assert.equal(hit.reason, "fingerprint-valid");

  const refresh = JSON.parse(runScript("scripts/stitch/cache.mjs", ["status", ...targetArgs, "--refresh"], root).stdout);
  assert.equal(refresh.hit, false);
  assert.equal(refresh.reason, "refresh-requested");

  fs.appendFileSync(path.join(root, ".stitch/screen/reference.png"), "changed");
  const stale = JSON.parse(runScript("scripts/stitch/cache.mjs", ["status", ...targetArgs], root).stdout);
  assert.equal(stale.hit, false);
  assert.equal(stale.reason, "manifest-invalid");
});

test("RTK absence is an optional health fallback", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "bprc-health-"));
  const output = path.join(root, "health.json");
  const result = runScript("scripts/agents/agent-health.mjs", ["--out", output], root, { ...process.env, PATH: "/nonexistent" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const health = JSON.parse(fs.readFileSync(output, "utf8"));
  assert.equal(health.ok, true);
  assert.equal(health.capabilities.rtk.status, "unavailable");
  assert.equal(health.capabilities.rtk.reasonCode, "RTK_UNAVAILABLE");
});

test("workflow state rejects reuse of a visual verifier instance", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "bprc-state-"));
  fs.mkdirSync(path.join(root, "artifacts/stitch/screen"), { recursive: true });
  const indexPath = "artifacts/stitch/screen/index.json";
  const runPath = "artifacts/stitch/screen/run.json";
  const index = createArtifactIndex({ slug: "screen", projectId: "project", screenId: "screen-id" });
  const run = createRunState(index.screen, indexPath, {
    needsDesign: false,
    needsRepo: false,
    branch: "00",
    design: { reason: "fresh" },
    repository: { reason: "fresh" },
  });
  for (const taskId of ["health", "design", "repository", "implementation", "check"]) run.tasks[taskId].status = "done";
  run.tasks["visual-verification"].workerInstanceHistory = ["verifier-1"];
  writeJson(path.join(root, indexPath), index);
  writeJson(path.join(root, runPath), run);

  const repeated = runScript("scripts/agents/workflow-state.mjs", ["start", "--screen", "screen", "--task", "visual-verification", "--worker-instance", "verifier-1"], root);
  assert.notEqual(repeated.status, 0);
  assert.match(repeated.stdout, /Fresh visual verification/);

  const fresh = runScript("scripts/agents/workflow-state.mjs", ["start", "--screen", "screen", "--task", "visual-verification", "--worker-instance", "verifier-2"], root);
  assert.equal(fresh.status, 0, fresh.stderr || fresh.stdout);
});

test("serialized worker completion validates artifacts and updates the shared index", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "bprc-complete-"));
  const artifactRoot = "artifacts/stitch/screen";
  const indexPath = `${artifactRoot}/index.json`;
  const runPath = `${artifactRoot}/run.json`;
  fs.mkdirSync(path.join(root, ".stitch/screen"), { recursive: true });
  fs.mkdirSync(path.join(root, artifactRoot), { recursive: true });
  fs.writeFileSync(path.join(root, ".stitch/screen/reference.png"), "image");
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
  const designPath = `${artifactRoot}/design-contract.json`;
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
  const receiptPath = `${artifactRoot}/design-receipt.json`;
  writeJson(path.join(root, ".stitch/screen/manifest.json"), manifest);
  writeJson(path.join(root, designPath), design);
  writeJson(path.join(root, receiptPath), { schemaVersion: 2, artifactType: "WorkerReceipt", taskId: "design", status: "done", artifact: designPath, reasonCodes: [] });
  const index = createArtifactIndex({ slug: "screen", projectId: "project", screenId: "screen-id" });
  const run = createRunState(index.screen, indexPath, {
    needsDesign: true,
    needsRepo: true,
    branch: "11",
    design: { reason: "missing" },
    repository: { reason: "missing" },
  });
  run.tasks.health.status = "done";
  run.tasks.design.status = "running";
  run.tasks.design.activeWorkerInstance = "design-1";
  run.tasks.design.workerInstanceHistory = ["design-1"];
  run.tasks.design.attempts = 1;
  writeJson(path.join(root, indexPath), index);
  writeJson(path.join(root, runPath), run);

  const result = runScript("scripts/agents/workflow-state.mjs", ["complete", "--screen", "screen", "--task", "design", "--receipt", receiptPath], root);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const updated = JSON.parse(fs.readFileSync(path.join(root, indexPath), "utf8"));
  assert.equal(updated.artifacts.designContract, designPath);
  assert.equal(updated.artifacts.sourceManifest, ".stitch/screen/manifest.json");
  assert.equal(updated.fingerprints.stitch, manifest.sourceFingerprint);
});
