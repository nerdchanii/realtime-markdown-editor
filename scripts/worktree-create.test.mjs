import assert from "node:assert/strict";
import test from "node:test";

import {
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
