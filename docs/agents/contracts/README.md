# V2 artifact contracts

These JSON Schemas are provider-neutral. Claude and Codex workers produce the same artifacts and compact WorkerReceipts; runtime model names and tool configuration never belong in design or repository contracts.

## Lifecycle

1. `StitchSourceManifest` records normalized cached source evidence and its fingerprint.
2. `DesignContract` records authoritative visual facts and optional verification hints.
3. `RepoContract` records architecture, narrow dependency freshness, risk, checks, and write ownership.
4. `ArtifactIndex` points to the current source, contracts, implementation, screenshots, comparison, and verification evidence.
5. `ImplementationResult` records scoped changes and deterministic checks.
6. `VerificationResult` records fresh functional and semantic visual judgment.
7. `WorkerReceipt` returns only status, reason codes, and artifact/index paths.
8. `RunState` records the deterministic DAG, attempts, worker-instance constraints, freshness, gates, and operational metrics.

`DesignContractDiff` is an iterative optimization; the current DesignContract remains authoritative. `RuntimeHealth` is deterministic preflight evidence.

Validate an artifact with:

```bash
node scripts/agents/validate-artifact.mjs <path>
```

Validation includes JSON Schema plus semantic checks for referenced paths, screen ownership, write scope, unresolved risk, verification evidence, and incompatible pass/done states.
