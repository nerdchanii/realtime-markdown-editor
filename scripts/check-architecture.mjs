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

function toPosixPath(path) {
  return path.replaceAll("\\", "/");
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

for (const file of walk("apps/api/src/modules")) {
  if (!toPosixPath(file).includes("/domain/")) continue;
  failures.push(...domainImportFailuresFor(file, readFileSync(file, "utf8")));
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
