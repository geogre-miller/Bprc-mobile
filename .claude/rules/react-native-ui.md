---
paths:
  - "src/screens/**/*.tsx"
  - "src/components/**/*.tsx"
  - "src/constants/theme.ts"
---

# React Native UI conventions

- Build with React Native primitives and `StyleSheet`; match web and native behavior where the repository supports both.
- Reuse semantic theme tokens and `ThemedText` variants. Add a shared token only when the value represents a repeated semantic decision.
- Preserve touch accessibility, keyboard reachability, safe-area ownership, loading/empty/error states, and dynamic-list virtualization.
- Treat supplied design dimensions as density-independent intent. Prefer responsive layout over fixed screen widths.
- Use the project's existing icon and image packages before introducing another dependency.
