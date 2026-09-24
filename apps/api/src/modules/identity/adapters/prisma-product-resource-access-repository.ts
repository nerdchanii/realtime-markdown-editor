import type { CheckpointId, DocumentId, FolderId, ProjectId, WorkspaceId } from "@rme/contracts";

import type {
  ProductResourceAccessRepository,
  ProjectAccessMode,
} from "@/modules/identity/ports/product-resource-access-repository.js";

type ProjectAccessRecord = Readonly<{
  workspaceId: string;
  rootFolderId: string | null;
}>;

type FolderAccessRecord = Readonly<{
  workspaceId: string;
  deletedAt: Date | null;
}>;

type DocumentAccessRecord = Readonly<{
  folder: Readonly<{
    workspaceId: string;
  }>;
}>;

type CheckpointAccessRecord = Readonly<{
  documentId: string;
}>;

export type PrismaProductResourceAccessPersistenceClient = Readonly<{
  project: {
    findUnique(args: {
      where: { id: string };
      select: { workspaceId: true; rootFolderId: true };
    }): Promise<ProjectAccessRecord | null>;
  };
  folder: {
    findUnique(args: {
      where: { id: string };
      select: { workspaceId: true; deletedAt: true };
    }): Promise<FolderAccessRecord | null>;
  };
  document: {
    findUnique(args: {
      where: { id: string };
      select: {
        folder: { select: { workspaceId: true } };
      };
    }): Promise<DocumentAccessRecord | null>;
  };
  checkpoint: {
    findUnique(args: {
      where: { id: string };
      select: { documentId: true };
    }): Promise<CheckpointAccessRecord | null>;
  };
}>;

export class PrismaProductResourceAccessRepository implements ProductResourceAccessRepository {
  constructor(private readonly client: PrismaProductResourceAccessPersistenceClient) {}

  async findWorkspaceIdForProject(
    projectId: ProjectId,
    mode: ProjectAccessMode,
  ): Promise<WorkspaceId | null> {
    const project = await this.client.project.findUnique({
      where: { id: projectId },
      select: { workspaceId: true, rootFolderId: true },
    });
    if (!project) return null;
    if (mode === "active" && !project.rootFolderId) return null;

    return project.workspaceId as WorkspaceId;
  }

  async findWorkspaceIdForFolder(folderId: FolderId): Promise<WorkspaceId | null> {
    const folder = await this.client.folder.findUnique({
      where: { id: folderId },
      select: { workspaceId: true, deletedAt: true },
    });
    if (!folder || folder.deletedAt) return null;

    return folder.workspaceId as WorkspaceId;
  }

  async findWorkspaceIdForDocument(documentId: DocumentId): Promise<WorkspaceId | null> {
    const document = await this.client.document.findUnique({
      where: { id: documentId },
      select: {
        folder: { select: { workspaceId: true } },
      },
    });
    if (!document) return null;

    return document.folder.workspaceId as WorkspaceId;
  }

  async findDocumentIdForCheckpoint(checkpointId: CheckpointId): Promise<DocumentId | null> {
    const checkpoint = await this.client.checkpoint.findUnique({
      where: { id: checkpointId },
      select: { documentId: true },
    });
    return (checkpoint?.documentId as DocumentId | undefined) ?? null;
  }
}
