import type { AnyExtension, Editor } from "@tiptap/core";

import { RichEditorPane } from "./RichEditorPane";
import type { EditorSelectionSnapshot } from "./ports/collaboration-adapter";
import { workspaceSinglePaneStyle } from "./styles";

export function EditorWorkspaceBody({
  markdown,
  onMarkdownChange,
  onSelectionChange,
  onEditorChange,
  collaborationExtensions,
  bootstrapMarkdown,
  editable = true,
}: {
  markdown: string;
  onMarkdownChange: (markdown: string) => void;
  onSelectionChange: (selection: EditorSelectionSnapshot) => void;
  onEditorChange?: ((editor: Editor | null) => void) | undefined;
  collaborationExtensions?: readonly AnyExtension[] | undefined;
  bootstrapMarkdown?: string | undefined;
  editable?: boolean | undefined;
}) {
  return (
    <div style={workspaceSinglePaneStyle} data-testid="editor-rich-view">
      <RichEditorPane
        markdown={markdown}
        onMarkdownChange={onMarkdownChange}
        onSelectionChange={onSelectionChange}
        onEditorChange={onEditorChange}
        collaborationExtensions={collaborationExtensions}
        bootstrapMarkdown={bootstrapMarkdown}
        editable={editable}
      />
    </div>
  );
}
