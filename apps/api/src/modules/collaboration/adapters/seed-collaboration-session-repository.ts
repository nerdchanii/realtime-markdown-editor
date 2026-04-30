import type {
  CollaborationDocumentId,
  CollaborationMember,
  CollaborationMembershipId,
  CollaborationSession,
  CollaborationSessionLookup,
  CollaborationSessionRepository,
  CollaborationUserId,
  CollaborationWorkspaceId,
} from "@/modules/collaboration/ports/collaboration-session-repository.js";

const seedWorkspaceId = "workspace_review" as CollaborationWorkspaceId;
const seedDocumentId = "document_review_plan" as CollaborationDocumentId;
const aliceUserId = "user_alice" as CollaborationUserId;
const bobUserId = "user_bob" as CollaborationUserId;
const carolUserId = "user_carol" as CollaborationUserId;
const danaUserId = "user_dana" as CollaborationUserId;
const aliceMembershipId = "member_alice" as CollaborationMembershipId;
const bobMembershipId = "member_bob" as CollaborationMembershipId;
const carolMembershipId = "member_carol" as CollaborationMembershipId;
const danaMembershipId = "member_dana" as CollaborationMembershipId;
const seedSyncedAt = new Date("2026-04-30T00:03:00.000Z");

const seedMembers = [
  {
    id: aliceMembershipId,
    userId: aliceUserId,
    workspaceId: seedWorkspaceId,
    displayName: "Alice",
    color: "#0969da",
  },
  {
    id: bobMembershipId,
    userId: bobUserId,
    workspaceId: seedWorkspaceId,
    displayName: "Bob",
    color: "#1a7f37",
  },
  {
    id: carolMembershipId,
    userId: carolUserId,
    workspaceId: seedWorkspaceId,
    displayName: "Carol",
    color: "#8250df",
  },
  {
    id: danaMembershipId,
    userId: danaUserId,
    workspaceId: seedWorkspaceId,
    displayName: "Dana",
    color: "#bf3989",
  },
] as const satisfies readonly CollaborationMember[];

type SeedCollaborationSessionRepositoryEnv = Readonly<{
  RME_COLLAB_PUBLIC_URL?: string;
  RME_COLLAB_SEED_DOCUMENT_KEY?: string;
}>;

export class SeedCollaborationSessionRepository implements CollaborationSessionRepository {
  private readonly realtimeUrl: string;
  private readonly documentKey: string;

  constructor(env: SeedCollaborationSessionRepositoryEnv = process.env) {
    this.realtimeUrl = readString(env.RME_COLLAB_PUBLIC_URL, "ws://127.0.0.1:1234");
    this.documentKey = readString(
      env.RME_COLLAB_SEED_DOCUMENT_KEY,
      "workspace_review/document_review_plan",
    );
  }

  async findSession(lookup: CollaborationSessionLookup): Promise<CollaborationSession | null> {
    if (lookup.documentId !== seedDocumentId) return null;
    return this.buildSession(lookup.currentMembershipId);
  }

  async findRuntimeSession(lookup: { documentKey: string }): Promise<CollaborationSession | null> {
    if (lookup.documentKey === this.documentKey) return this.buildSession(null);
    if (!lookup.documentKey.startsWith(`${seedWorkspaceId}/`)) return null;
    return this.buildRouteSession(lookup.documentKey);
  }

  async findSeedSession(
    memberId: CollaborationMembershipId | null,
  ): Promise<CollaborationSession | null> {
    return this.buildSession(memberId);
  }

  private buildSession(memberId: CollaborationMembershipId | null): CollaborationSession | null {
    const currentMember = seedMembers.find(
      (member) => member.id === (memberId ?? aliceMembershipId),
    );
    if (!currentMember) return null;

    return {
      documentId: seedDocumentId,
      documentKey: this.documentKey,
      realtimeUrl: this.realtimeUrl,
      currentMember,
      allowedMembers: seedMembers,
      sync: {
        status: "synced",
        pendingLocalEdits: 0,
        lastSyncedAt: seedSyncedAt,
      },
    };
  }

  private buildRouteSession(documentKey: string): CollaborationSession {
    const currentMember = seedMembers[0] as CollaborationMember;

    return {
      documentId: documentIdFromKey(documentKey),
      documentKey,
      realtimeUrl: this.realtimeUrl,
      currentMember,
      allowedMembers: seedMembers,
      sync: {
        status: "synced",
        pendingLocalEdits: 0,
        lastSyncedAt: seedSyncedAt,
      },
    };
  }
}

function readString(value: string | undefined, fallback: string): string {
  return value && value.trim().length > 0 ? value.trim() : fallback;
}

function documentIdFromKey(documentKey: string): CollaborationDocumentId {
  const segments = documentKey.split("/");
  return (segments[segments.length - 1] ?? documentKey) as CollaborationDocumentId;
}
