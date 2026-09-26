import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

// Enforces machine-checkable UI rules from ADR-0014 as a ratchet:
// - ui/no-box-border: a full `border:` shorthand boxes an element. Regions are separated by
//   background and spacing; only side dividers (border-top/right/bottom/left) are allowed.
// - ui/no-box-border-utility: the same box drawn with Tailwind `border` utilities, including
//   variant-prefixed (`hover:border`) and multiline class expressions.
// - ui/no-hardcoded-color: hex or CSS color functions (rgb, hsl, oklch, ...) outside CSS custom
//   property definitions break theming.
// Existing violations are recorded per file in the baseline. A file may never exceed its baseline,
// and new files start at zero. `--update-baseline` may only lower counts; `--init-baseline` works
// only when no baseline exists yet.

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const sourceRoot = join(repoRoot, "apps/web/src");
const baselinePath = join(repoRoot, "scripts/ui-rules-baseline.json");
const sourceFile = /\.(css|scss|ts|tsx)$/;
const skippedFile = /\.(test|spec)\.tsx?$/;
const allowComment = /ui-allow:/;
// Tailwind `border`, `border-2`, `border-[1px]` draw all four sides, with or without variant prefixes
// (`hover:`, `dark:`, `[&>*]:`). Side utilities (`border-b`, `border-x`) and `border-0` stay allowed;
// color utilities (`border-rme-border`) are not counted on their own.
const boxBorderUtility = /(?<![^\s"'`{(,:!])border(?:-(?:[1-8]|\[[^\]]*\]))?(?![-\w:])/g;
// Utilities live in `@apply` rules (CSS) and in string literals (TS/TSX). Literals are scanned on the
// whole file, so class expressions split across lines by Prettier are still covered.
const applyRule = /@apply\s+([^;}]*)/g;
const stringLiteral = /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`/g;
const colorValue =
  /#[0-9a-fA-F]{3,8}\b|(?<![-a-zA-Z0-9.$])(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/g;

const lineRules = {
  "ui/no-box-border": (line) =>
    (line.match(/(?<![-\w])border\s*:\s*["'`]?(?!\s*(?:0|none|transparent)\b)[^;,\n}]+/g) ?? [])
      .length,
  "ui/no-hardcoded-color": (line) =>
    /(--|\$)[\w-]+\s*:/.test(line) ? 0 : (line.match(colorValue) ?? []).length,
};

function countBoxBorderUtilities(path, text) {
  const pattern = /\.(css|scss)$/.test(path) ? applyRule : stringLiteral;
  let count = 0;
  for (const match of text.matchAll(pattern)) {
    count += (match[0].match(boxBorderUtility) ?? []).length;
  }
  return count;
}

function collectFiles(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) collectFiles(path, files);
    else if (sourceFile.test(entry) && !skippedFile.test(entry)) files.push(path);
  }
  return files;
}

function countViolations(path) {
  const lines = readFileSync(path, "utf8")
    .split("\n")
    .filter((line) => !allowComment.test(line));
  const counts = {};
  for (const line of lines) {
    for (const [rule, count] of Object.entries(lineRules)) {
      counts[rule] = (counts[rule] ?? 0) + count(line);
    }
  }
  counts["ui/no-box-border-utility"] = countBoxBorderUtilities(path, lines.join("\n"));
  return counts;
}

function scan() {
  const result = {};
  for (const path of collectFiles(sourceRoot)) {
    const counts = Object.fromEntries(
      Object.entries(countViolations(path)).filter(([, count]) => count > 0),
    );
    if (Object.keys(counts).length > 0) {
      result[relative(repoRoot, path).replaceAll("\\", "/")] = counts;
    }
  }
  return result;
}

function readBaseline() {
  return existsSync(baselinePath) ? JSON.parse(readFileSync(baselinePath, "utf8")) : {};
}

function regressions(current, baseline) {
  const errors = [];
  for (const [file, counts] of Object.entries(current)) {
    for (const [rule, count] of Object.entries(counts)) {
      const allowed = baseline[file]?.[rule] ?? 0;
      if (count > allowed) errors.push(`${file}: ${rule} ${count} (baseline ${allowed})`);
    }
  }
  return errors;
}

function total(report) {
  return Object.values(report).reduce(
    (sum, counts) => sum + Object.values(counts).reduce((a, b) => a + b, 0),
    0,
  );
}

function main() {
  const current = scan();
  if (!existsSync(baselinePath) && process.argv.includes("--init-baseline")) {
    writeFileSync(baselinePath, `${JSON.stringify(current, null, 2)}\n`);
    console.log(`ui:check baseline created with ${total(current)} violations`);
    return;
  }
  const baseline = readBaseline();
  const errors = regressions(current, baseline);
  if (errors.length > 0) {
    console.error("ui:check found new UI rule violations (ADR-0014):");
    for (const error of errors) console.error(`- ${error}`);
    console.error("Separate regions with background and spacing, and use theme tokens for colors.");
    console.error("A justified exception needs a `ui-allow: <reason>` comment on the same line.");
    process.exit(1);
  }
  if (process.argv.includes("--update-baseline")) {
    writeFileSync(baselinePath, `${JSON.stringify(current, null, 2)}\n`);
    console.log(`ui:check baseline lowered to ${total(current)} violations`);
    return;
  }
  console.log(`ui:check passed (${total(current)} baseline violations remain)`);
}

main();
