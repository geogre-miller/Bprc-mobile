#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { asArray, now, parseArgs, printJson, writeJson } from "./lib/common.mjs";
import { validateArtifact } from "./lib/artifact-validation.mjs";

const root = process.cwd();
const args = parseArgs(process.argv.slice(2));
const required = new Set(asArray(args.require));

function run(command, commandArgs, timeout = 5000) {
  const result = spawnSync(command, commandArgs, { cwd: root, encoding: "utf8", timeout, env: process.env });
  return {
    ok: result.status === 0,
    status: result.status,
    stdout: (result.stdout ?? "").trim(),
    stderr: (result.stderr ?? "").trim(),
    error: result.error?.message ?? null,
  };
}

function binaryVersion(command, versionArgs = ["--version"]) {
  const result = run(command, versionArgs);
  return result.ok ? result.stdout.split("\n")[0] : null;
}

function capability(name, status, detail = null, version = null, reasonCode = null) {
  return { status, required: required.has(name), version, detail, reasonCode };
}

function checkStitch() {
  const registrations = [];
  const codex = run("codex", ["mcp", "list"], 7000);
  const codexLine = codex.stdout.split("\n").find((candidate) => /^stitch\s/i.test(candidate));
  if (codex.ok && codexLine) {
    registrations.push({ runtime: "codex", authenticated: !/not logged in|disabled|failed|error/i.test(codexLine), line: codexLine.replace(/\s+/g, " ").trim() });
  }
  const claude = run("claude", ["mcp", "get", "stitch"], 10_000);
  if (claude.ok) {
    const status = claude.stdout.split("\n").find((candidate) => /^\s*Status:/i.test(candidate));
    if (status) registrations.push({ runtime: "claude", authenticated: /connected/i.test(status), line: status.replace(/\s+/g, " ").trim() });
  }
  const available = registrations.find((entry) => entry.authenticated);
  if (available) return capability("stitch", "available", registrations.map((entry) => `${entry.runtime}: ${entry.line}`).join("; "));
  if (registrations.length) return capability("stitch", "unavailable", registrations.map((entry) => `${entry.runtime}: ${entry.line}`).join("; "), null, "MCP_UNAVAILABLE");
  return capability("stitch", "unknown", "No Stitch MCP registration was discoverable from runtime CLIs", null, "MCP_UNAVAILABLE");
}

function checkCodeGraph() {
  const result = run("codegraph", ["status", "--json", root]);
  if (!result.ok) return capability("codegraph", fs.existsSync(path.join(root, ".codegraph")) ? "unknown" : "unavailable", result.error ?? (result.stderr || "CodeGraph CLI unavailable"));
  try {
    const data = JSON.parse(result.stdout);
    const stale = data.index?.state !== "complete" || data.index?.reindexRecommended || Object.values(data.pendingChanges ?? {}).some((value) => value > 0) || Boolean(data.worktreeMismatch);
    return capability("codegraph", stale ? "stale" : "available", `files=${data.fileCount}; pending=${JSON.stringify(data.pendingChanges ?? {})}`, data.version ?? null);
  } catch {
    return capability("codegraph", "unknown", "CodeGraph returned non-JSON status", binaryVersion("codegraph"));
  }
}

function checkGitNexus() {
  const runner = path.join(root, ".gitnexus", "run.cjs");
  if (!fs.existsSync(runner)) return capability("gitnexus", "unavailable", "Project-local GitNexus runner is absent");
  const result = run(process.execPath, [runner, "status"], 12000);
  if (!result.ok) return capability("gitnexus", "unknown", result.error ?? (result.stderr || "GitNexus status failed"));
  const output = result.stdout.replace(/\u001b\[[0-9;]*m/g, "");
  const stale = /Status:\s*.*stale|re-run gitnexus analyze/i.test(output);
  const version = output.match(/GitNexus Status \(([^)]+)\)/)?.[1] ?? null;
  return capability("gitnexus", stale ? "stale" : "available", stale ? "Index is stale" : "Index is current", version);
}

