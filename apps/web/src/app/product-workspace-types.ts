import type {
  BacklinkDto,
  CollaborationSessionDto,
  DocumentId,
  DocumentDetailDto,
  SessionDto,
  WorkspaceNavigationResponseDto,
} from "@rme/contracts";

import type { ApiClient } from "@/lib/api-client";

import type { AppFeatureProviders } from "./mock-providers";

export type ProductWorkspaceState =
  | Readonly<{
      status: "loading";
      providers?: never;
      error?: never;
      reload: () => void;
      apiClient: ApiClient;
    }>
  | Readonly<{
      status: "ready";
      providers: AppFeatureProviders;
      error?: never;
      reload: () => void;
      apiClient: ApiClient;
      selectDocumentId: (documentId: DocumentId) => void;
    }>
  | Readonly<{
      status: "empty";
      providers?: never;
      error?: never;
      reload: () => void;
      apiClient: ApiClient;
    }>
  | Readonly<{
      status: "unauthenticated";
      providers?: never;
      error?: never;
      reload: () => void;
      apiClient: ApiClient;
    }>
  | Readonly<{
      status: "no-workspace";
      providers?: never;
      error?: never;
      reload: () => void;
      apiClient: ApiClient;
    }>
  | Readonly<{
      status: "error";
      providers?: never;
      error: Error;
      reload: () => void;
      apiClient: ApiClient;
    }>;

export type ProductWorkspaceModel = Readonly<{
  apiClient: ApiClient;
  session: SessionDto | null;
  navigation: WorkspaceNavigationResponseDto;
  selectedDocument: DocumentDetailDto;
  collaborationSession: CollaborationSessionDto;
  markdownBody: string;
  backlinks: readonly BacklinkDto[];
}>;
