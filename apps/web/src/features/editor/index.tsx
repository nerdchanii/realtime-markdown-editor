import { useCallback, useState } from "react";

import type { CollaborationSessionDto } from "@rme/contracts";

import { EditorToolbar } from "./EditorToolbar";
import { EditorWorkspaceBody } from "./EditorWorkspaceBody";
import { PresenceLayer } from "./PresenceLayer";
import { mockCollaborationAdapter } from "./adapters/mock-collaboration-adapter";
import { createTiptapYjsCollaborationAdapter } from "./adapters/tiptap-yjs-collaboration-adapter";
import type {
  CollaborationAdapter,
  EditorSelectionSnapshot,
  EditorMode,
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
export type {
  CollaborationAdapter,
  EditorMode,
  EditorSelectionSnapshot,
  PresenceMember,
  SyncStatusViewModel,
};

export type EditorWorkspaceViewModel = Readonly<{
  replacementPoint: string;
  label: string;
  mode?: EditorMode;
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
- CE-05 keeps source and preview visible in split mode.

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
  const { markdown, mode, syncStatus, presence, handleMarkdownChange, handleSelectionChange } =
    useEditorWorkspaceState(viewModel, collaborationAdapter);
  const [selectedMode, setSelectedMode] = useState(mode);

  return (
    <div
      className="editor-workspace"
      aria-label="Editor and rich preview"
      data-testid="editor-workspace"
    >
      <EditorToolbar
        label={viewModel.label}
        mode={selectedMode}
        syncStatus={syncStatus}
        onModeChange={setSelectedMode}
      />
      <EditorWorkspaceBody
        markdown={markdown}
        mode={selectedMode}
        onMarkdownChange={handleMarkdownChange}
        onSelectionChange={handleSelectionChange}
      />
      <PresenceLayer members={presence} />
      <div className="replacement-point">{viewModel.replacementPoint}</div>
    </div>
  );
}

function useEditorWorkspaceState(
  viewModel: EditorWorkspaceViewModel,
  collaborationAdapter: CollaborationAdapter,
) {
  const activeAdapter = selectCollaborationAdapter(viewModel, collaborationAdapter);
  const { markdown, updateMarkdown, updateSelection, syncStatus, presence } =
    activeAdapter.useDocument(createCollaborationOptions(viewModel));
  const mode = viewModel.mode ?? "split";
  const handleMarkdownChange = useCallback(
    (nextMarkdown: string) => {
      updateMarkdown(nextMarkdown);
    },
    [updateMarkdown],
  );
  const handleSelectionChange = useCallback(
    (selection: EditorSelectionSnapshot) => {
      updateSelection(selection);
    },
    [updateSelection],
  );

  return {
    markdown,
    mode,
    syncStatus,
    presence,
    handleMarkdownChange,
    handleSelectionChange,
  };
}

function createCollaborationOptions(viewModel: EditorWorkspaceViewModel) {
  return {
    documentId: viewModel.documentId ?? readDocumentIdFromLocation(),
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
