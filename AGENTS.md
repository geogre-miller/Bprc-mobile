# Bprc Mobile — Codex entrypoint

Read `docs/agents/core.md` for durable repository rules.

For Stitch-to-React-Native migration, use the explicit workflow skill:

```text
$stitch-ui <screen-or-screen-id>
```

The skill protocol is in `docs/agents/workflows/stitch-ui.md`. Do not load the legacy Stitch workflow as a prerequisite.

Codex runtime policy:
- root orchestrator: GPT-6 Astra, low reasoning (`.codex/config.toml`)
- bounded workers: GPT-5.6 Luna, max reasoning (`.codex/agents/*.toml`)
- detailed worker state moves through artifacts/receipts, not conversation transcripts
- parallelize independent discovery; keep a single writer per file
- verify Expo SDK 57 APIs against exact versioned docs when uncertain

Available workflow skills remain aligned with Claude: `$stitch-ui`, `$stitch-inspect`, `$rn-context-map`, `$rn-ui-migrate`, `$visual-verify`, and `$agent-health`.

RTK policy: prefer documented RTK forms for supported Git, file inspection/search, diffs, and test runners when available. Do not prepend RTK to arbitrary commands, do not run RTK plus raw output by default, and do not double-prefix an auto-rewritten command. Fall back to raw commands when RTK is absent or exact evidence is required. RTK does not replace CodeGraph or GitNexus. Codex RTK integration is independent from Claude's hook and may be installed with `rtk init -g --codex` when supported by the installed version.
