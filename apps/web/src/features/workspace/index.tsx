import { useState } from "react";
import { FilePlus2, FolderPlus, Trash2 } from "lucide-react";

import { workspaceFeatureId } from "./events";
import { WorkspaceProjectSection } from "./WorkspaceProjectSection";
import { WorkspaceNodeView } from "./WorkspaceNodeView";
import { createFolderMoveTargets } from "./move-targets";
import type { WorkspaceDragItem } from "./drag-utils";
import { panelStyles } from "./styles";
import { normalizeViewModel } from "./tree-utils";
import { TrashPanel } from "./TrashPanel";
import type {
  WorkspaceFolderRenameRequest,
  WorkspaceDocumentMoveRequest,
  WorkspaceFolderMoveRequest,
  WorkspaceFolderMoveTarget,
  WorkspaceArchivedDocument,
  WorkspaceNavigationNode,
  WorkspaceNavigationSelection,
  WorkspaceNavigationViewModel,
} from "./types";
import { useWorkspaceSelection } from "./useWorkspaceSelection";

export type {
  WorkspaceNavigationNode,
  WorkspaceNavigationProject,
  WorkspaceNavigationSelection,
  WorkspaceNavigationViewModel,
  WorkspaceArchivedDocument,
  WorkspaceDocumentCreateRequest,
  WorkspaceDocumentMoveRequest,
  WorkspaceFolderCreateRequest,
  WorkspaceFolderMoveRequest,
  WorkspaceFolderMoveTarget,
  WorkspaceFolderRenameRequest,
} from "./types";

export { workspaceDocumentSelectedEventName, workspaceFeatureId } from "./events";

export type WorkspaceNavigationSlotProps = Readonly<{
  viewModel: WorkspaceNavigationViewModel;
}>;

