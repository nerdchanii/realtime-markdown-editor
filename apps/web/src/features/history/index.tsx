export const historyFeatureId = "history";

export type HistoryInspectorViewModel = Readonly<{
  replacementPoint: string;
  label: string;
}>;

export type HistoryInspectorSlotProps = Readonly<{
  viewModel: HistoryInspectorViewModel;
}>;

export function HistoryInspectorSlot({ viewModel }: HistoryInspectorSlotProps) {
  return (
    <aside className="inspector-panel" aria-label="History inspector">
      <div className="slot-kicker">History</div>
      <h2 className="slot-title">{viewModel.label}</h2>
      <div className="replacement-point">{viewModel.replacementPoint}</div>
    </aside>
  );
}
