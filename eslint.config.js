// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*", ".expo/*"],
  },
  {
    // Node scripts run outside the app bundle, so Node globals are defined.
    files: ["scripts/**/*.{js,mjs}"],
    languageOptions: {
      globals: { Buffer: "readonly", process: "readonly", console: "readonly" },
    },
  },
]);
