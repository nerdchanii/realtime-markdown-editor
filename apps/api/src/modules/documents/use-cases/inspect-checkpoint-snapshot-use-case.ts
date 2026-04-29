import type { CheckpointId } from "@/modules/documents/domain/checkpoint.js";
import type {
  CheckpointRepository,
  CheckpointSnapshot,
} from "@/modules/documents/ports/checkpoint-repository.js";

export class InspectCheckpointSnapshotUseCase {
  constructor(private readonly checkpoints: CheckpointRepository) {}

  async execute(checkpointId: CheckpointId): Promise<CheckpointSnapshot | null> {
    return this.checkpoints.findCheckpointSnapshot(checkpointId);
  }
}
