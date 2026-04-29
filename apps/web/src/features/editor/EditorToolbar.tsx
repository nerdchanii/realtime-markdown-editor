import type { EditorMode, SyncStatusViewModel } from "./ports/collaboration-adapter";
import { modeButtonStyle, modeGroupStyle, syncStatusStyle, toolbarStyle } from "./styles";

const modeLabels: Record<EditorMode, string> = {
  rich: "Rich",
  markdown: "Markdown",
  split: "Split",
  preview: "Preview",
};

export function EditorToolbar({
  label,
  mode,
  syncStatus,
  onModeChange,
}: {
  label: string;
  mode: EditorMode;
  syncStatus: SyncStatusViewModel;
  onModeChange: (mode: EditorMode) => void;
}) {
  return (
    <div style={toolbarStyle}>
      <div>
        <div className="slot-kicker">Editor</div>
        <div className="slot-title">{label}</div>
      </div>
      <ModeSwitcher mode={mode} onModeChange={onModeChange} />
      <SyncStatusSlot status={syncStatus} />
    </div>
  );
}

function ModeSwitcher({
  mode,
  onModeChange,
}: {
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Editor mode"
      style={modeGroupStyle}
      data-testid="editor-mode-switcher"
    >
      {(["rich", "markdown", "split", "preview"] as const).map((item) => (
        <button
          key={item}
          type="button"
          aria-pressed={item === mode}
          style={modeButtonStyle}
          onClick={() => onModeChange(item)}
        >
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
