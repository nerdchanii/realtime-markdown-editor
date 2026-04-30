import { strict as assert } from "node:assert";
import { test } from "node:test";

import {
  FallbackLiveYjsPersistenceAdapter,
  HttpLiveYjsPersistenceAdapter,
  InMemoryLiveYjsPersistenceAdapter,
} from "./yjs-document-store.js";

test("HTTP live Yjs persistence adapter stores and loads document state through the API", async () => {
  const requests: Array<Readonly<{ method: string; url: string; body: unknown }>> = [];
  const expectedState = new Uint8Array([1, 2, 3, 255]);
  const adapter = new HttpLiveYjsPersistenceAdapter("http://127.0.0.1:4000", async (url, init) => {
    requests.push({
      method: init?.method ?? "GET",
      url: url.toString(),
      body: init?.body ?? null,
    });

    if (init?.method === "PUT") return new Response(null, { status: 204 });

    return new Response(
      JSON.stringify({ stateBase64: Buffer.from(expectedState).toString("base64") }),
      {
        status: 200,
        headers: { "content-type": "application/json" },
      },
    );
  });

  await adapter.storeDocumentState("workspace_review/document_review_plan", expectedState);
  const loadedState = await adapter.loadDocumentState("workspace_review/document_review_plan");

  assert.equal(adapter.providerName, "api-postgres");
  assert.equal(requests[0]?.method, "PUT");
  assert.equal(
    requests[0]?.url,
    "http://127.0.0.1:4000/collaboration/internal/yjs-documents/d29ya3NwYWNlX3Jldmlldy9kb2N1bWVudF9yZXZpZXdfcGxhbg/state",
  );
  assert.deepEqual(JSON.parse(String(requests[0]?.body)), {
    stateBase64: Buffer.from(expectedState).toString("base64"),
  });
  assert.deepEqual(loadedState, expectedState);
});

test("HTTP live Yjs persistence adapter fails visibly when API load or store fails", async () => {
  const adapter = new HttpLiveYjsPersistenceAdapter(
    "http://127.0.0.1:4000",
    async () => new Response(null, { status: 500 }),
  );

  await assert.rejects(
    adapter.loadDocumentState("workspace_review/document_review_plan"),
    /Failed to load live Yjs document state: 500/,
  );
  await assert.rejects(
    adapter.storeDocumentState("workspace_review/document_review_plan", new Uint8Array([1])),
    /Failed to store live Yjs document state: 500/,
  );
});

test("fallback live Yjs persistence is explicit and can degrade to memory only when constructed", async () => {
  const adapter = new FallbackLiveYjsPersistenceAdapter(
    new HttpLiveYjsPersistenceAdapter(
      "http://127.0.0.1:4000",
      async () => new Response(null, { status: 500 }),
    ),
    new InMemoryLiveYjsPersistenceAdapter(),
  );
  const state = new Uint8Array([9, 8, 7]);

  await adapter.storeDocumentState("workspace_review/document_review_plan", state);
  const loaded = await adapter.loadDocumentState("workspace_review/document_review_plan");

  assert.deepEqual(loaded, state);
});
