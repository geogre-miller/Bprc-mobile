---
name: rn-ui-migrate
description: Implement a bounded React Native screen from prepared design and repository contracts while preserving repository architecture.
---
When this skill is explicitly invoked in Codex, delegate the requested task to the `rn-ui-migrator` custom agent with fresh context. Do not execute the worker task in the parent orchestrator.

Pass only the bounded task arguments and relevant artifact paths. The worker must read this skill file as reference instructions directly; it must not recursively invoke `$rn-ui-migrate`.

Worker capability instructions:


Required inputs are artifact paths for the design contract, repo contract, and reference screenshot.

1. Read the contracts directly.
2. Confirm both inputs pass `validate-artifact.mjs` and the ownership gate allows the task.
3. Read only source files needed by the repo contract and concrete dependencies encountered while implementing.
4. Never call Stitch MCP or rebuild the design specification.
5. Stay inside the contract's write scope; shared registries are serialized.
6. Reuse repository primitives and Expo SDK 57 patterns.
7. Implement in this order: hierarchy -> geometry -> typography/tokens -> assets/icons/fonts -> interactions -> safe-area/scrolling/responsive behavior.
8. Do not split trivial font/icon work into additional agents.
9. Run scoped checks, then the required repository checks, using RTK only for supported commands when available.
10. Write and validate V2 `implementation.json` and return only a validated WorkerReceipt. The serialized completion gate updates `index.json`.

On deterministic-check or visual repair, resume this same worker instance, read only the supplied failure evidence, and change only the correction scope.
