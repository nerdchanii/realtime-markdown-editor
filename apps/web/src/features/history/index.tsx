import { useMemo, useState } from "react";

export const historyFeatureId = "history";

export type HistoryCheckpoint = Readonly<{
  id: string;
  message: string;
  author: string;
  createdAt: string;
  snapshot: string;
}>;

export type HistoryInspectorViewModel = Readonly<{
  replacementPoint: string;
  label: string;
  checkpoints?: readonly HistoryCheckpoint[];
}>;

export type HistoryInspectorSlotProps = Readonly<{
  viewModel: HistoryInspectorViewModel;
}>;

const fallbackCheckpoints: readonly HistoryCheckpoint[] = [
  {
    id: "checkpoint-003",
    message: "Prepared reviewer CE path",
    author: "Mina Park",
    createdAt: "Today 10:24",
    snapshot: "# Collaborative editor review plan\n\nProperties stay outside this body.",
  },
  {
    id: "checkpoint-002",
    message: "Added backlinks surface",
    author: "Jules Chen",
    createdAt: "Yesterday 17:40",
    snapshot: "# Review plan\n\nAdded standard Markdown link context.",
  },
  {
    id: "checkpoint-001",
    message: "Created walking skeleton document",
    author: "Rina Sato",
    createdAt: "Yesterday 09:05",
    snapshot: "# Review plan\n\nInitial editor workspace scaffold.",
  },
];

// Mock replacement: checkpoint rows are seed data until TASK-016 wires real history providers.
export function HistoryInspectorSlot({ viewModel }: HistoryInspectorSlotProps) {
  const history = useHistoryInspectorState(viewModel);

  return (
    <aside className="inspector-panel" aria-label="History inspector" data-testid="history-slot">
      <div className="slot-kicker">History</div>
      <h2 className="slot-title">{viewModel.label}</h2>
      <RevisionComposer
        message={history.revisionMessage}
        onMessageChange={history.setRevisionMessage}
        onPublishRevision={history.publishRevision}
      />
      <CheckpointList
        checkpoints={history.checkpoints}
        selectedCheckpointId={history.selectedCheckpointId}
        onSelectCheckpoint={history.setSelectedCheckpointId}
      />
      {history.selected ? <SnapshotPreview checkpoint={history.selected} /> : <EmptyHistory />}
      <div className="replacement-point">{viewModel.replacementPoint}</div>
    </aside>
  );
}

function useHistoryInspectorState(viewModel: HistoryInspectorViewModel) {
  const incomingCheckpoints = useMemo(
    () => [...(viewModel.checkpoints ?? fallbackCheckpoints)],
    [viewModel.checkpoints],
  );
  const [checkpoints, setCheckpoints] = useState(incomingCheckpoints);
  const [selectedCheckpointId, setSelectedCheckpointId] = useState(checkpoints[0]?.id);
  const [revisionMessage, setRevisionMessage] = useState("");
  const selected = checkpoints.find((checkpoint) => checkpoint.id === selectedCheckpointId);

  const publishRevision = () => {
    const checkpoint = createCheckpoint(revisionMessage);
    setCheckpoints((current) => [checkpoint, ...current]);
    setSelectedCheckpointId(checkpoint.id);
    setRevisionMessage("");
  };

  return {
    checkpoints,
    publishRevision,
    revisionMessage,
    selected,
    selectedCheckpointId,
    setRevisionMessage,
    setSelectedCheckpointId,
  };
}

function RevisionComposer({
  message,
  onMessageChange,
  onPublishRevision,
}: Readonly<{
  message: string;
  onMessageChange: (message: string) => void;
  onPublishRevision: () => void;
}>) {
  return (
    <section aria-label="Publish revision" style={sectionStyle}>
      <button type="button" data-testid="publish-revision-button" onClick={onPublishRevision}>
        Publish revision
      </button>
      <input
        aria-label="Revision message"
        data-testid="revision-message-input"
        value={message}
        onChange={(event) => onMessageChange(event.currentTarget.value)}
      />
      <button
        type="button"
        data-testid="confirm-publish-revision-button"
        onClick={onPublishRevision}
      >
        Confirm
      </button>
    </section>
  );
}

function CheckpointList({
  checkpoints,
  selectedCheckpointId,
  onSelectCheckpoint,
}: Readonly<{
  checkpoints: readonly HistoryCheckpoint[];
  selectedCheckpointId: string | undefined;
  onSelectCheckpoint: (checkpointId: string) => void;
}>) {
  return (
    <section aria-label="Revision history" data-testid="revision-history-list" style={sectionStyle}>
      {checkpoints.map((checkpoint) => (
        <button
          key={checkpoint.id}
          type="button"
          style={checkpointStyle}
          data-testid="revision-history-item"
          aria-pressed={checkpoint.id === selectedCheckpointId}
          onClick={() => onSelectCheckpoint(checkpoint.id)}
        >
          <strong>{checkpoint.message}</strong>
          <span style={metadataStyle}>
            {checkpoint.author} · {checkpoint.createdAt}
          </span>
        </button>
      ))}
    </section>
  );
}

function SnapshotPreview({ checkpoint }: { checkpoint: HistoryCheckpoint }) {
  return (
    <section
      aria-label="Checkpoint snapshot"
      data-testid="revision-snapshot-viewer"
      style={snapshotStyle}
    >
      <div style={snapshotHeaderStyle}>Read-only snapshot</div>
      <pre style={snapshotBodyStyle}>{checkpoint.snapshot}</pre>
    </section>
  );
}

function EmptyHistory() {
  return (
    <section
      aria-label="Checkpoint snapshot"
      data-testid="revision-snapshot-viewer"
      style={snapshotStyle}
    >
      <div style={snapshotHeaderStyle}>No checkpoints yet</div>
    </section>
  );
}

const sectionStyle = {
  display: "grid",
  gap: "8px",
  marginTop: "14px",
};

const checkpointStyle = {
  display: "grid",
  gap: "4px",
  border: "1px solid var(--color-border)",
  borderRadius: "6px",
  padding: "10px",
  fontSize: "13px",
};

const metadataStyle = {
  color: "var(--color-text-muted)",
  fontSize: "12px",
};

const snapshotStyle = {
  marginTop: "14px",
  border: "1px solid var(--color-border)",
  borderRadius: "6px",
  padding: "10px",
};

const snapshotHeaderStyle = {
  color: "var(--color-text-secondary)",
  fontSize: "12px",
  fontWeight: 650,
};

const snapshotBodyStyle = {
  margin: "8px 0 0",
  whiteSpace: "pre-wrap" as const,
  color: "var(--color-text-primary)",
  fontSize: "12px",
  lineHeight: 1.55,
};

function createCheckpoint(message: string): HistoryCheckpoint {
  return {
    id: `checkpoint-${Date.now()}`,
    message: message.trim() || "Untitled revision",
    author: "Alice",
    createdAt: "Just now",
    snapshot: readCurrentEditorMarkdown(),
  };
}

function readCurrentEditorMarkdown() {
  if (typeof document === "undefined") {
    return "";
  }

  const editor = document.querySelector<HTMLTextAreaElement>(
    '[data-testid="collaborative-markdown-editor"]',
  );

  return editor?.value ?? "";
}
