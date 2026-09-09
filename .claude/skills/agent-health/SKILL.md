---
name: agent-health
description: Report deterministic Stitch workflow capability health and fail only for explicitly required capabilities.
argument-hint: "[--require stitch] [--require browser]"
disable-model-invocation: true
---

Run `node scripts/agents/agent-health.mjs $ARGUMENTS` from the repository root and return its structured JSON without reinterpreting tool availability from prose. Use `--out <path>` when the result will seed a workflow run.

An unavailable optional capability is a fallback condition. An unavailable explicitly required capability blocks the requested task.
