import { describe, expect, it } from 'vitest';
import { getMemberFromSearch, getDocumentKeyFromSearch } from '../collaboration/identity';

describe('identity query params', () => {
  it('uses Alice as the stable default reviewer identity', () => {
    expect(getMemberFromSearch('')).toMatchObject({
      id: 'alice',
      name: 'Alice',
      color: '#0969da',
    });
  });

  it('resolves Bob from ?user=bob', () => {
    expect(getMemberFromSearch('?user=bob')).toMatchObject({
      id: 'bob',
      name: 'Bob',
      color: '#1a7f37',
    });
  });

  it('falls back to the shared POC document key unless a safe key is provided', () => {
    expect(getDocumentKeyFromSearch('')).toBe('poc-yorkie-prosemirror-shared-markdown');
    expect(getDocumentKeyFromSearch('?doc=release-brief')).toBe('release-brief');
    expect(getDocumentKeyFromSearch('?doc=../../secret')).toBe(
      'poc-yorkie-prosemirror-shared-markdown',
    );
  });
});
