import { useCallback, useEffect, useMemo, useState } from "react";

import type { DocumentId, FolderId } from "@rme/contracts";

import type {
  WorkspaceDocumentCreateRequest,
  WorkspaceFolderCreateRequest,
  WorkspaceFolderRenameRequest,
  WorkspaceNavigationSelection,
} from "@/features/workspace";
import {
  createDocument,
  createFolder,
  createProductApiClient,
  deleteDocument,
  deleteFolder,
  updateFolder,
  type ApiClient,
} from "@/lib/api-client";

import {
  loadProductWorkspace,
  NoWorkspaceError,
  UnauthenticatedError,
} from "./product-workspace-loader";
import type { ProductWorkspaceState } from "./product-workspace-types";
import { createProductProviders } from "./product-workspace-view-model";

type LoadedProductWorkspaceInput = {
  apiClient: ApiClient;
  createProductDocument: (request: WorkspaceDocumentCreateRequest) => void;
  createProductFolder: (request: WorkspaceFolderCreateRequest) => void;
  deleteProductDocument: (documentId: string) => void;
  deleteProductFolder: (folderId: string) => void;
  renameProductFolder: (request: WorkspaceFolderRenameRequest) => void;
  reloadToken: number;
  selectDocument: (selection: WorkspaceNavigationSelection) => void;
  selectedDocumentId: DocumentId | null;
  selectDocumentId: (documentId: DocumentId) => void;
  reload: () => void;
};

export function useProductWorkspaceProviders(): ProductWorkspaceState {
  const apiClient = useMemo(() => createProductApiClient(), []);
  const [selectedDocumentId, setSelectedDocumentId] = useState<DocumentId | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const reload = useCallback(() => setReloadToken((current) => current + 1), []);
  const selection = useWorkspaceSelection(setSelectedDocumentId);
  const mutations = useWorkspaceMutations(apiClient, reload, setSelectedDocumentId);
  const loadInput = useMemo(
    () => ({ apiClient, reload, reloadToken, selectedDocumentId, ...selection, ...mutations }),
    [apiClient, reload, reloadToken, selectedDocumentId, selection, mutations],
  );

  return useLoadedProductWorkspace(loadInput);
}

function useWorkspaceSelection(setSelectedDocumentId: (documentId: DocumentId | null) => void) {
  const selectDocumentId = useCallback(
    (documentId: DocumentId) => {
      setSelectedDocumentId(documentId);
    },
    [setSelectedDocumentId],
  );
  const selectDocument = useCallback(
    (selection: WorkspaceNavigationSelection) => {
      selectDocumentId(selection.documentId as DocumentId);
    },
    [selectDocumentId],
  );

  return useMemo(() => ({ selectDocument, selectDocumentId }), [selectDocument, selectDocumentId]);
}

function useWorkspaceMutations(
  apiClient: ApiClient,
  reload: () => void,
  setSelectedDocumentId: (documentId: DocumentId | null) => void,
) {
  const createProductDocument = useProductDocumentCreator(apiClient, reload, setSelectedDocumentId);
  const createProductFolder = useProductFolderCreator(apiClient, reload);
  const deleteProductDocument = useProductDocumentDeleter(apiClient, reload, setSelectedDocumentId);
  const deleteProductFolder = useProductFolderDeleter(apiClient, reload, setSelectedDocumentId);
  const renameProductFolder = useProductFolderRenamer(apiClient, reload);

  return useMemo(
    () => ({
      createProductDocument,
      createProductFolder,
      deleteProductDocument,
      deleteProductFolder,
      renameProductFolder,
    }),
    [
      createProductDocument,
      createProductFolder,
      deleteProductDocument,
      deleteProductFolder,
      renameProductFolder,
    ],
  );
}

function useLoadedProductWorkspace(input: LoadedProductWorkspaceInput) {
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
        if (!abortController.signal.aborted) setState(createFailedState(error, input));
      },
    );

    return () => abortController.abort();
  }, [input]);

  return state;
}

function createFailedState(
  error: unknown,
  input: Pick<LoadedProductWorkspaceInput, "apiClient" | "reload">,
): ProductWorkspaceState {
  if (error instanceof UnauthenticatedError) {
    return { status: "unauthenticated", apiClient: input.apiClient, reload: input.reload };
  }
  if (error instanceof NoWorkspaceError) {
    return { status: "no-workspace", apiClient: input.apiClient, reload: input.reload };
  }
  return {
    status: "error",
    error: toError(error),
    apiClient: input.apiClient,
    reload: input.reload,
  };
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

function useProductFolderRenamer(apiClient: ApiClient, reload: () => void) {
  return useCallback(
    (request: WorkspaceFolderRenameRequest) => {
      const name = request.name.trim();
      if (!name) return;

      void updateFolder(apiClient, request.folderId, { name }).then(reload);
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
  input: Omit<LoadedProductWorkspaceInput, "reloadToken" | "selectedDocumentId">,
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
      input.renameProductFolder,
      input.reload,
    ),
    apiClient: input.apiClient,
    selectDocumentId: input.selectDocumentId,
    reload: input.reload,
    accountSurface: createAccountSurface(model),
  };
}

function createAccountSurface(
  model: NonNullable<Awaited<ReturnType<typeof loadProductWorkspace>>>,
) {
  const currentMember = model.session?.currentMembership;
  const folder = model.navigation.folders.find(
    (candidate) => candidate.id === model.selectedDocument.folderId,
  );
  const project = model.navigation.projects.find((candidate) => candidate.id === folder?.projectId);

  return {
    userName: model.session?.user.name ?? "Signed in user",
    userEmail: model.session?.user.email ?? "",
    currentMemberDisplayName: currentMember?.displayName ?? model.session?.user.name ?? "Member",
    currentMemberColor: currentMember?.color ?? "#8a99ad",
    workspaceName: model.navigation.workspace.name,
    projectName: project?.name ?? model.navigation.projects[0]?.name ?? "Workspace root",
  };
}

function toError(error: unknown) {
  return error instanceof Error ? error : new Error("Product workspace request failed");
}
