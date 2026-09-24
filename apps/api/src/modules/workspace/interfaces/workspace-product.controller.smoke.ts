import "reflect-metadata";

import { strict as assert } from "node:assert";
import type { AddressInfo } from "node:net";
import { test } from "node:test";

import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type {
  CreateFolderRequestDto,
  CreateProjectRequestDto,
  CreateWorkspaceMemberRequestDto,
  CreateWorkspaceRequestDto,
  DeletedResourceResponseDto,
  FolderDto,
  ListWorkspaceMembersResponseDto,
  ProjectDto,
  UpdateWorkspaceMemberRequestDto,
  WorkspaceMemberDto,
  WorkspaceMembershipId,
  WorkspaceDto,
  WorkspaceNavigationResponseDto,
} from "@rme/contracts";

import { configureHttpBoundary } from "@/interfaces/http/http-boundary.js";
import { ProductApiAccessService } from "@/modules/identity/use-cases/product-api-access-service.js";
import {
  WORKSPACE_PRODUCT_REPOSITORY,
  type WorkspaceProductRepository,
} from "@/modules/workspace/ports/workspace-product-repository.js";
import { WorkspaceProductController } from "@/modules/workspace/interfaces/workspace-product.controller.js";
import { WorkspaceProductService } from "@/modules/workspace/use-cases/workspace-product-service.js";

