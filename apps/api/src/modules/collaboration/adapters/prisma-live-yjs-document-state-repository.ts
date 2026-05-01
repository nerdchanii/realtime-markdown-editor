import { createHash } from "node:crypto";

import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

import { PrismaDatabaseService } from "@/database/database.service.js";
import type {
  CollaborationDocumentKey,
  LiveYjsDocumentStateRepository,
} from "@/modules/collaboration/ports/live-yjs-document-state-repository.js";
import { ProductCollaborationDocumentNotFoundError } from "@/modules/collaboration/ports/live-yjs-document-state-repository.js";

type LiveYjsStatePersistenceInput = Readonly<{
  artifactKey: string;
  checksumSha256: string;
  documentId: string;
  documentKey: CollaborationDocumentKey;
  metadata: Prisma.JsonObject;
  sizeBytes: bigint;
}>;

@Injectable()
export class PrismaLiveYjsDocumentStateRepository implements LiveYjsDocumentStateRepository {
  private readonly realtimeUrl: string;

  constructor(private readonly database: PrismaDatabaseService) {
    this.realtimeUrl = readConfiguredRealtimeUrl(process.env);
  }

  async loadDocumentState(documentKey: CollaborationDocumentKey): Promise<Uint8Array | null> {
    const liveState = await this.database.liveCollaborationState.findUnique({
      where: { documentKey },
      include: { stateArtifact: true },
    });
    const metadata = liveState?.stateArtifact?.metadata;
    if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;

    const stateBase64 = (metadata as Record<string, unknown>).stateBase64;
    if (typeof stateBase64 !== "string") return null;

    return new Uint8Array(Buffer.from(stateBase64, "base64"));
  }

  async storeDocumentState(input: {
    documentKey: CollaborationDocumentKey;
    state: Uint8Array;
  }): Promise<void> {
    const document = await this.findDocumentForState(input.documentKey);
    if (!document) throw new ProductCollaborationDocumentNotFoundError(input.documentKey);

    const state = persistedStateForDocument(document.id, input.documentKey, input.state);

    await this.database.$transaction(async (tx) => {
      await persistLiveYjsState(tx, this.realtimeUrl, state);
    });
  }

  private async findDocumentForState(documentKey: CollaborationDocumentKey) {
    const liveState = await this.database.liveCollaborationState.findUnique({
      where: { documentKey },
      select: { documentId: true },
    });
    if (liveState) {
      return this.database.document.findUnique({ where: { id: liveState.documentId } });
    }

    return this.database.document.findUnique({ where: { id: documentIdFromKey(documentKey) } });
  }
}

async function persistLiveYjsState(
  tx: Prisma.TransactionClient,
  realtimeUrl: string,
  state: LiveYjsStatePersistenceInput,
): Promise<void> {
  const artifact = await upsertStateArtifact(tx, state);
  await upsertLiveCollaborationState(tx, realtimeUrl, state, artifact.id);
}

async function upsertStateArtifact(
  tx: Prisma.TransactionClient,
  state: LiveYjsStatePersistenceInput,
) {
  return tx.artifact.upsert({
    where: { key: state.artifactKey },
    create: {
      documentId: state.documentId,
      key: state.artifactKey,
      kind: "collaborationState",
      contentType: "application/vnd.yjs-update",
      checksumSha256: state.checksumSha256,
      sizeBytes: state.sizeBytes,
      metadata: state.metadata,
    },
    update: {
      checksumSha256: state.checksumSha256,
      sizeBytes: state.sizeBytes,
      metadata: state.metadata,
    },
  });
}

async function upsertLiveCollaborationState(
  tx: Prisma.TransactionClient,
  realtimeUrl: string,
  state: LiveYjsStatePersistenceInput,
  stateArtifactId: string,
): Promise<void> {
  await tx.liveCollaborationState.upsert({
    where: { documentKey: state.documentKey },
    create: liveStateCreateInput(realtimeUrl, state, stateArtifactId),
    update: liveStateUpdateInput(realtimeUrl, state, stateArtifactId),
  });
}

function liveStateCreateInput(
  realtimeUrl: string,
  state: LiveYjsStatePersistenceInput,
  stateArtifactId: string,
) {
  return {
    documentId: state.documentId,
    documentKey: state.documentKey,
    realtimeUrl: realtimeUrlForDocumentKey(realtimeUrl),
    syncStatus: "synced" as const,
    pendingLocalEdits: 0,
    lastSyncedAt: new Date(),
    stateArtifactId,
  };
}

function liveStateUpdateInput(
  realtimeUrl: string,
  state: LiveYjsStatePersistenceInput,
  stateArtifactId: string,
) {
  return {
    realtimeUrl: realtimeUrlForDocumentKey(realtimeUrl),
    syncStatus: "synced" as const,
    pendingLocalEdits: 0,
    lastSyncedAt: new Date(),
    stateArtifactId,
  };
}

function persistedStateForDocument(
  documentId: string,
  documentKey: CollaborationDocumentKey,
  state: Uint8Array,
): LiveYjsStatePersistenceInput {
  return {
    artifactKey: artifactKeyForDocumentKey(documentKey),
    checksumSha256: createHash("sha256").update(state).digest("hex"),
    documentId,
    documentKey,
    metadata: liveYjsMetadata(state),
    sizeBytes: BigInt(state.byteLength),
  };
}

function liveYjsMetadata(state: Uint8Array): Prisma.JsonObject {
  return {
    stateBase64: Buffer.from(state).toString("base64"),
    provider: "yjs",
    storedBy: "collab-runtime",
  };
}

function documentIdFromKey(documentKey: string): string {
  const segments = documentKey.split("/");
  return segments[segments.length - 1] ?? documentKey;
}

function artifactKeyForDocumentKey(documentKey: string): string {
  return `collaboration/live-yjs/${Buffer.from(documentKey, "utf8").toString("base64url")}.yjs`;
}

function realtimeUrlForDocumentKey(baseRealtimeUrl: string): string {
  return baseRealtimeUrl;
}

function readString(value: string | undefined, fallback: string): string {
  return value && value.trim().length > 0 ? value.trim() : fallback;
}

function readConfiguredRealtimeUrl(env: NodeJS.ProcessEnv): string {
  const configured = env.RME_COLLAB_PUBLIC_URL;
  if (configured && configured.trim().length > 0) return configured.trim();

  const port = readString(env.RME_COLLAB_PORT ?? env.COLLAB_PORT, "4001");
  return `ws://127.0.0.1:${port}`;
}
