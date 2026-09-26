import { useDocumentMeta, useOpenDocument } from "../../core/hooks";
import type { DocumentEntry, LocalWorkspace } from "../../core/local-workspace";

import "./explorer.css";

interface ExplorerProps {
  workspace: LocalWorkspace;
  entries: DocumentEntry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
}

// Flat list of local documents. Folders wait for the workspace hierarchy decision (#6).
export function Explorer({ workspace, entries, selectedId, onSelect, onCreate }: ExplorerProps) {
  return (
    <div className="explorer">
      <div className="explorer__header">
        문서
        <button type="button" className="explorer__new" onClick={onCreate}>
          새 문서
        </button>
      </div>
      {entries.length === 0 ? (
        <p className="explorer__empty">문서가 없습니다.</p>
      ) : (
        <ul className="explorer__list">
          {entries.map((entry) => (
            <li key={entry.id}>
              <ExplorerItem
                workspace={workspace}
                id={entry.id}
                selected={entry.id === selectedId}
                onSelect={onSelect}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface ExplorerItemProps {
  workspace: LocalWorkspace;
  id: string;
  selected: boolean;
  onSelect: (id: string) => void;
}

function ExplorerItem({ workspace, id, selected, onSelect }: ExplorerItemProps) {
  const meta = useDocumentMeta(useOpenDocument(workspace, id));
  const title = meta?.title.trim();
  return (
    <button
      type="button"
      className="explorer__item"
      aria-current={selected}
      onClick={() => onSelect(id)}
    >
      {title ? title : <span className="explorer__untitled">제목 없음</span>}
    </button>
  );
}