test("workspace product API creates hierarchy and protects root folders", async () => {
  const repository = new InMemoryWorkspaceProductRepository();

  @Module({
    controllers: [WorkspaceProductController],
    providers: [
      WorkspaceProductService,
      { provide: WORKSPACE_PRODUCT_REPOSITORY, useValue: repository },
      { provide: ProductApiAccessService, useValue: new AllowAllProductApiAccessService() },
    ],
  })
  class ProductWorkspaceApiTestModule {}

  const app = await NestFactory.create(ProductWorkspaceApiTestModule, { logger: ["error"] });
  configureHttpBoundary(app);
  await app.listen(0);

  try {
    const baseUrl = baseUrlForApp(app);
    const workspace = await postJson<WorkspaceDto>(baseUrl, "/workspaces", {
      name: "Product Workspace",
    }).then((body) => body.workspace as WorkspaceDto);
    assert.equal(workspace.name, "Product Workspace");
    assert.ok(workspace.rootFolderId);
    assert.deepEqual(repository.createdWorkspaceOwnerUserIds, ["user_alice"]);

    const project = await postJson<ProjectDto>(baseUrl, `/workspaces/${workspace.id}/projects`, {
      name: "Release Plan",
    }).then((body) => body.project as ProjectDto);
    assert.equal(project.workspaceId, workspace.id);
    assert.ok(project.rootFolderId);

    const folder = await postJson<FolderDto>(baseUrl, "/folders", {
      parentFolderId: project.rootFolderId,
      name: "Specs",
    }).then((body) => body.folder as FolderDto);
    assert.equal(folder.parentFolderId, project.rootFolderId);
    assert.equal(folder.kind, "regular");

    const rootMove = await fetch(`${baseUrl}/folders/${workspace.rootFolderId}/move`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ targetParentFolderId: folder.id }),
    });
    assert.equal(rootMove.status, 400, await rootMove.text());

    const rootDelete = await fetch(`${baseUrl}/folders/${project.rootFolderId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    assert.equal(rootDelete.status, 400, await rootDelete.text());

    const navigation = await getJson<WorkspaceNavigationResponseDto>(
      baseUrl,
      `/workspaces/${workspace.id}/navigation`,
    );
    assert.deepEqual(
      navigation.folders.map((item) => item.id).sort(),
      [workspace.rootFolderId, project.rootFolderId, folder.id].sort(),
    );

    await postJson<FolderDto>(baseUrl, "/folders", {
      parentFolderId: folder.id,
      name: "Nested",
    });
    const nestedDelete = await fetch(`${baseUrl}/folders/${folder.id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    assert.equal(nestedDelete.status, 200, await nestedDelete.text());

    const afterDeleteNavigation = await getJson<WorkspaceNavigationResponseDto>(
      baseUrl,
      `/workspaces/${workspace.id}/navigation`,
    );
    assert.deepEqual(
      afterDeleteNavigation.folders.map((item) => item.name).sort(),
      ["Project root", "Workspace root"].sort(),
    );

    const projectDelete = await fetch(`${baseUrl}/projects/${project.id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    assert.equal(projectDelete.status, 200, await projectDelete.text());

    const afterProjectDeleteNavigation = await getJson<WorkspaceNavigationResponseDto>(
      baseUrl,
      `/workspaces/${workspace.id}/navigation`,
    );
    assert.deepEqual(afterProjectDeleteNavigation.projects, []);

    const workspaceDelete = await fetch(`${baseUrl}/workspaces/${workspace.id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    assert.equal(workspaceDelete.status, 200, await workspaceDelete.text());

    const workspaceAfterDelete = await fetch(`${baseUrl}/workspaces/${workspace.id}`, {
      headers: authHeaders(),
    });
    assert.equal(workspaceAfterDelete.status, 404, await workspaceAfterDelete.text());
  } finally {
    await app.close();
  }
});

class InMemoryWorkspaceProductRepository implements WorkspaceProductRepository {
  private readonly workspaces = new Map<string, WorkspaceDto>();
  private readonly members = new Map<string, WorkspaceMemberDto & { removedAt?: string }>();
  private readonly projects = new Map<string, ProjectDto>();
  private readonly folders = new Map<string, FolderDto & { deletedAt?: string }>();
  readonly createdWorkspaceOwnerUserIds: string[] = [];
  private next = 1;

  async listWorkspaces(): Promise<readonly WorkspaceDto[]> {
    return [...this.workspaces.values()];
  }

  async createWorkspace(
    input: CreateWorkspaceRequestDto,
    owner?: Readonly<{ userId: string }>,
  ): Promise<WorkspaceDto> {
    if (owner) this.createdWorkspaceOwnerUserIds.push(owner.userId);
    const workspaceId = this.id("workspace");
    const rootFolderId = this.id("folder");
    const workspace = { id: workspaceId, name: input.name, rootFolderId } as WorkspaceDto;
    this.workspaces.set(workspaceId, workspace);
    this.folders.set(rootFolderId, {
      id: rootFolderId,
      workspaceId,
      projectId: null,
      parentFolderId: null,
      name: "Workspace root",
      kind: "workspaceRoot",
    } as FolderDto);
    return workspace;
  }

  async findWorkspace(workspaceId: string): Promise<WorkspaceDto | null> {
    return this.workspaces.get(workspaceId) ?? null;
  }

  async updateWorkspace(
    workspaceId: string,
    input: { name?: string },
  ): Promise<WorkspaceDto | null> {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) return null;
    const updated = { ...workspace, name: input.name ?? workspace.name };
    this.workspaces.set(workspaceId, updated);
    return updated;
  }

  async deleteWorkspace(workspaceId: string): Promise<DeletedResourceResponseDto | null> {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace?.rootFolderId) return null;
    const deletedAt = new Date("2026-04-30T00:00:00.000Z").toISOString();
    this.workspaces.delete(workspaceId);
    for (const project of this.projects.values()) {
      if (project.workspaceId === workspaceId) this.projects.delete(project.id);
    }
    for (const folder of this.folders.values()) {
      if (folder.workspaceId === workspaceId) this.folders.set(folder.id, { ...folder, deletedAt });
    }
    return { id: workspaceId, deletedAt };
  }

  async listWorkspaceMembers(workspaceId: string): Promise<ListWorkspaceMembersResponseDto | null> {
    if (!this.workspaces.has(workspaceId)) return null;
    return {
      members: [...this.members.values()].filter(
        (member) => member.workspaceId === workspaceId && !member.removedAt,
      ),
    };
  }

  async addWorkspaceMember(
    workspaceId: string,
    input: CreateWorkspaceMemberRequestDto,
  ): Promise<WorkspaceMemberDto | null> {
    if (!this.workspaces.has(workspaceId)) return null;
    const id = this.id("member") as WorkspaceMembershipId;
    const member = {
      id,
      userId: this.id("user"),
      workspaceId,
      displayName: input.displayName ?? input.email,
      color: "#0969da",
      role: input.role ?? "editor",
    } as WorkspaceMemberDto;
    this.members.set(id, member);
    return member;
  }

  async updateWorkspaceMember(
    workspaceId: string,
    memberId: string,
    input: UpdateWorkspaceMemberRequestDto,
  ): Promise<WorkspaceMemberDto | null> {
    const member = this.members.get(memberId);
    if (!member || member.workspaceId !== workspaceId || member.removedAt) return null;
    const updated = {
      ...member,
      displayName: input.displayName ?? member.displayName,
      color: input.color ?? member.color,
      role: input.role ?? member.role,
    } as WorkspaceMemberDto;
    this.members.set(memberId, updated);
    return updated;
  }

  async removeWorkspaceMember(
    workspaceId: string,
    memberId: string,
  ): Promise<DeletedResourceResponseDto | null> {
    const member = this.members.get(memberId);
    if (!member || member.workspaceId !== workspaceId || member.removedAt) return null;
    const deletedAt = new Date("2026-04-30T00:00:00.000Z").toISOString();
    this.members.set(memberId, { ...member, removedAt: deletedAt });
    return { id: memberId, deletedAt };
  }

  async getWorkspaceNavigation(
    workspaceId: string,
  ): Promise<WorkspaceNavigationResponseDto | null> {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) return null;
    return {
      workspace,
      projects: [...this.projects.values()].filter(
        (project) => project.workspaceId === workspaceId,
      ),
      folders: [...this.folders.values()].filter(
        (folder) => folder.workspaceId === workspaceId && !folder.deletedAt,
      ),
      documents: [],
    };
  }

  async listProjects(workspaceId: string): Promise<readonly ProjectDto[] | null> {
    if (!this.workspaces.has(workspaceId)) return null;
    return [...this.projects.values()].filter((project) => project.workspaceId === workspaceId);
  }

  async createProject(
    workspaceId: string,
    input: CreateProjectRequestDto,
  ): Promise<ProjectDto | null> {
    if (!this.workspaces.has(workspaceId)) return null;
    const projectId = this.id("project");
    const rootFolderId = this.id("folder");
    const project = { id: projectId, workspaceId, name: input.name, rootFolderId } as ProjectDto;
    this.projects.set(projectId, project);
    this.folders.set(rootFolderId, {
      id: rootFolderId,
      workspaceId,
      projectId,
      parentFolderId: null,
      name: "Project root",
      kind: "projectRoot",
    } as FolderDto);
    return project;
  }

  async findProject(projectId: string): Promise<ProjectDto | null> {
    return this.projects.get(projectId) ?? null;
  }

  async updateProject(projectId: string, input: { name?: string }): Promise<ProjectDto | null> {
    const project = this.projects.get(projectId);
    if (!project) return null;
    const updated = { ...project, name: input.name ?? project.name };
    this.projects.set(projectId, updated);
    return updated;
  }

  async deleteProject(projectId: string): Promise<DeletedResourceResponseDto | null> {
    const project = this.projects.get(projectId);
    if (!project?.rootFolderId) return null;
    const deletedAt = new Date("2026-04-30T00:00:00.000Z").toISOString();
    this.projects.delete(projectId);
    for (const folderId of this.collectFolderTreeIds(project.rootFolderId)) {
      const folder = this.folders.get(folderId);
      if (folder) this.folders.set(folderId, { ...folder, deletedAt });
    }
    return { id: projectId, deletedAt };
  }

  async getFolderChildren(folderId: string) {
    const folder = this.folders.get(folderId);
    if (!folder || folder.deletedAt) return null;
    return {
      folder,
      folders: [...this.folders.values()].filter(
        (child) => child.parentFolderId === folderId && !child.deletedAt,
      ),
      documents: [],
    };
  }

  async createFolder(input: CreateFolderRequestDto): Promise<FolderDto | null> {
    const parent = this.folders.get(input.parentFolderId);
    if (!parent || parent.deletedAt) return null;
    const id = this.id("folder");
    const folder = {
      id,
      workspaceId: parent.workspaceId,
      projectId: parent.projectId,
      parentFolderId: parent.id,
      name: input.name,
      kind: "regular",
    } as FolderDto;
    this.folders.set(id, folder);
    return folder;
  }

  async findFolder(folderId: string): Promise<FolderDto | null> {
    const folder = this.folders.get(folderId);
    return folder && !folder.deletedAt ? folder : null;
  }

  async updateFolder(folderId: string, input: { name?: string }): Promise<FolderDto | null> {
    const folder = await this.findFolder(folderId);
    if (!folder) return null;
    const updated = { ...folder, name: input.name ?? folder.name };
    this.folders.set(folderId, updated);
    return updated;
  }

  async moveFolder(folderId: string, targetParentFolderId: string): Promise<FolderDto | null> {
    const folder = await this.findFolder(folderId);
    const target = await this.findFolder(targetParentFolderId);
    if (!folder || !target) return null;
    const updated = { ...folder, parentFolderId: target.id };
    this.folders.set(folderId, updated);
    return updated;
  }

  async folderHasDescendant(folderId: string, possibleDescendantId: string): Promise<boolean> {
    let cursor = this.folders.get(possibleDescendantId)?.parentFolderId ?? null;
    while (cursor) {
      if (cursor === folderId) return true;
      cursor = this.folders.get(cursor)?.parentFolderId ?? null;
    }
    return false;
  }

  async deleteFolder(folderId: string): Promise<DeletedResourceResponseDto | null> {
    const folder = await this.findFolder(folderId);
    if (!folder) return null;
    const deletedAt = new Date("2026-04-30T00:00:00.000Z").toISOString();
    const folderIds = this.collectFolderTreeIds(folderId);
    for (const childFolderId of folderIds) {
      const childFolder = this.folders.get(childFolderId);
      if (childFolder) this.folders.set(childFolderId, { ...childFolder, deletedAt });
    }
    return { id: folderId, deletedAt };
  }

  private collectFolderTreeIds(rootFolderId: string): string[] {
    const folderIds = [rootFolderId];
    for (let index = 0; index < folderIds.length; index += 1) {
      folderIds.push(
        ...[...this.folders.values()]
          .filter((folder) => folder.parentFolderId === folderIds[index] && !folder.deletedAt)
          .map((folder) => folder.id),
      );
    }
    return folderIds;
  }

  private id(prefix: string): string {
    return `${prefix}_${this.next++}`;
  }
}

