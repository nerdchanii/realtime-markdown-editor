import { useCallback, useState } from "react";

import type {
  CollaborationAdapter,
  CollaborationDocumentOptions,
  CollaborationDocumentState,
} from "../ports/collaboration-adapter";

export const productApiCollaborationProviderName = "features.editor.collaboration.product-api";

export function createProductApiCollaborationAdapter(): CollaborationAdapter {
  return {
    providerName: productApiCollaborationProviderName,
    useDocument: useProductApiDocument,
  };
}

function useProductApiDocument({
  documentId,
  initialMarkdown,
  initialPresence,
  initialSyncStatus,
}: CollaborationDocumentOptions): CollaborationDocumentState {
  const [documentState, setDocumentState] = useState(() => ({
    documentId,
    markdown: initialMarkdown,
  }));
  const markdown =
    documentState.documentId === documentId ? documentState.markdown : initialMarkdown;

  const updateMarkdown = useCallback(
    (nextMarkdown: string) => {
      setDocumentState({ documentId, markdown: nextMarkdown });
    },
    [documentId],
  );

  return {
    markdown,
    updateMarkdown,
    updateSelection: () => undefined,
    syncStatus: initialSyncStatus,
    presence: initialPresence,
    providerName: productApiCollaborationProviderName,
  };
}
