import js from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

const sourceFiles = ["apps/**/*.{ts,tsx}", "packages/**/*.ts", "e2e/**/*.ts", "scripts/**/*.mjs"];

const productionFiles = ["apps/**/*.{ts,tsx}", "packages/**/*.ts", "scripts/**/*.mjs"];
const testFiles = ["**/*.spec.{ts,tsx}", "**/*.test.{ts,tsx}", "**/*.smoke.ts", "e2e/**/*.ts"];
const reactFiles = ["apps/web/src/**/*.{ts,tsx}"];
const adapterFiles = ["apps/**/adapters/**/*.{ts,tsx}"];
const useCaseFiles = ["apps/**/use-cases/**/*.{ts,tsx}"];
const apiDomainFiles = ["apps/api/src/modules/**/domain/**/*.ts"];

const frameworkAndProviderImports = [
  "@nestjs",
  "@nestjs/*",
  "react",
  "react/*",
  "@tiptap/*",
  "prosemirror-*",
  "yjs",
  "y-*",
  "@hocuspocus/*",
  "yorkie-js-sdk",
  "@prisma/*",
  "prisma",
  "aws-sdk",
  "@aws-sdk/*",
  "ioredis",
  "redis",
];

export default [
  {
    ignores: [
      ".git/**",
      ".note/**",
      ".codex/**",
      ".worktrees/**",
      "worktrees/**",
      ".worktree/**",
      "node_modules/**",
      "dist/**",
      "**/dist/**",
      "build/**",
      "**/build/**",
      "coverage/**",
      "**/coverage/**",
      "docs/research/**",
      "playwright-report/**",
      "test-results/**",
      "**/*.tsbuildinfo",
      "pnpm-lock.yaml",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["*.cjs"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        module: "readonly",
        require: "readonly",
      },
    },
  },
  {
    files: sourceFiles,
    plugins: {
      import: importPlugin,
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      "no-undef": "off",
    },
  },
  {
    files: productionFiles,
    rules: {
      complexity: ["error", { max: 8 }],
      "max-depth": ["error", 3],
      "max-lines": ["error", { max: 250, skipBlankLines: true, skipComments: true }],
      "max-lines-per-function": [
        "error",
        { max: 40, skipBlankLines: true, skipComments: true, IIFEs: true },
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["apps/api/src/**"],
              message: "Frontend code must use packages/contracts or feature view models.",
            },
          ],
        },
      ],
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
        {
          selector: "function",
          format: ["camelCase", "PascalCase"],
        },
        {
          selector: "variable",
          modifiers: ["const"],
          format: ["camelCase", "PascalCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
        },
        {
          selector: "variable",
          format: ["camelCase", "PascalCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
        },
      ],
      "import/no-cycle": ["error", { ignoreExternal: true, maxDepth: 1 }],
    },
  },
  {
    files: useCaseFiles,
    rules: {
      "max-lines-per-function": [
        "error",
        { max: 50, skipBlankLines: true, skipComments: true, IIFEs: true },
      ],
    },
  },
  {
    files: [...adapterFiles, ...reactFiles],
    rules: {
      complexity: ["error", { max: 8 }],
    },
  },
  {
    files: testFiles,
    rules: {
      complexity: ["error", { max: 10 }],
      "max-depth": "off",
      "max-lines": "off",
      "max-lines-per-function": "off",
    },
  },
  {
    files: apiDomainFiles,
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: frameworkAndProviderImports,
              message: "Backend domain files must stay provider-neutral and framework-free.",
            },
          ],
        },
      ],
    },
  },
  {
    files: reactFiles,
    plugins: {
      "jsx-a11y": jsxA11y,
      react,
      "react-hooks": reactHooks,
    },
    settings: {
      react: {
        version: "19.0",
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      "react/jsx-key": "error",
      "react/jsx-no-target-blank": "error",
      "react/jsx-no-useless-fragment": "error",
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "error",
      "react/no-array-index-key": "warn",
      "react/no-children-prop": "error",
      "react/no-danger": "error",
      "react/react-in-jsx-scope": "off",
    },
  },
];
