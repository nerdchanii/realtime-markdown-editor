import type { DocumentId } from "@/modules/documents/domain/document.js";
import type {
  CheckpointRepository,
  CheckpointSnapshot,
} from "@/modules/documents/ports/checkpoint-repository.js";

export class ListCheckpointsUseCase {
  constructor(private readonly checkpoints: CheckpointRepository) {}

  async execute(documentId: DocumentId): Promise<readonly CheckpointSnapshot[]> {
    const checkpoints = await this.checkpoints.listCheckpoints(documentId);
    const snapshots = await Promise.all(
      checkpoints.map((checkpoint) => this.checkpoints.findCheckpointSnapshot(checkpoint.id)),
    );

    return snapshots.filter((snapshot): snapshot is CheckpointSnapshot => snapshot !== null);
  }
}
