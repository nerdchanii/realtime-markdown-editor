import * as Y from "yjs";

// Document core (ADR-0013). A document is one Y.Doc with two roots:
// - `meta` (Y.Map): owned by core, shared by every type (type, schemaVersion, title, createdAt).
// - `content`: owned by the type module (markdown: Y.Text).
// Core never reads `content` directly; it goes through the type module.

export const META_ROOT = "meta";
export const CONTENT_ROOT = "content";

export type DocumentType = "markdown";

export interface DocumentMeta {
  type: DocumentType;
  schemaVersion: number;
  title: string;
  createdAt: string;
}

export interface TypeModule {
  type: DocumentType;
  schemaVersion: number;
  // Projections must work without browser APIs so a server can compute them too.
  toText(doc: Y.Doc): string;
  toMarkdown?(doc: Y.Doc): string;
}

export interface DocumentSnapshot {
  type: DocumentType;
  schemaVersion: number;
  content: string;
}

export function metaMap(doc: Y.Doc): Y.Map<unknown> {
  return doc.getMap(META_ROOT);
}

// Writes the initial meta once, when the document is created. Loading an existing document never
// calls this, so persisted state is never overwritten by defaults.
export function initDocument(doc: Y.Doc, module: TypeModule, now: Date): void {
  doc.transact(() => {
    const meta = metaMap(doc);
    meta.set("type", module.type);
    meta.set("schemaVersion", module.schemaVersion);
    meta.set("title", "");
    meta.set("createdAt", now.toISOString());
  });
}

export function readMeta(doc: Y.Doc): DocumentMeta | null {
  const meta = metaMap(doc);
  const type = meta.get("type");
  const schemaVersion = meta.get("schemaVersion");
  if (type !== "markdown" || typeof schemaVersion !== "number") return null;
  const title = meta.get("title");
  const createdAt = meta.get("createdAt");
  return {
    type,
    schemaVersion,
    title: typeof title === "string" ? title : "",
    createdAt: typeof createdAt === "string" ? createdAt : "",
  };
}

export function setTitle(doc: Y.Doc, title: string): void {
  metaMap(doc).set("title", title);
}

export function snapshotDocument(doc: Y.Doc, module: TypeModule): DocumentSnapshot {
  return { type: module.type, schemaVersion: module.schemaVersion, content: module.toText(doc) };
}
