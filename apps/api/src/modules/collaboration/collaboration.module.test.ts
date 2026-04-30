import { strict as assert } from "node:assert";
import { test } from "node:test";

import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { DatabaseModule } from "@/database/database.module.js";
import { PrismaDatabaseService } from "@/database/database.service.js";
import { InternalCollaborationRuntimeController } from "@/modules/collaboration/interfaces/internal-collaboration-runtime.controller.js";
import {
  type CollaborationDocumentId,
  type CollaborationMembershipId,
  type CollaborationSession,
  type CollaborationSessionRepository,
} from "@/modules/collaboration/ports/collaboration-session-repository.js";
import {
  CollaborationModule,
  createRuntimeSessionRepository,
} from "@/modules/collaboration/collaboration.module.js";

const documentKey = "workspace_task077/document_task077_yjs";
const encodedDocumentKey = Buffer.from(documentKey, "utf8").toString("base64url");

@Module({ imports: [DatabaseModule, CollaborationModule] })
class CollaborationModuleSmokeTestModule {}

test("runtime session repository does not fall back to seed sessions in product mode", async () => {
  const product = new FailingRuntimeSessionRepository();
  const seed = new StaticRuntimeSessionRepository();
  const repository = createRuntimeSessionRepository(product, seed, false);

  await assert.rejects(
    repository.findRuntimeSession({ documentKey: "workspace_review/document_review_plan" }),
    /product session unavailable/,
  );
});

test("runtime session repository uses seed fallback only when explicitly enabled", async () => {
  const product = new FailingRuntimeSessionRepository();
  const seed = new StaticRuntimeSessionRepository();
  const repository = createRuntimeSessionRepository(product, seed, true);

  const session = await repository.findRuntimeSession({
    documentKey: "workspace_review/document_review_plan",
  });

  assert.equal(session?.documentKey, "workspace_review/document_review_plan");
});

test("collaboration module injects Prisma-backed repositories for internal runtime store/load", async () => {
  const app = await NestFactory.createApplicationContext(CollaborationModuleSmokeTestModule, {
    logger: false,
  });
  const database = app.get(PrismaDatabaseService);
  installFakeCollaborationDatabase(database);

  try {
    const controller = app.get(InternalCollaborationRuntimeController);

    await controller.putLiveYjsDocumentState(encodedDocumentKey, { stateBase64: "AQID" });
    const state = await controller.getLiveYjsDocumentState(encodedDocumentKey);
    const session = await controller.getDocumentSession(encodedDocumentKey);

    assert.equal(state.stateBase64, "AQID");
    assert.equal(session.documentKey, documentKey);
    assert.equal(session.documentId, "document_task077_yjs");
  } finally {
    await app.close();
  }
});

class FailingRuntimeSessionRepository implements CollaborationSessionRepository {
  async findSession(): Promise<CollaborationSession | null> {
    return null;
  }

  async findSeedSession(): Promise<CollaborationSession | null> {
    return null;
  }

  async findRuntimeSession(): Promise<CollaborationSession | null> {
    throw new Error("product session unavailable");
  }
}

class StaticRuntimeSessionRepository implements CollaborationSessionRepository {
  async findSession(): Promise<CollaborationSession | null> {
    return null;
  }

  async findSeedSession(): Promise<CollaborationSession | null> {
    return null;
  }

  async findRuntimeSession(): Promise<CollaborationSession | null> {
    return {
      documentId: "document_review_plan" as CollaborationDocumentId,
      documentKey: "workspace_review/document_review_plan",
      realtimeUrl: "ws://127.0.0.1:1234",
      currentMember: {
        id: "member_alice" as CollaborationMembershipId,
        userId: "user_alice" as CollaborationSession["currentMember"]["userId"],
        workspaceId: "workspace_review" as CollaborationSession["currentMember"]["workspaceId"],
        displayName: "Alice",
        color: "#0969da",
      },
      allowedMembers: [],
      sync: {
        status: "synced",
        pendingLocalEdits: 0,
        lastSyncedAt: null,
      },
    };
  }
}

function installFakeCollaborationDatabase(database: PrismaDatabaseService): void {
  let stateBase64: string | null = null;
  const liveState = {
    documentId: "document_task077_yjs",
    documentKey,
    realtimeUrl: `ws://127.0.0.1:1234/collaboration/${encodeURIComponent(documentKey)}`,
    syncStatus: "synced",
    pendingLocalEdits: 0,
    lastSyncedAt: null,
    stateArtifactId: "artifact_task077_yjs",
    stateArtifact: null as null | { metadata: { stateBase64: string } },
  };

  Object.defineProperties(database, {
    document: {
      value: {
        findUnique: async () => ({
          id: "document_task077_yjs",
          folder: { workspaceId: "workspace_task077" },
          liveCollaboration: liveState,
        }),
      },
    },
    workspaceMembership: {
      value: {
        findMany: async () => [
          {
            id: "member_task077",
            userId: "user_task077",
            workspaceId: "workspace_task077",
            displayName: "Task 077",
            color: "#0969da",
            createdAt: new Date("2026-04-30T00:00:00.000Z"),
          },
        ],
      },
    },
    liveCollaborationState: {
      value: {
        findUnique: async (query: { include?: { stateArtifact?: boolean } }) => {
          if (query.include?.stateArtifact) {
            return stateBase64
              ? { ...liveState, stateArtifact: { metadata: { stateBase64 } } }
              : { ...liveState, stateArtifact: null };
          }
          return liveState;
        },
      },
    },
    $transaction: {
      value: async (
        callback: (tx: {
          artifact: { upsert: () => Promise<{ id: string }> };
          liveCollaborationState: { upsert: () => Promise<typeof liveState> };
        }) => Promise<void>,
      ) =>
        callback({
          artifact: {
            upsert: async () => {
              stateBase64 = "AQID";
              return { id: "artifact_task077_yjs" };
            },
          },
          liveCollaborationState: {
            upsert: async () => liveState,
          },
        }),
    },
  });
}
