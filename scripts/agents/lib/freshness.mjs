import fs from "node:fs";
import { fingerprintFiles, readJson, resolveInside } from "./common.mjs";
import { validateArtifact } from "./artifact-validation.mjs";

export function computeArtifactFreshness(index, { root = process.cwd(), refresh = false } = {}) {
  const design = designFreshness(index, root, refresh);
  const repository = repoFreshness(index, root);
  const needsDesign = design.stale;
  const needsRepo = repository.stale;
  return {
    needsDesign,
    needsRepo,
    branch: `${needsDesign ? 1 : 0}${needsRepo ? 1 : 0}`,
    design,
    repository,
  };
}

function designFreshness(index, root, refresh) {
  if (refresh) return { stale: true, reason: "refresh-requested" };
  const manifestPath = index?.artifacts?.sourceManifest;
  const contractPath = index?.artifacts?.designContract;
  if (!manifestPath || !contractPath) return { stale: true, reason: "design-artifact-absent" };
  try {
    const manifestAbsolute = resolveInside(root, manifestPath);
    const contractAbsolute = resolveInside(root, contractPath);
    if (!fs.existsSync(manifestAbsolute) || !fs.existsSync(contractAbsolute)) return { stale: true, reason: "design-artifact-absent" };
    const manifest = readJson(manifestAbsolute);
    const contract = readJson(contractAbsolute);
    const manifestValidation = validateArtifact(manifest, { root, semantic: true });
    const contractValidation = validateArtifact(contract, { root, semantic: true });
    if (!manifestValidation.valid || !contractValidation.valid) return { stale: true, reason: "design-artifact-invalid" };
    return manifest.sourceFingerprint === contract.sourceFingerprint
      ? { stale: false, reason: "stitch-fingerprint-match", fingerprint: manifest.sourceFingerprint }
      : { stale: true, reason: "stitch-fingerprint-changed", fingerprint: manifest.sourceFingerprint };
  } catch {
    return { stale: true, reason: "design-artifact-unreadable" };
  }
}

function repoFreshness(index, root) {
  const contractPath = index?.artifacts?.repoContract;
  if (!contractPath) return { stale: true, reason: "repo-contract-absent" };
  try {
    const contractAbsolute = resolveInside(root, contractPath);
    if (!fs.existsSync(contractAbsolute)) return { stale: true, reason: "repo-contract-absent" };
    const contract = readJson(contractAbsolute);
    const validation = validateArtifact(contract, { root, semantic: true });
    if (!validation.valid) return { stale: true, reason: "repo-contract-invalid", errors: validation.errors };
    const fingerprint = fingerprintFiles(contract.repository.dependencies, root);
    return fingerprint === contract.repository.fingerprint
      ? { stale: false, reason: "repository-dependency-fingerprint-match", fingerprint }
      : { stale: true, reason: "repository-dependency-changed", fingerprint };
  } catch (error) {
    return { stale: true, reason: "repo-contract-unreadable", error: error.message };
  }
}
