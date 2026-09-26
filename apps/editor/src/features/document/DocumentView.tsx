import type { ReactNode } from "react";
import type * as Y from "yjs";

import { setTitle } from "../../core/document";
import { useDocumentMeta } from "../../core/hooks";

import "./document.css";

interface DocumentViewProps {
  doc: Y.Doc;
  children: ReactNode;
}

// Title lives in core `meta`, outside the body (DESIGN.md §5).
export function DocumentView({ doc, children }: DocumentViewProps) {
  const meta = useDocumentMeta(doc);

  return (
    <article className="document">
      <header className="document__header">
        <input
          className="document__title"
          aria-label="문서 제목"
          placeholder="제목 없음"
          value={meta?.title ?? ""}
          onChange={(event) => setTitle(doc, event.target.value)}
        />
      </header>
      <div className="document__body">{children}</div>
    </article>
  );
}

interface EmptyDocumentProps {
  hasDocuments: boolean;
  onCreate: () => void;
}

export function EmptyDocument({ hasDocuments, onCreate }: EmptyDocumentProps) {
  return (
    <div className="document-empty">
      <p>{hasDocuments ? "문서를 선택하세요." : "아직 문서가 없습니다."}</p>
      <button type="button" className="document-empty__action" onClick={onCreate}>
        새 문서 만들기
      </button>
    </div>
  );
}
