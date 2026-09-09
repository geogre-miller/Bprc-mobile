#!/usr/bin/env node
import { parseArgs, printJson, readJson, requiredArg } from "./lib/common.mjs";
import { validateArtifact } from "./lib/artifact-validation.mjs";

try {
  const args = parseArgs(process.argv.slice(2));
  const file = args.file ? requiredArg(args, "file") : args._[0];
  if (!file) throw new Error("Usage: validate-artifact.mjs <path> [--schema-only]");
  const result = validateArtifact(readJson(file), { semantic: args["schema-only"] !== true });
  printJson({ file, ...result });
  if (!result.valid) process.exitCode = 1;
} catch (error) {
  printJson({ valid: false, reasonCode: "ARTIFACT_INVALID", errors: [{ message: error.message }] });
  process.exitCode = 1;
}
