import type { WorkspaceFolderMoveTarget } from "./types";

export type WorkspaceDragItem =
  | Readonly<{ kind: "document"; id: string; folderId: string | null; projectId: string | null }>
  | Readonly<{ kind: "folder"; id: string; projectId: string | null }>;

const workspaceDragMimeType = "application/x-rme-workspace-node";

export function writeWorkspaceDragItem(dataTransfer: DataTransfer, item: WorkspaceDragItem) {
  dataTransfer.setData(workspaceDragMimeType, JSON.stringify(item));
  dataTransfer.setData("text/plain", item.id);
}

export function readWorkspaceDragItem(dataTransfer: DataTransfer): WorkspaceDragItem | null {
  const serialized = dataTransfer.getData(workspaceDragMimeType);
  if (!serialized) return null;

  try {
    const value: unknown = JSON.parse(serialized);
    if (!isWorkspaceDragItem(value)) return null;
    return value;
  } catch {
    return null;
  }
}

export function canDropOnFolder(
  targetFolderId: string,
  targetProjectId: string | null,
  dragItem: WorkspaceDragItem | null,
  moveTargets: readonly WorkspaceFolderMoveTarget[],
) {
  if (!dragItem) return false;

  const target = moveTargets.find((candidate) => candidate.id === targetFolderId);
  if (!target || target.projectId !== targetProjectId || target.projectId !== dragItem.projectId) {
    return false;
  }

  if (dragItem.kind === "document") {
    return dragItem.folderId !== targetFolderId;
  }

  return dragItem.id !== targetFolderId && !target.ancestorIds.includes(dragItem.id);
}

function isWorkspaceDragItem(value: unknown): value is WorkspaceDragItem {
  if (!value || typeof value !== "object") return false;

  const item = value as Partial<WorkspaceDragItem>;
  if (item.kind === "document") {
    return (
      typeof item.id === "string" &&
      (item.folderId === null || typeof item.folderId === "string") &&
      (item.projectId === null || typeof item.projectId === "string")
    );
  }
  return (
    item.kind === "folder" &&
    typeof item.id === "string" &&
    (item.projectId === null || typeof item.projectId === "string")
  );
}
