import eslintComments from "@eslint-community/eslint-plugin-eslint-comments";
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
const largeCatalogFiles = [
  "packages/contracts/src/http/index.ts",
  "packages/contracts/src/http/routes.ts",
  "packages/contracts/src/http/schemas.ts",
];
const legacyLargeAdapterFiles = [
  "apps/api/src/modules/documents/adapters/prisma-document-product-repository.ts",
  "apps/api/src/modules/workspace/adapters/prisma-workspace-product-repository.ts",
];

const frontendApiImportRule = {
  group: ["apps/api/src/**"],
  message: "Frontend code must use packages/contracts or feature view models.",
};
// Product paths must not depend on mock, seed, fixture, or fake modules (ADR-0010, AGENTS.md).
const mockImportRule = {
  group: [
    "**/*mock*",
    "**/*Mock*",
    "**/*seed*",
    "**/*Seed*",
    "**/*fixture*",
    "**/*fake*",
    "**/*Fake*",
  ],
  message:
    "Product code must not import mock/seed/fixture/fake modules. Show a real empty state or error instead.",
};
// Ratchet: existing violations tracked for removal (UI-GAP-013). Do not add entries.
const legacyMockImportFiles = [
  "apps/web/src/app/product-workspace-types.ts",
  "apps/web/src/app/product-workspace-view-model.ts",
  "apps/web/src/features/editor/index.tsx",
  "apps/web/src/features/editor/useMockMarkdownDocument.ts",
];

// UI-005 (ADR-0015): inline `style` may only pass CSS custom properties (`--name`) to stylesheets.
// Visual styles belong in CSS, where stylelint enforces UI-001..UI-004.
const inlineStyle = "JSXAttribute[name.name='style'] > JSXExpressionContainer";
const inlineStyleMessage =
  "UI-005: inline style may only set CSS custom properties (`--name`). Put visual styles in CSS.";
const inlineStyleRule = [
  "error",
  {
    selector: `${inlineStyle} > :not(ObjectExpression, TSAsExpression, TSSatisfiesExpression)`,
    message: inlineStyleMessage,
  },
  // A type cast is allowed only around an object literal, whose keys the selectors below check.
  {
    selector: `${inlineStyle} > :matches(TSAsExpression, TSSatisfiesExpression) > .expression:not(ObjectExpression)`,
    message: inlineStyleMessage,
  },
  { selector: `${inlineStyle} ObjectExpression > SpreadElement`, message: inlineStyleMessage },
  {
    selector: `${inlineStyle} ObjectExpression > Property[key.type!='Literal']`,
    message: inlineStyleMessage,
  },
  {
    selector: `${inlineStyle} ObjectExpression > Property[key.type='Literal'][key.value!=/^--/]`,
    message: inlineStyleMessage,
  },
];

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
      "docs/archive/**",
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
      "no-restricted-imports": ["error", { patterns: [frontendApiImportRule, mockImportRule] }],
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
    files: [...legacyMockImportFiles, ...testFiles, "scripts/**/*.mjs"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [frontendApiImportRule] }],
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
    files: largeCatalogFiles,
    rules: {
      "max-lines": ["error", { max: 750, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    files: legacyLargeAdapterFiles,
    rules: {
      "max-lines": ["error", { max: 900, skipBlankLines: true, skipComments: true }],
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
      "@eslint-community/eslint-comments": eslintComments,
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
      complexity: ["error", { max: 20 }],
      "max-lines": ["error", { max: 400, skipBlankLines: true, skipComments: true }],
      "max-lines-per-function": [
        "error",
        { max: 180, skipBlankLines: true, skipComments: true, IIFEs: true },
      ],
      "react/jsx-key": "error",
      "react/jsx-no-target-blank": "error",
      "react/jsx-no-useless-fragment": "error",
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "error",
      "react/no-array-index-key": "off",
      "react/no-children-prop": "error",
      "react/no-danger": "error",
      "react/react-in-jsx-scope": "off",
      "no-restricted-syntax": inlineStyleRule,
      // UI exceptions are path overrides in config, never inline disable comments (ADR-0015).
      "@eslint-community/eslint-comments/no-restricted-disable": ["error", "no-restricted-syntax"],
    },
  },
];
