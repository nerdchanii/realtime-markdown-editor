import { readdir, readFile } from "node:fs/promises";
import { dirname, extname, relative, resolve, sep } from "node:path";
import { URL } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";

const packageRoot = resolve(new URL("..", import.meta.url).pathname);
const workspaceRoot = resolve(packageRoot, "../..");
const sourceRoot = resolve(packageRoot, "src");
const importPattern =
  /\b(?:import|export)\s+(?:type\s+)?(?:[^'"]*from\s+)?["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g;

test("collab source does not import API source", async () => {
  const failures = [];

  for (const file of await findTypeScriptFiles(sourceRoot)) {
    const content = await readFile(file, "utf8");
    for (const specifier of importSpecifiers(content)) {
      if (isApiSourceImport(file, specifier)) {
        failures.push(`${relative(workspaceRoot, file)} -> ${specifier}`);
      }
    }
  }

  assert.deepEqual(failures, []);
});

async function findTypeScriptFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const path = resolve(dir, entry.name);
      if (entry.isDirectory()) return findTypeScriptFiles(path);
      if (entry.isFile() && extname(path) === ".ts" && !path.endsWith(".d.ts")) return [path];
      return [];
    }),
  );

  return files.flat();
}

function importSpecifiers(content) {
  return [...content.matchAll(importPattern)].map((match) => match[1] ?? match[2]);
}

function isApiSourceImport(file, specifier) {
  if (!specifier) return false;
  if (specifier.includes("apps/api/src")) return true;

  if (!specifier.startsWith(".")) return false;

  const resolved = resolve(dirname(file), specifier);
  return toPosix(relative(workspaceRoot, resolved)).startsWith("apps/api/src/");
}

function toPosix(path) {
  return path.split(sep).join("/");
}
