import { marked } from 'marked'
import { useMemo } from 'react'

marked.setOptions({
  gfm: true,
  breaks: false,
})

type MarkdownPreviewProps = {
  markdown: string
  compact?: boolean
}

export function MarkdownPreview({ markdown, compact = false }: MarkdownPreviewProps) {
  const html = useMemo(() => marked.parse(markdown, { async: false }), [markdown])

  return (
    <article
      className={compact ? 'markdown-preview markdown-preview-compact' : 'markdown-preview'}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

