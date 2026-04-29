import { useCallback } from "react";

import type { CollaborationSessionDto } from "@rme/contracts";

import { MarkdownPreview } from "./MarkdownPreview";
import { mockCollaborationAdapter } from "./adapters/mock-collaboration-adapter";
import type {
  CollaborationAdapter,
  EditorMode,
  PresenceMember,
  SyncStatusViewModel,
} from "./ports/collaboration-adapter";
import {
  modeButtonStyle,
  modeGroupStyle,
  presenceBadgeStyle,
  presenceDotStyle,
  presenceLayerStyle,
  syncStatusStyle,
  textareaStyle,
  toolbarStyle,
  workspaceGridStyle,
} from "./styles";

export const editorFeatureId = "editor";

export {
  createMockCollaborationAdapter,
  mockCollaborationAdapter,
  mockCollaborationProviderName,
} from "./adapters/mock-collaboration-adapter";
export { createTiptapYjsCollaborationAdapter } from "./adapters/tiptap-yjs-collaboration-adapter";
export type { CollaborationAdapter, EditorMode, PresenceMember, SyncStatusViewModel };

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
  const { markdown, mode, syncStatus, presence, handleMarkdownChange } = useEditorWorkspaceState(
    viewModel,
    collaborationAdapter,
  );

  return (
    <div
      className="editor-workspace"
      aria-label="Editor and rich preview"
      data-testid="editor-workspace"
    >
      <EditorToolbar label={viewModel.label} mode={mode} syncStatus={syncStatus} />
      <div style={workspaceGridStyle} data-testid="editor-split-view">
        <SourcePane markdown={markdown} onMarkdownChange={handleMarkdownChange} />
        <MarkdownPreview markdown={markdown} />
      </div>
      <PresenceLayer members={presence} />
      <div className="replacement-point">{viewModel.replacementPoint}</div>
    </div>
  );
}

function useEditorWorkspaceState(
  viewModel: EditorWorkspaceViewModel,
  collaborationAdapter: CollaborationAdapter,
) {
  const documentId = viewModel.documentId ?? readDocumentIdFromLocation();
  const initialMarkdown = viewModel.markdown ?? fallbackMarkdown;
  const { markdown, updateMarkdown, syncStatus, presence } = collaborationAdapter.useDocument({
    documentId,
    initialMarkdown,
    initialSyncStatus: viewModel.syncStatus ?? fallbackSyncStatus,
    initialPresence: viewModel.presence ?? fallbackPresence,
    ...(viewModel.collaborationSession ? { session: viewModel.collaborationSession } : {}),
  });
  const mode = viewModel.mode ?? "split";
  const handleMarkdownChange = useCallback(
    (nextMarkdown: string) => {
      updateMarkdown(nextMarkdown);
    },
    [updateMarkdown],
  );

  return {
    markdown,
    mode,
    syncStatus,
    presence,
    handleMarkdownChange,
  };
}

function EditorToolbar({
  label,
  mode,
  syncStatus,
}: {
  label: string;
  mode: EditorMode;
  syncStatus: SyncStatusViewModel;
}) {
  return (
    <div style={toolbarStyle}>
      <div>
        <div className="slot-kicker">Editor</div>
        <div className="slot-title">{label}</div>
      </div>
      <ModeSwitcher mode={mode} />
      <SyncStatusSlot status={syncStatus} />
    </div>
  );
}

function ModeSwitcher({ mode }: { mode: EditorMode }) {
  return (
    <div
      role="group"
      aria-label="Editor mode"
      style={modeGroupStyle}
      data-testid="editor-mode-switcher"
    >
      {(["rich", "markdown", "split", "preview"] as const).map((item) => (
        <button key={item} type="button" aria-pressed={item === mode} style={modeButtonStyle}>
          {modeLabels[item]}
        </button>
      ))}
    </div>
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

function SourcePane({
  markdown,
  onMarkdownChange,
}: {
  markdown: string;
  onMarkdownChange: (markdown: string) => void;
}) {
  return (
    <section aria-label="Markdown source" data-testid="markdown-source-pane">
      <textarea
        aria-label="Markdown editor"
        data-testid="collaborative-markdown-editor"
        value={markdown}
        onChange={(event) => onMarkdownChange(event.currentTarget.value)}
        spellCheck={false}
        style={textareaStyle}
      />
    </section>
  );
}

function PresenceLayer({ members }: { members: readonly PresenceMember[] }) {
  return (
    <div aria-label="Remote presence" data-testid="presence-layer" style={presenceLayerStyle}>
      {members.map((member) => (
        <span
          key={member.id}
          data-testid={`presence-cursor-${member.id}`}
          style={{ ...presenceBadgeStyle, borderColor: member.color }}
        >
          <span style={{ ...presenceDotStyle, background: member.color }} />
          <span>{member.name} editing</span>
          <span data-testid={`presence-selection-${member.id}`}>{member.range}</span>
        </span>
      ))}
    </div>
  );
}

const modeLabels: Record<EditorMode, string> = {
  rich: "Rich",
  markdown: "Markdown",
  split: "Split",
  preview: "Preview",
};

function readDocumentIdFromLocation() {
  if (typeof window === "undefined") {
    return "seed-review-plan";
  }

  return new URLSearchParams(window.location.search).get("document") ?? "seed-review-plan";
}
