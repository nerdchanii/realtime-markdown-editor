import type { Editor } from '@tiptap/core'
import { SEEDED_MARKDOWN } from '@poc/shared'
import type { EditorMode } from './types'

type MarkdownCapableEditor = Editor & {
  getMarkdown?: () => string
}

type MarkdownSetContent = (content: string, options: { contentType: 'markdown'; emitUpdate?: boolean }) => boolean

export const STARTER_MARKDOWN = SEEDED_MARKDOWN

export function readEditorMarkdown(editor: Editor | null): string {
  if (!editor) {
    return ''
  }

  const markdownEditor = editor as MarkdownCapableEditor

  if (typeof markdownEditor.getMarkdown === 'function') {
    return markdownEditor.getMarkdown()
  }

  return editor.getText()
}

export function writeEditorMarkdown(editor: Editor | null, markdown: string): boolean {
  if (!editor) {
    return false
  }

  const setContent = editor.commands.setContent as MarkdownSetContent
  return setContent(markdown, {
    contentType: 'markdown',
    emitUpdate: true,
  })
}

export function normalizeMode(mode: string | null): EditorMode {
  if (mode === 'source' || mode === 'split' || mode === 'preview') {
    return mode
  }

  return 'rich'
}
