import assert from "node:assert/strict";
import os from "node:os";
import test from "node:test";

import {
  buildBootstrapPlan,
  buildPgIsReadyArgs,
  databaseNameFromDatabaseUrl,
  loadEnvValueFromEnvText,
  loadDatabaseUrlFromEnvText,
  quotePostgresIdentifier,
  quotePostgresLiteral,
} from "./db-bootstrap.mjs";

test("databaseNameFromDatabaseUrl reads the database path from DATABASE_URL", () => {
  assert.equal(
    databaseNameFromDatabaseUrl(
      "postgresql://postgres:postgres@127.0.0.1:5432/realtime_markdown_editor",
    ),
    "realtime_markdown_editor",
  );
  assert.equal(
    databaseNameFromDatabaseUrl("postgres://postgres@127.0.0.1:5432/rme_task_077?schema=public"),
    "rme_task_077",
  );
});

test("databaseNameFromDatabaseUrl rejects URLs without a concrete database name", () => {
  assert.throws(
    () => databaseNameFromDatabaseUrl("postgresql://postgres:postgres@127.0.0.1:5432/"),
    /DATABASE_URL must include a database name/u,
  );
});

test("loadDatabaseUrlFromEnvText reads DATABASE_URL without exposing other env values", () => {
  assert.equal(
    loadDatabaseUrlFromEnvText(
      [
        "API_PORT=4000",
        "DATABASE_URL='postgresql://postgres:postgres@127.0.0.1:5432/rme_task_078'",
        "EXTRA_SECRET=do-not-print",
      ].join("\n"),
    ),
    "postgresql://postgres:postgres@127.0.0.1:5432/rme_task_078",
  );
});

test("loadEnvValueFromEnvText reads POSTGRES_HOST_PORT from env text", () => {
  assert.equal(
    loadEnvValueFromEnvText("POSTGRES_HOST_PORT", "POSTGRES_HOST_PORT=55432\n"),
    "55432",
  );
  assert.equal(loadEnvValueFromEnvText("POSTGRES_HOST_PORT", "DATABASE_URL=example\n"), null);
});

test("Postgres quoting helpers escape identifiers and literals", () => {
  assert.equal(quotePostgresIdentifier('rme_"quoted"'), '"rme_""quoted"""');
  assert.equal(quotePostgresLiteral("rme_'quoted'"), "'rme_''quoted'''");
});

test("buildPgIsReadyArgs targets the host and port from the bootstrap plan", () => {
  assert.deepEqual(
    buildPgIsReadyArgs({
      postgresHost: "127.0.0.1",
      postgresHost: "127.0.0.1",
      postgresHostPort: "55433",
      postgresUser: "postgres",
    }),
    ["pg_isready", "-h", "127.0.0.1", "-p", "55433", "-U", "postgres", "-d", "postgres"],
  );
});

test("buildBootstrapPlan defaults to the main local database as the current OS user", () => {
  const currentUser = os.userInfo().username;
  assert.deepEqual(buildBootstrapPlan({ env: {} }), {
    databaseName: "realtime_markdown_editor",
    databaseUrl: `postgresql://${currentUser}@127.0.0.1:5432/realtime_markdown_editor`,
    migrate: false,
    postgresHost: "127.0.0.1",
    postgresHostPort: "5432",
    postgresUser: currentUser,
  });
});

test("buildBootstrapPlan derives host port and database names from DATABASE_URL", () => {
  assert.deepEqual(
    buildBootstrapPlan({
      envText: "DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:55432/rme_task_080",
      migrate: true,
    }),
    {
      databaseName: "rme_task_080",
      databaseUrl: "postgresql://postgres:postgres@127.0.0.1:55432/rme_task_080",
      migrate: true,
      postgresHost: "127.0.0.1",
      postgresHostPort: "55432",
      postgresUser: "postgres",
    },
  );
});

test("buildBootstrapPlan lets POSTGRES_HOST_PORT override the DATABASE_URL port", () => {
  assert.deepEqual(
    buildBootstrapPlan({
      envText: [
        "POSTGRES_HOST_PORT=55433",
        "DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/rme_task_081",
      ].join("\n"),
    }),
    {
      databaseName: "rme_task_081",
      databaseUrl: "postgresql://postgres:postgres@127.0.0.1:55433/rme_task_081",
      migrate: false,
      postgresHost: "127.0.0.1",
      postgresHostPort: "55433",
      postgresUser: "postgres",
    },
  );
});

test("buildBootstrapPlan can prefer an explicit env file over process env", () => {
  assert.deepEqual(
    buildBootstrapPlan({
      env: {},
      envText: [
        "POSTGRES_HOST_PORT=55432",
        "DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:55432/rme_task_env_file",
      ].join("\n"),
    }),
    {
      databaseName: "rme_task_env_file",
      databaseUrl: "postgresql://postgres:postgres@127.0.0.1:55432/rme_task_env_file",
      migrate: false,
      postgresHost: "127.0.0.1",
      postgresHostPort: "55432",
      postgresUser: "postgres",
    },
  );
});
