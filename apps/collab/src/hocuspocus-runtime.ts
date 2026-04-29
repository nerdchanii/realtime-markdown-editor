import { Server } from "@hocuspocus/server";
import * as Y from "yjs";

import type { CollabRuntimeConfig } from "./config.js";

type HocuspocusDocumentPayload = {
  document: Y.Doc;
  documentName: string;
};

const documentSnapshots = new Map<string, Uint8Array>();

export function createHocuspocusRuntime(config: CollabRuntimeConfig): Server {
  return new Server({
    name: "rme-collab",
    address: config.host,
    port: config.port,
    debounce: 300,
    maxDebounce: 1200,
    async onLoadDocument(payload: HocuspocusDocumentPayload) {
      hydrateDocument(payload);
      return payload.document;
    },
    async onStoreDocument(payload: HocuspocusDocumentPayload) {
      documentSnapshots.set(payload.documentName, Y.encodeStateAsUpdate(payload.document));
    },
    async onListen({ port }: { port: number }) {
      console.log(`[collab] websocket ws://${config.host}:${port}`);
    },
  });
}

function hydrateDocument(payload: HocuspocusDocumentPayload): void {
  const snapshot = documentSnapshots.get(payload.documentName);
  if (snapshot) Y.applyUpdate(payload.document, snapshot);
}
