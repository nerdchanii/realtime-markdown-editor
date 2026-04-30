import assert from "node:assert/strict";
import test from "node:test";

import { resolveActiveEditorDocumentId } from "@/features/editor";
import { loadProductWorkspace } from "./product-workspace-loader";

test("loadProductWorkspace prefers the authenticated current workspace over the route workspace", async () => {
  const calls: string[] = [];
  const originalFetch = globalThis.fetch;
  const originalWindow = globalThis.window;
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { location: { search: "?workspace=workspace_route" } },
  });
  globalThis.fetch = async (input) => {
    const url = new URL(String(input));
    calls.push(url.pathname);

    if (url.pathname === "/auth/session") {
      return jsonResponse({
        session: {
          currentMembership: {
            id: "member_alice",
            workspaceId: "workspace_session",
            displayName: "Alice",
            color: "#0969da",
            role: "owner",
          },
          memberships: [
            {
              id: "member_alice",
              workspaceId: "workspace_session",
              displayName: "Alice",
              color: "#0969da",
              role: "owner",
            },
          ],
        },
      });
    }

    if (url.pathname === "/workspaces/workspace_session/navigation") {
      return jsonResponse({
        workspace: {
          id: "workspace_session",
          name: "Session Workspace",
          rootFolderId: "folder_root",
        },
        projects: [],
        folders: [
          {
            id: "folder_root",
            workspaceId: "workspace_session",
            projectId: null,
            parentFolderId: null,
            name: "Root",
            kind: "workspaceRoot",
          },
        ],
        documents: [
          {
            id: "document_session",
            folderId: "folder_root",
            title: "Session Doc",
            state: "draft",
            latestRevisionId: null,
          },
        ],
      });
    }

    if (url.pathname === "/documents/document_session") {
      return jsonResponse({
        document: {
          id: "document_session",
          folderId: "folder_root",
          title: "Session Doc",
          state: "draft",
          properties: [],
        },
      });
    }

    if (url.pathname === "/documents/document_session/content") {
      return jsonResponse({ content: { markdownBody: "# Session Doc" } });
    }

    if (url.pathname === "/documents/document_session/connections") {
      return jsonResponse({ backlinks: [], outgoingLinks: [] });
    }

    throw new Error(`Unexpected request: ${url.pathname}`);
  };

  try {
    const model = await loadProductWorkspace(
      { baseUrl: "http://127.0.0.1:4000", providerName: "test" },
      null,
      new AbortController().signal,
    );

    assert.equal(model?.navigation.workspace.id, "workspace_session");
    assert.ok(calls.includes("/workspaces/workspace_session/navigation"));
    assert.equal(calls.includes("/workspaces/workspace_route/navigation"), false);
  } finally {
    globalThis.fetch = originalFetch;
    Object.defineProperty(globalThis, "window", { configurable: true, value: originalWindow });
  }
});

test("resolveActiveEditorDocumentId preserves the view-model document over the route document", () => {
  const originalWindow = globalThis.window;
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { location: { search: "?document=document_route" } },
  });

  try {
    assert.equal(resolveActiveEditorDocumentId("document_review_plan"), "document_review_plan");
  } finally {
    Object.defineProperty(globalThis, "window", { configurable: true, value: originalWindow });
  }
});

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
