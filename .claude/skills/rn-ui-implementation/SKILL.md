---
name: rn-ui-implementation
description: Implement bounded UI and interaction work in this Expo Router app from a task packet or design specification. Use for screens, components, navigation, responsive layout, and visual fixes.
---

# React Native implementation

1. Confirm the task's allowed scope and inspect current changes in those files.
2. Understand the named route, screen, parent layout, and reusable primitives with `codegraph_explore`, naming those files and symbols in one query. Read a file in full only to edit it, or when CodeGraph does not index it. Avoid bulk reads or tree-wide grep for orientation; when no index is available, read only the files the task names.
3. Map the specification onto existing `StyleSheet`, theme, typography, routing, and persistence patterns.
4. Implement the smallest complete change. Keep route adapters thin and preserve platform-specific files.
5. Check safe-area ownership, scroll and keyboard reachability, touch targets, list virtualization, states, and light/dark semantic colors where applicable.
6. Verify an unfamiliar Expo or Expo Router API against the SDK 57 documentation tools before using it.
7. Run targeted checks, followed by `rtk npm run typecheck` and `rtk lint` when the packet requires full verification.

Use `npx expo install <package>` only when the task explicitly justifies a new Expo-compatible dependency. Report any design deviation or unresolved platform difference.
