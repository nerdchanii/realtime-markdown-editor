import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, normalize } from "node:path";

import ts from "typescript";

const forbiddenPackageDirs = [
  ["packages", "domain"].join("/"),
  ["packages", "application"].join("/"),
  ["packages", "shared"].join("/"),
  ["packages", "utils"].join("/"),
];

const deferredModuleDirs = [["apps", "api", "src", "modules", "history"].join("/")];
const eslintDisableMaxLinesPattern = /eslint-disable(?:-next-line|-line)?[^\n]*\bmax-lines\b/;

const domainImportPattern =
  /^(@nestjs(?:\/|$)|react(?:\/|$)|@tiptap(?:\/|$)|prosemirror-|yjs$|y-|@hocuspocus(?:\/|$)|yorkie-js-sdk(?:\/|$)|@prisma(?:\/|$)|prisma$|aws-sdk(?:\/|$)|@aws-sdk(?:\/|$)|ioredis$|redis$)/;
const nestDecoratorPattern =
  /@(Injectable|Module|Controller|Get|Post|Put|Patch|Delete|WebSocketGateway)\b/;

const failures = [];

for (const dir of forbiddenPackageDirs) {
  if (existsSync(dir)) {
    failures.push(`Forbidden package directory exists: ${dir}`);
  }
}

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) return walk(path);
    if (path.endsWith(".ts") || path.endsWith(".tsx")) return [path];
    return [];
  });
}

for (const dir of deferredModuleDirs) {
  if (walk(dir).length > 0) {
    failures.push(`Deferred backend module has source before promotion criteria are met: ${dir}`);
  }
}

for (const dir of ["apps", "packages", "scripts", "e2e"]) {
  for (const file of walk(dir)) {
    const content = readFileSync(file, "utf8");
    if (eslintDisableMaxLinesPattern.test(content)) {
      failures.push(`Do not disable ESLint max-lines; split the file or update config: ${file}`);
    }
  }
}

function toPosixPath(path) {
  return path.replaceAll("\\", "/");
}

