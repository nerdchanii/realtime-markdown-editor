export const documentFeatureId = "document";

export type DocumentContextViewModel = Readonly<{
  replacementPoint: string;
  label: string;
}>;

export type DocumentContextSlotProps = Readonly<{
  viewModel: DocumentContextViewModel;
}>;

export function DocumentContextSlot({ viewModel }: DocumentContextSlotProps) {
  return (
    <header className="document-context" aria-label="Document context">
      <div className="slot-kicker">Document</div>
      <h2 className="slot-title">{viewModel.label}</h2>
      <div className="replacement-point">{viewModel.replacementPoint}</div>
    </header>
  );
}
