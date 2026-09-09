#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { normalizePath, parseArgs, printJson, readJson, requiredArg } from "../agents/lib/common.mjs";
import { computeArtifactFreshness } from "../agents/lib/freshness.mjs";

const root = process.cwd();

try {
  const args = parseArgs(process.argv.slice(2));
  const screen = requiredArg(args, "screen");
  const indexPath = normalizePath(String(args.index ?? path.join("artifacts", "stitch", screen, "index.json")));
  const index = fs.existsSync(indexPath) ? readJson(indexPath) : null;
  const freshness = computeArtifactFreshness(index, { root, refresh: args.refresh === true });
  printJson({
    schemaVersion: 2,
    screen,
    indexPath,
    ...freshness,
  });
} catch (error) {
  printJson({ ok: false, reasonCode: "ARTIFACT_INVALID", error: error.message });
  process.exitCode = 1;
}
