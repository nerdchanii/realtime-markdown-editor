export type ViewMode = 'source' | 'rich' | 'split' | 'preview';

export type ViewModeOption = {
  id: ViewMode;
  label: string;
};

export const viewModes: ViewModeOption[] = [
  { id: 'source', label: 'Source' },
  { id: 'rich', label: 'Rich' },
  { id: 'split', label: 'Split' },
  { id: 'preview', label: 'Preview' },
];

const viewModeIds = new Set<ViewMode>(viewModes.map((mode) => mode.id));

export function getViewModeFromSearch(search: string): ViewMode {
  const params = new URLSearchParams(search);
  const mode = params.get('mode') as ViewMode | null;

  return mode && viewModeIds.has(mode) ? mode : 'split';
}

export function showsSource(mode: ViewMode): boolean {
  return mode === 'source' || mode === 'split';
}

export function showsRichEditor(mode: ViewMode): boolean {
  return mode === 'rich' || mode === 'split';
}

export function showsPreview(mode: ViewMode): boolean {
  return mode === 'preview' || mode === 'split';
}