function checkExpoDocs() {
  const result = run("curl", ["-L", "-I", "--max-time", "5", "--silent", "--show-error", "https://docs.expo.dev/versions/v57.0.0/"]);
  let configured = false;
  try {
    configured = fs.readFileSync(path.join(root, ".claude", "agents", "rn-ui-migrator.md"), "utf8").includes("mcp__expo__");
  } catch {
    configured = false;
  }
  if (result.ok) return capability("expoDocs", "available", configured ? "Expo SDK 57 docs reachable; Claude Expo MCP configured" : "Expo SDK 57 docs reachable", null);
  return capability("expoDocs", configured ? "unknown" : "unavailable", configured ? "Expo MCP configured but network reachability failed" : "Expo SDK 57 docs are not reachable", null, "CAPABILITY_UNAVAILABLE");
}

function checkBrowser() {
  let packageVersion = null;
  try {
    packageVersion = JSON.parse(fs.readFileSync(path.join(root, "node_modules", "playwright", "package.json"), "utf8")).version;
  } catch {
    // Package availability is optional.
  }
  const systemChrome = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ].find((candidate) => fs.existsSync(candidate));
  const pluginConfigured = (() => {
    try {
      return JSON.parse(fs.readFileSync(path.join(root, ".claude", "settings.json"), "utf8")).enabledPlugins?.["playwright@claude-plugins-official"] === true;
    } catch {
      return false;
    }
  })();
  const available = Boolean(packageVersion && (systemChrome || pluginConfigured));
  return capability("browser", available ? "available" : packageVersion || pluginConfigured ? "unknown" : "unavailable", `package=${packageVersion ?? "none"}; chrome=${systemChrome ?? "none"}; claudePlugin=${pluginConfigured}`, packageVersion, available ? null : "CAPABILITY_UNAVAILABLE");
}

function checkRtk() {
  const output = binaryVersion("rtk");
  const version = output?.match(/\d+(?:\.\d+){1,3}/)?.[0] ?? output;
  return capability("rtk", version ? "available" : "unavailable", version ? "Use only documented RTK command forms; raw fallback remains valid" : "Raw shell commands will be used", version, version ? null : "RTK_UNAVAILABLE");
}

const gitBranch = run("git", ["branch", "--show-current"]);
const gitHead = run("git", ["rev-parse", "HEAD"]);
const gitStatus = run("git", ["status", "--porcelain=v1"]);
let writable = false;
try {
  fs.accessSync(root, fs.constants.W_OK);
  writable = true;
} catch {
  writable = false;
}

const capabilities = {
  stitch: checkStitch(),
  codegraph: checkCodeGraph(),
  gitnexus: checkGitNexus(),
  expoDocs: checkExpoDocs(),
  browser: checkBrowser(),
  rtk: checkRtk(),
  repositoryWritable: capability("repositoryWritable", writable ? "available" : "unavailable", writable ? "Repository root is writable" : "Repository root is not writable", null, writable ? null : "CAPABILITY_UNAVAILABLE"),
};

const requiredFailures = [...required].filter((name) => !capabilities[name] || capabilities[name].status !== "available");
const report = {
  schemaVersion: 2,
  artifactType: "RuntimeHealth",
  checkedAt: now(),
  ok: requiredFailures.length === 0,
  required: [...required].sort(),
  requiredFailures,
  capabilities,
  repository: {
    root,
    writable,
    branch: gitBranch.ok ? gitBranch.stdout || null : null,
    head: gitHead.ok ? gitHead.stdout || null : null,
    status: gitStatus.ok && gitStatus.stdout ? gitStatus.stdout.split("\n") : [],
  },
};

const validation = validateArtifact(report, { semantic: false });
if (args.out && validation.valid) writeJson(String(args.out), report);
printJson(report);
if (!validation.valid) process.stderr.write(`${JSON.stringify({ reasonCode: "ARTIFACT_INVALID", errors: validation.errors })}\n`);
if (!report.ok || !validation.valid) process.exitCode = 1;
