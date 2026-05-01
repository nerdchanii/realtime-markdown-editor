import { strict as assert } from "node:assert";
import { test } from "node:test";

import { createHttpDocumentContentProjectionClient } from "./document-content-projection-client.js";

test("HTTP document content projection client uses internal collaboration runtime API", async () => {
  const requests: Array<Readonly<{ method: string; url: string; body: unknown }>> = [];
  const client = createHttpDocumentContentProjectionClient(
    "http://127.0.0.1:4000",
    async (url, init) => {
      requests.push({
        method: init?.method ?? "GET",
        url: url.toString(),
        body: init?.body ?? null,
      });

      if (init?.method === "PUT") {
        return new Response(JSON.stringify({ content: { markdownBody: "# Stored\n" } }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ content: { markdownBody: "# Loaded\n" } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    },
  );

  const loadedMarkdown = await client.loadCurrentMarkdown("document_1");
  await client.saveCurrentMarkdown("document_1", "# Stored\n");

  assert.equal(loadedMarkdown, "# Loaded\n");
  assert.equal(requests[0]?.method, "GET");
  assert.equal(
    requests[0]?.url,
    "http://127.0.0.1:4000/collaboration/internal/documents/document_1/content",
  );
  assert.equal(requests[1]?.method, "PUT");
  assert.deepEqual(JSON.parse(String(requests[1]?.body)), {
    markdownBody: "# Stored\n",
  });
});
