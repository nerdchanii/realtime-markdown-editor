import type { ReactNode, RefObject } from "react";

import { Button, type ButtonProps } from "@/components/ui";

import {
  bullet,
  code,
  codeBlock,
  h1,
  ordered,
  redo,
  task,
  undo,
  useEditorToolbarActions,
  type EditorRef,
  type RunEditorCommand,
} from "./EditorToolbarActions";
import type { SyncStatusViewModel } from "./ports/collaboration-adapter";
import {
  syncStatusStyle,
  toolbarActionsStyle,
  toolbarGroupStyle,
  toolbarStyle,
  visuallyHiddenInputStyle,
} from "./styles";

export function EditorToolbar({
  label,
  syncStatus,
  editorRef,
  documentId,
}: {
  label: string;
  syncStatus: SyncStatusViewModel;
  editorRef: EditorRef;
  documentId: string;
}) {
  return (
    <div style={toolbarStyle}>
      <EditorTitle label={label} />
      <EditorFormatControls editorRef={editorRef} documentId={documentId} />
      <SyncStatusSlot status={syncStatus} />
    </div>
  );
}

function EditorTitle({ label }: Readonly<{ label: string }>) {
  return (
    <div>
      <div className="slot-kicker">Editor</div>
      <div className="slot-title">{label}</div>
    </div>
  );
}

function EditorFormatControls(props: Readonly<{ editorRef: EditorRef; documentId: string }>) {
  const actions = useEditorToolbarActions(props);

  return (
    <div
      aria-label="Editor formatting toolbar"
      data-testid="editor-format-toolbar"
      style={toolbarActionsStyle}
    >
      <HistoryControlGroup runCommand={actions.runCommand} />
      <BlockControlGroup runCommand={actions.runCommand} />
      <InlineControlGroup actions={actions} />
      <ImageUploadStatus status={actions.imageStatus} />
    </div>
  );
}

function HistoryControlGroup({ runCommand }: Readonly<{ runCommand: RunEditorCommand }>) {
  return (
    <ToolbarGroup label="History controls">
      <ToolbarButton
        data-undo-source="collaboration"
        label="Undo"
        testId="editor-undo-button"
        onClick={() => runCommand(undo)}
      />
      <ToolbarButton
        data-undo-source="collaboration"
        label="Redo"
        testId="editor-redo-button"
        onClick={() => runCommand(redo)}
      />
    </ToolbarGroup>
  );
}

function BlockControlGroup({ runCommand }: Readonly<{ runCommand: RunEditorCommand }>) {
  return (
    <ToolbarGroup label="Block controls">
      <ToolbarButton label="Heading" testId="editor-heading-button" onClick={() => runCommand(h1)}>
        H1
      </ToolbarButton>
      <ToolbarButton
        label="Bullet list"
        testId="editor-bullet-list-button"
        onClick={() => runCommand(bullet)}
      >
        -
      </ToolbarButton>
      <ToolbarButton
        label="Numbered list"
        testId="editor-ordered-list-button"
        onClick={() => runCommand(ordered)}
      >
        1.
      </ToolbarButton>
      <ToolbarButton label="Task item" testId="editor-task-button" onClick={() => runCommand(task)}>
        []
      </ToolbarButton>
    </ToolbarGroup>
  );
}

type ToolbarActions = ReturnType<typeof useEditorToolbarActions>;

function InlineControlGroup({ actions }: Readonly<{ actions: ToolbarActions }>) {
  return (
    <ToolbarGroup label="Inline controls">
      <ToolbarButton label="Add link" testId="editor-link-button" onClick={actions.handleLink}>
        L
      </ToolbarButton>
      <ToolbarButton
        label="Inline code"
        testId="editor-inline-code-button"
        onClick={() => actions.runCommand(code)}
      >
        &lt;/&gt;
      </ToolbarButton>
      <ToolbarButton
        label="Code block"
        testId="editor-code-block-button"
        onClick={() => actions.runCommand(codeBlock)}
      >
        {"{}"}
      </ToolbarButton>
      <ImageButton
        handleImageFile={actions.handleImageFile}
        imageInputRef={actions.imageInputRef}
      />
    </ToolbarGroup>
  );
}

function ImageButton({
  handleImageFile,
  imageInputRef,
}: Readonly<{
  handleImageFile: ToolbarActions["handleImageFile"];
  imageInputRef: RefObject<HTMLInputElement | null>;
}>) {
  return (
    <>
      <ToolbarButton
        label="Insert image"
        testId="editor-image-button"
        onClick={() => imageInputRef.current?.click()}
      >
        IMG
      </ToolbarButton>
      <input
        ref={imageInputRef}
        accept="image/png,image/jpeg,image/webp"
        data-testid="editor-image-input"
        onChange={handleImageFile}
        style={visuallyHiddenInputStyle}
        type="file"
      />
    </>
  );
}

function ToolbarGroup({ label, children }: Readonly<{ label: string; children: ReactNode }>) {
  return (
    <div aria-label={label} style={toolbarGroupStyle}>
      {children}
    </div>
  );
}

function ToolbarButton({
  label,
  testId,
  children,
  ...props
}: ButtonProps & Readonly<{ label: string; testId: string }>) {
  return (
    <Button
      aria-label={label}
      data-testid={testId}
      size="icon"
      title={label}
      variant="ghost"
      {...props}
    >
      {children ?? label.slice(0, 1)}
    </Button>
  );
}

function ImageUploadStatus({ status }: Readonly<{ status: string }>) {
  return (
    <span aria-live="polite" data-testid="editor-image-upload-status" className="replacement-point">
      {status}
    </span>
  );
}

function SyncStatusSlot({ status }: { status: SyncStatusViewModel }) {
  return (
    <div aria-label="Sync status" data-testid="sync-status" style={syncStatusStyle}>
      <strong>{status.label}</strong>
      <span>{status.detail}</span>
      <span>{status.pendingEdits} pending</span>
    </div>
  );
}
