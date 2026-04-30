import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";

import * as Y from "yjs";

export type YjsDocumentStore = {
  readonly persistenceProviderName: string;
  loadDocument(
    documentKey: string,
    document: Y.Doc,
    fallbackMarkdown?: string | null,
  ): Promise<void>;
  storeDocument(documentKey: string, document: Y.Doc): Promise<void>;
};

export type LiveYjsPersistenceAdapter = {
  readonly providerName: string;
  loadDocumentState(documentKey: string): Promise<Uint8Array | null>;
  storeDocumentState(documentKey: string, state: Uint8Array): Promise<void>;
};

export type SeededYjsDocument = Readonly<{
  documentKey: string;
  markdown: string;
}>;

export type SeededYjsDocumentStoreOptions = Readonly<{
  seed: SeededYjsDocument;
  persistence: LiveYjsPersistenceAdapter;
}>;

export class SeededYjsDocumentStore implements YjsDocumentStore {
  private readonly seed: SeededYjsDocument;
  private readonly persistence: LiveYjsPersistenceAdapter;

  constructor(options: SeededYjsDocumentStoreOptions) {
    this.seed = options.seed;
    this.persistence = options.persistence;
  }

  get persistenceProviderName(): string {
    return this.persistence.providerName;
  }

  async loadDocument(
    documentKey: string,
    document: Y.Doc,
    fallbackMarkdown?: string | null,
  ): Promise<void> {
    const snapshot = await this.persistence.loadDocumentState(documentKey);
    if (snapshot) return applySnapshot(document, snapshot);

    const bootstrapMarkdown = this.resolveBootstrapMarkdown(documentKey, fallbackMarkdown);
    if (bootstrapMarkdown === null) return;

    insertBootstrapMarkdown(document, bootstrapMarkdown);
    await this.storeDocument(documentKey, document);
  }

  async storeDocument(documentKey: string, document: Y.Doc): Promise<void> {
    await this.persistence.storeDocumentState(documentKey, Y.encodeStateAsUpdate(document));
  }

  private resolveBootstrapMarkdown(
    documentKey: string,
    fallbackMarkdown: string | null | undefined,
  ): string | null {
    if (fallbackMarkdown !== undefined && fallbackMarkdown !== null) return fallbackMarkdown;
    if (documentKey === this.seed.documentKey) return this.seed.markdown;
    return null;
  }
}

function applySnapshot(document: Y.Doc, snapshot: Uint8Array): void {
  Y.applyUpdate(document, snapshot);
}

function insertBootstrapMarkdown(document: Y.Doc, markdownBody: string): void {
  const markdown = document.getText("markdown");
  if (markdown.length === 0) markdown.insert(0, markdownBody);
}

export class InMemoryLiveYjsPersistenceAdapter implements LiveYjsPersistenceAdapter {
  readonly providerName = "memory";
  private readonly snapshots = new Map<string, Uint8Array>();

  async loadDocumentState(documentKey: string): Promise<Uint8Array | null> {
    return this.snapshots.get(documentKey) ?? null;
  }

  async storeDocumentState(documentKey: string, state: Uint8Array): Promise<void> {
    this.snapshots.set(documentKey, state);
  }
}

export class FileSystemLiveYjsPersistenceAdapter implements LiveYjsPersistenceAdapter {
  readonly providerName = "filesystem";

  constructor(private readonly directory: string) {}

  async loadDocumentState(documentKey: string): Promise<Uint8Array | null> {
    try {
      return await readFile(this.documentPath(documentKey));
    } catch (error) {
      if (isNodeError(error) && error.code === "ENOENT") return null;
      throw error;
    }
  }

  async storeDocumentState(documentKey: string, state: Uint8Array): Promise<void> {
    await mkdir(this.directory, { recursive: true });

    const path = this.documentPath(documentKey);
    const temporaryPath = `${path}.${process.pid}.${randomUUID()}.tmp`;
    await writeFile(temporaryPath, state);
    await rename(temporaryPath, path);
  }

  private documentPath(documentKey: string): string {
    const encodedDocumentKey = Buffer.from(documentKey, "utf8").toString("base64url");
    return join(this.directory, `${encodedDocumentKey}.yjs`);
  }
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
