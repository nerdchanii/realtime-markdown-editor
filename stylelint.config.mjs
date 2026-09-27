// Style rules for the web apps (ADR-0015). Each rule carries the id listed in DESIGN.md §2.
// Exceptions live only in this file as path overrides. Inline `stylelint-disable` comments are
// ignored (`ignoreDisables`), so a rule cannot be switched off from inside a stylesheet.
// Existing violations are recorded in stylelint-suppressions.json and may only shrink.

// Layer that may draw panel dividers: one side, 1px, token color (UI-001).
const layoutFiles = ["apps/web/src/layouts/**/*.css", "apps/editor/src/layouts/**/*.css"];
// Rendered document content, where lines carry meaning (tables, rules, code blocks) (UI-001).
const editorContentFiles = [
  "apps/web/src/features/editor/editor-content.css",
  "apps/editor/src/features/editor/editor-content.css",
];
// The only place color literals may appear: theme token definitions (UI-003).
const tokenFiles = ["apps/web/src/styles/tokens.css", "apps/editor/src/styles/tokens.css"];

const tokenValue = "/^var\\(--[\\w-]+\\)$/";
const nonZero = ["/^(?!\\s*(0|none)\\s*$)/"];

// UI-001: no boxed borders. Border widths and styles other than 0/none are rejected.
const noBorders = {
  "/^border(-(top|right|bottom|left|block|inline)(-(start|end))?)?(-width)?$/": nonZero,
  "/^border(-(top|right|bottom|left|block|inline)(-(start|end))?)?-style$/": [
    "/^(?!\\s*none\\s*$)/",
  ],
};
const layoutBorders = {
  "/^border(-width|-style)?$/": nonZero,
  "/^border-(block|inline)/": nonZero,
};
// In layout CSS a divider is written only as one `border-<side>: 1px solid var(--token)` shorthand.
const layoutBorderLonghands = [
  "/^border-image/",
  "/^border-(top|right|bottom|left)-(width|style|color)$/",
];

// UI-002: no fake borders. Rings, outlines and background images come from tokens only.
const tokenOnlySurfaces = {
  "box-shadow": ["none", tokenValue],
  "/^outline(-style|-width)?$/": ["none", "0", tokenValue],
  "background-image": ["none", tokenValue],
};

// UI-002 (gradients) and UI-003 (color functions).
const gradientFunctions = [
  "linear-gradient",
  "radial-gradient",
  "conic-gradient",
  "repeating-linear-gradient",
  "repeating-radial-gradient",
  "repeating-conic-gradient",
];
const colorFunctions = [
  "rgb",
  "rgba",
  "hsl",
  "hsla",
  "hwb",
  "lab",
  "lch",
  "oklab",
  "oklch",
  "color",
];

export default {
  ignoreDisables: true,
  rules: {
    "declaration-property-value-disallowed-list": noBorders, // UI-001
    "property-disallowed-list": ["/^border-image/"], // UI-001
    "declaration-property-value-allowed-list": tokenOnlySurfaces, // UI-002
    // url() can embed images with colors and drawn borders; assets come in through tokens.
    "function-disallowed-list": [...gradientFunctions, ...colorFunctions, "url"], // UI-002, UI-003
    "color-no-hex": true, // UI-003
    "color-named": "never", // UI-003
    // UI-004: no @apply. UI-006: no directive that makes Tailwind generate utilities again.
    "at-rule-disallowed-list": ["apply", "source", "plugin", "config"], // UI-004, UI-006
  },
  overrides: [
    {
      files: ["**/*.scss"],
      customSyntax: "postcss-scss",
    },
    {
      files: layoutFiles,
      rules: {
        "declaration-property-value-disallowed-list": layoutBorders, // UI-001
        "property-disallowed-list": layoutBorderLonghands, // UI-001
        "declaration-property-value-allowed-list": {
          ...tokenOnlySurfaces,
          "/^border-(top|right|bottom|left)$/": ["0", "none", `/^1px solid var\\(--[\\w-]+\\)$/`],
        }, // UI-001, UI-002
      },
    },
    {
      files: editorContentFiles,
      rules: {
        "declaration-property-value-disallowed-list": null, // UI-001
      },
    },
    {
      files: tokenFiles,
      rules: {
        "function-disallowed-list": null, // UI-003
        "color-no-hex": null, // UI-003
        "color-named": null, // UI-003
      },
    },
  ],
};
