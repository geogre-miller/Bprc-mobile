#!/usr/bin/env node
import fs from "node:fs";

const required = [
  "docs/agents/core.md",
  "docs/agents/workflows/stitch-ui.md",
  "docs/agents/contracts/worker-receipt.schema.json",
  "docs/agents/contracts/design-contract.schema.json",
  "docs/agents/contracts/repo-contract.schema.json",
  "docs/agents/contracts/verification-result.schema.json",
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
];

let failed = false;
for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing: ${file}`);
    failed = true;
  }
}

for (const file of [
  "docs/agents/contracts/worker-receipt.schema.json",
  "docs/agents/contracts/design-contract.schema.json",
  "docs/agents/contracts/repo-contract.schema.json",
  "docs/agents/contracts/verification-result.schema.json",
  "docs/agents/contracts/run-state.schema.json",
]) {
  try {
    JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    console.error(`Invalid JSON: ${file}: ${error.message}`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log("Agent workflow structure is valid.");
