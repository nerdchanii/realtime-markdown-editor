import type { AnyExtension } from "@tiptap/core";

import { RichEditorPane } from "./RichEditorPane";
import type { EditorSelectionSnapshot } from "./ports/collaboration-adapter";
import { workspaceSinglePaneStyle } from "./styles";

export function EditorWorkspaceBody({
  markdown,
  onMarkdownChange,
  onSelectionChange,
  collaborationExtensions,
  bootstrapMarkdown,
}: {
  markdown: string;
  onMarkdownChange: (markdown: string) => void;
  onSelectionChange: (selection: EditorSelectionSnapshot) => void;
  collaborationExtensions?: readonly AnyExtension[] | undefined;
  bootstrapMarkdown?: string | undefined;
}) {
  return (
    <div style={workspaceSinglePaneStyle} data-testid="editor-rich-view">
      <RichEditorPane
        markdown={markdown}
        onMarkdownChange={onMarkdownChange}
        onSelectionChange={onSelectionChange}
        collaborationExtensions={collaborationExtensions}
        bootstrapMarkdown={bootstrapMarkdown}
      />
    </div>
  );
}
