import { baseKeymap, setBlockType, toggleMark } from 'prosemirror-commands';
import { history, redo, undo } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { wrapInList } from 'prosemirror-schema-list';
import type { Command } from 'prosemirror-state';
import { editorSchema } from './markdownDocument';

export const editorPlugins = [
  history(),
  keymap({
    'Mod-z': undo,
    'Shift-Mod-z': redo,
    'Mod-y': redo,
    'Mod-b': toggleMark(editorSchema.marks.strong),
    'Mod-i': toggleMark(editorSchema.marks.em),
  }),
  keymap(baseKeymap),
];

export type ToolbarCommand = {
  id: string;
  label: string;
  run: Command;
};

export const toolbarCommands: ToolbarCommand[] = [
  {
    id: 'paragraph',
    label: 'P',
    run: setBlockType(editorSchema.nodes.paragraph),
  },
  {
    id: 'heading-1',
    label: 'H1',
    run: setBlockType(editorSchema.nodes.heading, { level: 1 }),
  },
  {
    id: 'heading-2',
    label: 'H2',
    run: setBlockType(editorSchema.nodes.heading, { level: 2 }),
  },
  {
    id: 'bold',
    label: 'B',
    run: toggleMark(editorSchema.marks.strong),
  },
  {
    id: 'italic',
    label: 'I',
    run: toggleMark(editorSchema.marks.em),
  },
  {
    id: 'code',
    label: '{}',
    run: toggleMark(editorSchema.marks.code),
  },
  {
    id: 'list',
    label: 'List',
    run: wrapInList(editorSchema.nodes.bullet_list),
  },
];
