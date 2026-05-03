import type { CheckpointId, DocumentId, FolderId, ProjectId, WorkspaceId } from "@rme/contracts";

export const PRODUCT_RESOURCE_ACCESS_REPOSITORY = Symbol("PRODUCT_RESOURCE_ACCESS_REPOSITORY");

export type ProjectAccessMode = "existing" | "active";

export interface ProductResourceAccessRepository {
  findWorkspaceIdForProject(
    projectId: ProjectId,
    mode: ProjectAccessMode,
  ): Promise<WorkspaceId | null>;
  findWorkspaceIdForFolder(folderId: FolderId): Promise<WorkspaceId | null>;
  findWorkspaceIdForDocument(documentId: DocumentId): Promise<WorkspaceId | null>;
  findDocumentIdForCheckpoint(checkpointId: CheckpointId): Promise<DocumentId | null>;
}
