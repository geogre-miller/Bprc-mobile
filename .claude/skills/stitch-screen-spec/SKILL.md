---
name: stitch-screen-spec
description: Convert one referenced Stitch screen into a compact React Native task packet before implementation. Use when a task names a Stitch project, screen, or design source.
---

# Stitch screen specification

Retrieve the exact requested screen. Fetch project metadata only when it resolves a theme, device, or asset ambiguity; fetch HTML only when the screenshot and metadata cannot answer an implementation-critical question.

Extract hierarchy, geometry, spacing, typography, semantic colors, borders, radii, assets, states, scroll behavior, keyboard behavior, safe-area intent, and responsive intent. Record uncertainty instead of inventing exact values.

Identify the route, screen files, reusable components, tokens, dependencies, and parent layout ownership with `codegraph_explore` rather than reading those files, and read `DESIGN.md` and `package.json` directly because CodeGraph does not index them. Stitch is authoritative for appearance; the repository is authoritative for architecture.

Read `.claude/references/task-packet.md`, fill the core fields plus the `SOURCE_OF_TRUTH.design` and `VISUAL_SPEC` blocks with facts, and delegate it to `rn-implementer`. Do not require the worker to access Stitch.
