#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const repoRoot = resolve(dirname(scriptPath), "..");

export function slugifyTaskName(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function portsForSlug(slug) {
  const offset = (hashSlug(slug) + 724) % 800;
  return {
    API_PORT: String(4100 + offset),
    WEB_PORT: String(5100 + offset),
    COLLAB_PORT: String(6100 + offset),
  };
}

export function databaseNameForSlug(slug) {
  return `rme_${slug.replace(/-/g, "_")}`.replace(/[^a-z0-9_]/g, "_").slice(0, 63);
}

export function buildWorktreeEnv(sourceEnv, slug) {
  const ports = portsForSlug(slug);
  const databaseName = databaseNameForSlug(slug);
  const lines = sourceEnv.split(/\r?\n/);
  const seen = new Set();
  const rewritten = lines.map((line) => {
    const key = parseEnvKey(line);
    if (!key) return line;
    seen.add(key);

    if (key === "API_PORT") return `API_PORT=${ports.API_PORT}`;
    if (key === "WEB_PORT") return `WEB_PORT=${ports.WEB_PORT}`;
    if (key === "COLLAB_PORT") return `COLLAB_PORT=${ports.COLLAB_PORT}`;
    if (key === "DATABASE_URL")
      return `DATABASE_URL=${rewriteDatabaseUrl(readEnvValue(line), databaseName)}`;

    return line;
  });

  for (const [key, value] of Object.entries(ports)) {
    if (!seen.has(key)) rewritten.push(`${key}=${value}`);
  }

  return `${rewritten.join("\n").replace(/\n+$/u, "")}\n`;
}

export function redactEnvForSummary(envContent) {
  const preferred = ["API_PORT", "WEB_PORT", "COLLAB_PORT", "DATABASE_URL"];
  const keys = envContent
    .split(/\r?\n/)
    .map(parseEnvKey)
    .filter((key) => key !== null);
  const ordered = [
    ...preferred.filter((key) => keys.includes(key)),
    ...keys.filter((key) => !preferred.includes(key)),
  ];
  const known = ordered.filter((key) => preferred.includes(key));
  const additionalCount = new Set(ordered.filter((key) => !preferred.includes(key))).size;
  const summary = [...new Set(known)].map((key) => `${key} configured`);
  if (additionalCount === 1) summary.push("1 additional env variable copied");
  if (additionalCount > 1) summary.push(`${additionalCount} additional env variables copied`);
  return summary;
}

function hashSlug(slug) {
  let hash = 0;
  for (const [index, char] of [...slug].entries()) {
    hash = (hash + char.charCodeAt(0) * (index + 1)) % 800;
  }
  return hash;
}

function parseEnvKey(line) {
  const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=/u);
  return match?.[1] ?? null;
}

function readEnvValue(line) {
  const separator = line.indexOf("=");
  return separator === -1 ? "" : line.slice(separator + 1).trim();
}

function rewriteDatabaseUrl(rawValue, databaseName) {
  try {
    const url = new URL(stripEnvQuotes(rawValue));
    url.pathname = `/${databaseName}`;
    return restoreEnvQuotes(rawValue, url.toString());
  } catch {
    return rawValue;
  }
}

function stripEnvQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function restoreEnvQuotes(original, value) {
  if (original.startsWith('"') && original.endsWith('"')) return `"${value}"`;
  if (original.startsWith("'") && original.endsWith("'")) return `'${value}'`;
  return value;
}

function main() {
  const options = readCliOptions();
  if (!options) return;

  assertIgnored(".worktrees");

  const worktreePath = join(repoRoot, ".worktrees", options.slug);
  if (!existsSync(worktreePath)) {
    mkdirSync(dirname(worktreePath), { recursive: true });
    addWorktree(worktreePath, options.branchName);
  }

  const { targetEnvPath, worktreeEnv } = writeWorktreeEnv(worktreePath, options.slug);

  console.log(`Worktree ready: ${relativeToRepo(worktreePath)}`);
  console.log(`Generated local env: ${relativeToRepo(targetEnvPath)}`);
  for (const line of redactEnvForSummary(worktreeEnv)) {
    console.log(`- ${line}`);
  }
  console.log("Run from the worktree with env loaded from .env.local.");
}

function readCliOptions() {
  const taskName = process.argv[2];
  const branchName = process.argv[3];
  if (!taskName) {
    console.error("Usage: node scripts/worktree-create.mjs <task-name> [branch-name]");
    process.exitCode = 1;
    return null;
  }

  const slug = slugifyTaskName(taskName);
  if (!slug) {
    console.error("Task name must contain at least one alphanumeric character.");
    process.exitCode = 1;
    return null;
  }

  return { branchName: branchName ?? slug, slug };
}

function writeWorktreeEnv(worktreePath, slug) {
  const sourceEnvPath = join(repoRoot, ".env");
  if (!existsSync(sourceEnvPath)) {
    console.error("Root .env was not found; create it before generating a worktree env.");
    process.exit(1);
  }

  const targetEnvPath = join(worktreePath, ".env.local");
  const sourceEnv = readFileSync(sourceEnvPath, "utf8");
  const worktreeEnv = buildWorktreeEnv(sourceEnv, slug);
  writeFileSync(targetEnvPath, worktreeEnv, { mode: 0o600 });

  return { targetEnvPath, worktreeEnv };
}

function assertIgnored(path) {
  try {
    execFileSync("git", ["check-ignore", "-q", path], { cwd: repoRoot, stdio: "ignore" });
  } catch {
    console.error(`${path} must be ignored before creating local worktrees.`);
    process.exit(1);
  }
}

function addWorktree(worktreePath, branchName) {
  try {
    execFileSync("git", ["rev-parse", "--verify", branchName], {
      cwd: repoRoot,
      stdio: "ignore",
    });
    execFileSync("git", ["worktree", "add", worktreePath, branchName], {
      cwd: repoRoot,
      stdio: "inherit",
    });
  } catch {
    execFileSync("git", ["worktree", "add", "-b", branchName, worktreePath], {
      cwd: repoRoot,
      stdio: "inherit",
    });
  }
}

function relativeToRepo(path) {
  return path.startsWith(`${repoRoot}/`) ? path.slice(repoRoot.length + 1) : path;
}

if (process.argv[1] === scriptPath) {
  main();
}
