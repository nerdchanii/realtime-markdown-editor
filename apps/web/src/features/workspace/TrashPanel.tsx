import { RotateCcw } from "lucide-react";

import type { WorkspaceArchivedDocument } from "./types";

export function TrashPanel({
  documents,
  status,
  onRefresh,
  onRestoreDocument,
}: Readonly<{
  documents: readonly WorkspaceArchivedDocument[];
  status: "idle" | "loading" | "error";
  onRefresh: () => void;
  onRestoreDocument: (documentId: string) => void;
}>) {
  return (
    <section className="workspace-trash" aria-label="Trash">
      <header className="workspace-trash__header">
        <span>Trash</span>
        <button type="button" className="workspace-trash__refresh" onClick={onRefresh}>
          Refresh
        </button>
      </header>
      {status === "loading" ? <p className="workspace-trash__message">Loading...</p> : null}
      {status === "error" ? (
        <p className="workspace-trash__message">Trash could not be loaded.</p>
      ) : null}
      {status === "idle" && documents.length === 0 ? (
        <p className="workspace-trash__message">Trash is empty.</p>
      ) : null}
      <ul className="workspace-trash__list">
        {documents.map((document) => (
          <li key={document.id} className="workspace-trash__item">
            <div className="workspace-trash__copy">
              <span className="workspace-trash__title">{document.title}</span>
              <span className="workspace-trash__date">{formatArchivedAt(document.archivedAt)}</span>
            </div>
            <button
              type="button"
              className="workspace-trash__restore"
              aria-label={`Restore ${document.title}`}
              onClick={() => onRestoreDocument(document.id)}
            >
              <RotateCcw size={14} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function formatArchivedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Archived";
  return `Archived ${date.toLocaleDateString()}`;
}
