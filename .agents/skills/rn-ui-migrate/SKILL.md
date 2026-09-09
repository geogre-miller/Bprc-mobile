---
name: rn-ui-migrate
description: Implement a bounded React Native screen from prepared design and repository contracts while preserving repository architecture.
---
When this skill is explicitly invoked in Codex, delegate the requested task to the `rn-ui-migrator` custom agent with fresh context. Do not execute the worker task in the parent orchestrator.

Pass only the bounded task arguments and relevant artifact paths. The worker must read this skill file as reference instructions directly; it must not recursively invoke `$rn-ui-migrate`.

Worker capability instructions:


Required inputs are artifact paths for the design contract, repo contract, and reference screenshot.

1. Read the contracts directly.
2. Read only source files needed by the repo contract and concrete dependencies encountered while implementing.
3. Never call Stitch MCP or rebuild the design specification.
4. Stay inside the contract's write scope.
5. Reuse repository primitives and Expo SDK 57 patterns.
6. Implement in this order: hierarchy -> geometry -> typography/tokens -> assets/icons/fonts -> interactions -> safe-area/scrolling/responsive behavior.
7. Do not split trivial font/icon work into additional agents.
8. Run scoped checks, then the required repository checks.
9. Write a concise `implementation.json` with changed files, checks, deviations, and blockers.
10. Return only a WorkerReceipt.

On repair, read the supplied verification artifact and change only listed deltas inside the correction scope.
