import "fake-indexeddb/auto";

import assert from "node:assert/strict";
import { test } from "node:test";

import { markdownContent, markdownType } from "../types/markdown/module";
import { LocalWorkspace } from "./local-workspace";

test("documents and their content survive reopening the local workspace", async () => {
  const first = new LocalWorkspace("test-reopen");
  await first.ready();
  assert.deepEqual(first.list(), []);

  const entry = await first.createDocument(markdownType, new Date("2026-09-26T00:00:00Z"));
  const doc = await first.openDocument(entry.id);
  markdownContent(doc).insert(0, "# Plan\n\n- ship slice 1");
  await first.destroy();

  const second = new LocalWorkspace("test-reopen");
  await second.ready();
  assert.deepEqual(second.list(), [entry]);
  const reopened = await second.openDocument(entry.id);
  assert.equal(markdownType.title(reopened), "Plan");
  assert.equal(markdownContent(reopened).toString(), "# Plan\n\n- ship slice 1");
  await second.destroy();
});

test("the list is newest first and notifies subscribers", async () => {
  const workspace = new LocalWorkspace("test-order");
  await workspace.ready();
  let notified = 0;
  const unsubscribe = workspace.subscribe(() => notified++);
  const older = await workspace.createDocument(markdownType, new Date("2026-09-25T00:00:00Z"));
  const newer = await workspace.createDocument(markdownType, new Date("2026-09-26T00:00:00Z"));
  assert.deepEqual(
    workspace.list().map((e) => e.id),
    [newer.id, older.id],
  );
  assert.equal(notified, 2);
  unsubscribe();
  await workspace.destroy();
});
