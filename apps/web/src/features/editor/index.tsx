/* eslint-disable max-lines-per-function */
import type { Editor } from "@tiptap/core";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { CollaborationSessionDto } from "@rme/contracts";

import type { ApiClient } from "@/lib/api-client";
import { writeCurrentEditorMarkdown } from "@/lib/current-editor-markdown";

import { EditorToolbar } from "./EditorToolbar";
import { EditorWorkspaceBody } from "./EditorWorkspaceBody";
import { resolveActiveEditorDocumentId as resolveEditorDocumentId } from "./active-document-id";
import { mockCollaborationAdapter } from "./adapters/mock-collaboration-adapter";
import { createTiptapYjsCollaborationAdapter } from "./adapters/tiptap-yjs-collaboration-adapter";
import {
  fallbackMarkdown,
  fallbackPresence,
  fallbackSyncStatus,
} from "./editor-workspace-fallbacks";
import type {
  CollaborationAdapter,
  EditorSelectionSnapshot,
  PresenceMember,
  SyncStatusViewModel,
} from "./ports/collaboration-adapter";

export const editorFeatureId = "editor";

export {
  createMockCollaborationAdapter,
  mockCollaborationAdapter,
  mockCollaborationProviderName,
} from "./adapters/mock-collaboration-adapter";
export { createProductApiCollaborationAdapter } from "./adapters/product-api-collaboration-adapter";
export { createTiptapYjsCollaborationAdapter } from "./adapters/tiptap-yjs-collaboration-adapter";
export type { CollaborationAdapter, EditorSelectionSnapshot, PresenceMember, SyncStatusViewModel };

export type EditorWorkspaceViewModel = Readonly<{
  replacementPoint: string;
  label: string;
  markdown?: string;
  documentId?: string;
  syncStatus?: SyncStatusViewModel;
  presence?: readonly PresenceMember[];
  collaborationSession?: CollaborationSessionDto;
  apiClient?: ApiClient;
}>;

export type EditorWorkspaceSlotProps = Readonly<{
  viewModel: EditorWorkspaceViewModel;
  collaborationAdapter?: CollaborationAdapter;
  headerContent?: ReactNode;
  onSaved?: (() => void) | undefined;
  historyPreview?: EditorHistoryPreview | null | undefined;
  onCloseHistoryPreview?: (() => void) | undefined;
}>;

export type EditorHistoryPreview = Readonly<{
  checkpointId: string;
  label: string;
  markdown: string;
}>;

// The mock adapter remains the UI-test fallback until realtime integration.
export function EditorWorkspaceSlot({
  viewModel,
  collaborationAdapter = mockCollaborationAdapter,
  headerContent,
  onSaved,
  historyPreview,
  onCloseHistoryPreview,
}: EditorWorkspaceSlotProps) {
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);
  const state = useEditorWorkspaceState(viewModel, collaborationAdapter);

  return (
    <EditorWorkspaceFrame>
      <EditorWorkspaceContent
        editor={editorInstance}
        onEditorChange={setEditorInstance}
        viewModel={viewModel}
        state={state}
        headerContent={headerContent}
        onSaved={onSaved}
        historyPreview={historyPreview}
        onCloseHistoryPreview={onCloseHistoryPreview}
      />
    </EditorWorkspaceFrame>
  );
}

