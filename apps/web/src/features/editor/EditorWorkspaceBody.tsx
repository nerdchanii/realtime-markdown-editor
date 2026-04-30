import { RichEditorPane } from "./RichEditorPane";
import type { EditorSelectionSnapshot } from "./ports/collaboration-adapter";
import { workspaceSinglePaneStyle } from "./styles";

export function EditorWorkspaceBody({
  markdown,
  onMarkdownChange,
  onSelectionChange,
}: {
  markdown: string;
  onMarkdownChange: (markdown: string) => void;
  onSelectionChange: (selection: EditorSelectionSnapshot) => void;
}) {
  return (
    <div style={workspaceSinglePaneStyle} data-testid="editor-rich-view">
      <RichEditorPane
        markdown={markdown}
        onMarkdownChange={onMarkdownChange}
        onSelectionChange={onSelectionChange}
      />
    </div>
  );
}
