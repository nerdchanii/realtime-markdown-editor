import type {
  CollaborationMembershipId,
  CollaborationDocumentId,
  CollaborationSession,
  CollaborationSessionRepository,
} from "@/modules/collaboration/ports/collaboration-session-repository.js";

export type IssueCollaborationSessionInput = Readonly<{
  documentId: CollaborationDocumentId;
  memberId: CollaborationMembershipId | null;
}>;

export class IssueCollaborationSessionUseCase {
  constructor(private readonly sessions: CollaborationSessionRepository) {}

  async execute(input: IssueCollaborationSessionInput): Promise<CollaborationSession | null> {
    return this.sessions.findSession(input);
  }
}

export class IssueSeedCollaborationSessionUseCase {
  constructor(private readonly sessions: CollaborationSessionRepository) {}

  async execute(input: {
    memberId: CollaborationMembershipId | null;
  }): Promise<CollaborationSession | null> {
    return this.sessions.findSeedSession(input.memberId);
  }
}
