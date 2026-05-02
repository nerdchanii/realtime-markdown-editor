import { WorkspaceNodeView } from "./WorkspaceNodeView";
import { panelStyles } from "./styles";
import type {
  NormalizedWorkspaceNavigationViewModel,
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
  onRenameFolder,
}: Readonly<{
  model: NormalizedWorkspaceNavigationViewModel;
  project: WorkspaceNavigationProject;
  selectedDocumentId: string | null | undefined;
  selectedFolderId: string | null | undefined;
  onSelectFolder: (folderId: string) => void;
  onSelectDocument: (selection: WorkspaceNavigationSelection) => void;
  onDeleteDocument: (documentId: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onRenameFolder: (request: WorkspaceFolderRenameRequest) => void;
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
          onRenameFolder={onRenameFolder}
        />
      </ul>
    </section>
  );
}
