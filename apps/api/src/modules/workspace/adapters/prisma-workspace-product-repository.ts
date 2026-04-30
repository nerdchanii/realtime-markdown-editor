/* eslint-disable max-lines */

import { randomUUID } from "node:crypto";

import type {
  DeletedResourceResponseDto,
  DocumentSummaryDto,
  FolderChildrenResponseDto,
  FolderDto,
  FolderKindDto,
  ProjectDto,
  WorkspaceDto,
  WorkspaceNavigationResponseDto,
} from "@rme/contracts";

import type { WorkspaceProductRepository } from "@/modules/workspace/ports/workspace-product-repository.js";

type WorkspaceRecord = Readonly<{
  id: string;
  name: string;
  rootFolderId: string | null;
}>;

type ProjectRecord = Readonly<{
  id: string;
  workspaceId: string;
  name: string;
  rootFolderId: string | null;
}>;

type FolderRecord = Readonly<{
  id: string;
  workspaceId: string;
  projectId: string | null;
  parentFolderId: string | null;
  name: string;
  kind: string;
}>;

type DocumentSummaryRecord = Readonly<{
  id: string;
  folderId: string;
  title: string;
  state: string;
  latestRevisionId: string | null;
  publishedRevisionId: string | null;
}>;

type WorkspaceSelect = Readonly<{ id: true; name: true; rootFolderId: true }>;
type ProjectSelect = Readonly<{ id: true; workspaceId: true; name: true; rootFolderId: true }>;
type FolderSelect = Readonly<{
  id: true;
  workspaceId: true;
  projectId: true;
  parentFolderId: true;
  name: true;
  kind: true;
}>;
type DocumentSummarySelect = Readonly<{
  id: true;
  folderId: true;
  title: true;
  state: true;
  latestRevisionId: true;
  publishedRevisionId: true;
}>;

export type PrismaWorkspaceProductPersistenceClient = Readonly<{
  workspace: {
    findMany(args: {
      where?: { rootFolderId?: { not: null } };
      select: WorkspaceSelect;
      orderBy: { name: "asc" };
    }): Promise<WorkspaceRecord[]>;
    findUnique(args: {
      where: { id: string };
      select: WorkspaceSelect;
    }): Promise<WorkspaceRecord | null>;
    create(args: {
      data: { id: string; name: string };
      select: WorkspaceSelect;
    }): Promise<WorkspaceRecord>;
    update(args: {
      where: { id: string };
      data: { name?: string; rootFolderId?: string };
      select: WorkspaceSelect;
    }): Promise<WorkspaceRecord>;
  };
  project: {
    findMany(args: {
      where: { workspaceId: string; rootFolderId?: { not: null } };
      select: ProjectSelect;
      orderBy: { name: "asc" };
    }): Promise<ProjectRecord[]>;
    findUnique(args: {
      where: { id: string };
      select: ProjectSelect;
    }): Promise<ProjectRecord | null>;
    create(args: {
      data: { id: string; workspaceId: string; name: string };
      select: ProjectSelect;
    }): Promise<ProjectRecord>;
    update(args: {
      where: { id: string };
      data: { name?: string; rootFolderId?: string };
      select: ProjectSelect;
    }): Promise<ProjectRecord>;
  };
  folder: {
    findMany(args: {
      where: {
        workspaceId?: string;
        parentFolderId?: string;
        deletedAt?: null;
      };
      select: FolderSelect | (FolderSelect & { deletedAt: true });
      orderBy: { name: "asc" };
    }): Promise<(FolderRecord & { deletedAt?: Date | null })[]>;
    findUnique(args: {
      where: { id: string };
      select: FolderSelect & { deletedAt?: true };
    }): Promise<(FolderRecord & { deletedAt?: Date | null }) | null>;
    create(args: {
      data: {
        id: string;
        workspaceId: string;
        projectId: string | null;
        parentFolderId: string | null;
        name: string;
        kind: FolderKindDto;
      };
      select: FolderSelect;
    }): Promise<FolderRecord>;
    update(args: {
      where: { id: string };
      data: { name?: string; parentFolderId?: string | null; deletedAt?: Date };
      select: FolderSelect & { deletedAt?: true };
    }): Promise<(FolderRecord & { deletedAt?: Date | null }) | null>;
  };
  document: {
    findMany(args: {
      where: {
        folderId?: string;
        archivedAt: null;
        folder?: { workspaceId: string; deletedAt: null };
      };
      select: DocumentSummarySelect;
      orderBy: { title: "asc" };
    }): Promise<DocumentSummaryRecord[]>;
  };
  $transaction<T>(
    callback: (client: PrismaWorkspaceProductPersistenceClient) => Promise<T>,
  ): Promise<T>;
}>;

