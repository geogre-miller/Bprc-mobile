---
name: verify-change
description: Verify a completed repository change against its acceptance criteria without editing it. Use for final checks, risky diffs, design fidelity review, or failed validation.
---

# Verify change

Read the task packet, `git status`, and the relevant diff. Use `codegraph_explore` on the changed symbols to see their callers and blast radius instead of reading neighbouring files. Run `detect_changes({scope: "all"})` to list the execution flows the diff disturbs, and treat `partial` or `truncated` as an incomplete check rather than a pass. Account for every acceptance criterion.

Run the narrowest affected check first, through `rtk`. For a completed implementation, run `rtk npm run typecheck` and `rtk lint` unless the packet specifies a narrower valid gate. For a visual criterion, capture the implementation yourself: start the app with the `run` skill and screenshot the affected route on the web target with the Playwright tools. Compare it to the packet's reference by hierarchy, geometry, spacing, typography, colors, radii, assets, insets, and interaction states. Mark a native-only or uncapturable criterion as unverified rather than passing it.

Return a pass only when each criterion is supported by code, check output, or supplied visual evidence. Report pre-existing failures separately. Do not edit files.
