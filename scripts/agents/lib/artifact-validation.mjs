import fs from "node:fs";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import { fileEvidence, readJson, resolveInside } from "./common.mjs";

const CONTRACT_DIR = "docs/agents/contracts";
const DEFAULT_SCHEMA_ROOT = path.resolve(import.meta.dirname, "../../..");
const TYPE_TO_SCHEMA = Object.freeze({
  ArtifactIndex: "artifact-index.schema.json",
  DesignContract: "design-contract.schema.json",
  DesignContractDiff: "design-contract-diff.schema.json",
  ImplementationResult: "implementation-result.schema.json",
  RepoContract: "repo-contract.schema.json",
  RunState: "run-state.schema.json",
  RuntimeHealth: "runtime-health.schema.json",
  StitchSourceManifest: "stitch-manifest.schema.json",
  VerificationResult: "verification-result.schema.json",
  WorkerReceipt: "worker-receipt.schema.json",
});

export function createValidator(root = DEFAULT_SCHEMA_ROOT) {
  const ajv = new Ajv2020({ allErrors: true, strict: false, allowUnionTypes: true });
  const validators = {};
  for (const [type, schemaFile] of Object.entries(TYPE_TO_SCHEMA)) {
    const schema = readJson(path.join(root, CONTRACT_DIR, schemaFile));
    validators[type] = ajv.compile(schema);
  }
  return validators;
}

export function validateArtifact(data, { root = process.cwd(), schemaRoot = DEFAULT_SCHEMA_ROOT, semantic = true } = {}) {
  const validators = createValidator(schemaRoot);
  const validate = validators[data?.artifactType];
  if (!validate) {
    return { valid: false, errors: [{ kind: "schema", message: `Unknown artifactType: ${data?.artifactType ?? "missing"}` }] };
  }

  const validSchema = validate(data);
  const errors = validSchema ? [] : (validate.errors ?? []).map((error) => ({
    kind: "schema",
    path: error.instancePath,
    message: error.message,
  }));
  if (semantic) errors.push(...semanticErrors(data, root));
  return { valid: errors.length === 0, errors };
}

function semanticErrors(data, root) {
  const errors = [];
  const requirePath = (candidate, label) => {
    if (!candidate) return;
    try {
      const absolute = resolveInside(root, candidate);
      if (!fs.existsSync(absolute)) errors.push({ kind: "semantic", path: label, message: `Referenced path does not exist: ${candidate}` });
    } catch (error) {
      errors.push({ kind: "semantic", path: label, message: error.message });
    }
  };
  const readReferencedJson = (candidate) => {
    if (!candidate) return null;
    try {
      const absolute = resolveInside(root, candidate);
      return fs.existsSync(absolute) ? readJson(absolute) : null;
    } catch {
      return null;
    }
  };

  if (data.artifactType === "DesignContract") {
    requirePath(data.reference?.screenshotPath, "reference.screenshotPath");
    requirePath(data.reference?.htmlPath, "reference.htmlPath");
    requirePath(data.reference?.manifestPath, "reference.manifestPath");
  }

  if (data.artifactType === "RepoContract") {
    requirePath(data.screenOwner, "screenOwner");
    for (const dependency of data.repository?.dependencies ?? []) requirePath(dependency, "repository.dependencies");
    if (["high", "critical", "unknown"].includes(data.risk) && data.riskResolved !== true) {
      errors.push({ kind: "semantic", path: "risk", message: `${data.risk.toUpperCase()} risk requires riskResolved: true and corroborating riskReason` });
    }
  }

  if (data.artifactType === "WorkerReceipt") {
    requirePath(data.artifact, "artifact");
    requirePath(data.artifactIndex, "artifactIndex");
    if (data.status === "done" && !data.artifact && !data.artifactIndex) {
      errors.push({ kind: "semantic", path: "status", message: "A done receipt must point to an artifact or artifact index" });
    }
    if (data.status === "done" && (data.blockers?.length ?? 0) > 0) errors.push({ kind: "semantic", path: "blockers", message: "A done receipt cannot contain blockers" });
  }

  if (data.artifactType === "ImplementationResult") {
    for (const candidate of data.changedFiles ?? []) requirePath(candidate, "changedFiles");
    if (data.status === "done" && (data.checks ?? []).some((check) => check.status === "fail")) {
      errors.push({ kind: "semantic", path: "checks", message: "A done implementation cannot contain a failed check" });
    }
    if (data.status === "done" && (data.blockers?.length ?? 0) > 0) errors.push({ kind: "semantic", path: "blockers", message: "A done implementation cannot contain blockers" });
  }

  if (data.artifactType === "VerificationResult") {
    requirePath(data.reference, "reference");
    requirePath(data.actual, "actual");
    requirePath(data.comparison, "comparison");
    if (data.status === "pass" && (data.deltas?.length ?? 0) > 0) errors.push({ kind: "semantic", path: "deltas", message: "A passing verification cannot contain unresolved visual deltas" });
    if (data.status === "pass" && (data.reasonCodes?.length ?? 0) > 0) errors.push({ kind: "semantic", path: "reasonCodes", message: "A passing verification cannot contain failure reason codes" });
  }

  if (data.artifactType === "ArtifactIndex") {
    for (const [key, candidate] of Object.entries(data.artifacts ?? {})) requirePath(candidate, `artifacts.${key}`);
    const sourceManifest = readReferencedJson(data.artifacts?.sourceManifest);
    const designContract = readReferencedJson(data.artifacts?.designContract);
    const repoContract = readReferencedJson(data.artifacts?.repoContract);
    if (sourceManifest && data.fingerprints?.stitch !== sourceManifest.sourceFingerprint) errors.push({ kind: "semantic", path: "fingerprints.stitch", message: "Stitch fingerprint does not match source manifest" });
    if (designContract && data.fingerprints?.stitch !== designContract.sourceFingerprint) errors.push({ kind: "semantic", path: "fingerprints.stitch", message: "Stitch fingerprint does not match DesignContract" });
    if (repoContract && data.fingerprints?.repository !== repoContract.repository?.fingerprint) errors.push({ kind: "semantic", path: "fingerprints.repository", message: "Repository fingerprint does not match RepoContract" });
  }

  if (data.artifactType === "StitchSourceManifest") {
    for (const [label, evidence] of [["screenshot", data.screenshot], ["html", data.html], ...((data.assets ?? []).map((item, index) => [`assets.${index}`, item]))]) {
      if (!evidence) continue;
      requirePath(evidence.path, label);
      try {
        const current = fileEvidence(evidence.path, root);
        if (current.sha256 !== evidence.sha256) errors.push({ kind: "semantic", path: label, message: `Hash mismatch for ${evidence.path}` });
      } catch {
        // Missing/escaping paths are reported by requirePath.
      }
    }
  }

  if (data.artifactType === "RunState") requirePath(data.artifactIndex, "artifactIndex");
  return errors;
}

export function validateSchemaFiles(root = DEFAULT_SCHEMA_ROOT) {
  const validators = createValidator(root);
  return { valid: Object.keys(validators).length === Object.keys(TYPE_TO_SCHEMA).length, count: Object.keys(validators).length };
}

export { TYPE_TO_SCHEMA };
