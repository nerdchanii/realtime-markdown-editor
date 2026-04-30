import type { DocumentId, SessionDto, WorkspaceId } from "@rme/contracts";

import {
  fetchAuthSession,
  fetchDocument,
  fetchDocumentConnections,
  fetchDocumentContent,
  fetchWorkspaceNavigation,
  fetchWorkspaces,
  type ApiClient,
} from "@/lib/api-client";

import type { ProductWorkspaceModel } from "./product-workspace-types";

export async function loadProductWorkspace(
  apiClient: ApiClient,
  selectedDocumentId: DocumentId | null,
  signal: AbortSignal,
): Promise<ProductWorkspaceModel | null> {
  const session = await resolveProductSession(apiClient);
  if (signal.aborted) return null;

  const workspaceId = await resolveWorkspaceId(apiClient, session);
  if (!workspaceId || signal.aborted) return null;

  const navigation = await fetchWorkspaceNavigation(apiClient, workspaceId as WorkspaceId);
  const documentId = selectProductDocumentId(navigation, selectedDocumentId);
  if (!documentId) return null;

  return fetchProductWorkspaceModel(apiClient, session, navigation, documentId);
}

async function resolveProductSession(apiClient: ApiClient) {
  try {
    const response = await fetchAuthSession(apiClient);
    return response.session;
  } catch {
    return null;
  }
}

async function resolveWorkspaceId(apiClient: ApiClient, session: SessionDto | null) {
  const sessionWorkspaceId = session?.currentMembership?.workspaceId;
  if (sessionWorkspaceId) return sessionWorkspaceId;

  const routeWorkspaceId = readRouteWorkspaceId();
  if (routeWorkspaceId && isSessionWorkspace(session, routeWorkspaceId)) return routeWorkspaceId;

  const workspaces = await fetchWorkspaces(apiClient);
  return workspaces.workspaces[0]?.id ?? null;
}

function isSessionWorkspace(session: SessionDto | null, workspaceId: string) {
  return session?.memberships.some((membership) => membership.workspaceId === workspaceId) ?? false;
}

async function fetchProductWorkspaceModel(
  apiClient: ApiClient,
  session: SessionDto | null,
  navigation: ProductWorkspaceModel["navigation"],
  documentId: DocumentId,
): Promise<ProductWorkspaceModel> {
  const [{ document }, { content }, connections] = await Promise.all([
    fetchDocument(apiClient, documentId),
    fetchDocumentContent(apiClient, documentId),
    fetchDocumentConnections(apiClient, documentId),
  ]);

  return {
    apiClient,
    session,
    navigation,
    selectedDocument: document,
    markdownBody: content.markdownBody,
    backlinks: connections.backlinks,
  };
}

function selectProductDocumentId(
  navigation: ProductWorkspaceModel["navigation"],
  selectedDocumentId: DocumentId | null,
): DocumentId | null {
  const availableIds = new Set(navigation.documents.map((document) => document.id));

  if (selectedDocumentId && availableIds.has(selectedDocumentId)) return selectedDocumentId;
  return navigation.documents[0]?.id ?? null;
}

function readRouteWorkspaceId(): string | null {
  if (typeof window === "undefined") return null;

  return new URLSearchParams(window.location.search).get("workspace");
}
