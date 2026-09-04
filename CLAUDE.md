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
