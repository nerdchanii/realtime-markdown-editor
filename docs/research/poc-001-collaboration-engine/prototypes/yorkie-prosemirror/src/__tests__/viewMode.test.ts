import { describe, expect, it } from 'vitest';
import { getViewModeFromSearch, viewModes } from '../ui/viewModes';

describe('view modes', () => {
  it('supports the required Source, Rich, Split, and Preview controls', () => {
    expect(viewModes.map((mode) => mode.id)).toEqual(['source', 'rich', 'split', 'preview']);
  });

  it('defaults to Split and accepts a valid ?mode=', () => {
    expect(getViewModeFromSearch('')).toBe('split');
    expect(getViewModeFromSearch('?mode=preview')).toBe('preview');
    expect(getViewModeFromSearch('?mode=unknown')).toBe('split');
  });
});