function EditorWorkspaceContent({
  editor,
  onEditorChange,
  viewModel,
  state,
  headerContent,
  onSaved,
  historyPreview,
  onCloseHistoryPreview,
}: Readonly<{
  editor: Editor | null;
  onEditorChange: (editor: Editor | null) => void;
  viewModel: EditorWorkspaceViewModel;
  state: ReturnType<typeof useEditorWorkspaceState>;
  headerContent?: ReactNode;
  onSaved?: (() => void) | undefined;
  historyPreview?: EditorHistoryPreview | null | undefined;
  onCloseHistoryPreview?: (() => void) | undefined;
}>) {
  const isHistoryPreview = Boolean(historyPreview);
  const displayedMarkdown = historyPreview?.markdown ?? state.markdown;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
      <EditorToolbarSlot
        editor={editor}
        markdown={displayedMarkdown}
        presence={state.presence}
        viewModel={viewModel}
        isReadOnly={isHistoryPreview}
        onSaved={onSaved}
      />
      <div
        className="app-scroll-area"
        style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden" }}
      >
        <HistoryPreviewSlot historyPreview={historyPreview} onClose={onCloseHistoryPreview} />
        {headerContent}
        <EditorBodySlot
          markdown={displayedMarkdown}
          isReadOnly={isHistoryPreview}
          state={state}
          onEditorChange={onEditorChange}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 18px",
          borderTop: "1px solid var(--color-border)",
          background: "var(--color-surface)",
          fontSize: "11px",
          color: "var(--color-text-secondary)",
          fontWeight: 500,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", gap: "16px" }}>
          <span>{formatCount(readWordCount(state.markdown), "word")}</span>
          <span>{formatCount(state.markdown.length, "char")}</span>
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ width: "1px", height: "12px", background: "var(--color-border)" }} />
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "var(--color-success)",
              }}
            />
            {state.syncStatus?.label ?? "Synced"}
          </span>
        </div>
      </div>
      <CurrentMarkdownStore markdown={state.markdown} />
    </div>
  );
}

function EditorToolbarSlot({
  editor,
  markdown,
  presence,
  viewModel,
  isReadOnly,
  onSaved,
}: Readonly<{
  editor: Editor | null;
  markdown: string;
  presence: readonly PresenceMember[];
  viewModel: EditorWorkspaceViewModel;
  isReadOnly: boolean;
  onSaved?: (() => void) | undefined;
}>) {
  return (
    <EditorToolbar
      apiClient={viewModel.apiClient}
      documentId={viewModel.documentId}
      editor={editor}
      exportTitle={viewModel.label}
      isReadOnly={isReadOnly}
      markdown={markdown}
      onSaved={onSaved}
      presence={presence}
    />
  );
}

function EditorBodySlot({
  markdown,
  isReadOnly,
  state,
  onEditorChange,
}: Readonly<{
  markdown: string;
  isReadOnly: boolean;
  state: ReturnType<typeof useEditorWorkspaceState>;
  onEditorChange: (editor: Editor | null) => void;
}>) {
  return (
    <ActiveEditorBody
      markdown={markdown}
      onMarkdownChange={isReadOnly ? noopMarkdownChange : state.handleMarkdownChange}
      onSelectionChange={state.handleSelectionChange}
      onEditorChange={onEditorChange}
      collaborationExtensions={isReadOnly ? undefined : state.editorExtensions}
      bootstrapMarkdown={isReadOnly ? undefined : state.bootstrapMarkdown}
      editable={!isReadOnly}
    />
  );
}

function HistoryPreviewBanner({
  label,
  onClose,
}: Readonly<{
  label: string;
  onClose?: (() => void) | undefined;
}>) {
  return (
    <div
      style={{
        alignItems: "center",
        background: "#f8fafc",
        borderBottom: "1px solid var(--color-border)",
        color: "var(--color-text-secondary)",
        display: "flex",
        fontSize: "12px",
        gap: "12px",
        justifyContent: "space-between",
        padding: "8px 18px",
      }}
    >
      <span>
        Viewing saved history:{" "}
        <strong style={{ color: "var(--color-text-primary)" }}>{label}</strong>. This snapshot is
        read-only.
      </span>
      <button
        onClick={onClose}
        style={{
          background: "transparent",
          border: "0",
          color: "var(--color-accent)",
          cursor: "pointer",
          font: "inherit",
          fontWeight: 650,
          padding: 0,
        }}
        type="button"
      >
        Back to current document
      </button>
    </div>
  );
}

function HistoryPreviewSlot({
  historyPreview,
  onClose,
}: Readonly<{
  historyPreview?: EditorHistoryPreview | null | undefined;
  onClose?: (() => void) | undefined;
}>) {
  if (!historyPreview) {
    return <div aria-hidden="true" style={{ minHeight: "35px" }} />;
  }

  return <HistoryPreviewBanner label={historyPreview.label} onClose={onClose} />;
}

