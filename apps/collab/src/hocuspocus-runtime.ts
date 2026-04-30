import { Server } from "@hocuspocus/server";
import * as Y from "yjs";

import type { CollabRuntimeConfig, LiveYjsPersistenceConfig } from "./config.js";
import {
  createHttpDocumentContentProjectionClient,
  type DocumentContentProjectionClient,
} from "./document-content-projection-client.js";
import type { CollaborationSessionClient } from "./session/session-client.js";
import { createSeedCollaborationSessionClient } from "./seed/seed-collaboration-session-client.js";
import {
  FileSystemLiveYjsPersistenceAdapter,
  InMemoryLiveYjsPersistenceAdapter,
  SeededYjsDocumentStore,
  type LiveYjsPersistenceAdapter,
  type YjsDocumentStore,
} from "./yjs-document-store.js";

type HocuspocusDocumentPayload = {
  document: Y.Doc;
  documentName: string;
};

export type HocuspocusRuntimeDependencies = Readonly<{
  sessionClient: CollaborationSessionClient;
  documentStore: YjsDocumentStore;
  projectionClient: DocumentContentProjectionClient;
}>;

export function createHocuspocusRuntime(
  config: CollabRuntimeConfig,
  dependencies: HocuspocusRuntimeDependencies = createDefaultRuntimeDependencies(config),
): Server {
  return new Server({
    ...createServerConfig(config),
    onLoadDocument: (payload: HocuspocusDocumentPayload) =>
      loadRuntimeDocument(payload, dependencies),
    onStoreDocument: (payload: HocuspocusDocumentPayload) =>
      storeRuntimeDocument(payload, dependencies),
    onListen: ({ port }: { port: number }) => logRuntimeListen(config, dependencies, port),
  });
}

function createServerConfig(config: CollabRuntimeConfig) {
  return {
    name: "rme-collab",
    address: config.host,
    port: config.port,
    debounce: 300,
    maxDebounce: 1200,
  };
}

async function loadRuntimeDocument(
  payload: HocuspocusDocumentPayload,
  dependencies: HocuspocusRuntimeDependencies,
) {
  const session = await dependencies.sessionClient.loadSession(payload.documentName);
  const fallbackMarkdown = await loadFallbackMarkdown(
    dependencies.projectionClient,
    session.documentId,
  );
  await dependencies.documentStore.loadDocument(
    payload.documentName,
    payload.document,
    fallbackMarkdown,
  );
  return payload.document;
}

async function storeRuntimeDocument(
  payload: HocuspocusDocumentPayload,
  dependencies: HocuspocusRuntimeDependencies,
) {
  await dependencies.documentStore.storeDocument(payload.documentName, payload.document);
  const session = await dependencies.sessionClient.loadSession(payload.documentName);
  await saveMarkdownProjection(dependencies.projectionClient, session.documentId, payload.document);
}

async function logRuntimeListen(
  config: CollabRuntimeConfig,
  dependencies: HocuspocusRuntimeDependencies,
  port: number,
) {
  console.log(`[collab] websocket ws://${config.host}:${port}`);
  console.log(
    `[collab] live Yjs persistence ${dependencies.documentStore.persistenceProviderName}`,
  );
}

function createDefaultRuntimeDependencies(
  config: CollabRuntimeConfig,
): HocuspocusRuntimeDependencies {
  return {
    sessionClient: createSeedCollaborationSessionClient(config),
    documentStore: new SeededYjsDocumentStore({
      seed: {
        documentKey: config.seedDocumentKey,
        markdown: "# Review Plan\n\nSeeded collaborative Markdown document.\n",
      },
      persistence: createLiveYjsPersistenceAdapter(config.liveYjsPersistence),
    }),
    projectionClient: createHttpDocumentContentProjectionClient(config.apiBaseUrl),
  };
}

async function loadFallbackMarkdown(
  projectionClient: DocumentContentProjectionClient,
  documentId: string,
): Promise<string | null> {
  try {
    return await projectionClient.loadCurrentMarkdown(documentId);
  } catch (error) {
    console.warn(`[collab] DB Markdown fallback bootstrap unavailable: ${String(error)}`);
    return null;
  }
}

async function saveMarkdownProjection(
  projectionClient: DocumentContentProjectionClient,
  documentId: string,
  document: Y.Doc,
): Promise<void> {
  try {
    await projectionClient.saveCurrentMarkdown(documentId, document.getText("markdown").toString());
  } catch (error) {
    console.warn(`[collab] DB Markdown projection update failed: ${String(error)}`);
  }
}

function createLiveYjsPersistenceAdapter(
  config: LiveYjsPersistenceConfig,
): LiveYjsPersistenceAdapter {
  if (config.provider === "memory") return new InMemoryLiveYjsPersistenceAdapter();

  return new FileSystemLiveYjsPersistenceAdapter(config.directory);
}
