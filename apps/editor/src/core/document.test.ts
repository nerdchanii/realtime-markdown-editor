import assert from "node:assert/strict";
import { test } from "node:test";

import * as Y from "yjs";

import { markdownContent, markdownType } from "../types/markdown/module";
import { initDocument, readMeta, snapshotDocument } from "./document";

test("a new markdown document has core meta and a Y.Text content root", () => {
  const doc = new Y.Doc();
  initDocument(doc, markdownType, new Date("2026-09-26T00:00:00Z"));
  markdownContent(doc).insert(0, "# Hello");

  assert.deepEqual(readMeta(doc), {
    type: "markdown",
    schemaVersion: 1,
    createdAt: "2026-09-26T00:00:00.000Z",
  });
  assert.deepEqual(snapshotDocument(doc, markdownType), {
    type: "markdown",
    schemaVersion: 1,
    content: "# Hello",
  });
  assert.equal(markdownType.title(doc), "Hello");
});

test("the document is plain Yjs state that a sync provider can carry unchanged", () => {
  const local = new Y.Doc();
  initDocument(local, markdownType, new Date("2026-09-26T00:00:00Z"));
  markdownContent(local).insert(0, "local text");

  // A provider (Hocuspocus in slice 2) only exchanges Yjs updates.
  const remote = new Y.Doc();
  Y.applyUpdate(remote, Y.encodeStateAsUpdate(local));
  assert.deepEqual(readMeta(remote), readMeta(local));
  assert.equal(markdownContent(remote).toString(), "local text");

  markdownContent(remote).insert(0, "remote + ");
  Y.applyUpdate(local, Y.encodeStateAsUpdate(remote, Y.encodeStateVector(local)));
  assert.equal(markdownContent(local).toString(), "remote + local text");
});

test("readMeta rejects a document without core meta", () => {
  assert.equal(readMeta(new Y.Doc()), null);
});
