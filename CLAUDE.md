# Bprc Mobile — Claude Code entrypoint

Read `docs/agents/core.md` for durable repository rules.

For Stitch-to-React-Native migration, invoke:

```text
/stitch-ui <screen-or-screen-id>
```

`/stitch-ui` runs in an isolated `orchestrator` subagent configured as Claude Opus 5 / low. Bounded workers are Claude Sonnet 5 / high.

The skill protocol is in `docs/agents/workflows/stitch-ui.md`. Do not load the legacy Stitch workflow as a prerequisite.

Keep detailed worker state in artifacts/receipts, parallelize independent discovery, and keep a single writer per file.

Available workflow commands remain aligned with Codex: `/stitch-ui`, `/stitch-inspect`, `/rn-context-map`, `/rn-ui-migrate`, `/visual-verify`, and `/agent-health`.

RTK policy: prefer documented RTK forms for supported Git, file inspection/search, diffs, and test runners when available. Do not prepend RTK to arbitrary commands, do not run RTK plus raw output by default, and do not double-prefix an auto-rewritten command. Fall back to raw commands when RTK is absent or exact evidence is required. RTK does not replace CodeGraph or GitNexus. Claude's optional `rtk init -g` hook is independent from Codex RTK integration.
