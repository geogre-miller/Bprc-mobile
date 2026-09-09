#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { asArray, fileEvidence, normalizePath, now, parseArgs, printJson, readJson, requiredArg, sha256, stableStringify, writeJson } from "../agents/lib/common.mjs";
import { validateArtifact } from "../agents/lib/artifact-validation.mjs";

const root = process.cwd();

function imageDimensions(file) {
  const buffer = fs.readFileSync(file);
  if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < buffer.length) {
      if (buffer[offset] !== 0xff) { offset += 1; continue; }
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
        return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
      }
      offset += 2 + length;
    }
  }
  throw new Error(`Unsupported screenshot format: ${file}`);
}

function evidence(file, sourceUrl = null, includeDimensions = false) {
  const result = fileEvidence(file, root);
  if (includeDimensions) Object.assign(result, imageDimensions(path.resolve(root, result.path)));
  if (sourceUrl) result.sourceUrl = sourceUrl;
  return result;
}

function fingerprint(projectId, screenId, screenshot, html, assets) {
  return sha256(stableStringify({
    schemaVersion: 2,
    projectId,
    screenId,
    screenshot: { sha256: screenshot.sha256, width: screenshot.width, height: screenshot.height },
    html: html?.sha256 ?? null,
    assets: assets.map((asset) => asset.sha256).sort(),
  }));
}

function cacheStatus({ screen, projectId, screenId, refresh }) {
  const manifestPath = normalizePath(path.join(".stitch", screen, "manifest.json"));
  if (refresh) return { hit: false, reason: "refresh-requested", manifestPath, reasonCode: null };
  if (!fs.existsSync(manifestPath)) return { hit: false, reason: "manifest-absent", manifestPath, reasonCode: null };
  try {
    const manifest = readJson(manifestPath);
    if (manifest.projectId !== projectId || manifest.screenId !== screenId) {
      return { hit: false, reason: "target-mismatch", manifestPath, reasonCode: "ARTIFACT_INVALID" };
    }
    const validation = validateArtifact(manifest, { root, semantic: true });
    return validation.valid
      ? { hit: true, reason: "fingerprint-valid", manifestPath, sourceFingerprint: manifest.sourceFingerprint, screenshotPath: manifest.screenshot.path }
      : { hit: false, reason: "manifest-invalid", manifestPath, reasonCode: "ARTIFACT_INVALID", errors: validation.errors };
  } catch (error) {
    return { hit: false, reason: "manifest-unreadable", manifestPath, reasonCode: "ARTIFACT_INVALID", errors: [{ message: error.message }] };
  }
}

function copyEvidence(source, destination) {
  const sourceAbsolute = path.resolve(root, source);
  const destinationAbsolute = path.resolve(root, destination);
  fs.mkdirSync(path.dirname(destinationAbsolute), { recursive: true });
  if (sourceAbsolute !== destinationAbsolute) fs.copyFileSync(sourceAbsolute, destinationAbsolute);
  return normalizePath(path.relative(root, destinationAbsolute));
}

function fetchUrl(url, destination) {
  const destinationAbsolute = path.resolve(root, destination);
  fs.mkdirSync(path.dirname(destinationAbsolute), { recursive: true });
  const temporary = `${destinationAbsolute}.${process.pid}.download`;
  const result = spawnSync("curl", ["-L", "--fail", "--silent", "--show-error", "--output", temporary, url], { cwd: root, encoding: "utf8" });
  if (result.status !== 0) {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
    throw new Error(`Download failed for ${url}: ${(result.stderr || result.error?.message || "curl failed").trim()}`);
  }
  fs.renameSync(temporary, destinationAbsolute);
  return normalizePath(path.relative(root, destinationAbsolute));
}

function assetDestination(directory, source, index) {
  let extension = "";
  try {
    extension = path.extname(new URL(source).pathname).slice(0, 12);
  } catch {
    extension = path.extname(source).slice(0, 12);
  }
  return path.join(directory, "assets", `asset-${String(index + 1).padStart(2, "0")}${extension || ".bin"}`);
}

try {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0];
  const screen = requiredArg(args, "screen");
  const projectId = requiredArg(args, "project-id");
  const screenId = requiredArg(args, "screen-id");

  if (command === "status") {
    printJson(cacheStatus({ screen, projectId, screenId, refresh: args.refresh === true }));
  } else if (["store", "fetch"].includes(command)) {
    const directory = path.join(".stitch", screen);
    const assetUrls = asArray(args["asset-url"]);
    const screenshotUrl = args["screenshot-url"] ? String(args["screenshot-url"]) : null;
    const htmlUrl = args["html-url"] ? String(args["html-url"]) : null;
    const recordSourceUrls = args["record-source-urls"] === true;
    const screenshotPath = command === "fetch"
      ? fetchUrl(requiredArg(args, "screenshot-url"), path.join(directory, "reference.png"))
      : copyEvidence(requiredArg(args, "screenshot"), path.join(directory, "reference.png"));
    const htmlPath = command === "fetch"
      ? (htmlUrl ? fetchUrl(htmlUrl, path.join(directory, "source.html")) : null)
      : (args.html ? copyEvidence(String(args.html), path.join(directory, "source.html")) : null);
    const localAssets = asArray(args.asset);
    const assetPaths = command === "fetch"
      ? assetUrls.map((url, index) => fetchUrl(url, assetDestination(directory, url, index)))
      : localAssets.map((asset, index) => copyEvidence(asset, assetDestination(directory, asset, index)));
    const screenshot = evidence(screenshotPath, recordSourceUrls ? screenshotUrl : null, true);
    const html = htmlPath ? evidence(htmlPath, recordSourceUrls ? htmlUrl : null) : null;
    const assets = assetPaths.map((asset, index) => evidence(asset, recordSourceUrls ? (assetUrls[index] ?? null) : null));
    const manifest = {
      schemaVersion: 2,
      artifactType: "StitchSourceManifest",
      projectId,
      screenId,
      retrievedAt: now(),
      sourceFingerprint: fingerprint(projectId, screenId, screenshot, html, assets),
      screenshot,
      html,
      assets,
    };
    const manifestPath = normalizePath(path.join(directory, "manifest.json"));
    const validation = validateArtifact(manifest, { root, semantic: true });
    if (validation.valid) writeJson(manifestPath, manifest);
    printJson({ ok: validation.valid, manifestPath, sourceFingerprint: manifest.sourceFingerprint, screenshotPath, validation });
    if (!validation.valid) process.exitCode = 1;
  } else {
    throw new Error("Usage: cache.mjs <status|store|fetch> --screen <slug> --project-id <id> --screen-id <id> [--refresh]");
  }
} catch (error) {
  printJson({ ok: false, reasonCode: "ARTIFACT_INVALID", error: error.message });
  process.exitCode = 1;
}
