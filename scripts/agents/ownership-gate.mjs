#!/usr/bin/env node
import { parseArgs, printJson, readJson, requiredArg } from "./lib/common.mjs";
import { ownershipConflicts } from "./lib/scheduler.mjs";

try {
  const args = parseArgs(process.argv.slice(2));
  const data = readJson(requiredArg(args, "file"));
  const tasks = data.tasks ?? data;
  const conflicts = ownershipConflicts(tasks);
  printJson({ ok: conflicts.length === 0, conflicts, reasonCode: conflicts.length ? "WRITE_CONFLICT" : null });
  if (conflicts.length) process.exitCode = 1;
} catch (error) {
  printJson({ ok: false, reasonCode: "ARTIFACT_INVALID", error: error.message });
  process.exitCode = 1;
}
