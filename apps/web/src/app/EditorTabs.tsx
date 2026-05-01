export function EditorTabs({
  activeDocumentId,
  tabs,
  onSelectDocument,
  onCloseDocument,
}: Readonly<{
  activeDocumentId?: string | undefined;
  tabs: readonly EditorTabViewModel[];
  onSelectDocument: (documentId: string) => void;
  onCloseDocument: (documentId: string) => void;
}>) {
  return (
    <div className="document-tabs" aria-label="Document tabs" data-testid="document-tabs">
      {tabs.map((tab) => {
        const isActive = tab.documentId === activeDocumentId;
        return (
          <button
            key={tab.documentId}
            aria-current={isActive ? "page" : undefined}
            className={isActive ? "document-tab document-tab--active" : "document-tab"}
            onClick={() => onSelectDocument(tab.documentId)}
            type="button"
          >
            <span className="document-tab__label" title={toDocumentTabLabel(tab.title)}>
              {toDocumentTabLabel(tab.title)}
            </span>
            {tabs.length > 1 ? (
              <span
                aria-label={`Close ${tab.title}`}
                className="document-tab__close"
                onClick={(event) => {
                  event.stopPropagation();
                  onCloseDocument(tab.documentId);
                }}
                role="button"
                tabIndex={0}
              >
                x
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export type EditorTabViewModel = Readonly<{
  documentId: string;
  title: string;
}>;

function toDocumentTabLabel(title: string) {
  return title.toLowerCase().endsWith(".md") ? title : `${title}.md`;
}
