import { useCallback, useEffect, useMemo, useState } from "react";

import type { DocumentId, FolderId } from "@rme/contracts";

import type {
  WorkspaceDocumentCreateRequest,
  WorkspaceFolderCreateRequest,
  WorkspaceNavigationSelection,
} from "@/features/workspace";
import {
  createDocument,
  createFolder,
  createProductApiClient,
  deleteDocument,
  deleteFolder,
  type ApiClient,
} from "@/lib/api-client";

import {
  loadProductWorkspace,
  NoWorkspaceError,
  UnauthenticatedError,
} from "./product-workspace-loader";
import type { ProductWorkspaceState } from "./product-workspace-types";
import { createProductProviders } from "./product-workspace-view-model";

export function useProductWorkspaceProviders(): ProductWorkspaceState {
  const apiClient = useMemo(() => createProductApiClient(), []);
  const [selectedDocumentId, setSelectedDocumentId] = useState<DocumentId | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const reload = useCallback(() => setReloadToken((current) => current + 1), []);
  const selectDocumentId = useCallback((documentId: DocumentId) => {
    setSelectedDocumentId(documentId);
  }, []);
  const selectDocument = useCallback(
    (selection: WorkspaceNavigationSelection) => {
      selectDocumentId(selection.documentId as DocumentId);
    },
    [selectDocumentId],
  );
  const createProductDocument = useProductDocumentCreator(apiClient, reload, setSelectedDocumentId);
  const createProductFolder = useProductFolderCreator(apiClient, reload);
  const deleteProductDocument = useProductDocumentDeleter(apiClient, reload, setSelectedDocumentId);
  const deleteProductFolder = useProductFolderDeleter(apiClient, reload, setSelectedDocumentId);
  const loadInput = useMemo(
    () => ({
      apiClient,
      createProductDocument,
      createProductFolder,
      deleteProductDocument,
      deleteProductFolder,
      reloadToken,
      selectDocument,
      selectedDocumentId,
      selectDocumentId,
      reload,
    }),
    [
      apiClient,
      createProductDocument,
      createProductFolder,
      deleteProductDocument,
      deleteProductFolder,
      reloadToken,
      selectDocument,
      selectedDocumentId,
      selectDocumentId,
      reload,
    ],
  );

  return useLoadedProductWorkspace(loadInput);
}

function useLoadedProductWorkspace(input: {
  apiClient: ApiClient;
  createProductDocument: (request: WorkspaceDocumentCreateRequest) => void;
  createProductFolder: (request: WorkspaceFolderCreateRequest) => void;
  deleteProductDocument: (documentId: string) => void;
  deleteProductFolder: (folderId: string) => void;
  reloadToken: number;
  selectDocument: (selection: WorkspaceNavigationSelection) => void;
  selectedDocumentId: DocumentId | null;
  selectDocumentId: (documentId: DocumentId) => void;
  reload: () => void;
}) {
  const [state, setState] = useState<ProductWorkspaceState>({
    status: "loading",
    apiClient: input.apiClient,
    reload: input.reload,
  });

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
        if (!abortController.signal.aborted) {
          if (error instanceof UnauthenticatedError) {
            setState({
              status: "unauthenticated",
              apiClient: input.apiClient,
              reload: input.reload,
            });
          } else if (error instanceof NoWorkspaceError) {
            setState({ status: "no-workspace", apiClient: input.apiClient, reload: input.reload });
          } else {
            setState({
              status: "error",
              error: toError(error),
              apiClient: input.apiClient,
              reload: input.reload,
            });
          }
        }
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
        globalThis.sessionStorage?.setItem("rme.focus-title-document-id", response.document.id);
        reload();
      });
    },
    [apiClient, reload, setSelectedDocumentId],
  );
}

function useProductFolderCreator(apiClient: ApiClient, reload: () => void) {
  return useCallback(
    (request: WorkspaceFolderCreateRequest) => {
      void createFolder(apiClient, {
        parentFolderId: request.parentFolderId as FolderId,
        name: request.name,
      }).then(reload);
    },
    [apiClient, reload],
  );
}

function useProductDocumentDeleter(
  apiClient: ApiClient,
  reload: () => void,
  setSelectedDocumentId: (documentId: DocumentId | null) => void,
) {
  return useCallback(
    (documentId: string) => {
      void deleteDocument(apiClient, documentId as DocumentId).then(() => {
        setSelectedDocumentId(null);
        reload();
      });
    },
    [apiClient, reload, setSelectedDocumentId],
  );
}

function useProductFolderDeleter(
  apiClient: ApiClient,
  reload: () => void,
  setSelectedDocumentId: (documentId: DocumentId | null) => void,
) {
  return useCallback(
    (folderId: string) => {
      void deleteFolder(apiClient, folderId).then(() => {
        setSelectedDocumentId(null);
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
    createProductFolder: (request: WorkspaceFolderCreateRequest) => void;
    deleteProductDocument: (documentId: string) => void;
    deleteProductFolder: (folderId: string) => void;
    selectDocument: (selection: WorkspaceNavigationSelection) => void;
    selectDocumentId: (documentId: DocumentId) => void;
    apiClient: ApiClient;
    reload: () => void;
  },
): ProductWorkspaceState {
  if (!model) return { status: "empty", apiClient: input.apiClient, reload: input.reload };

  return {
    status: "ready",
    providers: createProductProviders(
      model,
      input.selectDocument,
      input.createProductDocument,
      input.createProductFolder,
      input.deleteProductDocument,
      input.deleteProductFolder,
      input.reload,
    ),
    apiClient: input.apiClient,
    selectDocumentId: input.selectDocumentId,
    reload: input.reload,
  };
}

function toError(error: unknown) {
  return error instanceof Error ? error : new Error("Product workspace request failed");
}
