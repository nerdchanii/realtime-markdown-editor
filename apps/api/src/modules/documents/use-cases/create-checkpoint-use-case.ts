import type { DocumentId } from "@/modules/documents/domain/document.js";
import type { WorkspaceMembershipId } from "@/modules/documents/domain/references.js";
import type {
  CheckpointRepository,
  CheckpointSnapshot,
} from "@/modules/documents/ports/checkpoint-repository.js";

export type CreateCheckpointUseCaseInput = Readonly<{
  documentId: DocumentId;
  authorMembershipId: WorkspaceMembershipId;
  message: string;
  markdownSnapshot: string;
}>;

export class CreateCheckpointUseCase {
  constructor(private readonly checkpoints: CheckpointRepository) {}

  async execute(input: CreateCheckpointUseCaseInput): Promise<CheckpointSnapshot> {
    return this.checkpoints.createCheckpoint({
      documentId: input.documentId,
      authorMembershipId: input.authorMembershipId,
      message: input.message.trim() || "Manual checkpoint",
      markdownSnapshot: input.markdownSnapshot,
    });
  }
}
