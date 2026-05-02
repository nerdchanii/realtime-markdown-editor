import type {
  WorkspaceNavigationNode,
  WorkspaceNavigationProject,
  WorkspaceNavigationViewModel,
} from "@/features/workspace";

import type { WorkspaceShellFeatureProviders } from "./types";

export function getDisplayedDocumentTitle(
  input: Readonly<{
    activeDocumentId: string | undefined;
    documentContextTitle: string | undefined;
    editorLabel: string;
    titleDrafts: Readonly<Record<string, string>>;
  }>,
) {
  if (!input.activeDocumentId) {
    return input.documentContextTitle ?? input.editorLabel;
  }

  return (
    input.titleDrafts[input.activeDocumentId] ?? input.documentContextTitle ?? input.editorLabel
  );
}

export function overrideProviderDocumentTitle(
  providers: WorkspaceShellFeatureProviders,
  documentId: string | undefined,
  title: string,
): WorkspaceShellFeatureProviders {
  if (!documentId) return providers;

  return {
    ...providers,
    workspaceNavigation: overrideWorkspaceNavigationTitle(
      providers.workspaceNavigation,
      documentId,
      title,
    ),
    documentContext: {
      ...providers.documentContext,
      title,
    },
    editorWorkspace: {
      ...providers.editorWorkspace,
      label: title,
    },
  };
}

function overrideWorkspaceNavigationTitle(
  viewModel: WorkspaceNavigationViewModel,
  documentId: string,
  title: string,
): WorkspaceNavigationViewModel {
  return {
    ...viewModel,
    ...(viewModel.root
      ? { root: overrideWorkspaceNodeTitle(viewModel.root, documentId, title) }
      : {}),
    ...(viewModel.projects
      ? {
          projects: viewModel.projects.map((project) =>
            overrideWorkspaceProjectTitle(project, documentId, title),
          ),
        }
      : {}),
  };
}

function overrideWorkspaceProjectTitle(
  project: WorkspaceNavigationProject,
  documentId: string,
  title: string,
): WorkspaceNavigationProject {
  return {
    ...project,
    root: overrideWorkspaceNodeTitle(project.root, documentId, title),
  };
}

function overrideWorkspaceNodeTitle(
  node: WorkspaceNavigationNode,
  documentId: string,
  title: string,
): WorkspaceNavigationNode {
  const nextName = node.kind === "document" && node.id === documentId ? title : node.name;
  const nextChildren = node.children?.map((child) =>
    overrideWorkspaceNodeTitle(child, documentId, title),
  );

  return {
    ...node,
    name: nextName,
    ...(nextChildren ? { children: nextChildren } : {}),
  };
}
