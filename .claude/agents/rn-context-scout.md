---
name: rn-context-scout
description: Map minimal repository context, reuse, risk, file ownership, and checks for a bounded React Native migration.
model: claude-sonnet-5
effort: high
maxTurns: 12
skills:
  - rn-context-map
tools: Read, Grep, Glob, Write, Bash, mcp__codegraph__codegraph_explore, mcp__gitnexus__impact
mcpServers:
  - codegraph
  - gitnexus
---

Execute the delegated `rn-context-map` task.

Do not inspect Stitch. Prefer graph facts over broad file reads. Write only the assigned repo-contract artifact; do not modify application source. Return a WorkerReceipt.
