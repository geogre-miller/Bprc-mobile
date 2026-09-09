import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export const ARTIFACT_SCHEMA_VERSION = 2;

export const FAILURE_REASONS = Object.freeze([
  "DESIGN_UNCERTAINTY",
  "HIGH_RISK",
  "CRITICAL_RISK",
  "UNKNOWN_RISK",
  "WRITE_CONFLICT",
  "CHECK_FAILED",
  "VISUAL_MISMATCH",
  "MCP_UNAVAILABLE",
  "RTK_UNAVAILABLE",
  "BASELINE_FAILURE",
  "ARTIFACT_INVALID",
  "CAPABILITY_UNAVAILABLE",
  "RETRY_EXHAUSTED",
]);

export function parseArgs(argv) {
  const result = { _: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (!value.startsWith("--")) {
      result._.push(value);
      continue;
    }

    const equals = value.indexOf("=");
    const key = value.slice(2, equals === -1 ? undefined : equals);
    const next = equals === -1 ? argv[index + 1] : value.slice(equals + 1);
    const parsed = equals !== -1 || (next && !next.startsWith("--")) ? next : true;
    if (equals === -1 && parsed !== true) index += 1;

    if (Object.hasOwn(result, key)) {
      result[key] = Array.isArray(result[key]) ? [...result[key], parsed] : [result[key], parsed];
    } else {
      result[key] = parsed;
    }
  }
  return result;
}

export function requiredArg(args, name) {
  const value = args[name];
  if (value === undefined || value === true || value === "") {
    throw new Error(`Missing required argument --${name}`);
  }
  return String(value);
}

export function asArray(value) {
  if (value === undefined) return [];
  return Array.isArray(value) ? value.map(String) : [String(value)];
}

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function writeJson(file, value) {
  const absolute = path.resolve(file);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  const temporary = `${absolute}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`);
  fs.renameSync(temporary, absolute);
}

export function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function fileEvidence(file, root = process.cwd()) {
  const absolute = resolveInside(root, file);
  const buffer = fs.readFileSync(absolute);
  return {
    path: normalizePath(path.relative(root, absolute)),
    sha256: sha256(buffer),
    bytes: buffer.byteLength,
  };
}

export function fingerprintFiles(files, root = process.cwd()) {
  const normalized = [...new Set(files.map(normalizePath))].sort();
  const records = normalized.map((file) => {
    const absolute = resolveInside(root, file);
    if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) {
      throw new Error(`Fingerprint dependency does not exist: ${file}`);
    }
    return [file, sha256(fs.readFileSync(absolute))];
  });
  return sha256(stableStringify(records));
}

export function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function resolveInside(root, candidate) {
  const base = path.resolve(root);
  const absolute = path.resolve(base, candidate);
  if (absolute !== base && !absolute.startsWith(`${base}${path.sep}`)) {
    throw new Error(`Path escapes repository root: ${candidate}`);
  }
  return absolute;
}

export function normalizePath(value) {
  return String(value).replaceAll(path.sep, "/").replace(/^\.\//, "");
}

export function now() {
  return new Date().toISOString();
}

export function printJson(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}
