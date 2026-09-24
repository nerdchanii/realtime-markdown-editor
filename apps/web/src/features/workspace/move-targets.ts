import type {
  NormalizedWorkspaceNavigationViewModel,
  WorkspaceFolderMoveTarget,
  WorkspaceNavigationNode,
} from "./types";

export function createFolderMoveTargets(
  model: NormalizedWorkspaceNavigationViewModel,
): readonly WorkspaceFolderMoveTarget[] {
  return [
    ...createFolderMoveTargetsForNode(model.root, null, [model.workspaceName], [], null),
    ...model.projects.flatMap((project) =>
      createFolderMoveTargetsForNode(
        project.root,
        project.id,
        [model.workspaceName, project.name],
        [],
        null,
      ),
    ),
  ];
}

function createFolderMoveTargetsForNode(
  node: WorkspaceNavigationNode,
  projectId: string | null,
  path: readonly string[],
  ancestorIds: readonly string[],
  parentFolderId: string | null,
): readonly WorkspaceFolderMoveTarget[] {
  if (node.kind === "document") return [];

  const currentTarget = {
    id: node.id,
    label: [...path, node.name].filter(Boolean).join(" / "),
    projectId,
    parentFolderId,
    ancestorIds,
  };
  const nextAncestorIds = [...ancestorIds, node.id];

  return [
    currentTarget,
    ...(node.children ?? []).flatMap((child) =>
      createFolderMoveTargetsForNode(
        child,
        projectId,
        [...path, node.name],
        nextAncestorIds,
        node.id,
      ),
    ),
  ];
}
