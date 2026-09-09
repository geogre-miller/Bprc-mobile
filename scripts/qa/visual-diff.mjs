#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { now, parseArgs, printJson, requiredArg, writeJson } from "../agents/lib/common.mjs";

export function compareScreenshots(options) {
  const { reference, actual, diffOutput, comparisonOutput, metadata, threshold = 0.1, tileSize = 32, maxRegions = 12 } = options;
  const referencePng = PNG.sync.read(fs.readFileSync(reference));
  const actualPng = PNG.sync.read(fs.readFileSync(actual));
  if (referencePng.width !== actualPng.width || referencePng.height !== actualPng.height) {
    return failure("VISUAL_MISMATCH", "Reference and actual screenshots must have identical dimensions", {
      reference: { width: referencePng.width, height: referencePng.height },
      actual: { width: actualPng.width, height: actualPng.height },
    });
  }

  const { width, height } = referencePng;
  const diff = new PNG({ width, height });
  const mismatchPixels = pixelmatch(referencePng.data, actualPng.data, diff.data, width, height, {
    threshold,
    includeAA: false,
    diffColor: [255, 0, 0],
    aaColor: [255, 255, 0],
  });

  ensureParent(diffOutput);
  fs.writeFileSync(diffOutput, PNG.sync.write(diff));
  if (comparisonOutput) {
    const comparison = new PNG({ width: width * 3, height });
    PNG.bitblt(referencePng, comparison, 0, 0, width, height, 0, 0);
    PNG.bitblt(actualPng, comparison, 0, 0, width, height, width, 0);
    PNG.bitblt(diff, comparison, 0, 0, width, height, width * 2, 0);
    ensureParent(comparisonOutput);
    fs.writeFileSync(comparisonOutput, PNG.sync.write(comparison));
  }

  const result = {
    schemaVersion: 2,
    artifactType: "VisualDiffMetadata",
    generatedAt: now(),
    informationalOnly: true,
    note: "Pixel metrics guide the fresh visual verifier and are never the final pass/fail criterion.",
    dimensions: { width, height },
    mismatchPixels,
    mismatchRatio: mismatchPixels / (width * height),
    threshold,
    reference: normalize(reference),
    actual: normalize(actual),
    diff: normalize(diffOutput),
    comparison: comparisonOutput ? normalize(comparisonOutput) : null,
    candidateMismatchRegions: candidateRegions(diff, tileSize, maxRegions),
  };
  if (metadata) writeJson(metadata, result);
  return { ok: true, ...result };
}

function candidateRegions(diff, tileSize, maxRegions) {
  const tiles = [];
  for (let y = 0; y < diff.height; y += tileSize) {
    for (let x = 0; x < diff.width; x += tileSize) {
      const tileWidth = Math.min(tileSize, diff.width - x);
      const tileHeight = Math.min(tileSize, diff.height - y);
      let changedPixels = 0;
      for (let row = y; row < y + tileHeight; row += 1) {
        for (let column = x; column < x + tileWidth; column += 1) {
          const offset = (row * diff.width + column) * 4;
          if (diff.data[offset] === 255 && diff.data[offset + 1] === 0 && diff.data[offset + 2] === 0) changedPixels += 1;
        }
      }
      if (changedPixels > 0) tiles.push({ x, y, width: tileWidth, height: tileHeight, changedPixels });
    }
  }
  return tiles.sort((left, right) => right.changedPixels - left.changedPixels).slice(0, maxRegions);
}

function normalize(file) {
  return path.relative(process.cwd(), path.resolve(file)).replaceAll(path.sep, "/");
}

function ensureParent(file) {
  fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
}

function failure(reasonCode, error, details) {
  return { ok: false, reasonCode, error, details };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const result = compareScreenshots({
    reference: requiredArg(args, "reference"),
    actual: requiredArg(args, "actual"),
    diffOutput: requiredArg(args, "diff-out"),
    comparisonOutput: args["comparison-out"] ? String(args["comparison-out"]) : undefined,
    metadata: args.metadata ? String(args.metadata) : undefined,
    threshold: Number(args.threshold ?? 0.1),
    tileSize: Number(args["tile-size"] ?? 32),
    maxRegions: Number(args["max-regions"] ?? 12),
  });
  printJson(result);
  if (!result.ok) process.exitCode = 1;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
