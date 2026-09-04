@AGENTS.md

# Bprc Mobile

## Architecture

- This is an Expo SDK 57 React Native app using TypeScript and Expo Router typed routes.
- Keep files in `src/app` as thin route adapters. Put screen implementation in `src/screens/<feature>/index.tsx`.
- Styling uses React Native `StyleSheet`. Preserve this choice unless the user explicitly requests a migration.
- Reuse `Colors`, `Spacing`, `Radius`, and typography variants from `src/constants/theme.ts` and the themed components before adding local constants.
- Persistent prototype state uses `src/hooks/use-persisted-state.ts`. Preserve existing storage keys and domain types.
- `DESIGN.md` is the source of truth for the app design system. A referenced Stitch screen is the source of truth for that screen's appearance; the repository remains authoritative for architecture and implementation patterns.

## Working agreement

- Read code with CodeGraph (`codegraph_explore`, or `codegraph explore "<question>"`) before reaching for `Read`, `Grep`, or `Glob`. Bulk file reads to orient yourself are not acceptable here; read a file in full only to edit it or when CodeGraph does not index it (`DESIGN.md`, `package.json`, `app.json`).
- Confirm Expo SDK 57 API surface with the Expo documentation tools rather than recall.
- Run shell commands through the `rtk` proxy for anything with verbose output (`rtk git`, `rtk read`, `rtk grep`, `rtk find`, `rtk tree`, `rtk diff`, `rtk npm run typecheck`, `rtk lint`, `rtk test`). A `PreToolUse` hook rewrites plain commands automatically, so do not fight the rewrite. Run the raw command only when the exact unfiltered output is the thing being verified.
- `rtk read` is a cheaper `cat`, not a substitute for graph analysis: reach for a graph tool to understand structure, and `rtk read` only when you need a specific file's bytes.
- The two graph tools split by question, and neither replaces the other. CodeGraph answers "what is this code and what does it say", because it returns verbatim source with the call paths. GitNexus answers "what breaks": `impact({target, direction: "upstream", summaryOnly: true})` for a ranked risk verdict with affected execution flows before editing a shared symbol, and `detect_changes({scope: "all"})` to review a diff before committing. Do not use GitNexus `query` or `context` for reading code; they cost more round trips than CodeGraph and return no source.
- Inspect `git status` before editing and preserve unrelated or unfinished user changes.
- Make the smallest change that satisfies the task. Keep edits inside an explicit allowed scope.
- Prefer existing components and dependencies. Install Expo packages with `npx expo install` only when a new dependency is explicitly justified.
- Determine whether a parent already owns safe-area insets before adding a `SafeAreaView`.
- Use `FlatList` or `SectionList` for dynamic collections; use `ScrollView` for bounded content.
- Do not commit, push, publish, deploy, or rewrite Git history unless the user explicitly requests it.

## Verification

Run the narrowest relevant check first, then finish implementation tasks with:

```bash
npm run typecheck
npm run lint
```

Report pre-existing failures separately from failures introduced by the task.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **Bprc-mobile** (487 symbols, 991 relationships, 38 execution flows).

> Index stale? Run `node .gitnexus/run.cjs analyze --index-only` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? Bootstrap with `npx`, `bunx`, or `pnpm dlx` — e.g. `bunx gitnexus@latest analyze` (npm 11 npx crash; #1939).

## Always Do

- **MUST run impact analysis before editing.** Use `impact({target: "symbolName", direction: "upstream"})` (MCP) or `node .gitnexus/run.cjs impact "symbolName" --direction upstream --repo .` (CLI fallback); report callers, processes, and risk. Never substitute grep for graph analysis.
- **MUST analyze graph changes before committing.** Use `detect_changes({scope: "all"})` (MCP) or `node .gitnexus/run.cjs detect-changes --scope all --repo .` (CLI fallback). `partial: true` or `truncated: true` is not a clean check — a zero means unseen, not unaffected; re-run it. For regression review: `detect_changes({scope: "compare", base_ref: "main"})` or `node .gitnexus/run.cjs detect-changes --scope compare --base-ref "main" --repo .`.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- **MUST treat `risk: UNKNOWN` as unresolved, not as low.** An empty caller set is not evidence the symbol is unused — it can also mean the callers are not resolvable by the index (plain-object property access, dynamic dispatch, cross-language calls). `impact` pairs `UNKNOWN` with a `riskNote` saying so. Confirm with a text search before treating the symbol as safe to change or delete; do not proceed on the strength of a zero.
- When exploring unfamiliar code, use `query({search_query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `context({name: "symbolName"})`.
- For security review, `explain({target: "fileOrSymbol"})` lists taint findings (source→sink flows; needs `analyze --pdg`).

## Never Do

- NEVER edit a function, class, or method before MCP/CLI impact analysis.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis, and never read `UNKNOWN` as an all-clear — it means the walk could not answer, which is the one verdict that requires confirming by other means.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit before MCP/CLI graph change analysis.

## Resources

| Resource | Use for |
| --- | --- |
| `gitnexus://repo/Bprc-mobile/context` | Codebase overview, check index freshness |
| `gitnexus://repo/Bprc-mobile/clusters` | All functional areas |
| `gitnexus://repo/Bprc-mobile/processes` | All execution flows |
| `gitnexus://repo/Bprc-mobile/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
| --- | --- |
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
