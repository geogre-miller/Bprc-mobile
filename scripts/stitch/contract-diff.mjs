#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { parseArgs, printJson, readJson, requiredArg, stableStringify, writeJson } from "../agents/lib/common.mjs";
import { validateArtifact } from "../agents/lib/artifact-validation.mjs";

const IGNORED_PATHS = new Set(["generatedAt", "sourceFingerprint"]);

function walk(before, after, currentPath, output, limit) {
  if (output.length >= limit || stableStringify(before) === stableStringify(after)) return;
  if (currentPath && IGNORED_PATHS.has(currentPath)) return;
  const beforeObject = before && typeof before === "object";
  const afterObject = after && typeof after === "object";
  if (beforeObject && afterObject && Array.isArray(before) === Array.isArray(after)) {
    const keys = Array.isArray(before)
      ? [...Array(Math.max(before.length, after.length)).keys()].map(String)
      : [...new Set([...Object.keys(before), ...Object.keys(after)])].sort();
    for (const key of keys) {
      const nextPath = currentPath ? `${currentPath}.${key}` : key;
      walk(before[key], after[key], nextPath, output, limit);
      if (output.length >= limit) break;
    }
    return;
  }
  output.push({ path: currentPath || "$", from: before === undefined ? null : before, to: after === undefined ? null : after });
}

try {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0] ?? "diff";
  if (command === "snapshot") {
    const source = requiredArg(args, "contract");
    const output = requiredArg(args, "out");
    const contract = readJson(source);
    const validation = validateArtifact(contract, { semantic: true });
    if (!validation.valid || contract.artifactType !== "DesignContract") throw new Error(`Invalid DesignContract: ${JSON.stringify(validation.errors)}`);
    fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
    fs.copyFileSync(source, output);
    printJson({ ok: true, snapshot: output });
  } else if (command === "diff") {
    const before = readJson(requiredArg(args, "before"));
    const after = readJson(requiredArg(args, "after"));
    for (const [label, contract] of [["before", before], ["after", after]]) {
      const validation = validateArtifact(contract, { semantic: true });
      if (!validation.valid || contract.artifactType !== "DesignContract") throw new Error(`Invalid ${label} DesignContract: ${JSON.stringify(validation.errors)}`);
    }
    const limit = Number(args.limit ?? 200);
    const changed = [];
    walk(before, after, "", changed, limit);
    const result = {
      schemaVersion: 2,
      artifactType: "DesignContractDiff",
      fromFingerprint: before.sourceFingerprint,
      toFingerprint: after.sourceFingerprint,
      changed,
      truncated: changed.length >= limit,
    };
    const validation = validateArtifact(result, { semantic: false });
    if (!validation.valid) throw new Error(`Invalid DesignContractDiff: ${JSON.stringify(validation.errors)}`);
    if (args.out) writeJson(String(args.out), result);
    printJson(result);
  } else {
    throw new Error("Usage: contract-diff.mjs <snapshot|diff> [arguments]");
  }
} catch (error) {
  printJson({ ok: false, reasonCode: "ARTIFACT_INVALID", error: error.message });
  process.exitCode = 1;
}
