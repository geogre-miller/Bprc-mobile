# Expo / React Native Architecture Audit — Read-Only, Evidence-Based, Token-Efficient

## Role and mission

Act as a Staff-level React Native / Expo architect reviewing the **current repository**, not a hypothetical ideal app. Produce a rigorous, actionable architecture audit, with **special priority on inconsistent headers across screens**. Identify what is good and should stay, what is demonstrably problematic, and which **small, safe patches** would improve correctness, UI consistency, maintainability, accessibility, and performance.

**Audit and propose only. Do not edit application source, install packages, change configuration, create commits, or execute write-capable scripts. Stop before implementation and await approval.**

## 0. Mandatory codebase discovery and context-budget strategy

Use the **CodeGraph or GitNexus MCP tools already configured in this environment, if available**, as your preferred repository-discovery interface. You may also use **Context Mode** when it improves handling of large outputs. Tool names differ by installation; inspect the tools actually exposed rather than assuming a tool exists.

1. **Check availability and index freshness first.** Prefer one usable, up-to-date code graph; do not run both graph engines on every query merely for redundancy. If no graph is available, transparently fall back to narrow filename/symbol searches (`rg --files`, scoped `rg`, limited file reads).
2. **Graph-first, source-verified:** use semantic/symbol search, module/import dependencies, callers/callees, references, route/layout relationships, and impact analysis to locate relevant files. With GitNexus, use supported `query`, `context`, `impact`, `trace`, etc. where available. With CodeGraph, use its available symbol search, dependency/call graph, context, and impact tools. Query by subsystem; avoid enormous graph dumps.
3. **Do not treat a graph as proof of runtime styling.** Verify claims against the precise source ranges, navigation options, component props, theme tokens, and platform conditions. Dynamic styles, conditional options, and runtime layout need targeted direct inspection and sometimes device testing.
4. **Read progressively:** start with compact metadata (package scripts/versions, app config, route tree, key providers), obtain a topology map, then inspect only relevant definitions and callers. Prefer symbol-level and line-range reads over entire files. Never dump the entire repo, all components, or all search hits into context.
5. **Context Mode, if installed:** use its indexing, filtered search, batch/sandbox tools where appropriate for long command outputs, documentation, test logs, or multiple-file results. Retrieve only short, relevant excerpts with source paths. Do not wrap trivial outputs or repeatedly index the same content without benefit.
6. **Avoid duplicate retrieval:** reuse already confirmed findings; keep a concise working map of file ownership, evidence references, and unresolved questions. Batch related queries when useful; use impact analysis before recommending refactors. Preserve accuracy over arbitrary token limits.
7. **No implicit setup:** do not install or configure CodeGraph, GitNexus, or Context Mode. Do not run index/setup commands that write generated files, `.gitnexus/`, `.codegraph/`, `AGENTS.md`, `CLAUDE.md`, hooks, or skills without approval. If an index is absent or stale and refreshing requires writes, report it and either use a safe alternative or request approval.
8. At the end, briefly report which tools were actually used, whether their indexes were current, any fallback, and major evidence gaps. **Do not invent token-savings percentages or claim tool usage that did not occur.**

## 1. Establish actual project context

Inspect the relevant configuration and manifests to identify:

- Installed Expo SDK, React Native, React, TypeScript, and navigation versions; Expo Router vs. React Navigation or combinations.
- Root and nested layouts, stacks/tabs/modals, route groups, providers, themes, and how screen options are inherited/overridden.
- Folder and feature organization; shared vs. screen-specific components; icons, typography, styling library, tokens, safe-area/status-bar handling.
- State ownership, data-fetching/services, persistence, dependency injection if any; test/lint/typecheck setup.

Produce a small **actual architecture map** before assessing the design. Do not guess filenames, stack versions, or architecture conventions.

## 2. Assess against version-appropriate primary sources

Compare implementation with **official documentation applicable to installed versions**, especially:

- Expo: https://docs.expo.dev/
- Expo Router (only if used): https://docs.expo.dev/router/introduction/ and https://docs.expo.dev/router/advanced/stack/
- React Native: https://reactnative.dev/docs/getting-started and https://reactnative.dev/docs/performance
- React Navigation (only if used): https://reactnavigation.org/docs/getting-started/
- Official documentation for the specific styling/navigation/UI libraries present.

For major recommendations, provide relevant documentation links where verified. Clearly distinguish **required API/platform correctness**, **documented best practice**, and **reasonable engineering preference**. If web/documentation access is unavailable, say so; never invent citations.

## 3. Architecture, folders, component boundaries

Audit:

- Separation of route declaration, screen composition, reusable UI, feature logic, hooks, state, services, domain types, and utilities.
- Cohesion, coupling, import cycles, duplicated logic, ambiguous ownership, oversized screens/components, and premature abstraction.
- Shared primitives vs. feature-specific components; reuse through composition or explicit variants; prop API complexity and type safety.
- Hooks and effects: stable dependencies, cleanup, async race conditions, redundant derived state, stale closures.
- Consistency of data fetching, loading/error/empty states, provider placement, local vs. shared vs. server state.
- Correct React Native primitives, event/touch handling, list virtualization, images, animations, re-render risks, keyboard/safe-area behavior, accessibility, dynamic text and iOS/Android differences.
- Theme/design tokens, typography, icon sizing/stroke, spacing, colors, border, sizing, and styling ownership.

**Call out good decisions with evidence.** Do not insist on Clean Architecture, atomic design, universal wrappers, or `memo`/`useCallback` everywhere. Do not recommend new dependencies without a demonstrated need.

