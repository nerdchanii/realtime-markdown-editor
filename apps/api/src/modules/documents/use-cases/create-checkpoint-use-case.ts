import type { DocumentId } from "@/modules/documents/domain/document.js";
import type { WorkspaceMembershipId } from "@/modules/documents/domain/references.js";
import type {
  CheckpointRepository,
  CheckpointSnapshot,
} from "@/modules/documents/ports/checkpoint-repository.js";
import type { DocumentContentRepository } from "@/modules/documents/ports/document-content-repository.js";

export type CreateCheckpointUseCaseInput = Readonly<{
  documentId: DocumentId;
  authorMembershipId: WorkspaceMembershipId;
  message: string;
  markdownSnapshot?: string | undefined;
  resolveCurrentContent?: boolean | undefined;
}>;

export class CheckpointCurrentContentNotFoundError extends Error {
  constructor(documentId: DocumentId) {
    super(`Current Markdown projection not found for document ${documentId}.`);
    this.name = "CheckpointCurrentContentNotFoundError";
  }
}

export class CreateCheckpointUseCase {
  constructor(
    private readonly checkpoints: CheckpointRepository,
    private readonly content: DocumentContentRepository,
  ) {}

  async execute(input: CreateCheckpointUseCaseInput): Promise<CheckpointSnapshot> {
    const markdownSnapshot = await this.resolveMarkdownSnapshot(input);

    return this.checkpoints.createCheckpoint({
      documentId: input.documentId,
      authorMembershipId: input.authorMembershipId,
      message: input.message.trim() || "Manual checkpoint",
      markdownSnapshot,
    });
  }

  private async resolveMarkdownSnapshot(input: CreateCheckpointUseCaseInput): Promise<string> {
    if (shouldResolveCurrentContent(input)) {
      const currentContent = await this.content.findCurrentContent(input.documentId);
      if (currentContent) return currentContent.markdownBody;
    }
    if (input.markdownSnapshot !== undefined) return input.markdownSnapshot;

    throw new CheckpointCurrentContentNotFoundError(input.documentId);
  }
}

function shouldResolveCurrentContent(input: CreateCheckpointUseCaseInput): boolean {
  return input.resolveCurrentContent === true || input.markdownSnapshot === undefined;
}
