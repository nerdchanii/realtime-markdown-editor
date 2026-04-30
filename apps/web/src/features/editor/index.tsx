import { useCallback, useEffect, type ReactNode } from "react";

import type { CollaborationSessionDto } from "@rme/contracts";

import { writeCurrentEditorMarkdown } from "@/lib/current-editor-markdown";

import { EditorToolbar } from "./EditorToolbar";
import { EditorWorkspaceBody } from "./EditorWorkspaceBody";
import { PresenceLayer } from "./PresenceLayer";
import { mockCollaborationAdapter } from "./adapters/mock-collaboration-adapter";
import { createTiptapYjsCollaborationAdapter } from "./adapters/tiptap-yjs-collaboration-adapter";
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
}>;

export type EditorWorkspaceSlotProps = Readonly<{
  viewModel: EditorWorkspaceViewModel;
  collaborationAdapter?: CollaborationAdapter;
}>;

const fallbackMarkdown = `# Collaborative editor review plan

This Markdown body is the portable CE evidence path.

- CE-01 keeps concurrent edits in the central editor.
- CE-04 exposes checkpoints in the history slot.
- CE-05 uses the rich authoring surface as the rendered Markdown view.

\`\`\`ts
const editorSurface = "mock-backed";
\`\`\`

| Surface | Status |
| --- | --- |
| Properties | Outside body |
| Backlinks | Visible |
`;

const fallbackSyncStatus: SyncStatusViewModel = {
  label: "Synced",
  detail: "Mock provider, 0 pending local edits",
  pendingEdits: 0,
};

const fallbackPresence: readonly PresenceMember[] = [
  { id: "alice", name: "Alice", color: "#0969da", range: "line 3" },
  { id: "bob", name: "Bob", color: "#1a7f37", range: "table block" },
];

// The mock adapter remains the UI-test fallback until realtime integration.
export function EditorWorkspaceSlot({
  viewModel,
  collaborationAdapter = mockCollaborationAdapter,
}: EditorWorkspaceSlotProps) {
  const {
    markdown,
    editorExtensions,
    bootstrapMarkdown,
    syncStatus,
    presence,
    handleMarkdownChange,
    handleSelectionChange,
  } = useEditorWorkspaceState(viewModel, collaborationAdapter);

  return (
    <EditorWorkspaceFrame>
      <EditorToolbar label={viewModel.label} syncStatus={syncStatus} />
      <ActiveEditorBody
        markdown={markdown}
        onMarkdownChange={handleMarkdownChange}
        onSelectionChange={handleSelectionChange}
        collaborationExtensions={editorExtensions}
        bootstrapMarkdown={bootstrapMarkdown}
      />
      <CurrentMarkdownStore markdown={markdown} />
      <PresenceLayer members={presence} />
    </EditorWorkspaceFrame>
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
  collaborationExtensions,
  bootstrapMarkdown,
}: Readonly<{
  markdown: string;
  onMarkdownChange: (markdown: string) => void;
  onSelectionChange: (selection: EditorSelectionSnapshot) => void;
  collaborationExtensions?: ReturnType<CollaborationAdapter["useDocument"]>["editorExtensions"];
  bootstrapMarkdown?: ReturnType<CollaborationAdapter["useDocument"]>["bootstrapMarkdown"];
}>) {
  return (
    <EditorWorkspaceBody
      markdown={markdown}
      onMarkdownChange={onMarkdownChange}
      onSelectionChange={onSelectionChange}
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
  const handleMarkdownChange = useCallback(
    (nextMarkdown: string) => {
      documentState.updateMarkdown(nextMarkdown);
      writeCurrentEditorMarkdown(nextMarkdown);
      void saveCurrentMarkdownProjection(documentId, nextMarkdown);
    },
    [documentId, documentState],
  );
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

function createCollaborationOptions(viewModel: EditorWorkspaceViewModel, documentId: string) {
  return {
    documentId,
    initialMarkdown: viewModel.markdown ?? fallbackMarkdown,
    initialSyncStatus: viewModel.syncStatus ?? fallbackSyncStatus,
    initialPresence: viewModel.presence ?? fallbackPresence,
    ...(viewModel.collaborationSession && isSeedReviewDocumentId(documentId)
      ? { session: viewModel.collaborationSession }
      : {}),
  };
}

async function saveCurrentMarkdownProjection(documentId: string, markdownBody: string) {
  const url = `http://127.0.0.1:4000/documents/${encodeURIComponent(documentId)}/content`;
  const body = JSON.stringify({
    markdownBody,
    source: "collaboration-projection",
  });

  if (typeof XMLHttpRequest !== "undefined") {
    try {
      const request = new XMLHttpRequest();
      request.open("PUT", url, false);
      request.setRequestHeader("Content-Type", "application/json");
      request.send(body);
    } catch {
      // Projection persistence must not break the live collaborative editor.
    }
    return;
  }

  try {
    await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body,
    });
  } catch {
    // Projection persistence must not break the live collaborative editor.
  }
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

function resolveActiveEditorDocumentId(viewModelDocumentId: string | undefined): string {
  const routeDocumentId = readDocumentIdFromLocation();
  if (
    routeDocumentId !== "seed-review-plan" &&
    viewModelDocumentId !== undefined &&
    isSeedReviewDocumentId(viewModelDocumentId)
  ) {
    return routeDocumentId;
  }

  return viewModelDocumentId ?? routeDocumentId;
}

function isSeedReviewDocumentId(documentId: string): boolean {
  return documentId === "document_review_plan" || documentId === "seed-review-plan";
}