async function postJson<T>(
  baseUrl: string,
  path: string,
  body: object,
): Promise<Record<string, T>> {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });
  const responseText = await response.text();
  assert.equal(response.status, 201, responseText);
  return JSON.parse(responseText) as Record<string, T>;
}

async function getJson<T>(baseUrl: string, path: string): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, { headers: authHeaders() });
  const responseText = await response.text();
  assert.equal(response.status, 200, responseText);
  return JSON.parse(responseText) as T;
}

class AllowAllProductApiAccessService {
  async requireSession() {
    return {
      user: { id: "user_alice", email: "alice@example.test", name: "Alice" },
      memberships: [{ id: "member_alice", workspaceId: "workspace_1" }],
      currentMembership: { id: "member_alice", workspaceId: "workspace_1" },
    };
  }

  async requireWorkspaceAccess(): Promise<void> {}
  async requireWorkspaceOwnerAccess() {
    return {
      membership: { id: "member_alice", workspaceId: "workspace_1", role: "owner" },
    };
  }
  async requireProjectAccess(): Promise<void> {}
  async requireProjectOwnerAccess() {
    return {
      membership: { id: "member_alice", workspaceId: "workspace_1", role: "owner" },
    };
  }
  async requireFolderAccess(): Promise<void> {}
}

function authHeaders(init: Record<string, string> = {}): Record<string, string> {
  return { ...init, Cookie: "rme_session=session_token" };
}

function assertAddressInfo(address: string | AddressInfo | null): asserts address is AddressInfo {
  assert.notEqual(address, null);
  assert.notEqual(typeof address, "string");
}

function baseUrlForApp(app: Awaited<ReturnType<typeof NestFactory.create>>): string {
  const address = app.getHttpServer().address();
  assertAddressInfo(address);

  return `http://127.0.0.1:${address.port}`;
}
