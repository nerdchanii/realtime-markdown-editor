import * as Y from "yjs";

import type { CollaborationSessionDto } from "@rme/contracts";

const databaseName = "rme-editor-offline-drafts";
const databaseVersion = 1;
const draftStoreName = "yjs-drafts";

export type OfflineDraftPersistenceSnapshot = Readonly<{
  hydrated: boolean;
  recovered: boolean;
  available: boolean;
}>;

type SnapshotListener = (snapshot: OfflineDraftPersistenceSnapshot) => void;

export type OfflineDraftPersistence = Readonly<{
  snapshot: () => OfflineDraftPersistenceSnapshot;
  subscribe: (listener: SnapshotListener) => () => void;
  destroy: () => void;
}>;

export function createIndexedDbOfflineDraftPersistence(
  session: CollaborationSessionDto,
  document: Y.Doc,
): OfflineDraftPersistence {
  const persistence = new IndexedDbOfflineDraftPersistence(session, document);
  persistence.start();
  return persistence;
}

class IndexedDbOfflineDraftPersistence implements OfflineDraftPersistence {
  private readonly key: string;
  private readonly listeners = new Set<SnapshotListener>();
  private snapshotState: OfflineDraftPersistenceSnapshot = {
    hydrated: false,
    recovered: false,
    available: canUseIndexedDb(),
  };
  private destroyed = false;
  private persistTimer: number | null = null;

  constructor(
    session: CollaborationSessionDto,
    private readonly document: Y.Doc,
  ) {
    this.key = createDraftKey(session);
  }

  start() {
    if (!this.snapshotState.available) {
      this.setSnapshot({ ...this.snapshotState, hydrated: true });
      return;
    }

    this.document.on("update", this.persistDocumentState);
    void this.hydrateDocument();
  }

  snapshot = () => this.snapshotState;

  subscribe = (listener: SnapshotListener) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  destroy = () => {
    this.destroyed = true;
    this.document.off("update", this.persistDocumentState);
    if (this.persistTimer !== null) {
      window.clearTimeout(this.persistTimer);
      this.persistTimer = null;
    }
  };

  private async hydrateDocument() {
    try {
      const update = await readDraftUpdate(this.key);
      if (this.destroyed) return;

      if (update && update.byteLength > 0) {
        Y.applyUpdate(this.document, update, "indexeddb-offline-draft-recovery");
        this.setSnapshot({ hydrated: true, recovered: true, available: true });
        return;
      }

      this.setSnapshot({ hydrated: true, recovered: false, available: true });
    } catch {
      this.setSnapshot({ hydrated: true, recovered: false, available: false });
    }
  }

  private persistDocumentState = () => {
    if (this.destroyed || !this.snapshotState.available) return;
    if (this.persistTimer !== null) return;

    this.persistTimer = window.setTimeout(() => {
      this.persistTimer = null;
      const update = Y.encodeStateAsUpdate(this.document);
      void writeDraftUpdate(this.key, update).catch(() => {
        this.setSnapshot({ ...this.snapshotState, available: false });
      });
    }, 100);
  };

  private setSnapshot(snapshot: OfflineDraftPersistenceSnapshot) {
    this.snapshotState = snapshot;
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }
}

function createDraftKey(session: CollaborationSessionDto) {
  return `${session.currentMemberId}:${session.documentKey}`;
}

function canUseIndexedDb() {
  return typeof indexedDB !== "undefined" && typeof window !== "undefined";
}

async function readDraftUpdate(key: string): Promise<Uint8Array | null> {
  const database = await openDraftDatabase();

  try {
    const value = await requestToPromise(
      database.transaction(draftStoreName, "readonly").objectStore(draftStoreName).get(key),
    );
    if (value instanceof Uint8Array) return value;
    if (value instanceof ArrayBuffer) return new Uint8Array(value);
    return null;
  } finally {
    database.close();
  }
}

async function writeDraftUpdate(key: string, update: Uint8Array): Promise<void> {
  const database = await openDraftDatabase();

  try {
    const transaction = database.transaction(draftStoreName, "readwrite");
    transaction.objectStore(draftStoreName).put(update, key);
    await transactionToPromise(transaction);
  } finally {
    database.close();
  }
}

function openDraftDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, databaseVersion);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(draftStoreName)) {
        database.createObjectStore(draftStoreName);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Unable to open IndexedDB"));
  });
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

function transactionToPromise(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("IndexedDB transaction failed"));
    transaction.onabort = () =>
      reject(transaction.error ?? new Error("IndexedDB transaction aborted"));
  });
}
