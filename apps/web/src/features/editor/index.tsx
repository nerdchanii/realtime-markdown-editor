import { useCallback } from "react";

import { MarkdownPreview } from "./MarkdownPreview";
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
import { useMockMarkdownDocument } from "./useMockMarkdownDocument";

export const editorFeatureId = "editor";

export type EditorMode = "rich" | "markdown" | "split" | "preview";

export type SyncStatusViewModel = Readonly<{
  label: string;
  detail: string;
  pendingEdits: number;
}>;

export type PresenceMember = Readonly<{
  id: string;
  name: string;
  color: string;
  range: string;
}>;

export type EditorWorkspaceViewModel = Readonly<{
  replacementPoint: string;
  label: string;
  mode?: EditorMode;
  markdown?: string;
  documentId?: string;
  syncStatus?: SyncStatusViewModel;
  presence?: readonly PresenceMember[];
}>;

export type EditorWorkspaceSlotProps = Readonly<{
  viewModel: EditorWorkspaceViewModel;
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

// Mock replacement: TASK-016 should swap this seed surface for collab/editor providers.
export function EditorWorkspaceSlot({ viewModel }: EditorWorkspaceSlotProps) {
  const { markdown, mode, handleMarkdownChange } = useEditorWorkspaceState(viewModel);

  return (
    <div
      className="editor-workspace"
      aria-label="Editor and rich preview"
      data-testid="editor-workspace"
    >
      <EditorToolbar
        label={viewModel.label}
        mode={mode}
        syncStatus={viewModel.syncStatus ?? fallbackSyncStatus}
      />
      <div style={workspaceGridStyle} data-testid="editor-split-view">
        <SourcePane markdown={markdown} onMarkdownChange={handleMarkdownChange} />
        <MarkdownPreview markdown={markdown} />
      </div>
      <PresenceLayer members={viewModel.presence ?? fallbackPresence} />
      <div className="replacement-point">{viewModel.replacementPoint}</div>
    </div>
  );
}

function useEditorWorkspaceState(viewModel: EditorWorkspaceViewModel) {
  const documentId = viewModel.documentId ?? readDocumentIdFromLocation();
  const initialMarkdown = viewModel.markdown ?? fallbackMarkdown;
  const { markdown, updateMarkdown } = useMockMarkdownDocument({ documentId, initialMarkdown });
  const mode = viewModel.mode ?? "split";
  const handleMarkdownChange = useCallback(
    (nextMarkdown: string) => {
      updateMarkdown(nextMarkdown);
    },
    [updateMarkdown],
  );

  return { markdown, mode, handleMarkdownChange };
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
