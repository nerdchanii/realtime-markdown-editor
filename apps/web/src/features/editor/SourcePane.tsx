import { useCallback } from "react";

import type { EditorSelectionSnapshot } from "./ports/collaboration-adapter";
import { textareaStyle } from "./styles";

export function SourcePane({
  markdown,
  onMarkdownChange,
  onSelectionChange,
}: {
  markdown: string;
  onMarkdownChange: (markdown: string) => void;
  onSelectionChange: (selection: EditorSelectionSnapshot) => void;
}) {
  const publishSelection = useSelectionPublisher(onSelectionChange);

  return (
    <section aria-label="Markdown source" data-testid="markdown-source-pane">
      <textarea
        aria-label="Markdown editor"
        data-testid="collaborative-markdown-editor"
        value={markdown}
        onChange={(event) => {
          onMarkdownChange(event.currentTarget.value);
          publishSelection(event.currentTarget);
        }}
        onFocus={(event) => publishSelection(event.currentTarget)}
        onKeyUp={(event) => publishSelection(event.currentTarget)}
        onMouseUp={(event) => publishSelection(event.currentTarget)}
        onSelect={(event) => publishSelection(event.currentTarget)}
        spellCheck={false}
        style={textareaStyle}
      />
    </section>
  );
}

function useSelectionPublisher(onSelectionChange: (selection: EditorSelectionSnapshot) => void) {
  return useCallback(
    (element: HTMLTextAreaElement) => {
      onSelectionChange({
        anchor: element.selectionStart,
        head: element.selectionEnd,
      });
    },
    [onSelectionChange],
  );
}
