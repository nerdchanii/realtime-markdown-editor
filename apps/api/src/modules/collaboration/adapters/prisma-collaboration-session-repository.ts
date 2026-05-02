import { Injectable } from "@nestjs/common";

import { PrismaDatabaseService } from "@/database/database.service.js";
import type {
  CollaborationDocumentId,
  CollaborationMember,
  CollaborationMembershipId,
  CollaborationSession,
  CollaborationSessionLookup,
  CollaborationSessionRepository,
  CollaborationSyncStatus,
} from "@/modules/collaboration/ports/collaboration-session-repository.js";

@Injectable()
export class PrismaCollaborationSessionRepository implements CollaborationSessionRepository {
  private readonly realtimeUrl: string;

  constructor(private readonly database: PrismaDatabaseService) {
    this.realtimeUrl = readConfiguredRealtimeUrl(process.env);
  }

  async findSession(lookup: CollaborationSessionLookup): Promise<CollaborationSession | null> {
    const document = await findDocumentForCollaboration(this.database, lookup.documentId);
    if (!document) return null;

    const memberships = await this.database.workspaceMembership.findMany({
      where: { workspaceId: document.folder.workspaceId, removedAt: null },
      orderBy: { createdAt: "asc" },
    });
    const currentMember = memberships.find(
      (membership) => membership.id === lookup.currentMembershipId,
    );
    if (!currentMember) return null;

    return {
      documentId: document.id as CollaborationDocumentId,
      documentKey: documentKeyFromRecord(document),
      realtimeUrl: realtimeUrlFromRecord(document, this.realtimeUrl),
      currentMember: mapMember(currentMember),
      allowedMembers: memberships.map(mapMember),
      sync: syncStateFromRecord(document),
    };
  }

  async findRuntimeSession(lookup: { documentKey: string }): Promise<CollaborationSession | null> {
    const document = await findDocumentByCollaborationKey(this.database, lookup.documentKey);
    if (!document) return null;

    const memberships = await this.database.workspaceMembership.findMany({
      where: { workspaceId: document.folder.workspaceId, removedAt: null },
      orderBy: { createdAt: "asc" },
    });
    const currentMember = memberships[0];
    if (!currentMember) return null;

    return {
      documentId: document.id as CollaborationDocumentId,
      documentKey: documentKeyFromRecord(document),
      realtimeUrl: realtimeUrlFromRecord(document, this.realtimeUrl),
      currentMember: mapMember(currentMember),
      allowedMembers: memberships.map(mapMember),
      sync: syncStateFromRecord(document),
    };
  }

  async findSeedSession(): Promise<CollaborationSession | null> {
    return null;
  }
}

async function findDocumentForCollaboration(
  database: PrismaDatabaseService,
  documentId: CollaborationDocumentId,
) {
  return database.document.findUnique({
    where: { id: documentId },
    include: {
      folder: true,
      liveCollaboration: true,
    },
  });
}

type CollaborationDocumentRecord = NonNullable<
  Awaited<ReturnType<typeof findDocumentForCollaboration>>
>;

async function findDocumentByCollaborationKey(
  database: PrismaDatabaseService,
  documentKey: string,
) {
  const liveState = await database.liveCollaborationState.findUnique({
    where: { documentKey },
    select: { documentId: true },
  });

  return findDocumentForCollaboration(
    database,
    (liveState?.documentId ?? documentIdFromKey(documentKey)) as CollaborationDocumentId,
  );
}

function documentKeyFromRecord(document: CollaborationDocumentRecord): string {
  return document.liveCollaboration?.documentKey ?? fallbackDocumentKey(document);
}

function realtimeUrlFromRecord(
  document: CollaborationDocumentRecord,
  fallbackRealtimeUrl: string,
): string {
  return fallbackRealtimeUrl;
}

function syncStateFromRecord(document: CollaborationDocumentRecord): CollaborationSession["sync"] {
  const live = document.liveCollaboration;
  return {
    status: mapSyncStatus(live?.syncStatus ?? "connecting"),
    pendingLocalEdits: live?.pendingLocalEdits ?? 0,
    lastSyncedAt: live?.lastSyncedAt ?? null,
  };
}

function fallbackDocumentKey(document: { id: string; folder: { workspaceId: string } }): string {
  return `${document.folder.workspaceId}/${document.id}`;
}

function documentIdFromKey(documentKey: string): string {
  const segments = documentKey.split("/");
  return segments[segments.length - 1] ?? documentKey;
}

function mapMember(member: {
  id: string;
  userId: string;
  workspaceId: string;
  displayName: string;
  color: string;
}): CollaborationMember {
  return {
    id: member.id as CollaborationMembershipId,
    userId: member.userId as CollaborationMember["userId"],
    workspaceId: member.workspaceId as CollaborationMember["workspaceId"],
    displayName: member.displayName,
    color: member.color,
  };
}

function mapSyncStatus(status: string): CollaborationSyncStatus {
  if (status === "pendingLocalChanges") return "pending-local-changes";
  if (
    status === "connecting" ||
    status === "synced" ||
    status === "offline" ||
    status === "reconnecting" ||
    status === "error"
  ) {
    return status;
  }
  return "connecting";
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
