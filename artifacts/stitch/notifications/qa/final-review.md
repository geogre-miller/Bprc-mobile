# Notifications — final simulator verification

Verified on iPhone 17 / iOS 26.5 with the locally running app.

- Dashboard bell opens `/alerts`, implemented by `Notifications` in `src/screens/notifications`.
- Notifications belongs to the Home stack and shares the five existing Expo Router native tabs. No extra tab or More menu.
- Price and purchase filters show their respective cards; mark-all-read clears unread state.
- Regression check: Notifications → Market → one tap on Home returns directly to the dashboard (`home-return-single-tap.png`). Home tab presses reset its nested stack; a second tap is unnecessary. Web Home uses `resetOnFocus` for the same policy (typechecked; native simulator is the runtime evidence).
- Unread dots appear immediately before the clock icons: `unread-dot-fixed.png`.
- At the end of the list, the price-threshold card clears the floating tab bar: `bottom-inset-fixed.png`.
- `npm run typecheck`, scoped ESLint, and `git diff --check` pass.
- Full lint retains the pre-existing `react-hooks/set-state-in-effect` error in `src/hooks/use-color-scheme.web.ts:11`.

Notification data/read state are local fixtures. Card destination actions and threshold settings remain placeholders pending their destination flows.
