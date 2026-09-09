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