function frontendFeatureNameForPath(path) {
  return toPosixPath(path).match(/^apps\/web\/src\/features\/([^/]+)\//)?.[1] ?? null;
}

function apiModuleNameForPath(path) {
  return toPosixPath(path).match(/^apps\/api\/src\/modules\/([^/]+)\//)?.[1] ?? null;
}

function apiDomainModuleNameForSpecifier(file, specifier) {
  const aliasMatch = specifier.match(/^@\/modules\/([^/]+)\/domain(?:\/|$)/);
  if (aliasMatch) return aliasMatch[1];

  if (!specifier.startsWith(".")) return null;

  const resolved = toPosixPath(normalize(join(dirname(file), specifier)));
  return resolved.match(/^apps\/api\/src\/modules\/([^/]+)\/domain(?:\/|$)/)?.[1] ?? null;
}

function importSpecifiersFor(file, content) {
  const sourceFile = ts.createSourceFile(
    file,
    content,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const specifiers = [];

  function visit(node) {
    const specifier = importSpecifierTextFor(node);
    if (specifier) specifiers.push(specifier);
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return specifiers;
}

function importSpecifierTextFor(node) {
  if (hasStringModuleSpecifier(node)) return node.moduleSpecifier.text;
  if (isStringImportTypeNode(node)) return node.argument.literal.text;
  return null;
}

function hasStringModuleSpecifier(node) {
  return (
    (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
    node.moduleSpecifier &&
    ts.isStringLiteral(node.moduleSpecifier)
  );
}

function isStringImportTypeNode(node) {
  return (
    ts.isImportTypeNode(node) &&
    ts.isLiteralTypeNode(node.argument) &&
    ts.isStringLiteral(node.argument.literal)
  );
}

function domainImportFailuresFor(file, content) {
  const currentModule = apiModuleNameForPath(file);
  const specifierFailures = importSpecifiersFor(file, content).flatMap((specifier) =>
    domainSpecifierFailuresFor(file, currentModule, specifier),
  );
  if (!nestDecoratorPattern.test(content)) return specifierFailures;
  return [...specifierFailures, `Domain file contains Nest/framework decorator: ${file}`];
}

function domainSpecifierFailuresFor(file, currentModule, specifier) {
  const specifierFailures = [];
  if (domainImportPattern.test(specifier)) {
    specifierFailures.push(
      `Domain file imports forbidden framework/provider package: ${file} -> ${specifier}`,
    );
  }

  const importedDomainModule = apiDomainModuleNameForSpecifier(file, specifier);
  if (importedDomainModule && importedDomainModule !== currentModule) {
    specifierFailures.push(`Domain file imports another module's domain: ${file} -> ${specifier}`);
  }
  return specifierFailures;
}

function resolveRelativeSpecifier(file, specifier) {
  if (!specifier.startsWith(".")) return null;
  return toPosixPath(normalize(join(dirname(file), specifier)));
}

function frontendSpecifierFailuresFor(file, specifier) {
  const specifierFailures = [];
  if (isTestFile(file)) return specifierFailures;

  if (isApiSourceImport(specifier)) {
    specifierFailures.push(`Frontend file imports API source: ${file} -> ${specifier}`);
  }

  if (isOtherFeatureAliasSubpathImport(file, specifier)) {
    specifierFailures.push(`Frontend file imports feature internals: ${file} -> ${specifier}`);
  }

  if (isOtherFeatureRelativeImport(file, specifier)) {
    specifierFailures.push(
      `Frontend file imports another feature by relative path: ${file} -> ${specifier}`,
    );
  }

  return specifierFailures;
}

function isTestFile(file) {
  return /\.(spec|test)\.tsx?$/.test(file);
}

function isApiSourceImport(specifier) {
  return specifier.includes("apps/api/src") || specifier.startsWith("@/../api/");
}

function isOtherFeatureAliasSubpathImport(file, specifier) {
  const importerFeature = frontendFeatureNameForPath(file);
  const aliasFeatureSubpath = specifier.match(/^@\/features\/([^/]+)\/.+/);
  return Boolean(aliasFeatureSubpath && aliasFeatureSubpath[1] !== importerFeature);
}

function isOtherFeatureRelativeImport(file, specifier) {
  const resolvedRelative = resolveRelativeSpecifier(file, specifier);
  const relativeFeature = resolvedRelative ? frontendFeatureNameForPath(resolvedRelative) : null;
  return Boolean(relativeFeature && relativeFeature !== frontendFeatureNameForPath(file));
}

for (const file of walk("apps/api/src/modules")) {
  if (!toPosixPath(file).includes("/domain/")) continue;
  failures.push(...domainImportFailuresFor(file, readFileSync(file, "utf8")));
}

for (const file of walk("apps/web/src")) {
  const content = readFileSync(file, "utf8");
  for (const specifier of importSpecifiersFor(file, content)) {
    failures.push(...frontendSpecifierFailuresFor(file, specifier));
  }
}

// UI-007 (ADR-0015): styles are plain CSS. Only these existing SCSS files may remain; they are
// removed with the Tiptap editor. Do not add entries. Remove an entry when its file is deleted.
const legacyScssFiles = new Set([
  "apps/web/src/components/tiptap-node/blockquote-node/blockquote-node.scss",
  "apps/web/src/components/tiptap-node/code-block-node/code-block-node.scss",
  "apps/web/src/components/tiptap-node/heading-node/heading-node.scss",
  "apps/web/src/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss",
  "apps/web/src/components/tiptap-node/image-node/image-node.scss",
  "apps/web/src/components/tiptap-node/image-upload-node/image-upload-node.scss",
  "apps/web/src/components/tiptap-node/list-node/list-node.scss",
  "apps/web/src/components/tiptap-node/paragraph-node/paragraph-node.scss",
  "apps/web/src/components/tiptap-templates/simple/simple-editor.scss",
  "apps/web/src/components/tiptap-ui-primitive/badge/badge-colors.scss",
  "apps/web/src/components/tiptap-ui-primitive/badge/badge-group.scss",
  "apps/web/src/components/tiptap-ui-primitive/badge/badge.scss",
  "apps/web/src/components/tiptap-ui-primitive/button-group/button-group.scss",
  "apps/web/src/components/tiptap-ui-primitive/button/button-colors.scss",
  "apps/web/src/components/tiptap-ui-primitive/button/button.scss",
  "apps/web/src/components/tiptap-ui-primitive/card/card.scss",
  "apps/web/src/components/tiptap-ui-primitive/dropdown-menu/dropdown-menu.scss",
  "apps/web/src/components/tiptap-ui-primitive/input/input.scss",
  "apps/web/src/components/tiptap-ui-primitive/popover/popover.scss",
  "apps/web/src/components/tiptap-ui-primitive/separator/separator.scss",
  "apps/web/src/components/tiptap-ui-primitive/toolbar/toolbar.scss",
  "apps/web/src/components/tiptap-ui-primitive/tooltip/tooltip.scss",
  "apps/web/src/components/tiptap-ui/color-highlight-button/color-highlight-button.scss",
  "apps/web/src/components/tiptap-ui/link-popover/link-popover.scss",
  "apps/web/src/styles/_keyframe-animations.scss",
  "apps/web/src/styles/_variables.scss",
]);

function walkScss(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return walkScss(path);
    return path.endsWith(".scss") ? [toPosixPath(path)] : [];
  });
}

const scssFiles = new Set(walkScss("apps/web/src"));
for (const file of scssFiles) {
  if (!legacyScssFiles.has(file)) {
    failures.push(`UI-007: write styles in plain CSS, not SCSS (ADR-0015): ${file}`);
  }
}
for (const file of legacyScssFiles) {
  if (!scssFiles.has(file)) {
    failures.push(`UI-007: remove the deleted SCSS file from legacyScssFiles: ${file}`);
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
