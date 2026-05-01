import type { HistoryCheckpoint, HistoryInspectorViewModel } from "./types";
import { useHistoryInspectorState } from "./useHistoryInspectorState";

export const historyFeatureId = "history";
export type { HistoryCheckpoint, HistoryInspectorViewModel } from "./types";

export type HistoryInspectorSlotProps = Readonly<{
  viewModel: HistoryInspectorViewModel;
  onPreviewCheckpoint?: ((checkpoint: HistoryCheckpoint) => void) | undefined;
  refreshToken?: number | undefined;
}>;

export function HistoryInspectorSlot({
  viewModel,
  onPreviewCheckpoint,
  refreshToken,
}: HistoryInspectorSlotProps) {
  const history = useHistoryInspectorState(viewModel, [], refreshToken);
  const usesProductHistory = Boolean(viewModel.apiClient && viewModel.documentId);
  const timelineEntries = history.checkpoints.length
    ? history.checkpoints.map((checkpoint, index) => {
        const detail = checkpoint.message?.trim();
        return {
          key: checkpoint.id,
          checkpoint,
          actor: checkpoint.author,
          action: checkpoint.kind === "autosave" ? "autosaved" : "saved",
          time: formatCheckpointTime(checkpoint.createdAt),
          color: index === 0 ? "#2b7fff" : "#cad5e2",
          ...(detail ? { detail } : {}),
        };
      })
    : usesProductHistory
      ? []
      : [];

  return (
    <aside
      className="inspector-panel"
      aria-label="History inspector"
      data-testid="history-slot"
      style={{ display: "flex", flexDirection: "column", padding: 0 }}
    >
      <InspectorTabs />
      <div
        className="app-scroll-area"
        style={{
          flex: 1,
          padding: "24px 16px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {timelineEntries.length > 0 ? (
          <HistoryTimeline
            entries={timelineEntries}
            selectedCheckpointId={history.selectedCheckpointId}
            onSelect={(checkpoint) => {
              history.setSelectedCheckpointId(checkpoint.id);
              onPreviewCheckpoint?.(checkpoint);
            }}
          />
        ) : (
          <EmptyHistoryState />
        )}
      </div>
    </aside>
  );
}

function InspectorTabs() {
  return (
    <div className="inspector-tabs">
      <div className="inspector-tab">History</div>
    </div>
  );
}

function HistoryTimeline({
  entries,
  selectedCheckpointId,
  onSelect,
}: Readonly<{
  entries: readonly {
    key: string;
    checkpoint: HistoryCheckpoint;
    actor: string;
    action: string;
    time: string;
    color: string;
    detail?: string;
  }[];
  selectedCheckpointId?: string | undefined;
  onSelect: (checkpoint: HistoryCheckpoint) => void;
}>) {
  return (
    <div style={{ position: "relative", paddingLeft: "8px" }}>
      <div
        style={{
          position: "absolute",
          top: "8px",
          bottom: 0,
          left: "11px",
          width: "1px",
          background: "var(--color-border)",
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
        {entries.map((entry) => (
          <TimelineItem
            key={entry.key}
            actor={entry.actor}
            action={entry.action}
            time={entry.time}
            dotColor={entry.color}
            isSelected={entry.checkpoint.id === selectedCheckpointId}
            onSelect={() => onSelect(entry.checkpoint)}
            {...(entry.detail ? { content: entry.detail } : {})}
          />
        ))}
      </div>
    </div>
  );
}

function TimelineItem({
  actor,
  action,
  time,
  dotColor,
  isSelected,
  onSelect,
  content,
}: {
  actor: string;
  action: string;
  time: string;
  dotColor: string;
  isSelected: boolean;
  onSelect: () => void;
  content?: string;
}) {
  return (
    <button
      aria-current={isSelected ? "true" : undefined}
      onClick={onSelect}
      style={{
        background: isSelected ? "#f1f7ff" : "transparent",
        border: "0",
        borderRadius: "6px",
        color: "inherit",
        cursor: "pointer",
        font: "inherit",
        margin: "0 -8px",
        padding: "6px 8px 6px 24px",
        position: "relative",
        textAlign: "left",
      }}
      type="button"
    >
      <div
        style={{
          position: "absolute",
          left: "-1px",
          top: "4px",
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: dotColor,
          border: "2px solid var(--color-background)",
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <div style={{ fontSize: "13px", lineHeight: "16px", color: "#1d293d" }}>
          <span style={{ fontWeight: 600 }}>{actor}</span> {action}
        </div>
        {content ? <div style={historyDetailStyle}>{content}</div> : null}
        <div style={{ fontSize: "11px", color: "#90a1b9", marginTop: "2px" }}>{time}</div>
      </div>
    </button>
  );
}

function EmptyHistoryState() {
  return (
    <div style={{ color: "#90a1b9", fontSize: "12px", lineHeight: "18px" }}>
      No saved revisions yet.
    </div>
  );
}

function formatCheckpointTime(createdAt: string) {
  const timestamp = new Date(createdAt);
  if (Number.isNaN(timestamp.getTime())) return "Recently";
  return formatRelativeTime(timestamp);
}

const historyDetailStyle = {
  marginTop: "4px",
  color: "#45556c",
  fontSize: "12px",
  lineHeight: "18px",
};

function formatRelativeTime(timestamp: Date) {
  const diffMs = Date.now() - timestamp.getTime();
  const diffMinutes = Math.max(0, Math.round(diffMs / 60000));
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes === 1 ? "" : "s"} ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}
