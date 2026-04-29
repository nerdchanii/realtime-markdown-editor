export const workspaceFeatureId = "workspace";

export type WorkspaceNavigationViewModel = Readonly<{
  replacementPoint: string;
  label: string;
}>;

export type WorkspaceNavigationSlotProps = Readonly<{
  viewModel: WorkspaceNavigationViewModel;
}>;

export function WorkspaceNavigationSlot({ viewModel }: WorkspaceNavigationSlotProps) {
  return (
    <aside className="workspace-panel" aria-label="Workspace navigation">
      <div className="slot-kicker">Workspace</div>
      <h1 className="slot-title">{viewModel.label}</h1>
      <div className="replacement-point">{viewModel.replacementPoint}</div>
    </aside>
  );
}
