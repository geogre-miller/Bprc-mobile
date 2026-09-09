#!/usr/bin/env node
import { asArray, fingerprintFiles, parseArgs, printJson, readJson, requiredArg, writeJson } from "../agents/lib/common.mjs";
import { validateArtifact } from "../agents/lib/artifact-validation.mjs";

try {
  const args = parseArgs(process.argv.slice(2));
  const contractPath = args.contract ? String(args.contract) : null;
  const contract = contractPath ? readJson(contractPath) : null;
  const dependencies = contract?.repository?.dependencies ?? asArray(args.file);
  if (dependencies.length === 0) throw new Error("Provide --contract or at least one --file dependency");
  const fingerprint = fingerprintFiles(dependencies);
  if (args.write === true) {
    if (!contractPath || !contract) throw new Error("--write requires --contract");
    contract.repository.fingerprint = fingerprint;
    const validation = validateArtifact(contract, { semantic: true });
    if (!validation.valid) throw new Error(`Updated RepoContract is invalid: ${JSON.stringify(validation.errors)}`);
    writeJson(contractPath, contract);
  }
  printJson({ ok: true, fingerprint, dependencies, updated: args.write === true ? contractPath : null });
} catch (error) {
  printJson({ ok: false, reasonCode: "ARTIFACT_INVALID", error: error.message });
  process.exitCode = 1;
}
