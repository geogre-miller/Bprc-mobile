# Bprc Mobile — Claude Code entrypoint

Read `docs/agents/core.md` for durable repository rules.

For Stitch-to-React-Native migration, invoke:

```text
/stitch-ui <screen-or-screen-id>
```

`/stitch-ui` runs in an isolated `orchestrator` subagent configured as Claude Opus 5 / low. Bounded workers are Claude Sonnet 5 / high.

The skill protocol is in `docs/agents/workflows/stitch-ui.md`. Do not load the legacy Stitch workflow as a prerequisite.

Keep detailed worker state in artifacts/receipts, parallelize independent discovery, and keep a single writer per file.
