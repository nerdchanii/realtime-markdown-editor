import { defaultMarkdownParser, defaultMarkdownSerializer, schema } from 'prosemirror-markdown';
import type { Node as ProseMirrorNode } from 'prosemirror-model';
import { SEEDED_MARKDOWN } from '@poc/shared';

export const editorSchema = schema;

export const initialMarkdown = SEEDED_MARKDOWN;

export function parseMarkdownToDoc(markdown: string): ProseMirrorNode {
  return defaultMarkdownParser.parse(markdown.trim() || '\n');
}

export function serializeDocToMarkdown(doc: ProseMirrorNode): string {
  return defaultMarkdownSerializer.serialize(doc, {
    tightLists: false,
  });
}
