#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { buildBootstrapPlan } from "./db-bootstrap.mjs";

const scriptPath = fileURLToPath(import.meta.url);
const repoRoot = resolve(dirname(scriptPath), "..");

const envFile = localEnvFile();
const envText = envFile ? readFileSync(envFile, "utf8") : "";
const localEnv = parseEnvText(envText);
const bootstrapPlan = buildBootstrapPlan({
  env: envFile ? {} : process.env,
  envText,
  migrate: true,
});
const runtimeEnv = {
  ...localEnv,
  ...process.env,
  DATABASE_URL: bootstrapPlan.databaseUrl,
};
// API 와 collab 은 같은 협업 연결 token 서명 값을 써야 한다. env 에 없으면 이번 실행에만 쓸 임의 값을 만든다.
// 값은 출력하지 않는다. 고정 기본값은 두지 않는다.
if (!runtimeEnv.RME_COLLAB_TOKEN_SECRET) {
  runtimeEnv.RME_COLLAB_TOKEN_SECRET = randomBytes(32).toString("base64url");
}

run("node", ["scripts/db-bootstrap.mjs", "--migrate", ...(envFile ? ["--env-file", envFile] : [])]);
run("node", ["scripts/seed-local-product.mjs"], runtimeEnv);
run(
  "pnpm",
  ["--parallel", "--filter", "@rme/api", "--filter", "@rme/collab", "--filter", "@rme/web", "dev"],
  runtimeEnv,
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

function parseEnvText(envText) {
  const env = {};

  for (const line of envText.split(/\r?\n/u)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/u);
    if (!match) continue;
    env[match[1]] = stripEnvQuotes(match[2].trim());
  }

  return env;
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
