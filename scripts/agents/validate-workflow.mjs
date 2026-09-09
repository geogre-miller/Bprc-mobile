#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { TYPE_TO_SCHEMA, validateSchemaFiles } from "./lib/artifact-validation.mjs";

const required = [
  "docs/agents/core.md",
  "docs/agents/workflows/stitch-ui.md",
  "docs/agents/contracts/worker-receipt.schema.json",
  "docs/agents/contracts/design-contract.schema.json",
  "docs/agents/contracts/repo-contract.schema.json",
  "docs/agents/contracts/verification-result.schema.json",
  "docs/agents/contracts/run-state.schema.json",
  "docs/agents/contracts/artifact-index.schema.json",
  "docs/agents/contracts/stitch-manifest.schema.json",
  "docs/agents/contracts/implementation-result.schema.json",
  "docs/agents/contracts/design-contract-diff.schema.json",
  "docs/agents/contracts/runtime-health.schema.json",
  ".claude/agents/orchestrator.md",
  ".claude/agents/stitch-inspector.md",
  ".claude/agents/rn-context-scout.md",
  ".claude/agents/rn-ui-migrator.md",
  ".claude/agents/visual-verifier.md",
  ".codex/config.toml",
  ".codex/agents/stitch-inspector.toml",
  ".codex/agents/rn-context-scout.toml",
  ".codex/agents/rn-ui-migrator.toml",
  ".codex/agents/visual-verifier.toml",
  "scripts/agents/agent-health.mjs",
  "scripts/agents/validate-artifact.mjs",
  "scripts/agents/artifact-index.mjs",
  "scripts/agents/workflow-state.mjs",
  "scripts/agents/ownership-gate.mjs",
  "scripts/stitch/cache.mjs",
  "scripts/stitch/artifact-freshness.mjs",
  "scripts/stitch/repo-fingerprint.mjs",
  "scripts/stitch/contract-diff.mjs",
  "scripts/qa/capture-route.mjs",
  "scripts/qa/visual-diff.mjs",
];

const skillNames = ["stitch-ui", "stitch-inspect", "rn-context-map", "rn-ui-migrate", "visual-verify", "agent-health"];

let failed = false;
const errors = [];
function fail(message) {
  console.error(message);
  errors.push(message);
  failed = true;
}

for (const file of required) {
  if (!fs.existsSync(file)) {
    fail(`Missing: ${file}`);
  }
}

for (const file of Object.values(TYPE_TO_SCHEMA).map((name) => path.join("docs/agents/contracts", name))) {
  try {
    JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    fail(`Invalid JSON: ${file}: ${error.message}`);
  }
}

try {
  const schemaResult = validateSchemaFiles();
  if (!schemaResult.valid || schemaResult.count !== Object.keys(TYPE_TO_SCHEMA).length) fail(`JSON Schema compilation mismatch: ${JSON.stringify(schemaResult)}`);
} catch (error) {
  fail(`JSON Schema compilation failed: ${error.message}`);
}

for (const name of skillNames) {
  const claude = path.join(".claude/skills", name, "SKILL.md");
  const codex = path.join(".agents/skills", name, "SKILL.md");
  const metadata = path.join(".agents/skills", name, "agents/openai.yaml");
  for (const file of [claude, codex, metadata]) if (!fs.existsSync(file)) fail(`Missing aligned skill: ${file}`);
  if (fs.existsSync(claude) && !fs.readFileSync(claude, "utf8").startsWith(`---\nname: ${name}\n`)) fail(`Claude skill name mismatch: ${claude}`);
  if (fs.existsSync(codex) && !fs.readFileSync(codex, "utf8").startsWith(`---\nname: ${name}\n`)) fail(`Codex skill name mismatch: ${codex}`);
}

assertIncludes(".claude/agents/orchestrator.md", ["model: claude-opus-5", "effort: low"]);
for (const name of ["stitch-inspector", "rn-context-scout", "rn-ui-migrator", "visual-verifier"]) {
  assertIncludes(`.claude/agents/${name}.md`, ["model: claude-sonnet-5", "effort: high"]);
  assertIncludes(`.codex/agents/${name}.toml`, ['model = "gpt-5.6-luna"', 'model_reasoning_effort = "max"']);
}
assertIncludes(".codex/config.toml", ['model = "gpt-6-astra"', 'model_reasoning_effort = "low"', "max_concurrent_threads_per_session = 3", "max_depth = 1"]);

const claudeMigrator = fs.readFileSync(".claude/agents/rn-ui-migrator.md", "utf8");
if (/mcp__stitch|mcpServers:[\s\S]*?- stitch\b/.test(claudeMigrator)) fail("Claude RN migrator exposes Stitch MCP");
assertIncludes(".codex/agents/rn-ui-migrator.toml", ["[mcp_servers.stitch]", "enabled = false"]);

assertIncludes(".claude/skills/stitch-ui/SKILL.md", ["freshness (`00`, `01`, `10`, or `11`)", "compact WorkerReceipts"]);
assertIncludes(".agents/skills/stitch-ui/SKILL.md", ["freshness (`00`, `01`, `10`, or `11`)", "compact WorkerReceipts"]);
assertIncludes("docs/agents/workflows/stitch-ui.md", ["one implementation writer", "newly spawned verifier", "never another worker's transcript", "raw command", "`00`", "`01`", "`10`", "`11`"]);
assertIncludes("scripts/agents/lib/scheduler.mjs", ["maxParallelWorkers: 3", "maxDelegationDepth: 1", "maxRepairLoops: 2", "freshVerifierRequired: true"]);

function assertIncludes(file, needles) {
  if (!fs.existsSync(file)) return;
  const text = fs.readFileSync(file, "utf8");
  for (const needle of needles) if (!text.includes(needle)) fail(`Missing invariant in ${file}: ${needle}`);
}

if (failed) process.exit(1);
console.log(`Agent workflow V2 is valid (${skillNames.length} aligned skills, ${Object.keys(TYPE_TO_SCHEMA).length} compiled schemas).`);
