import { MarkdownPreview } from "./MarkdownPreview";
import { RichEditorPane } from "./RichEditorPane";
import { SourcePane } from "./SourcePane";
import type { EditorMode, EditorSelectionSnapshot } from "./ports/collaboration-adapter";
import { workspaceGridStyle, workspaceSinglePaneStyle } from "./styles";

export function EditorWorkspaceBody({
  markdown,
  mode,
  onMarkdownChange,
  onSelectionChange,
}: {
  markdown: string;
  mode: EditorMode;
  onMarkdownChange: (markdown: string) => void;
  onSelectionChange: (selection: EditorSelectionSnapshot) => void;
}) {
  if (mode === "markdown") {
    return renderMarkdownMode(markdown, onMarkdownChange, onSelectionChange);
  }

  if (mode === "rich") {
    return renderRichMode(markdown, onMarkdownChange, onSelectionChange);
  }

  if (mode === "preview") {
    return renderPreviewMode(markdown);
  }

  return renderSplitMode(markdown, onMarkdownChange, onSelectionChange);
}

function renderMarkdownMode(
  markdown: string,
  onMarkdownChange: (markdown: string) => void,
  onSelectionChange: (selection: EditorSelectionSnapshot) => void,
) {
  return (
    <div style={workspaceSinglePaneStyle} data-testid="editor-markdown-view">
      <SourcePane
        markdown={markdown}
        onMarkdownChange={onMarkdownChange}
        onSelectionChange={onSelectionChange}
      />
    </div>
  );
}

function renderRichMode(
  markdown: string,
  onMarkdownChange: (markdown: string) => void,
  onSelectionChange: (selection: EditorSelectionSnapshot) => void,
) {
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

function renderPreviewMode(markdown: string) {
  return (
    <div style={workspaceSinglePaneStyle} data-testid="editor-preview-view">
      <MarkdownPreview markdown={markdown} />
    </div>
  );
}

function renderSplitMode(
  markdown: string,
  onMarkdownChange: (markdown: string) => void,
  onSelectionChange: (selection: EditorSelectionSnapshot) => void,
) {
  return (
    <div style={workspaceGridStyle} data-testid="editor-split-view">
      <SourcePane
        markdown={markdown}
        onMarkdownChange={onMarkdownChange}
        onSelectionChange={onSelectionChange}
      />
      <MarkdownPreview markdown={markdown} />
    </div>
  );
}
