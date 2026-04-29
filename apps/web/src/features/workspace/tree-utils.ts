import { seededNavigationModel } from "./seed";
import type {
  NormalizedWorkspaceNavigationViewModel,
  WorkspaceNavigationNode,
  WorkspaceNavigationSelection,
  WorkspaceNavigationViewModel,
} from "./types";

export function normalizeViewModel(
  viewModel: WorkspaceNavigationViewModel,
): NormalizedWorkspaceNavigationViewModel {
  const fallback = seededNavigationModel;

  return {
    ...fallback,
    ...viewModel,
    workspaceId: fallbackTo(viewModel.workspaceId, fallback.workspaceId),
    workspaceName: fallbackTo(viewModel.workspaceName, viewModel.label, fallback.workspaceName),
    workspaceDescription: fallbackTo(viewModel.workspaceDescription, fallback.workspaceDescription),
    activeMembersLabel: fallbackTo(viewModel.activeMembersLabel, fallback.activeMembersLabel),
    root: fallbackTo(viewModel.root, fallback.root),
    projects: fallbackTo(viewModel.projects, fallback.projects),
    selectedDocumentId: fallbackTo(viewModel.selectedDocumentId, fallback.selectedDocumentId),
  };
}

function fallbackTo<T>(...values: readonly [T | undefined, ...(T | undefined)[], T]): T {
  for (const value of values) {
    if (value !== undefined) {
      return value;
    }
  }

  return values.at(-1) as T;
}

export function findDocumentSelection(
  model: NormalizedWorkspaceNavigationViewModel,
  selectedDocumentId?: string | null,
): WorkspaceNavigationSelection | undefined {
  if (!selectedDocumentId) {
    return undefined;
  }

  return (
    findDocumentInNode(model.root, selectedDocumentId, model.workspaceId, null, [
      model.workspaceName,
    ]) ?? findProjectDocumentSelection(model, selectedDocumentId)
  );
}

function findProjectDocumentSelection(
  model: NormalizedWorkspaceNavigationViewModel,
  selectedDocumentId: string,
) {
  for (const project of model.projects) {
    const selection = findDocumentInNode(
      project.root,
      selectedDocumentId,
      model.workspaceId,
      project.id,
      [model.workspaceName, project.name],
    );

    if (selection) {
      return selection;
    }
  }

  return undefined;
}

function findDocumentInNode(
  node: WorkspaceNavigationNode,
  selectedDocumentId: string,
  workspaceId: string,
  projectId: string | null,
  path: readonly string[],
): WorkspaceNavigationSelection | undefined {
  if (node.kind === "document" && node.id === selectedDocumentId) {
    return createWorkspaceDocumentSelection(node, workspaceId, projectId, path);
  }

  for (const child of node.children ?? []) {
    const childPath = isFolderNode(node) ? [...path, node.name] : path;
    const selection = findDocumentInNode(
      child,
      selectedDocumentId,
      workspaceId,
      projectId,
      childPath,
    );

    if (selection) {
      return selection;
    }
  }

  return undefined;
}

export function createWorkspaceDocumentSelection(
  node: WorkspaceNavigationNode,
  workspaceId: string,
  projectId: string | null,
  path: readonly string[],
): WorkspaceNavigationSelection {
  return {
    workspaceId,
    projectId,
    documentId: node.id,
    folderId: node.folderId ?? null,
    title: node.name,
    path: [...path, node.name],
  };
}

export function isFolderNode(node: WorkspaceNavigationNode) {
  return node.kind === "regular" || node.kind === "inbox";
}
