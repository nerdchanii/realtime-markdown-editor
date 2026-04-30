import type {
  CollaborationSessionDto,
  CollaborationSessionResponseDto,
  RealtimeMemberDto,
} from "@rme/contracts";

import { createMockApiClient } from "@/lib/api-client";

export async function resolveRouteCollaborationSession(
  documentId: string,
  initialSession: CollaborationSessionDto | null,
): Promise<CollaborationSessionDto | null> {
  const member = readRouteMember();
  if (!isSeedReviewDocumentId(documentId)) {
    return createReviewRouteCollaborationSession(documentId, member);
  }

  return (await fetchSeedCollaborationSession(member)) ?? initialSession;
}

export function isSeedReviewDocumentId(documentId: string): boolean {
  return documentId === "document_review_plan" || documentId === "seed-review-plan";
}

async function fetchSeedCollaborationSession(
  member: string | null,
): Promise<CollaborationSessionDto | null> {
  const client = createMockApiClient();
  const params = new URLSearchParams();
  if (member) params.set("memberId", memberIdForRouteMember(member));

  const response = await fetch(`${client.baseUrl}/collaboration/sessions/seed?${params}`);
  if (!response.ok) return null;

  return mapIssuedCollaborationSession((await response.json()) as CollaborationSessionResponseDto);
}

function mapIssuedCollaborationSession(
  response: CollaborationSessionResponseDto,
): CollaborationSessionDto {
  return {
    documentId: response.documentId,
    documentKey: response.documentKey,
    realtimeUrl: response.realtimeUrl,
    currentMemberId: response.currentMember.id,
    members: response.allowedMembers,
    sync: response.sync,
  };
}

function createReviewRouteCollaborationSession(
  documentId: string,
  member: string | null,
): CollaborationSessionDto {
  const currentMemberId = memberIdForRouteMember(member ?? "alice");
  const currentMember =
    routeReviewMembers.find((candidate) => candidate.id === currentMemberId) ??
    requiredFirstMember(routeReviewMembers);

  return {
    documentId: documentId as CollaborationSessionDto["documentId"],
    documentKey: reviewRouteDocumentKey(documentId),
    realtimeUrl: reviewRouteRealtimeUrl(documentId),
    currentMemberId: currentMember.id,
    members: routeReviewMembers,
    sync: {
      status: "connecting",
      pendingLocalEdits: 0,
      lastSyncedAt: null,
    },
  };
}

function reviewRouteDocumentKey(documentId: string): string {
  return `workspace_review/${documentId}`;
}

function reviewRouteRealtimeUrl(documentId: string): string {
  return `ws://127.0.0.1:1234/collaboration/${encodeURIComponent(
    reviewRouteDocumentKey(documentId),
  )}`;
}

function memberIdForRouteMember(member: string): string {
  if (member.startsWith("member_")) return member;
  return `member_${member}`;
}

function readRouteMember(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("member");
}

function requiredFirstMember(members: readonly RealtimeMemberDto[]): RealtimeMemberDto {
  const member = members[0];
  if (!member) {
    throw new Error("Review route collaboration session must include at least one member");
  }
  return member;
}

const routeReviewMembers: readonly RealtimeMemberDto[] = [
  {
    id: "member_alice",
    userId: "user_alice",
    workspaceId: "workspace_review",
    displayName: "Alice",
    color: "#0969da",
  } as RealtimeMemberDto,
  {
    id: "member_bob",
    userId: "user_bob",
    workspaceId: "workspace_review",
    displayName: "Bob",
    color: "#1a7f37",
  } as RealtimeMemberDto,
  {
    id: "member_carol",
    userId: "user_carol",
    workspaceId: "workspace_review",
    displayName: "Carol",
    color: "#8250df",
  } as RealtimeMemberDto,
  {
    id: "member_dana",
    userId: "user_dana",
    workspaceId: "workspace_review",
    displayName: "Dana",
    color: "#bf3989",
  } as RealtimeMemberDto,
];
