import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

export default [
  js.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        chrome: "readonly",
        console: "readonly",
        document: "readonly",
        window: "readonly",
        NodeFilter: "readonly",
        MutationObserver: "readonly",
        HTMLElement: "readonly",
        HTMLInputElement: "readonly",
        HTMLMetaElement: "readonly",
        Text: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "no-undef": "off",
    },
  },
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "scripts/**",
      "**/*.test.ts",
      "**/__tests__/**",
    ],
  },
];
