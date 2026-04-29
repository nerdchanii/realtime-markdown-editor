import { describe, expect, it } from 'vitest';
import {
  buildCheckpoint,
  sortCheckpointsNewestFirst,
  type Checkpoint,
} from '../collaboration/checkpoints';

describe('checkpoints', () => {
  it('captures an explicit snapshot with author and message metadata', () => {
    const checkpoint = buildCheckpoint({
      authorId: 'alice',
      authorName: 'Alice',
      markdown: '# Plan\n\nShip the collaboration POC.',
      message: 'Before offline merge test',
      now: new Date('2026-04-29T12:34:56.000Z'),
    });

    expect(checkpoint).toEqual({
      id: '2026-04-29T12:34:56.000Z-alice',
      authorId: 'alice',
      authorName: 'Alice',
      createdAt: '2026-04-29T12:34:56.000Z',
      markdown: '# Plan\n\nShip the collaboration POC.',
      message: 'Before offline merge test',
    });
  });

  it('sorts checkpoint history newest first', () => {
    const checkpoints: Checkpoint[] = [
      {
        id: 'old',
        authorId: 'alice',
        authorName: 'Alice',
        createdAt: '2026-04-29T10:00:00.000Z',
        markdown: 'old',
        message: 'old',
      },
      {
        id: 'new',
        authorId: 'bob',
        authorName: 'Bob',
        createdAt: '2026-04-29T11:00:00.000Z',
        markdown: 'new',
        message: 'new',
      },
    ];

    expect(sortCheckpointsNewestFirst(checkpoints).map((checkpoint) => checkpoint.id)).toEqual([
      'new',
      'old',
    ]);
  });
});
