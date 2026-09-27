import { strict as assert } from "node:assert";
import { createHmac } from "node:crypto";
import { after, before, test } from "node:test";

import { HocuspocusProvider } from "@hocuspocus/provider";
import type { Server } from "@hocuspocus/server";
import * as Y from "yjs";

import type { CollabRuntimeConfig } from "./config.js";
import { createHocuspocusRuntime } from "./hocuspocus-runtime.js";

// 실제 Hocuspocus 서버와 provider 로 협업 연결 인증을 끝까지 확인한다.

const signingMaterial = "rme-test-collab-token-signing-0123456789";
const documentName = "workspace_review/document_review_plan";

let runtime: Server;
let realtimeUrl: string;

before(async () => {
  runtime = createHocuspocusRuntime(testConfig(), {
    sessionClient: {
      loadSession: async (documentKey) => ({
        documentId: documentKey.split("/")[1] ?? documentKey,
        documentKey,
        realtimeUrl: "ws://127.0.0.1:0",
        currentMemberId: "member_alice",
        members: [],
        sync: { status: "synced", pendingLocalEdits: 0, lastSyncedAt: null },
      }),
    },
    documentStore: {
      persistenceProviderName: "test",
      loadDocument: async () => undefined,
      storeDocument: async () => undefined,
    },
    projectionClient: {
      loadCurrentMarkdown: async () => null,
      saveCurrentMarkdown: async () => undefined,
    },
  });
  await runtime.listen();
  realtimeUrl = `ws://127.0.0.1:${runtime.address.port}`;
});

after(async () => {
  await runtime.destroy();
});

test("collab server denies connections without a token", async () => {
  const outcome = await connect(documentName, null);

  assert.equal(outcome.kind, "denied");
});

test("collab server denies forged, expired and other-document tokens", async () => {
  const forged = `${tokenFor({ access: "write" }).slice(0, -4)}AAAA`;
  const expired = tokenFor({ access: "write", exp: epochSeconds(Date.now()) - 1 });
  const otherDocument = tokenFor({
    access: "write",
    documentKey: "workspace_review/document_other",
  });

  assert.equal((await connect(documentName, forged)).kind, "denied");
  assert.equal((await connect(documentName, expired)).kind, "denied");
  assert.equal((await connect(documentName, otherDocument)).kind, "denied");
});

test("collab server opens read tokens as read-only and ignores their edits", async () => {
  const outcome = await connect(documentName, tokenFor({ access: "read" }), (document) => {
    document.getText("markdown").insert(0, "read-only edit");
  });

  assert.equal(outcome.kind, "authenticated");
  assert.equal(outcome.kind === "authenticated" ? outcome.scope : null, "readonly");
  assert.equal(outcome.kind === "authenticated" ? outcome.serverTextBeforeClose : null, "");
});

test("collab server applies edits from write tokens", async () => {
  const outcome = await connect(documentName, tokenFor({ access: "write" }), (document) => {
    document.getText("markdown").insert(0, "hello");
  });

  assert.equal(outcome.kind, "authenticated");
  assert.equal(outcome.kind === "authenticated" ? outcome.scope : null, "read-write");
  assert.equal(outcome.kind === "authenticated" ? outcome.serverTextBeforeClose : null, "hello");
});

type ConnectOutcome =
  | Readonly<{ kind: "authenticated"; scope: string; serverTextBeforeClose: string }>
  | Readonly<{ kind: "denied"; reason: string }>;

async function connect(
  name: string,
  token: string | null,
  afterSync?: (document: Y.Doc) => void,
): Promise<ConnectOutcome> {
  const document = new Y.Doc();

  return new Promise<ConnectOutcome>((resolve, reject) => {
    let scope: string | null = null;
    const timeout = setTimeout(() => {
      provider.destroy();
      reject(new Error("collab connection did not settle"));
    }, 5000);
    const settle = (outcome: ConnectOutcome) => {
      clearTimeout(timeout);
      // 편집이 서버에 도달할 시간을 준 뒤, 연결이 열린 상태에서 서버 문서를 읽고 닫는다.
      setTimeout(() => {
        const settled =
          outcome.kind === "authenticated"
            ? { ...outcome, serverTextBeforeClose: serverText(name) }
            : outcome;
        provider.destroy();
        resolve(settled);
      }, 150);
    };
    const provider = new HocuspocusProvider({
      url: realtimeUrl,
      name,
      document,
      token,
      onAuthenticated: (data) => {
        scope = data.scope;
      },
      onSynced: () => {
        afterSync?.(document);
        settle({ kind: "authenticated", scope: scope ?? "unknown", serverTextBeforeClose: "" });
      },
      onAuthenticationFailed: ({ reason }) => settle({ kind: "denied", reason }),
    });
  });
}

function serverText(name: string): string {
  return runtime.hocuspocus.documents.get(name)?.getText("markdown").toString() ?? "";
}

function tokenFor(overrides: Record<string, unknown>): string {
  const now = epochSeconds(Date.now());
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      iss: "rme-api",
      aud: "rme-collab",
      sub: "user_alice",
      principalKind: "user",
      membershipId: "member_alice",
      workspaceId: "workspace_review",
      documentId: "document_review_plan",
      documentKey: documentName,
      iat: now,
      exp: now + 120,
      ...overrides,
    }),
  ).toString("base64url");
  const signature = createHmac("sha256", signingMaterial)
    .update(`${header}.${payload}`)
    .digest("base64url");
  return `${header}.${payload}.${signature}`;
}

function epochSeconds(milliseconds: number): number {
  return Math.floor(milliseconds / 1000);
}

function testConfig(): CollabRuntimeConfig {
  return {
    host: "127.0.0.1",
    port: 0,
    apiBaseUrl: "http://127.0.0.1:0",
    publicRealtimeUrl: "ws://127.0.0.1:0",
    enableLiveYjsPersistenceFallback: false,
    liveYjsPersistence: { provider: "memory", directory: "" },
    collabTokenSigningSecret: signingMaterial,
  };
}
