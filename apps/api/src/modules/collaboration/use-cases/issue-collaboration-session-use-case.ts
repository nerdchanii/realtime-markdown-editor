import type {
  CollaborationMembershipId,
  CollaborationDocumentId,
  CollaborationSession,
  CollaborationSessionRepository,
} from "@/modules/collaboration/ports/collaboration-session-repository.js";

export type IssueCollaborationSessionInput = Readonly<{
  documentId: CollaborationDocumentId;
  currentMembershipId: CollaborationMembershipId;
}>;

export class IssueCollaborationSessionUseCase {
  constructor(private readonly sessions: CollaborationSessionRepository) {}

  async execute(input: IssueCollaborationSessionInput): Promise<CollaborationSession | null> {
    return this.sessions.findSession({
      documentId: input.documentId,
      currentMembershipId: input.currentMembershipId,
    });
  }
}

export class LoadRuntimeCollaborationSessionUseCase {
  constructor(private readonly sessions: CollaborationSessionRepository) {}

  async execute(input: { documentKey: string }): Promise<CollaborationSession | null> {
    return this.sessions.findRuntimeSession({ documentKey: input.documentKey });
  }
}
