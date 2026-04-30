import { useCallback, useEffect, useMemo, useState } from "react";

import type { DocumentId } from "@rme/contracts";

import type {
  WorkspaceDocumentCreateRequest,
  WorkspaceNavigationSelection,
} from "@/features/workspace";
import { createDocument, createProductApiClient, type ApiClient } from "@/lib/api-client";

import { loadProductWorkspace } from "./product-workspace-loader";
import type { ProductWorkspaceState } from "./product-workspace-types";
import { createProductProviders } from "./product-workspace-view-model";

export function useProductWorkspaceProviders(): ProductWorkspaceState {
  const apiClient = useMemo(() => createProductApiClient(), []);
  const [selectedDocumentId, setSelectedDocumentId] = useState<DocumentId | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const reload = useCallback(() => setReloadToken((current) => current + 1), []);
  const selectDocument = useCallback((selection: WorkspaceNavigationSelection) => {
    setSelectedDocumentId(selection.documentId as DocumentId);
  }, []);
  const createProductDocument = useProductDocumentCreator(apiClient, reload, setSelectedDocumentId);
  const loadInput = useMemo(
    () => ({
      apiClient,
      createProductDocument,
      reloadToken,
      selectDocument,
      selectedDocumentId,
    }),
    [apiClient, createProductDocument, reloadToken, selectDocument, selectedDocumentId],
  );

  return useLoadedProductWorkspace(loadInput);
}

function useLoadedProductWorkspace(input: {
  apiClient: ApiClient;
  createProductDocument: (request: WorkspaceDocumentCreateRequest) => void;
  reloadToken: number;
  selectDocument: (selection: WorkspaceNavigationSelection) => void;
  selectedDocumentId: DocumentId | null;
}) {
  const [state, setState] = useState<ProductWorkspaceState>({ status: "loading" });

  useEffect(() => {
    const abortController = new AbortController();
    void loadProductWorkspace(
      input.apiClient,
      input.selectedDocumentId,
      abortController.signal,
    ).then(
      (model) => {
        if (abortController.signal.aborted) return;
        setState(createLoadedState(model, input));
      },
      (error) => {
        if (!abortController.signal.aborted) setState({ status: "error", error: toError(error) });
      },
    );

    return () => abortController.abort();
  }, [input]);

  return state;
}

function useProductDocumentCreator(
  apiClient: ApiClient,
  reload: () => void,
  setSelectedDocumentId: (documentId: DocumentId) => void,
) {
  return useCallback(
    (request: WorkspaceDocumentCreateRequest) => {
      const folderId = request.folderId;
      if (!folderId) return;

      void createDocument(apiClient, folderId, {
        title: request.title,
        initialMarkdownBody: `# ${request.title}\n\nStart writing here.`,
        state: "draft",
      }).then((response) => {
        setSelectedDocumentId(response.document.id);
        reload();
      });
    },
    [apiClient, reload, setSelectedDocumentId],
  );
}

function createLoadedState(
  model: Awaited<ReturnType<typeof loadProductWorkspace>>,
  input: {
    createProductDocument: (request: WorkspaceDocumentCreateRequest) => void;
    selectDocument: (selection: WorkspaceNavigationSelection) => void;
  },
): ProductWorkspaceState {
  if (!model) return { status: "empty" };

  return {
    status: "ready",
    providers: createProductProviders(model, input.selectDocument, input.createProductDocument),
  };
}

function toError(error: unknown) {
  return error instanceof Error ? error : new Error("Product workspace request failed");
}
