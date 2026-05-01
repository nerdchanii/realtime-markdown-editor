#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { buildBootstrapPlan } from "./db-bootstrap.mjs";

const scriptPath = fileURLToPath(import.meta.url);
const repoRoot = resolve(dirname(scriptPath), "..");

const envFile = localEnvFile();
const bootstrapPlan = buildBootstrapPlan({
  env: envFile ? {} : process.env,
  envText: envFile ? readFileSync(envFile, "utf8") : "",
  migrate: true,
});

run("node", ["scripts/db-bootstrap.mjs", "--migrate", ...(envFile ? ["--env-file", envFile] : [])]);
run("node", ["scripts/seed-local-product.mjs"], {
  ...process.env,
  DATABASE_URL: bootstrapPlan.databaseUrl,
});
run(
  "pnpm",
  ["--parallel", "--filter", "@rme/api", "--filter", "@rme/collab", "--filter", "@rme/web", "dev"],
  {
    ...process.env,
    DATABASE_URL: bootstrapPlan.databaseUrl,
  },
);

function run(command, args, env = process.env) {
  execFileSync(command, args, {
    cwd: repoRoot,
    env,
    stdio: "inherit",
  });
}

function localEnvFile() {
  for (const name of [".env.local", ".env"]) {
    const candidate = join(repoRoot, name);
    if (existsSync(candidate)) return candidate;
  }
  return null;
}