export function WorkspaceNavigationSlot({ viewModel }: WorkspaceNavigationSlotProps) {
  const { model, selectedDocumentId, selectDocument } = useWorkspaceSelection(viewModel);
  const [selectedFolder, setSelectedFolder] = useState<Readonly<{
    documentId: string | null;
    folderId: string | null;
  }> | null>(null);
  const selectedFolderId =
    selectedFolder?.documentId === selectedDocumentId ? selectedFolder.folderId : null;
  const targetFolderId = selectedFolderId ?? model.activeFolderId ?? model.defaultFolderId;
  const targetFolder = targetFolderId
    ? (findNodeById(model.root, targetFolderId) ??
      findProjectNodeById(model.projects, targetFolderId))
    : null;
  const moveTargets = createFolderMoveTargets(model);
  const [dragItem, setDragItem] = useState<WorkspaceDragItem | null>(null);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [trashState, setTrashState] = useState<
    Readonly<{
      documents: readonly WorkspaceArchivedDocument[];
      status: "idle" | "loading" | "error";
    }>
  >({ documents: [], status: "idle" });

  const handleSelectDocument = (selection: Parameters<typeof selectDocument>[0]) => {
    setSelectedFolder({
      documentId: selection.documentId,
      folderId: selection.folderId,
    });
    selectDocument(selection);
  };
  const handleSelectFolder = (folderId: string | null) => {
    setSelectedFolder({
      documentId: selectedDocumentId,
      folderId,
    });
  };
  const handleOpenTrash = () => {
    const nextOpen = !isTrashOpen;
    setIsTrashOpen(nextOpen);
    if (nextOpen) void loadTrashDocuments(model, setTrashState);
  };
  const handleRestoreDocument = (documentId: string) => {
    model.onRestoreDocument?.(documentId);
    setTrashState((current) => ({
      ...current,
      documents: current.documents.filter((document) => document.id !== documentId),
    }));
  };

  return (
    <aside
      className="workspace-panel workspace-navigation"
      aria-label="Workspace navigation"
      data-feature={workspaceFeatureId}
      style={{ display: "flex", flexDirection: "column", padding: 0 }}
    >
      <div style={{ display: "flex", flexDirection: "column", minHeight: 0, flex: 1 }}>
        {/* Explorer */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0, flex: 1 }}>
          <div className="workspace-navigation__tabs">
            <span className="workspace-navigation__tab">Explorer</span>
            <div className="workspace-navigation__actions">
              <button
                type="button"
                className="workspace-navigation__action"
                aria-label={isTrashOpen ? "Close Trash" : "Open Trash"}
                aria-pressed={isTrashOpen}
                disabled={!model.onListArchivedDocuments}
                onClick={handleOpenTrash}
              >
                <Trash2 size={14} />
              </button>
              <button
                type="button"
                className="workspace-navigation__action"
                aria-label="New document"
                disabled={!targetFolderId || !model.onCreateDocument}
                onClick={() => {
                  if (!targetFolderId) return;
                  const title = uniqueChildName(targetFolder, "document", "Untitled document");
                  if (!title) return;
                  model.onCreateDocument?.({
                    folderId: targetFolderId,
                    title,
                  });
                }}
              >
                <FilePlus2 size={14} />
              </button>
              <button
                type="button"
                className="workspace-navigation__action"
                aria-label="New folder"
                disabled={!targetFolderId || !model.onCreateFolder}
                onClick={() => {
                  if (!targetFolderId) return;
                  const name = uniqueChildName(targetFolder, "folder", "Untitled folder");
                  if (!name) return;
                  model.onCreateFolder?.({
                    parentFolderId: targetFolderId,
                    name,
                  });
                }}
              >
                <FolderPlus size={14} />
              </button>
            </div>
          </div>

          <div className="workspace-navigation__tree">
            {isTrashOpen ? (
              <TrashPanel
                documents={trashState.documents}
                status={trashState.status}
                onRefresh={() => void loadTrashDocuments(model, setTrashState)}
                onRestoreDocument={handleRestoreDocument}
              />
            ) : (
              <>
                <WorkspaceRoot
                  model={model}
                  selectedDocumentId={selectedDocumentId}
                  selectedFolderId={selectedFolderId}
                  onSelectFolder={handleSelectFolder}
                  onSelectDocument={handleSelectDocument}
                  onDeleteDocument={(documentId) => model.onDeleteDocument?.(documentId)}
                  onDeleteFolder={(folderId) => model.onDeleteFolder?.(folderId)}
                  onRenameFolder={(request) => model.onRenameFolder?.(request)}
                  onMoveFolder={(request) => model.onMoveFolder?.(request)}
                  onMoveDocument={(request) => model.onMoveDocument?.(request)}
                  moveTargets={moveTargets}
                  dragItem={dragItem}
                  onDragStart={setDragItem}
                  onDragEnd={() => setDragItem(null)}
                />
                <ProjectList
                  model={model}
                  selectedDocumentId={selectedDocumentId}
                  selectedFolderId={selectedFolderId}
                  onSelectFolder={handleSelectFolder}
                  onSelectDocument={handleSelectDocument}
                  onDeleteDocument={(documentId) => model.onDeleteDocument?.(documentId)}
                  onDeleteFolder={(folderId) => model.onDeleteFolder?.(folderId)}
                  onRenameFolder={(request) => model.onRenameFolder?.(request)}
                  onMoveFolder={(request) => model.onMoveFolder?.(request)}
                  onMoveDocument={(request) => model.onMoveDocument?.(request)}
                  moveTargets={moveTargets}
                  dragItem={dragItem}
                  onDragStart={setDragItem}
                  onDragEnd={() => setDragItem(null)}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

async function loadTrashDocuments(
  model: ReturnType<typeof normalizeViewModel>,
  setTrashState: (
    state: Readonly<{
      documents: readonly WorkspaceArchivedDocument[];
      status: "idle" | "loading" | "error";
    }>,
  ) => void,
) {
  if (!model.onListArchivedDocuments) return;
  setTrashState({ documents: [], status: "loading" });
  try {
    setTrashState({
      documents: await model.onListArchivedDocuments(),
      status: "idle",
    });
  } catch {
    setTrashState({ documents: [], status: "error" });
  }
}

function WorkspaceRoot({
  model,
  selectedDocumentId,
  selectedFolderId,
  onSelectFolder,
  onSelectDocument,
  onDeleteDocument,
  onDeleteFolder,
  onRenameFolder,
  onMoveFolder,
  onMoveDocument,
  moveTargets,
  dragItem,
  onDragStart,
  onDragEnd,
}: Readonly<{
  model: ReturnType<typeof normalizeViewModel>;
  selectedDocumentId: string | null | undefined;
  selectedFolderId: string | null | undefined;
  onSelectFolder: (folderId: string) => void;
  onSelectDocument: (selection: WorkspaceNavigationSelection) => void;
  onDeleteDocument: (documentId: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onRenameFolder: (request: WorkspaceFolderRenameRequest) => void;
  onMoveFolder: (request: WorkspaceFolderMoveRequest) => void;
  onMoveDocument: (request: WorkspaceDocumentMoveRequest) => void;
  moveTargets: readonly WorkspaceFolderMoveTarget[];
  dragItem: WorkspaceDragItem | null;
  onDragStart: (item: WorkspaceDragItem) => void;
  onDragEnd: () => void;
}>) {
  return (
    <ul style={panelStyles.tree}>
      <WorkspaceNodeView
        node={model.root}
        path={[model.workspaceName]}
        selectedDocumentId={selectedDocumentId}
        selectedFolderId={selectedFolderId}
        workspaceId={model.workspaceId}
        onSelectFolder={onSelectFolder}
        onSelectDocument={onSelectDocument}
        onDeleteDocument={onDeleteDocument}
        onDeleteFolder={onDeleteFolder}
        onRenameFolder={onRenameFolder}
        onMoveFolder={onMoveFolder}
        onMoveDocument={onMoveDocument}
        moveTargets={moveTargets}
        dragItem={dragItem}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      />
    </ul>
  );
}

function ProjectList({
  model,
  selectedDocumentId,
  selectedFolderId,
  onSelectFolder,
  onSelectDocument,
  onDeleteDocument,
  onDeleteFolder,
  onRenameFolder,
  onMoveFolder,
  onMoveDocument,
  moveTargets,
  dragItem,
  onDragStart,
  onDragEnd,
}: Readonly<{
  model: ReturnType<typeof normalizeViewModel>;
  selectedDocumentId?: string | null;
  selectedFolderId?: string | null;
  onSelectFolder: (folderId: string) => void;
  onSelectDocument: (selection: WorkspaceNavigationSelection) => void;
  onDeleteDocument: (documentId: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onRenameFolder: (request: WorkspaceFolderRenameRequest) => void;
  onMoveFolder: (request: WorkspaceFolderMoveRequest) => void;
  onMoveDocument: (request: WorkspaceDocumentMoveRequest) => void;
  moveTargets: readonly WorkspaceFolderMoveTarget[];
  dragItem: WorkspaceDragItem | null;
  onDragStart: (item: WorkspaceDragItem) => void;
  onDragEnd: () => void;
}>) {
  return (
    <div style={{ display: "grid", gap: "2px" }}>
      {model.projects.map((project) => (
        <WorkspaceProjectSection
          key={project.id}
          model={model}
          project={project}
          selectedDocumentId={selectedDocumentId}
          selectedFolderId={selectedFolderId}
          onSelectFolder={onSelectFolder}
          onSelectDocument={onSelectDocument}
          onDeleteDocument={onDeleteDocument}
          onDeleteFolder={onDeleteFolder}
          onRenameFolder={onRenameFolder}
          onMoveFolder={onMoveFolder}
          onMoveDocument={onMoveDocument}
          moveTargets={moveTargets}
          dragItem={dragItem}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        />
      ))}
    </div>
  );
}

function findProjectNodeById(
  projects: ReturnType<typeof normalizeViewModel>["projects"],
  nodeId: string,
) {
  for (const project of projects) {
    const node = findNodeById(project.root, nodeId);
    if (node) return node;
  }

  return null;
}

function findNodeById(
  node: WorkspaceNavigationNode,
  nodeId: string,
): WorkspaceNavigationNode | null {
  if (node.id === nodeId) return node;

  for (const child of node.children ?? []) {
    const matched = findNodeById(child, nodeId);
    if (matched) return matched;
  }

  return null;
}

function uniqueChildName(
  folder: WorkspaceNavigationNode | null,
  kind: "document" | "folder",
  baseName: string,
) {
  const existingNames = new Set(
    (folder?.children ?? [])
      .filter((child) =>
        kind === "document" ? child.kind === "document" : child.kind !== "document",
      )
      .map((child) => child.name.trim().toLowerCase())
      .filter(Boolean),
  );

  const normalizedBaseName = baseName.trim();
  if (!normalizedBaseName) return "";
  if (!existingNames.has(normalizedBaseName.toLowerCase())) return normalizedBaseName;

  for (let index = 2; index < 1000; index += 1) {
    const candidate = `${normalizedBaseName} ${index}`;
    if (!existingNames.has(candidate.toLowerCase())) return candidate;
  }

  return "";
}
