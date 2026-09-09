import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { validateArtifact, validateSchemaFiles } from "../lib/artifact-validation.mjs";

const repositoryRoot = path.resolve(import.meta.dirname, "../../..");

test("all V2 artifact schemas compile", () => {
  assert.deepEqual(validateSchemaFiles(repositoryRoot), { valid: true, count: 10 });
});

test("semantic validation rejects unresolved architectural risk", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "bprc-artifact-"));
  fs.writeFileSync(path.join(root, "owner.tsx"), "export default null;\n");
  const artifact = {
    schemaVersion: 2,
    artifactType: "RepoContract",
    screenOwner: "owner.tsx",
    repository: { fingerprint: "0".repeat(64), dependencies: ["owner.tsx"] },
    reuse: [],
    writeScope: ["owner.tsx"],
    checks: ["npm run typecheck"],
    risk: "unknown",
    riskReason: "Graph could not resolve callers",
    riskResolved: false,
  };
  const result = validateArtifact(artifact, { root, semantic: true });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.path === "risk"));
});

test("done receipts require a real artifact pointer", () => {
  const artifact = {
    schemaVersion: 2,
    artifactType: "WorkerReceipt",
    taskId: "design",
    status: "done",
    reasonCodes: [],
  };
  const result = validateArtifact(artifact, { root: repositoryRoot, semantic: true });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.path === "status"));
});
