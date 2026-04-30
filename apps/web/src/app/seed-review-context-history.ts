import type { SeedReviewContextDto } from "@rme/contracts";

import type { HistoryCheckpoint } from "@/features/history";

export function mapCheckpoint(
  context: SeedReviewContextDto,
  checkpoint: SeedReviewContextDto["checkpoints"][number],
): HistoryCheckpoint {
  const revision = context.revisions.find((candidate) => candidate.id === checkpoint.revisionId);

  return {
    id: checkpoint.id,
    message: checkpoint.message,
    author: findMemberName(context, checkpoint.authorMembershipId),
    createdAt: checkpoint.createdAt,
    snapshot: revision?.snapshotArtifact.key ?? checkpoint.snapshotArtifact.key,
  };
}

function findMemberName(context: SeedReviewContextDto, membershipId: string) {
  return context.members.find((member) => member.id === membershipId)?.displayName ?? "Seed member";
}
