import type { SyncStatusViewModel } from "./ports/collaboration-adapter";
import { syncStatusStyle, toolbarStyle } from "./styles";

export function EditorToolbar({
  label,
  syncStatus,
}: {
  label: string;
  syncStatus: SyncStatusViewModel;
}) {
  return (
    <div style={toolbarStyle}>
      <div>
        <div className="slot-kicker">Editor</div>
        <div className="slot-title">{label}</div>
      </div>
      <SyncStatusSlot status={syncStatus} />
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
