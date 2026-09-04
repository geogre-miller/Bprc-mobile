---
paths:
  - "src/app/**/*.tsx"
  - "src/components/app-tabs*.tsx"
---

# Expo Router boundaries

- Keep route files as parameter adapters that render a screen from `src/screens`.
- Register stack presentation and header behavior in `src/app/_layout.tsx`; keep tab composition in the tab layout and app-tabs components.
- Preserve typed route compatibility and existing platform-specific `.web.tsx` components.
- Confirm whether a layout or tab bar already owns headers and insets before adding them inside a screen.
