#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const repoRoot = resolve(dirname(scriptPath), "..");
const defaultDatabaseUrl = "postgresql://postgres:postgres@127.0.0.1:5432/realtime_markdown_editor";
const defaultPostgresHostPort = "5432";
const defaultReadyTimeoutMs = 30_000;
const defaultReadyIntervalMs = 1_000;

export function databaseNameFromDatabaseUrl(databaseUrl) {
  const parsed = new URL(databaseUrl);
  if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
    throw new Error("DATABASE_URL must use the postgres or postgresql protocol.");
  }

  const databaseName = decodeURIComponent(parsed.pathname.replace(/^\/+/u, ""));
  if (!databaseName) {
    throw new Error("DATABASE_URL must include a database name.");
  }
  return databaseName;
}

export function loadDatabaseUrlFromEnvText(envText) {
  return loadEnvValueFromEnvText("DATABASE_URL", envText);
}

export function loadEnvValueFromEnvText(name, envText) {
  for (const line of envText.split(/\r?\n/u)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/u);
    if (match?.[1] !== name) continue;
    if (match) return stripEnvQuotes(match[2].trim());
  }
  return null;
}

export function quotePostgresIdentifier(value) {
  return `"${value.replaceAll('"', '""')}"`;
}

export function quotePostgresLiteral(value) {
  return `'${value.replaceAll("'", "''")}'`;
}

export function buildPgIsReadyArgs(postgresUser) {
  return ["pg_isready", "-U", postgresUser, "-d", "postgres"];
}

export function buildBootstrapPlan({ env = process.env, envText = null, migrate = false } = {}) {
  const sourceDatabaseUrl = resolveDatabaseUrl(env, envText);
  const parsed = new URL(sourceDatabaseUrl);
  const postgresHostPort = resolvePostgresHostPort(env, envText, parsed);
  parsed.port = postgresHostPort;
  const databaseUrl = parsed.toString();

  return {
    databaseName: databaseNameFromDatabaseUrl(databaseUrl),
    databaseUrl,
    migrate,
    postgresHostPort,
    postgresUser: decodeURIComponent(parsed.username || "postgres"),
  };
}

function main() {
  const migrate = process.argv.includes("--migrate");
  const envFile = readOptionValue("--env-file");
  const plan = buildBootstrapPlan(buildPlanInput({ envFile, migrate }));

  const composeEnv = { ...process.env, POSTGRES_HOST_PORT: plan.postgresHostPort };
  compose(["up", "-d", "postgres"], { env: composeEnv });
  const containerId = readPostgresContainerId(composeEnv);

  waitForPostgres({ containerId, postgresUser: plan.postgresUser });
  ensureDatabase({ containerId, databaseName: plan.databaseName, postgresUser: plan.postgresUser });
  console.log(`Postgres is ready; ensured database ${plan.databaseName}.`);

  runMigrationsIfRequested(plan);
}

function resolveDatabaseUrl(env, envText) {
  return env.DATABASE_URL ?? loadDatabaseUrlFromEnvText(envText ?? "") ?? defaultDatabaseUrl;
}

function resolvePostgresHostPort(env, envText, parsedDatabaseUrl) {
  const configuredPort =
    env.POSTGRES_HOST_PORT ??
    loadEnvValueFromEnvText("POSTGRES_HOST_PORT", envText ?? "") ??
    parsedDatabaseUrl.port;
  return configuredPort || defaultPostgresHostPort;
}

function buildPlanInput({ envFile, migrate }) {
  return {
    env: envFile ? {} : process.env,
    envText: readEnvTextForPlan(envFile),
    migrate,
  };
}

function readEnvTextForPlan(envFile) {
  if (envFile) return readFileSync(envFile, "utf8");
  if (process.env.DATABASE_URL) return "";
  return readLocalEnvText();
}

function readPostgresContainerId(composeEnv) {
  const containerId = compose(["ps", "-q", "postgres"], {
    encoding: "utf8",
    env: composeEnv,
  }).trim();
  if (!containerId) {
    throw new Error("Docker Compose did not return a postgres container id.");
  }
  return containerId;
}

function runMigrationsIfRequested(plan) {
  if (!plan.migrate) return;
  execFileSync("pnpm", ["--filter", "@rme/api", "db:migrate:deploy"], {
    cwd: repoRoot,
    env: { ...process.env, DATABASE_URL: plan.databaseUrl },
    stdio: "inherit",
  });
}

function readLocalEnvText() {
  for (const envFile of [".env.local", ".env"]) {
    const envPath = join(repoRoot, envFile);
    if (existsSync(envPath)) return readFileSync(envPath, "utf8");
  }
  return "";
}

function ensureDatabase({ containerId, databaseName, postgresUser }) {
  const existsSql = `SELECT 1 FROM pg_database WHERE datname = ${quotePostgresLiteral(databaseName)}`;
  const exists = dockerExec(containerId, [
    "psql",
    "-U",
    postgresUser,
    "-d",
    "postgres",
    "-tAc",
    existsSql,
  ])
    .trim()
    .includes("1");

  if (exists) return;

  dockerExec(
    containerId,
    [
      "psql",
      "-U",
      postgresUser,
      "-d",
      "postgres",
      "-v",
      "ON_ERROR_STOP=1",
      "-c",
      `CREATE DATABASE ${quotePostgresIdentifier(databaseName)}`,
    ],
    { stdio: "inherit" },
  );
}

function waitForPostgres({
  containerId,
  postgresUser,
  timeoutMs = defaultReadyTimeoutMs,
  intervalMs = defaultReadyIntervalMs,
}) {
  const startedAt = Date.now();
  let lastError = null;

  while (Date.now() - startedAt < timeoutMs) {
    try {
      dockerExec(containerId, buildPgIsReadyArgs(postgresUser), { stdio: "ignore" });
      return;
    } catch (error) {
      lastError = error;
      sleep(intervalMs);
    }
  }

  const seconds = Math.round(timeoutMs / 1000);
  throw new Error(`Postgres did not become ready within ${seconds}s.`, { cause: lastError });
}

function compose(args, options = {}) {
  return execFileSync("docker", ["compose", ...args], {
    cwd: repoRoot,
    env: options.env ?? process.env,
    stdio: options.stdio ?? "pipe",
    encoding: options.encoding,
  });
}

function dockerExec(containerId, args, options = {}) {
  return execFileSync("docker", ["exec", containerId, ...args], {
    cwd: repoRoot,
    stdio: options.stdio ?? "pipe",
    encoding: options.encoding ?? "utf8",
  });
}

function sleep(milliseconds) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
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

function readOptionValue(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  const value = process.argv[index + 1];
  if (!value) {
    throw new Error(`${name} requires a value.`);
  }
  return value;
}

if (process.argv[1] === scriptPath) {
  main();
}
