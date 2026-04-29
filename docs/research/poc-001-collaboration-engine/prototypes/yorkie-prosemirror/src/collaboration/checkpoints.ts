export type Checkpoint = {
  id: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  markdown: string;
  message: string;
};

export type BuildCheckpointInput = {
  authorId: string;
  authorName: string;
  markdown: string;
  message: string;
  now?: Date;
};

export function buildCheckpoint(input: BuildCheckpointInput): Checkpoint {
  const createdAt = (input.now ?? new Date()).toISOString();

  return {
    id: `${createdAt}-${input.authorId}`,
    authorId: input.authorId,
    authorName: input.authorName,
    createdAt,
    markdown: input.markdown,
    message: input.message.trim() || 'Manual checkpoint',
  };
}

export function sortCheckpointsNewestFirst(checkpoints: Checkpoint[]): Checkpoint[] {
  return [...checkpoints].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}
