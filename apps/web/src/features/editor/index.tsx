import type { Editor } from "@tiptap/core";
import { useCallback, useEffect, useRef, type ReactNode, type RefObject } from "react";

import type { CollaborationSessionDto } from "@rme/contracts";

import type { ApiClient } from "@/lib/api-client";
import { writeCurrentEditorMarkdown } from "@/lib/current-editor-markdown";

import { EditorToolbar } from "./EditorToolbar";
import { EditorWorkspaceBody } from "./EditorWorkspaceBody";
import { PresenceLayer } from "./PresenceLayer";
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
}>;

// The mock adapter remains the UI-test fallback until realtime integration.
export function EditorWorkspaceSlot({
  viewModel,
  collaborationAdapter = mockCollaborationAdapter,
}: EditorWorkspaceSlotProps) {
  const editorRef = useRef<Editor | null>(null);
  const state = useEditorWorkspaceState(viewModel, collaborationAdapter);

  return (
    <EditorWorkspaceFrame>
      <EditorWorkspaceContent editorRef={editorRef} viewModel={viewModel} state={state} />
    </EditorWorkspaceFrame>
  );
}

function EditorWorkspaceContent({
  editorRef,
  viewModel,
  state,
}: Readonly<{
  editorRef: RefObject<Editor | null>;
  viewModel: EditorWorkspaceViewModel;
  state: ReturnType<typeof useEditorWorkspaceState>;
}>) {
  return (
    <>
      <EditorToolbarSlot editorRef={editorRef} viewModel={viewModel} state={state} />
      <EditorBodySlot editorRef={editorRef} state={state} />
      <CurrentMarkdownStore markdown={state.markdown} />
      <PresenceLayer members={state.presence} />
    </>
  );
}

function EditorToolbarSlot({
  editorRef,
  viewModel,
  state,
}: Readonly<{
  editorRef: RefObject<Editor | null>;
  viewModel: EditorWorkspaceViewModel;
  state: ReturnType<typeof useEditorWorkspaceState>;
}>) {
  return (
    <EditorToolbar
      documentId={resolveActiveEditorDocumentId(viewModel.documentId)}
      editorRef={editorRef}
      label={viewModel.label}
      syncStatus={state.syncStatus}
    />
  );
}

function EditorBodySlot({
  editorRef,
  state,
}: Readonly<{
  editorRef: RefObject<Editor | null>;
  state: ReturnType<typeof useEditorWorkspaceState>;
}>) {
  return (
    <ActiveEditorBody
      markdown={state.markdown}
      onMarkdownChange={state.handleMarkdownChange}
      onSelectionChange={state.handleSelectionChange}
      onEditorChange={(editor) => {
        editorRef.current = editor;
      }}
      collaborationExtensions={state.editorExtensions}
      bootstrapMarkdown={state.bootstrapMarkdown}
    />
  );
}

function EditorWorkspaceFrame({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div
      className="editor-workspace"
      aria-label="Collaborative rich Markdown editor"
      data-testid="editor-workspace"
      style={{ position: "relative" }}
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
}: Readonly<{
  markdown: string;
  onMarkdownChange: (markdown: string) => void;
  onSelectionChange: (selection: EditorSelectionSnapshot) => void;
  onEditorChange?: ((editor: Editor | null) => void) | undefined;
  collaborationExtensions?: ReturnType<CollaborationAdapter["useDocument"]>["editorExtensions"];
  bootstrapMarkdown?: ReturnType<CollaborationAdapter["useDocument"]>["bootstrapMarkdown"];
}>) {
  return (
    <EditorWorkspaceBody
      markdown={markdown}
      onMarkdownChange={onMarkdownChange}
      onSelectionChange={onSelectionChange}
      onEditorChange={onEditorChange}
      collaborationExtensions={collaborationExtensions}
      bootstrapMarkdown={bootstrapMarkdown}
    />
  );
}

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

function readDocumentIdFromLocation() {
  if (typeof window === "undefined") {
    return "seed-review-plan";
  }

  return new URLSearchParams(window.location.search).get("document") ?? "seed-review-plan";
}

export function resolveActiveEditorDocumentId(viewModelDocumentId: string | undefined): string {
  return viewModelDocumentId ?? readDocumentIdFromLocation();
}
