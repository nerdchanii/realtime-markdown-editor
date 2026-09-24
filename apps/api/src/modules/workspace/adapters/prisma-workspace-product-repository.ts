import { randomUUID } from "node:crypto";

import type {
  CreateWorkspaceMemberRequestDto,
  DeletedResourceResponseDto,
  DocumentSummaryDto,
  FolderChildrenResponseDto,
  FolderDto,
  FolderKindDto,
  ListWorkspaceMembersResponseDto,
  ProjectDto,
  UpdateWorkspaceMemberRequestDto,
  UserId,
  WorkspaceMemberDto,
  WorkspaceDto,
  WorkspaceId,
  WorkspaceMembershipId,
  WorkspaceNavigationResponseDto,
} from "@rme/contracts";

import type { WorkspaceProductRepository } from "@/modules/workspace/ports/workspace-product-repository.js";
import type { WorkspaceOwnerCreateInput } from "@/modules/workspace/ports/workspace-product-repository.js";

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

type UserIdentityRecord = Readonly<{
  id: string;
  email: string;
  name: string;
}>;

type WorkspaceMembershipRecord = Readonly<{
  id: string;
  userId: string;
  workspaceId: string;
  displayName: string;
  color: string;
  role: "owner" | "member";
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
type UserIdentitySelect = Readonly<{ id: true; email: true; name: true }>;
type WorkspaceMembershipSelect = Readonly<{
  id: true;
  userId: true;
  workspaceId: true;
  displayName: true;
  color: true;
  role: true;
}>;
type WorkspaceFindManyWhere = Readonly<{
  rootFolderId?: { not: null };
  id?: { in: readonly string[] };
}>;

export type PrismaWorkspaceProductPersistenceClient = Readonly<{
  user: {
    findUnique(args: {
      where: { email: string };
      select: UserIdentitySelect;
    }): Promise<UserIdentityRecord | null>;
  };
  workspace: {
    findMany(args: {
      where?: WorkspaceFindManyWhere;
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
      data: { name?: string; rootFolderId?: string | null };
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
      data: { name?: string; rootFolderId?: string | null };
      select: ProjectSelect;
    }): Promise<ProjectRecord>;
    updateMany(args: {
      where: { workspaceId: string; rootFolderId: { not: null } };
      data: { rootFolderId: null };
    }): Promise<unknown>;
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
    updateMany(args: {
      where: { id: { in: readonly string[] }; deletedAt: null };
      data: { deletedAt: Date };
    }): Promise<unknown>;
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
    updateMany(args: {
      where: { folderId: { in: readonly string[] }; archivedAt: null };
      data: { archivedAt: Date };
    }): Promise<unknown>;
  };
  workspaceMembership: {
    findMany(args: {
      where: { workspaceId: string; removedAt: null };
      select: WorkspaceMembershipSelect;
      orderBy: { createdAt: "asc" };
    }): Promise<WorkspaceMembershipRecord[]>;
    findUnique(args: {
      where: { id: string };
      select: WorkspaceMembershipSelect & { removedAt: true };
    }): Promise<(WorkspaceMembershipRecord & { removedAt: Date | null }) | null>;
    upsert(args: {
      where: { workspaceId_userId: { workspaceId: string; userId: string } };
      update: {
        displayName: string;
        role: "owner" | "member";
        removedAt: null;
      };
      create: {
        id: string;
        userId: string;
        workspaceId: string;
        displayName: string;
        color: string;
        role: "owner" | "member";
      };
      select: WorkspaceMembershipSelect;
    }): Promise<WorkspaceMembershipRecord>;
    update(args: {
      where: { id: string };
      data: {
        displayName?: string;
        color?: string;
        role?: "owner" | "member";
        removedAt?: Date;
      };
      select: WorkspaceMembershipSelect;
    }): Promise<WorkspaceMembershipRecord>;
    create(args: {
      data: {
        id: string;
        userId: string;
        workspaceId: string;
        displayName: string;
        color: string;
        role: "owner";
      };
    }): Promise<unknown>;
  };
  $transaction<T>(
    callback: (client: PrismaWorkspaceProductPersistenceClient) => Promise<T>,
  ): Promise<T>;
}>;

export class PrismaWorkspaceProductRepository implements WorkspaceProductRepository {
  constructor(private readonly client: PrismaWorkspaceProductPersistenceClient) {}

  async listWorkspaces(workspaceIds?: readonly WorkspaceId[]): Promise<readonly WorkspaceDto[]> {
    if (workspaceIds && workspaceIds.length === 0) return [];
    const records = await this.client.workspace.findMany({
      where: workspaceListWhere(workspaceIds),
      select: workspaceSelect,
      orderBy: { name: "asc" },
    });
    return records.map(toWorkspaceDto);
  }

  async createWorkspace(
    input: { name: string },
    owner?: WorkspaceOwnerCreateInput,
  ): Promise<WorkspaceDto> {
    return this.client.$transaction(async (transaction) => {
      const workspace = await transaction.workspace.create({
        data: { id: newId("workspace"), name: input.name },
        select: workspaceSelect,
      });
      const created = await createWorkspaceRoot(transaction, workspace.id);
      await createOwnerMembership(transaction, workspace.id, owner);
      return created;
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

  async deleteWorkspace(workspaceId: string): Promise<DeletedResourceResponseDto | null> {
    const current = await this.findWorkspace(workspaceId);
    if (!current) return null;
    const deletedAt = new Date();

    await this.client.$transaction(async (transaction) => {
      const folders = await transaction.folder.findMany({
        where: { workspaceId, deletedAt: null },
        select: folderSelect,
        orderBy: { name: "asc" },
      });
      const folderIds = folders.map((folder) => folder.id);
      await transaction.workspace.update({
        where: { id: workspaceId },
        data: { rootFolderId: null },
        select: workspaceSelect,
      });
      await transaction.project.updateMany({
        where: { workspaceId, rootFolderId: { not: null } },
        data: { rootFolderId: null },
      });
      await archiveFolderDocuments(transaction, folderIds, deletedAt);
      await markFoldersDeleted(transaction, folderIds, deletedAt);
    });

    return { id: workspaceId, deletedAt: deletedAt.toISOString() };
  }

  async listWorkspaceMembers(workspaceId: string): Promise<ListWorkspaceMembersResponseDto | null> {
    if (!(await this.findWorkspace(workspaceId))) return null;
    const records = await this.client.workspaceMembership.findMany({
      where: { workspaceId, removedAt: null },
      select: workspaceMembershipSelect,
      orderBy: { createdAt: "asc" },
    });
    return { members: records.map(toWorkspaceMemberDto) };
  }

  async addWorkspaceMember(
    workspaceId: string,
    input: CreateWorkspaceMemberRequestDto,
  ): Promise<WorkspaceMemberDto | null> {
    if (!(await this.findWorkspace(workspaceId))) return null;
    const user = await this.client.user.findUnique({
      where: { email: normalizeEmail(input.email) },
      select: userIdentitySelect,
    });
    if (!user) return null;

    const displayName = input.displayName?.trim() || user.name;
    const record = await this.client.workspaceMembership.upsert({
      where: { workspaceId_userId: { workspaceId, userId: user.id } },
      update: {
        displayName,
        role: roleDtoToRecord(input.role ?? "editor"),
        removedAt: null,
      },
      create: {
        id: newId("member"),
        userId: user.id,
        workspaceId,
        displayName,
        color: colorForUser(user.id),
        role: roleDtoToRecord(input.role ?? "editor"),
      },
      select: workspaceMembershipSelect,
    });
    return toWorkspaceMemberDto(record);
  }

  async updateWorkspaceMember(
    workspaceId: string,
    memberId: string,
    input: UpdateWorkspaceMemberRequestDto,
  ): Promise<WorkspaceMemberDto | null> {
    if (!(await this.findActiveWorkspaceMember(workspaceId, memberId))) return null;
    const data: Parameters<
      PrismaWorkspaceProductPersistenceClient["workspaceMembership"]["update"]
    >[0]["data"] = {};
    if (input.displayName !== undefined) data.displayName = input.displayName.trim();
    if (input.color !== undefined) data.color = input.color.trim();
    if (input.role !== undefined) data.role = roleDtoToRecord(input.role);

    return toWorkspaceMemberDto(
      await this.client.workspaceMembership.update({
        where: { id: memberId },
        data,
        select: workspaceMembershipSelect,
      }),
    );
  }

  async removeWorkspaceMember(
    workspaceId: string,
    memberId: string,
  ): Promise<DeletedResourceResponseDto | null> {
    if (!(await this.findActiveWorkspaceMember(workspaceId, memberId))) return null;
    const removedAt = new Date();
    await this.client.workspaceMembership.update({
      where: { id: memberId },
      data: { removedAt },
      select: workspaceMembershipSelect,
    });
    return { id: memberId, deletedAt: removedAt.toISOString() };
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

  async deleteProject(projectId: string): Promise<DeletedResourceResponseDto | null> {
    const current = await this.findProject(projectId);
    if (!current) return null;
    const deletedAt = new Date();

    await this.client.$transaction(async (transaction) => {
      const folderIds = await collectFolderTreeIds(transaction, current.rootFolderId);
      await transaction.project.update({
        where: { id: projectId },
        data: { rootFolderId: null },
        select: projectSelect,
      });
      await archiveFolderDocuments(transaction, folderIds, deletedAt);
      await markFoldersDeleted(transaction, folderIds, deletedAt);
    });

    return { id: projectId, deletedAt: deletedAt.toISOString() };
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
    await this.client.$transaction(async (transaction) => {
      const folderIds = await collectFolderTreeIds(transaction, folderId);
      await archiveFolderDocuments(transaction, folderIds, deletedAt);
      await markFoldersDeleted(transaction, folderIds, deletedAt);
    });
    return { id: folderId, deletedAt: deletedAt.toISOString() };
  }

  private async findActiveWorkspaceMember(
    workspaceId: string,
    memberId: string,
  ): Promise<WorkspaceMemberDto | null> {
    const record = await this.client.workspaceMembership.findUnique({
      where: { id: memberId },
      select: { ...workspaceMembershipSelect, removedAt: true },
    });
    if (!record || record.workspaceId !== workspaceId || record.removedAt) return null;
    return toWorkspaceMemberDto(record);
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
const userIdentitySelect = { id: true, email: true, name: true } as const;
const workspaceMembershipSelect = {
  id: true,
  userId: true,
  workspaceId: true,
  displayName: true,
  color: true,
  role: true,
} as const;

function newId(prefix: string): string {
  return `${prefix}_${randomUUID()}`;
}

async function createWorkspaceRoot(
  transaction: PrismaWorkspaceProductPersistenceClient,
  workspaceId: string,
): Promise<WorkspaceDto> {
  const rootFolder = await transaction.folder.create({
    data: {
      id: newId("folder"),
      workspaceId,
      projectId: null,
      parentFolderId: null,
      name: "Workspace root",
      kind: "workspaceRoot",
    },
    select: folderSelect,
  });
  return toWorkspaceDto(
    await transaction.workspace.update({
      where: { id: workspaceId },
      data: { rootFolderId: rootFolder.id },
      select: workspaceSelect,
    }),
  );
}

async function collectFolderTreeIds(
  client: PrismaWorkspaceProductPersistenceClient,
  rootFolderId: string,
): Promise<string[]> {
  const folderIds = [rootFolderId];
  for (let index = 0; index < folderIds.length; index += 1) {
    const parentFolderId = folderIds[index];
    if (!parentFolderId) continue;
    const children = await client.folder.findMany({
      where: { parentFolderId, deletedAt: null },
      select: folderSelect,
      orderBy: { name: "asc" },
    });
    folderIds.push(...children.map((child) => child.id));
  }
  return folderIds;
}

async function archiveFolderDocuments(
  transaction: PrismaWorkspaceProductPersistenceClient,
  folderIds: readonly string[],
  archivedAt: Date,
): Promise<void> {
  if (folderIds.length === 0) return;
  await transaction.document.updateMany({
    where: { folderId: { in: folderIds }, archivedAt: null },
    data: { archivedAt },
  });
}

async function markFoldersDeleted(
  transaction: PrismaWorkspaceProductPersistenceClient,
  folderIds: readonly string[],
  deletedAt: Date,
): Promise<void> {
  if (folderIds.length === 0) return;
  await transaction.folder.updateMany({
    where: { id: { in: folderIds }, deletedAt: null },
    data: { deletedAt },
  });
}

async function createOwnerMembership(
  transaction: PrismaWorkspaceProductPersistenceClient,
  workspaceId: string,
  owner: WorkspaceOwnerCreateInput | undefined,
): Promise<void> {
  if (!owner) return;
  await transaction.workspaceMembership.create({
    data: {
      id: newId("member"),
      userId: owner.userId,
      workspaceId,
      displayName: owner.displayName,
      color: "#0969da",
      role: "owner",
    },
  });
}

function workspaceListWhere(
  workspaceIds: readonly WorkspaceId[] | undefined,
): WorkspaceFindManyWhere {
  return workspaceIds
    ? { rootFolderId: { not: null }, id: { in: workspaceIds } }
    : { rootFolderId: { not: null } };
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

function toWorkspaceMemberDto(record: WorkspaceMembershipRecord): WorkspaceMemberDto {
  return {
    id: record.id as WorkspaceMembershipId,
    userId: record.userId as UserId,
    workspaceId: record.workspaceId as WorkspaceId,
    displayName: record.displayName,
    color: record.color,
    role: record.role === "owner" ? "owner" : "editor",
  };
}

function roleDtoToRecord(role: CreateWorkspaceMemberRequestDto["role"]): "owner" | "member" {
  return role === "owner" ? "owner" : "member";
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function colorForUser(userId: string): string {
  const palette = ["#0969da", "#1a7f37", "#8250df", "#bf3989", "#bc4c00", "#57606a"];
  const sum = [...userId].reduce((value, char) => value + char.charCodeAt(0), 0);
  return palette[sum % palette.length] ?? "#0969da";
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
