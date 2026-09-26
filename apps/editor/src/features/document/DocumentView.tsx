import type { ReactNode } from "react";

import "./document.css";

interface DocumentViewProps {
  children: ReactNode;
}

// The title is the body's first H1, so the document has no separate title header.
export function DocumentView({ children }: DocumentViewProps) {
  return <article className="document">{children}</article>;
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
