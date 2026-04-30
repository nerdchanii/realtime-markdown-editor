import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";

import * as Y from "yjs";

import { encodeDocumentKey } from "./session/document-key-codec.js";

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

type FetchLike = (url: URL, init?: RequestInit) => Promise<Response>;

export class HttpLiveYjsPersistenceAdapter implements LiveYjsPersistenceAdapter {
  readonly providerName = "api-postgres";
  private readonly baseUrl: string;
  private readonly fetchImpl: FetchLike;

  constructor(apiBaseUrl: string, fetchImpl: FetchLike = fetch) {
    this.baseUrl = apiBaseUrl.replace(/\/$/, "");
    this.fetchImpl = fetchImpl;
  }

  async loadDocumentState(documentKey: string): Promise<Uint8Array | null> {
    const response = await this.fetchImpl(this.stateUrl(documentKey), { method: "GET" });
    if (response.status === 404 || response.status === 204) return null;
    if (!response.ok) {
      throw new Error(`Failed to load live Yjs document state: ${response.status}`);
    }

    const payload = (await response.json()) as unknown;
    const stateBase64 = readStateBase64(payload);
    return new Uint8Array(Buffer.from(stateBase64, "base64"));
  }

  async storeDocumentState(documentKey: string, state: Uint8Array): Promise<void> {
    const response = await this.fetchImpl(this.stateUrl(documentKey), {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ stateBase64: Buffer.from(state).toString("base64") }),
    });
    if (!response.ok) {
      throw new Error(`Failed to store live Yjs document state: ${response.status}`);
    }
  }

  private stateUrl(documentKey: string): URL {
    return new URL(
      `${this.baseUrl}/collaboration/internal/yjs-documents/${encodeDocumentKey(
        documentKey,
      )}/state`,
    );
  }
}

export class FallbackLiveYjsPersistenceAdapter implements LiveYjsPersistenceAdapter {
  readonly providerName: string;

  constructor(
    private readonly primary: LiveYjsPersistenceAdapter,
    private readonly fallback: LiveYjsPersistenceAdapter,
  ) {
    this.providerName = `${primary.providerName}+${fallback.providerName}-fallback`;
  }

  async loadDocumentState(documentKey: string): Promise<Uint8Array | null> {
    try {
      return await this.primary.loadDocumentState(documentKey);
    } catch (error) {
      console.warn(
        `[collab] ${this.primary.providerName} live Yjs load failed; using ${this.fallback.providerName}: ${String(
          error,
        )}`,
      );
      return this.fallback.loadDocumentState(documentKey);
    }
  }

  async storeDocumentState(documentKey: string, state: Uint8Array): Promise<void> {
    try {
      await this.primary.storeDocumentState(documentKey, state);
    } catch (error) {
      console.warn(
        `[collab] ${this.primary.providerName} live Yjs store failed; using ${this.fallback.providerName}: ${String(
          error,
        )}`,
      );
      await this.fallback.storeDocumentState(documentKey, state);
    }
  }
}

function readStateBase64(payload: unknown): string {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Live Yjs state response must be an object.");
  }

  const stateBase64 = (payload as Record<string, unknown>).stateBase64;
  if (typeof stateBase64 !== "string") {
    throw new Error("Live Yjs state response requires stateBase64.");
  }
  return stateBase64;
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
