import assert from "node:assert/strict";
import test from "node:test";

import {
  applyWorktreeEnvOverrides,
  buildPostgresBootstrapArgs,
  buildWorktreeEnv,
  databaseNameForSlug,
  portsForSlug,
  redactEnvForSummary,
  slugifyTaskName,
} from "./worktree-create.mjs";

test("slugifyTaskName creates a filesystem-safe worktree slug", () => {
  assert.equal(
    slugifyTaskName("TASK-077 DB backed collaboration"),
    "task-077-db-backed-collaboration",
  );
  assert.equal(slugifyTaskName("../TASK 078!!"), "task-078");
});

test("portsForSlug assigns stable distinct ports for a slug", () => {
  assert.deepEqual(portsForSlug("task-077-collab-persistence"), {
    API_PORT: "4575",
    WEB_PORT: "5575",
    COLLAB_PORT: "6575",
  });
});

test("databaseNameForSlug creates a Postgres-safe database name", () => {
  assert.equal(
    databaseNameForSlug("task-077-collab-persistence"),
    "rme_task_077_collab_persistence",
  );
});

test("buildWorktreeEnv copies env content but rewrites runtime isolation keys", () => {
  const source = [
    "EXTRA_SETTING=example-value",
    "DATABASE_URL=postgresql://127.0.0.1:5432/realtime_markdown_editor",
    "API_PORT=4000",
    "WEB_PORT=5173",
    "COLLAB_PORT=4001",
    "",
  ].join("\n");

  const result = buildWorktreeEnv(source, "task-077-collab-persistence");

  assert.match(result, /^EXTRA_SETTING=example-value$/m);
  assert.match(result, /^API_PORT=4575$/m);
  assert.match(result, /^WEB_PORT=5575$/m);
  assert.match(result, /^COLLAB_PORT=6575$/m);
  assert.match(
    result,
    /^DATABASE_URL=postgresql:\/\/127\.0\.0\.1:5432\/rme_task_077_collab_persistence$/m,
  );
});

test("buildWorktreeEnv preserves non-default Postgres host ports", () => {
  const source = [
    "POSTGRES_HOST_PORT=55432",
    "DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:55432/realtime_markdown_editor",
    "",
  ].join("\n");

  const result = buildWorktreeEnv(source, "task-080-frontend-api");

  assert.match(result, /^POSTGRES_HOST_PORT=55432$/m);
  assert.match(
    result,
    /^DATABASE_URL=postgresql:\/\/postgres:postgres@127\.0\.0\.1:55432\/rme_task_080_frontend_api$/m,
  );
});

test("buildWorktreeEnv adds POSTGRES_HOST_PORT when DATABASE_URL uses a non-default port", () => {
  const source = [
    "DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:55432/realtime_markdown_editor",
    "",
  ].join("\n");

  const result = buildWorktreeEnv(source, "task-078-checkpoints");

  assert.match(result, /^POSTGRES_HOST_PORT=55432$/m);
  assert.match(
    result,
    /^DATABASE_URL=postgresql:\/\/postgres:postgres@127\.0\.0\.1:55432\/rme_task_078_checkpoints$/m,
  );
});

test("applyWorktreeEnvOverrides lets callers choose a non-default database host port", () => {
  const source = [
    "POSTGRES_HOST_PORT=5432",
    "DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/realtime_markdown_editor",
    "API_PORT=4000",
  ].join("\n");

  const result = applyWorktreeEnvOverrides(source, {
    POSTGRES_HOST_PORT: "55433",
    DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:55433/realtime_markdown_editor",
  });

  assert.match(result, /^POSTGRES_HOST_PORT=55433$/m);
  assert.match(
    result,
    /^DATABASE_URL=postgresql:\/\/postgres:postgres@127\.0\.0\.1:55433\/realtime_markdown_editor$/m,
  );
  assert.match(result, /^API_PORT=4000$/m);
});

test("redactEnvForSummary never returns secret values", () => {
  const summary = redactEnvForSummary(
    [
      "EXTRA_SETTING=example-value",
      "DATABASE_URL=postgresql://127.0.0.1:5432/rme_task",
      "API_PORT=4575",
      "WEB_PORT=5575",
      "COLLAB_PORT=6575",
    ].join("\n"),
  );

  assert.deepEqual(summary, [
    "API_PORT configured",
    "WEB_PORT configured",
    "COLLAB_PORT configured",
    "DATABASE_URL configured",
    "1 additional env variable copied",
  ]);
  assert.ok(!summary.join("\n").includes("example-value"));
  assert.ok(!summary.join("\n").includes("postgres://"));
  assert.ok(!summary.join("\n").includes("EXTRA_SETTING"));
});

test("buildPostgresBootstrapArgs points bootstrap at the generated worktree env", () => {
  assert.deepEqual(buildPostgresBootstrapArgs("/repo/.worktrees/task/.env.local"), [
    "scripts/db-bootstrap.mjs",
    "--env-file",
    "/repo/.worktrees/task/.env.local",
  ]);
});