export class PrismaWorkspaceProductRepository implements WorkspaceProductRepository {
  constructor(private readonly client: PrismaWorkspaceProductPersistenceClient) {}

  async listWorkspaces(): Promise<readonly WorkspaceDto[]> {
    const records = await this.client.workspace.findMany({
      where: { rootFolderId: { not: null } },
      select: workspaceSelect,
      orderBy: { name: "asc" },
    });
    return records.map(toWorkspaceDto);
  }

  async createWorkspace(input: { name: string }): Promise<WorkspaceDto> {
    return this.client.$transaction(async (transaction) => {
      const workspace = await transaction.workspace.create({
        data: { id: newId("workspace"), name: input.name },
        select: workspaceSelect,
      });
      const rootFolder = await transaction.folder.create({
        data: {
          id: newId("folder"),
          workspaceId: workspace.id,
          projectId: null,
          parentFolderId: null,
          name: "Workspace root",
          kind: "workspaceRoot",
        },
        select: folderSelect,
      });
      return toWorkspaceDto(
        await transaction.workspace.update({
          where: { id: workspace.id },
          data: { rootFolderId: rootFolder.id },
          select: workspaceSelect,
        }),
      );
    });
  }

  async findWorkspace(workspaceId: string): Promise<WorkspaceDto | null> {
    const record = await this.client.workspace.findUnique({
      where: { id: workspaceId },
      select: workspaceSelect,
    });
    return record?.rootFolderId ? toWorkspaceDto(record) : null;
  }

  async updateWorkspace(
    workspaceId: string,
    input: { name?: string },
  ): Promise<WorkspaceDto | null> {
    const current = await this.findWorkspace(workspaceId);
    if (!current) return null;
    return toWorkspaceDto(
      await this.client.workspace.update({
        where: { id: workspaceId },
        data: input.name === undefined ? {} : { name: input.name },
        select: workspaceSelect,
      }),
    );
  }

  async getWorkspaceNavigation(
    workspaceId: string,
  ): Promise<WorkspaceNavigationResponseDto | null> {
    const workspace = await this.findWorkspace(workspaceId);
    if (!workspace) return null;
    const [projects, folders, documents] = await Promise.all([
      this.listProjects(workspaceId),
      this.client.folder.findMany({
        where: { workspaceId },
        select: { ...folderSelect, deletedAt: true },
        orderBy: { name: "asc" },
      }),
      this.client.document.findMany({
        where: { archivedAt: null, folder: { workspaceId, deletedAt: null } },
        select: documentSummarySelect,
        orderBy: { title: "asc" },
      }),
    ]);
    const activeFolders = activeFolderRecords(folders);
    const activeFolderIds = new Set(activeFolders.map((folder) => folder.id));

    return {
      workspace,
      projects: projects ?? [],
      folders: activeFolders.map(toFolderDto),
      documents: documents
        .filter((document) => activeFolderIds.has(document.folderId))
        .map(toDocumentSummaryDto),
    };
  }

  async listProjects(workspaceId: string): Promise<readonly ProjectDto[] | null> {
    if (!(await this.findWorkspace(workspaceId))) return null;
    const records = await this.client.project.findMany({
      where: { workspaceId, rootFolderId: { not: null } },
      select: projectSelect,
      orderBy: { name: "asc" },
    });
    return records.map(toProjectDto);
  }

