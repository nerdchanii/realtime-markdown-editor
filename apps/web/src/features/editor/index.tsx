export const editorFeatureId = "editor";

export type EditorWorkspaceViewModel = Readonly<{
  replacementPoint: string;
  label: string;
}>;

export type EditorWorkspaceSlotProps = Readonly<{
  viewModel: EditorWorkspaceViewModel;
}>;

export function EditorWorkspaceSlot({ viewModel }: EditorWorkspaceSlotProps) {
  return (
    <div className="editor-workspace" aria-label="Editor and rich preview">
      <div className="slot-kicker">Editor</div>
      <div className="slot-title">{viewModel.label}</div>
      <div className="replacement-point">{viewModel.replacementPoint}</div>
    </div>
  );
}
