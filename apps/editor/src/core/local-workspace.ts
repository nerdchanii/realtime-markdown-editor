import { IndexeddbPersistence } from "y-indexeddb";
import * as Y from "yjs";

import { initDocument, type DocumentType, type TypeModule } from "./document";

// Local workspace (ADR-0011, `authority: local`): the canonical copy lives in this browser.
// No account and no server. Each document is its own Y.Doc persisted with y-indexeddb, so the
// same Y.Doc can later be attached to a sync provider without changing its structure.
//
// The index only lists which documents exist. Titles live in each document's `meta`, so there is
// one source of truth per value.

export const WORKSPACE_AUTHORITY = "local";

export interface DocumentEntry {
  id: string;
  type: DocumentType;
  createdAt: string;
}

interface OpenDocument {
  doc: Y.Doc;
  persistence: IndexeddbPersistence;
  ready: Promise<Y.Doc>;
}

export class LocalWorkspace {
  private readonly index = new Y.Doc();
  private readonly entries = this.index.getMap<DocumentEntry>("documents");
  private readonly indexPersistence: IndexeddbPersistence;
  private readonly documents = new Map<string, OpenDocument>();
  private cachedList: DocumentEntry[] | null = null;

  constructor(private readonly namespace = "rme-local") {
    this.indexPersistence = new IndexeddbPersistence(`${namespace}:index`, this.index);
    // Registered first, so the cache is cleared before any subscriber reads the list.
    this.entries.observe(() => {
      this.cachedList = null;
    });
  }

  async ready(): Promise<void> {
    await this.indexPersistence.whenSynced;
  }

  // Returns the same array until the index changes (a stable snapshot for React).
  list = (): DocumentEntry[] => {
    this.cachedList ??= [...this.entries.values()].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
    return this.cachedList;
  };

  subscribe = (listener: () => void): (() => void) => {
    this.entries.observe(listener);
    return () => this.entries.unobserve(listener);
  };

  async createDocument(module: TypeModule, now = new Date()): Promise<DocumentEntry> {
    const id = crypto.randomUUID();
    const doc = await this.openDocument(id);
    initDocument(doc, module, now);
    const entry: DocumentEntry = { id, type: module.type, createdAt: now.toISOString() };
    this.entries.set(id, entry);
    return entry;
  }

  openDocument(id: string): Promise<Y.Doc> {
    const open = this.documents.get(id) ?? this.attach(id);
    return open.ready;
  }

  async destroy(): Promise<void> {
    for (const { persistence, doc } of this.documents.values()) {
      await persistence.destroy();
      doc.destroy();
    }
    this.documents.clear();
    await this.indexPersistence.destroy();
    this.index.destroy();
  }

  private attach(id: string): OpenDocument {
    const doc = new Y.Doc({ guid: id });
    const persistence = new IndexeddbPersistence(`${this.namespace}:doc:${id}`, doc);
    const open = { doc, persistence, ready: persistence.whenSynced.then(() => doc) };
    this.documents.set(id, open);
    return open;
  }
}