  async createProject(workspaceId: string, input: { name: string }): Promise<ProjectDto | null> {
    if (!(await this.findWorkspace(workspaceId))) return null;
    return this.client.$transaction(async (transaction) => {
      const project = await transaction.project.create({
        data: { id: newId("project"), workspaceId, name: input.name },
        select: projectSelect,
      });
      const rootFolder = await transaction.folder.create({
        data: {
          id: newId("folder"),
          workspaceId,
          projectId: project.id,
          parentFolderId: null,
          name: "Project root",
          kind: "projectRoot",
        },
        select: folderSelect,
      });
      return toProjectDto(
        await transaction.project.update({
          where: { id: project.id },
          data: { rootFolderId: rootFolder.id },
          select: projectSelect,
        }),
      );
    });
  }

  async findProject(projectId: string): Promise<ProjectDto | null> {
    const record = await this.client.project.findUnique({
      where: { id: projectId },
      select: projectSelect,
    });
    return record?.rootFolderId ? toProjectDto(record) : null;
  }

  async updateProject(projectId: string, input: { name?: string }): Promise<ProjectDto | null> {
    const current = await this.findProject(projectId);
    if (!current) return null;
    return toProjectDto(
      await this.client.project.update({
        where: { id: projectId },
        data: input.name === undefined ? {} : { name: input.name },
        select: projectSelect,
      }),
    );
  }

  async getFolderChildren(folderId: string): Promise<FolderChildrenResponseDto | null> {
    const folder = await this.findFolder(folderId);
    if (!folder) return null;
    const [folders, documents] = await Promise.all([
      this.client.folder.findMany({
        where: { parentFolderId: folderId, deletedAt: null },
        select: folderSelect,
        orderBy: { name: "asc" },
      }),
      this.client.document.findMany({
        where: { folderId, archivedAt: null },
        select: documentSummarySelect,
        orderBy: { title: "asc" },
      }),
    ]);

    return {
      folder,
      folders: folders.map(toFolderDto),
      documents: documents.map(toDocumentSummaryDto),
    };
  }

  async createFolder(input: { name: string; parentFolderId: string }): Promise<FolderDto | null> {
    const parent = await this.findFolder(input.parentFolderId);
    if (!parent) return null;
    return toFolderDto(
      await this.client.folder.create({
        data: {
          id: newId("folder"),
          workspaceId: parent.workspaceId,
          projectId: parent.projectId,
          parentFolderId: parent.id,
          name: input.name,
          kind: "regular",
        },
        select: folderSelect,
      }),
    );
  }

  async findFolder(folderId: string): Promise<FolderDto | null> {
    const record = await this.client.folder.findUnique({
      where: { id: folderId },
      select: { ...folderSelect, deletedAt: true },
    });
    return record && !record.deletedAt ? toFolderDto(record) : null;
  }

  async updateFolder(folderId: string, input: { name?: string }): Promise<FolderDto | null> {
    const current = await this.findFolder(folderId);
    if (!current) return null;
    return toFolderDto(
      requiredFolderRecord(
        await this.client.folder.update({
          where: { id: folderId },
          data: input.name === undefined ? {} : { name: input.name },
          select: folderSelect,
        }),
      ),
    );
  }

  async moveFolder(folderId: string, targetParentFolderId: string): Promise<FolderDto | null> {
    const current = await this.findFolder(folderId);
    const target = await this.findFolder(targetParentFolderId);
    if (!current || !target) return null;
    return toFolderDto(
      requiredFolderRecord(
        await this.client.folder.update({
          where: { id: folderId },
          data: { parentFolderId: targetParentFolderId },
          select: folderSelect,
        }),
      ),
    );
  }