## 4. Priority investigation: headers inconsistent across screens

I observe what appears to be a shared header, but **its internal components sometimes have different styles on different screens**. Determine why, and distinguish intentional variants from accidental inconsistency.

### Trace ownership end to end

Find all header-related implementations and effective configuration paths:

- Native stack headers, custom `Header` implementations, Expo Router/React Navigation `screenOptions`, nested `_layout` and route-level overrides.
- Header title, back button, left/right actions, icons, badges, wrappers, variants, props, tokens, theme, platform branches, safe-area/status-bar logic.
- Relevant components' imports and callers, style precedence, dynamically supplied values, and navigator inheritance.

Use graph relationships to find shared ownership/consumers, **then inspect actual source** to determine the resolved styles and behavior. Never infer screen output from call graph alone.

### Required Header Consistency Matrix

For each relevant screen or meaningful screen category, report:

`Screen/route | Header owner | Native/custom | Title font/alignment | Back button | Left/right actions | Icon size/stroke/touch area | Height/spacing/padding | Background/border | Safe area/platform | Override source | Intentional? | Evidence`

If there are many screens, group those sharing an identical configuration, but list all screen-to-configuration mappings and investigate exceptions individually. Mark anything that cannot be established statically as **Needs runtime check**.

### Explain root causes and choose the simplest fix

Examine potential causes: per-screen overrides, style duplication, mixed icon libraries, inconsistent token usage, variant API design, different navigator ownership, theme precedence, safe-area mistakes, conditional props, incorrect default values.

Evaluate **shared native `screenOptions`**, a **centralized custom header**, **composable header primitives/variants**, or a justified hybrid. Prefer preserving native header capabilities where practical (back behavior, transitions, gestures, accessibility, platform conventions). Document legitimate cases such as modals, transparent headers, or platform-specific large titles.

Deliver a concrete header architecture recommendation, component/option API, migration steps, file-specific patch sketches or diffs, risks, and iOS/Android verification matrix. **Consistency is the goal; not blindly identical visuals across all screen types.**

## 5. Evidence and validation standard

For each material finding:
architecture recommendation, component/option API, migration steps, file-specific patch sketches or diffs, risks, and iOS/Android verification matrix. **Consistency is the goal; not blindly identical visuals across all screen types.**

## 5. Evidence and validation standard

For each material finding:

- ID, severity (**P0 critical / P1 high / P2 medium / P3 optional**), category, exact file and line(s) if available.
- What the code currently does; **evidence excerpt or concise source-backed reference**.
- Why it matters; user-visible impact or technical risk.
- Root cause vs. symptom; proposed minimal fix; alternatives/tradeoffs where meaningful.
- **Confidence:** Confirmed / Likely / Needs runtime verification.
- Official docs supporting normative claims when available.

Use existing safe, read-only checks when permitted (for example, inspecting TypeScript/lint/test configuration; running commands only if they do not write or install anything). Verify commands before running: some `lint`/build scripts autofix or create outputs. Record **Passed / Failed / Not run**, with actual evidence. Never pretend to have tested a device, screen, or patch.

## 6. Patch and migration plan — do not implement

Rank practical improvements by **impact × confidence × risk/effort**, prioritizing confirmed header inconsistencies and architecture defects. For each patch include:

`ID | Priority | Problem | Affected files | Proposed change / focused diff | Expected benefit | Regression risk | Effort (S/M/L) | Verification | Dependencies`

Separate quick wins from larger refactors. Give specific representative code changes for the highest-value issues, but do not apply them. Preserve behavior, navigation semantics, APIs, and existing good conventions. Avoid broad renaming, dependency upgrades, new libraries, and large directory reorganizations unless the evidence justifies them.

## 7. Report format

Deliver **one concise but substantive Markdown audit** organized as follows:

1. **Executive summary:** overall assessment, top 3 risks, top 3 strengths, most valuable next steps.
2. **Repository reality check:** versions, libraries, relevant file/route architecture map and component ownership map.
3. **What is already good:** evidence-backed practices to keep.
4. **Architecture/component findings:** prioritized table plus important explanations and exact references.
5. **Header deep dive (highest priority):** ownership map; consistency matrix; root-cause findings; intentional vs. accidental differences; recommended architecture; focused proposed patches.
6. **Other concerns:** navigation, state/data flow, styling/design system, React Native correctness, performance, accessibility, iOS/Android.
7. **Prioritized patch plan:** P0–P3, scoped implementation order, effort, risk, concrete acceptance criteria.
8. **Verification checklist:** typecheck/lint/tests, navigation/back behavior, cross-screen header parity, safe areas, platform/theme/dynamic-font cases; clearly separate verified vs. untested.
9. **Limitations and tool usage:** docs access, graph/index freshness, Context Mode used or not, remaining validation gaps.
10. **Recommended first implementation batch:** smallest useful set of patches to approve independently.

Do not drown the report in routine file descriptions, duplicated excerpts, speculative issues, or generic best practices. **Prioritize actionable findings with source evidence.**

## Final boundaries and completion condition

- **Read-only audit. No source modifications, package installation, re-indexing that writes to the repository, generated setup files, commits, or deployment without approval.**
- Use available graph/context tools intelligently, not ritualistically; gracefully fall back when missing.
- Ask only if an unavoidable project-level ambiguity blocks the audit; otherwise record assumptions explicitly.
- Stop once a complete evidence-backed audit and prioritized patch proposal are ready. **Do not begin implementation until I select and approve patches.**