function EditorWorkspaceFrame({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div
      className="editor-workspace"
      aria-label="Collaborative rich Markdown editor"
      data-testid="editor-workspace"
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        flex: 1,
      }}
    >
      {children}
    </div>
  );
}

function ActiveEditorBody({
  markdown,
  onMarkdownChange,
  onSelectionChange,
  onEditorChange,
  collaborationExtensions,
  bootstrapMarkdown,
  editable = true,
}: Readonly<{
  markdown: string;
  onMarkdownChange: (markdown: string) => void;
  onSelectionChange: (selection: EditorSelectionSnapshot) => void;
  onEditorChange?: ((editor: Editor | null) => void) | undefined;
  collaborationExtensions?: ReturnType<CollaborationAdapter["useDocument"]>["editorExtensions"];
  bootstrapMarkdown?: ReturnType<CollaborationAdapter["useDocument"]>["bootstrapMarkdown"];
  editable?: boolean | undefined;
}>) {
  return (
    <EditorWorkspaceBody
      markdown={markdown}
      onMarkdownChange={onMarkdownChange}
      onSelectionChange={onSelectionChange}
      onEditorChange={onEditorChange}
      collaborationExtensions={collaborationExtensions}
      bootstrapMarkdown={bootstrapMarkdown}
      editable={editable}
    />
  );
}

function noopMarkdownChange() {}

function CurrentMarkdownStore({ markdown }: Readonly<{ markdown: string }>) {
  useEffect(() => writeCurrentEditorMarkdown(markdown), [markdown]);

  return null;
}

function useEditorWorkspaceState(
  viewModel: EditorWorkspaceViewModel,
  collaborationAdapter: CollaborationAdapter,
) {
  const documentId = resolveActiveEditorDocumentId(viewModel.documentId);
  const documentState = selectCollaborationAdapter(viewModel, collaborationAdapter).useDocument(
    createCollaborationOptions(viewModel, documentId),
  );
  const handleMarkdownChange = useMarkdownProjectionHandler(documentState.updateMarkdown);
  const handleSelectionChange = useCallback(
    (selection: EditorSelectionSnapshot) => documentState.updateSelection(selection),
    [documentState],
  );

  return {
    markdown: documentState.markdown,
    editorExtensions: documentState.editorExtensions,
    bootstrapMarkdown: documentState.bootstrapMarkdown,
    syncStatus: documentState.syncStatus,
    presence: documentState.presence,
    handleMarkdownChange,
    handleSelectionChange,
  };
}

function useMarkdownProjectionHandler(updateMarkdown: (markdown: string) => void) {
  return useCallback(
    (nextMarkdown: string) => {
      updateMarkdown(nextMarkdown);
      writeCurrentEditorMarkdown(nextMarkdown);
    },
    [updateMarkdown],
  );
}

function createCollaborationOptions(viewModel: EditorWorkspaceViewModel, documentId: string) {
  return {
    documentId,
    initialMarkdown: viewModel.markdown ?? fallbackMarkdown,
    initialSyncStatus: viewModel.syncStatus ?? fallbackSyncStatus,
    initialPresence: viewModel.presence ?? fallbackPresence,
    ...(viewModel.collaborationSession ? { session: viewModel.collaborationSession } : {}),
  };
}

function selectCollaborationAdapter(
  viewModel: EditorWorkspaceViewModel,
  fallbackAdapter: CollaborationAdapter,
): CollaborationAdapter {
  if (viewModel.collaborationSession) return createTiptapYjsCollaborationAdapter();
  return fallbackAdapter;
}

function readWordCount(markdown: string) {
  const normalized = markdown.replace(/\s+/g, " ").trim();
  if (normalized.length === 0) return 0;
  return normalized.split(" ").length;
}

function formatCount(count: number, noun: string) {
  return `${new Intl.NumberFormat("en-US").format(count)} ${noun}${count === 1 ? "" : "s"}`;
}

export function resolveActiveEditorDocumentId(viewModelDocumentId: string | undefined): string {
  return resolveEditorDocumentId(viewModelDocumentId);
}
