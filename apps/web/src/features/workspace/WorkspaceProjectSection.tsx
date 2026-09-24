import { WorkspaceNodeView } from "./WorkspaceNodeView";
import type { WorkspaceDragItem } from "./drag-utils";
import { panelStyles } from "./styles";
import type {
  NormalizedWorkspaceNavigationViewModel,
  WorkspaceDocumentMoveRequest,
  WorkspaceDocumentRenameRequest,
  WorkspaceFolderMoveRequest,
  WorkspaceFolderMoveTarget,
  WorkspaceFolderRenameRequest,
  WorkspaceNavigationProject,
  WorkspaceNavigationSelection,
} from "./types";

export function WorkspaceProjectSection({
  model,
  project,
  selectedDocumentId,
  selectedFolderId,
  onSelectFolder,
  onSelectDocument,
  onDeleteDocument,
  onDeleteFolder,
  onRenameDocument,
  onRenameFolder,
  onMoveFolder,
  onMoveDocument,
  moveTargets,
  dragItem,
  onDragStart,
  onDragEnd,
}: Readonly<{
  model: NormalizedWorkspaceNavigationViewModel;
  project: WorkspaceNavigationProject;
  selectedDocumentId: string | null | undefined;
  selectedFolderId: string | null | undefined;
  onSelectFolder: (folderId: string) => void;
  onSelectDocument: (selection: WorkspaceNavigationSelection) => void;
  onDeleteDocument: (documentId: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onRenameDocument: (request: WorkspaceDocumentRenameRequest) => void;
  onRenameFolder: (request: WorkspaceFolderRenameRequest) => void;
  onMoveFolder: (request: WorkspaceFolderMoveRequest) => void;
  onMoveDocument: (request: WorkspaceDocumentMoveRequest) => void;
  moveTargets: readonly WorkspaceFolderMoveTarget[];
  dragItem: WorkspaceDragItem | null;
  onDragStart: (item: WorkspaceDragItem) => void;
  onDragEnd: () => void;
}>) {
  return (
    <section className="workspace-project-section" aria-label={project.name}>
      <div className="workspace-project-section__header">
        <span className="workspace-project-section__key">{project.key}</span>
        <span className="workspace-project-section__name">{project.name}</span>
      </div>
      <ul style={panelStyles.tree}>
        <WorkspaceNodeView
          node={project.root}
          path={[model.workspaceName, project.name]}
          projectId={project.id}
          selectedDocumentId={selectedDocumentId}
          selectedFolderId={selectedFolderId}
          workspaceId={model.workspaceId}
          onSelectFolder={onSelectFolder}
          onSelectDocument={onSelectDocument}
          onDeleteDocument={onDeleteDocument}
          onDeleteFolder={onDeleteFolder}
          onRenameDocument={onRenameDocument}
          onRenameFolder={onRenameFolder}
          onMoveFolder={onMoveFolder}
          onMoveDocument={onMoveDocument}
          moveTargets={moveTargets}
          dragItem={dragItem}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        />
      </ul>
    </section>
  );
}
