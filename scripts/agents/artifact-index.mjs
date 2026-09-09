#!/usr/bin/env node
import path from "node:path";
import { asArray, normalizePath, now, parseArgs, printJson, readJson, requiredArg, writeJson } from "./lib/common.mjs";
import { validateArtifact } from "./lib/artifact-validation.mjs";

const ARTIFACT_KEYS = new Set([
  "sourceManifest",
  "designContract",
  "designContractDiff",
  "repoContract",
  "implementation",
  "verification",
  "referenceScreenshot",
  "actualScreenshot",
  "comparison",
  "captureMetadata",
  "diffMetadata",
]);

try {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0];
  const screen = requiredArg(args, "screen");
  const indexPath = normalizePath(String(args.index ?? path.join("artifacts", "stitch", screen, "index.json")));
  let index;

  if (command === "init") {
    index = {
      schemaVersion: 2,
      artifactType: "ArtifactIndex",
      screen: { slug: screen, projectId: requiredArg(args, "project-id"), screenId: requiredArg(args, "screen-id") },
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
  } else if (command === "set") {
    index = readJson(indexPath);
    for (const artifact of asArray(args.artifact)) {
      const [key, ...rest] = artifact.split("=");
      if (!ARTIFACT_KEYS.has(key) || rest.length === 0) throw new Error("--artifact must be key=path for a supported artifact key");
      index.artifacts[key] = normalizePath(rest.join("="));
    }
    for (const fingerprint of asArray(args.fingerprint)) {
      const [key, ...rest] = fingerprint.split("=");
      if (!["stitch", "repository"].includes(key) || rest.length === 0) throw new Error("--fingerprint must be stitch=value or repository=value");
      index.fingerprints[key] = rest.join("=");
    }
    index.updatedAt = now();
  } else {
    throw new Error("Usage: artifact-index.mjs <init|set> --screen <slug> [arguments]");
  }

  const result = validateArtifact(index, { semantic: command === "set" });
  if (result.valid) writeJson(indexPath, index);
  printJson({ ok: result.valid, index: indexPath, errors: result.errors });
  if (!result.valid) process.exitCode = 1;
} catch (error) {
  printJson({ ok: false, reasonCode: "ARTIFACT_INVALID", error: error.message });
  process.exitCode = 1;
}
