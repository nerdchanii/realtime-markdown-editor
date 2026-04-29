import { Server } from "@hocuspocus/server";
import * as Y from "yjs";

import type { CollabRuntimeConfig } from "./config.js";
import type { CollaborationSessionClient } from "./session/session-client.js";
import { createSeedCollaborationSessionClient } from "./seed/seed-collaboration-session-client.js";
import { InMemorySeededYjsDocumentStore, type YjsDocumentStore } from "./yjs-document-store.js";

type HocuspocusDocumentPayload = {
  document: Y.Doc;
  documentName: string;
};

export type HocuspocusRuntimeDependencies = Readonly<{
  sessionClient: CollaborationSessionClient;
  documentStore: YjsDocumentStore;
}>;

export function createHocuspocusRuntime(
  config: CollabRuntimeConfig,
  dependencies: HocuspocusRuntimeDependencies = createDefaultRuntimeDependencies(config),
): Server {
  return new Server({
    name: "rme-collab",
    address: config.host,
    port: config.port,
    debounce: 300,
    maxDebounce: 1200,
    async onLoadDocument(payload: HocuspocusDocumentPayload) {
      await dependencies.sessionClient.loadSession(payload.documentName);
      await dependencies.documentStore.loadDocument(payload.documentName, payload.document);
      return payload.document;
    },
    async onStoreDocument(payload: HocuspocusDocumentPayload) {
      await dependencies.documentStore.storeDocument(payload.documentName, payload.document);
    },
    async onListen({ port }: { port: number }) {
      console.log(`[collab] websocket ws://${config.host}:${port}`);
    },
  });
}

function createDefaultRuntimeDependencies(
  config: CollabRuntimeConfig,
): HocuspocusRuntimeDependencies {
  return {
    sessionClient: createSeedCollaborationSessionClient(config),
    documentStore: new InMemorySeededYjsDocumentStore({
      documentKey: config.seedDocumentKey,
      markdown: "# Review Plan\n\nSeeded collaborative Markdown document.\n",
    }),
  };
}
