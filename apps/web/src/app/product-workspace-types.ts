import type {
  BacklinkDto,
  CollaborationSessionDto,
  DocumentDetailDto,
  SessionDto,
  WorkspaceNavigationResponseDto,
} from "@rme/contracts";

import type { ApiClient } from "@/lib/api-client";

import type { AppFeatureProviders } from "./mock-providers";

export type ProductWorkspaceState =
  | Readonly<{ status: "loading"; providers?: never; error?: never }>
  | Readonly<{ status: "ready"; providers: AppFeatureProviders; error?: never }>
  | Readonly<{ status: "empty"; providers?: never; error?: never }>
  | Readonly<{ status: "error"; providers?: never; error: Error }>;

export type ProductWorkspaceModel = Readonly<{
  apiClient: ApiClient;
  session: SessionDto | null;
  navigation: WorkspaceNavigationResponseDto;
  selectedDocument: DocumentDetailDto;
  collaborationSession: CollaborationSessionDto;
  markdownBody: string;
  backlinks: readonly BacklinkDto[];
}>;
