# Bprc Mobile

## Architecture

- This is an Expo SDK 57 React Native app using TypeScript and Expo Router typed routes.
- Keep files in `src/app` as thin route adapters. Put screen implementation in `src/screens/<feature>/index.tsx`.
- Styling uses React Native `StyleSheet`. Preserve this choice unless the user explicitly requests a migration.
- Reuse `Colors`, `Spacing`, `Radius`, and typography variants from `src/constants/theme.ts` and the themed components before adding local constants.
- Persistent prototype state uses `src/hooks/use-persisted-state.ts`. Preserve existing storage keys and domain types.
- `DESIGN.md` is the source of truth for the app design system. A referenced Stitch screen is the source of truth for that screen's appearance; the repository remains authoritative for architecture and implementation patterns.

## Working agreement

- Prefer CodeGraph (`codegraph_explore`, or `codegraph explore "<question>"`) when `.codegraph/` is present and current. Fall back to targeted `Read`, `Grep`, or `Glob` when the index is missing, stale, or does not cover the file type.
- Confirm Expo SDK 57 API surface with the Expo documentation tools rather than recall.
- Use `rtk` for verbose shell output when it is available; otherwise run the narrow raw command.
- Use GitNexus impact analysis before changing a shared, high-risk, or broadly reused symbol. Record one verdict in the task packet so workers do not repeat it. Treat `UNKNOWN`, partial, or truncated results as unresolved and confirm them with targeted source inspection.
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

This project is indexed by GitNexus as **Bprc-mobile** (637 symbols, 1324 relationships, 41 execution flows).

> Index stale? Run `node .gitnexus/run.cjs analyze --index-only` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? Bootstrap with `npx`, `bunx`, or `pnpm dlx` — e.g. `bunx gitnexus@latest analyze` (npm 11 npx crash; #1939).

## Always Do

- **MUST run impact before editing.** Use `impact({target: "symbolName", direction: "upstream"})` or `node .gitnexus/run.cjs impact "symbolName" --direction upstream --repo .`; report callers, processes, and risk. Never substitute grep for graph analysis.
- **MUST analyze graph changes before committing.** Use `detect_changes({scope: "all"})` (MCP) or `node .gitnexus/run.cjs detect-changes --scope all --repo .` (CLI fallback). `partial: true` or `truncated: true` is not a clean check — a zero means unseen, not unaffected; re-run it. For regression review: `detect_changes({scope: "compare", base_ref: "main"})` or `node .gitnexus/run.cjs detect-changes --scope compare --base-ref "main" --repo .`.
- MUST warn on HIGH/CRITICAL `risk` pre-edit; never use `riskSharedAxes` to waive a HIGH/CRITICAL `risk` warning. Compare File/symbol: MCP File omits axes; Graph-RAG expands File.
- **MUST treat `risk: UNKNOWN` as unresolved, not as low.** An empty caller set is not evidence the symbol is unused — it can also mean the callers are not resolvable by the index (plain-object property access, dynamic dispatch, cross-language calls). `impact` pairs `UNKNOWN` with a `riskNote` saying so. Confirm with a text search before treating the symbol as safe to change or delete; do not proceed on the strength of a zero.
- **MUST use `query({search_query: "concept"})` for concepts/flows, `context({name: "symbolName"})` for a named symbol, or `impact` for blast radius, on read-only callers, dependencies, imports, or execution flow.** Graph first; text search only for empty/`UNKNOWN`/literals.
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