  async folderHasDescendant(folderId: string, possibleDescendantId: string): Promise<boolean> {
    let cursor = await this.findFolder(possibleDescendantId);
    while (cursor?.parentFolderId) {
      if (cursor.parentFolderId === folderId) return true;
      cursor = await this.findFolder(cursor.parentFolderId);
    }
    return false;
  }

  async deleteFolder(folderId: string): Promise<DeletedResourceResponseDto | null> {
    if (!(await this.findFolder(folderId))) return null;
    const deletedAt = new Date();
    await this.client.folder.update({
      where: { id: folderId },
      data: { deletedAt },
      select: { ...folderSelect, deletedAt: true },
    });
    return { id: folderId, deletedAt: deletedAt.toISOString() };
  }
}

const workspaceSelect = { id: true, name: true, rootFolderId: true } as const;
const projectSelect = { id: true, workspaceId: true, name: true, rootFolderId: true } as const;
const folderSelect = {
  id: true,
  workspaceId: true,
  projectId: true,
  parentFolderId: true,
  name: true,
  kind: true,
} as const;
const documentSummarySelect = {
  id: true,
  folderId: true,
  title: true,
  state: true,
  latestRevisionId: true,
  publishedRevisionId: true,
} as const;

function newId(prefix: string): string {
  return `${prefix}_${randomUUID()}`;
}

function toWorkspaceDto(record: WorkspaceRecord): WorkspaceDto {
  if (!record.rootFolderId) throw new Error("Workspace root folder is missing.");
  return {
    id: record.id as WorkspaceDto["id"],
    name: record.name,
    rootFolderId: record.rootFolderId as WorkspaceDto["rootFolderId"],
  };
}

function toProjectDto(record: ProjectRecord): ProjectDto {
  if (!record.rootFolderId) throw new Error("Project root folder is missing.");
  return {
    id: record.id as ProjectDto["id"],
    workspaceId: record.workspaceId as ProjectDto["workspaceId"],
    name: record.name,
    rootFolderId: record.rootFolderId as ProjectDto["rootFolderId"],
  };
}

function toFolderDto(record: FolderRecord): FolderDto {
  return {
    id: record.id as FolderDto["id"],
    workspaceId: record.workspaceId as FolderDto["workspaceId"],
    projectId: record.projectId as FolderDto["projectId"],
    name: record.name,
    kind: toFolderKind(record.kind),
    parentFolderId: record.parentFolderId as FolderDto["parentFolderId"],
  };
}

function toDocumentSummaryDto(record: DocumentSummaryRecord): DocumentSummaryDto {
  return {
    id: record.id as DocumentSummaryDto["id"],
    folderId: record.folderId as DocumentSummaryDto["folderId"],
    title: record.title,
    state: record.state === "review" || record.state === "saved" ? record.state : "draft",
    latestRevisionId: record.latestRevisionId as DocumentSummaryDto["latestRevisionId"],
    publishedRevisionId: record.publishedRevisionId as DocumentSummaryDto["publishedRevisionId"],
  };
}

function toFolderKind(value: string): FolderKindDto {
  if (value === "workspaceRoot" || value === "projectRoot" || value === "inbox") return value;
  return "regular";
}

function requiredFolderRecord(record: FolderRecord | null): FolderRecord {
  if (!record) throw new Error("Expected folder record to exist after guarded update.");
  return record;
}

function activeFolderRecords(
  records: readonly (FolderRecord & { deletedAt?: Date | null })[],
): readonly FolderRecord[] {
  const byId = new Map(records.map((record) => [record.id, record]));
  return records.filter((record) => isActiveFolderRecord(record, byId));
}

function isActiveFolderRecord(
  record: FolderRecord & { deletedAt?: Date | null },
  byId: ReadonlyMap<string, FolderRecord & { deletedAt?: Date | null }>,
): boolean {
  if (record.deletedAt) return false;
  let parentId = record.parentFolderId;
  while (parentId) {
    const parent = byId.get(parentId);
    if (!parent || parent.deletedAt) return false;
    parentId = parent.parentFolderId;
  }
  return true;
}
