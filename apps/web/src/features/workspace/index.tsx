import { workspaceFeatureId } from "./events";
import { WorkspaceNodeView } from "./WorkspaceNodeView";
import { panelStyles } from "./styles";
import { normalizeViewModel } from "./tree-utils";
import type { WorkspaceNavigationSelection, WorkspaceNavigationViewModel } from "./types";
import { useWorkspaceSelection } from "./useWorkspaceSelection";

export type {
  WorkspaceNavigationNode,
  WorkspaceNavigationProject,
  WorkspaceNavigationSelection,
  WorkspaceNavigationViewModel,
} from "./types";

export { workspaceDocumentSelectedEventName, workspaceFeatureId } from "./events";

export type WorkspaceNavigationSlotProps = Readonly<{
  viewModel: WorkspaceNavigationViewModel;
}>;

export function WorkspaceNavigationSlot({ viewModel }: WorkspaceNavigationSlotProps) {
  const { model, selectedDocument, selectedDocumentId, selectDocument } =
    useWorkspaceSelection(viewModel);

  return (
    <aside
      className="workspace-panel workspace-navigation"
      aria-label="Workspace navigation"
      data-feature={workspaceFeatureId}
      data-selected-document-id={selectedDocument?.documentId}
    >
      <WorkspaceHeader model={model} />
      <WorkspaceRoot
        model={model}
        selectedDocumentId={selectedDocumentId}
        onSelectDocument={selectDocument}
      />
      <ProjectList
        model={model}
        selectedDocumentId={selectedDocumentId}
        onSelectDocument={selectDocument}
      />
      <SelectedEditorContext selectedDocument={selectedDocument} />
      <div className="replacement-point">{model.replacementPoint}</div>
    </aside>
  );
}

function WorkspaceHeader({ model }: Readonly<{ model: ReturnType<typeof normalizeViewModel> }>) {
  return (
    <div style={panelStyles.header}>
      <div className="slot-kicker">Workspace</div>
      <h1 className="slot-title">{model.workspaceName}</h1>
      <div style={panelStyles.metaRow}>
        <span style={panelStyles.badge}>{model.activeMembersLabel}</span>
        <span style={panelStyles.badge}>Mock seed</span>
      </div>
      <div style={{ color: "var(--color-text-secondary)", fontSize: "13px", lineHeight: 1.45 }}>
        {model.workspaceDescription}
      </div>
    </div>
  );
}

function WorkspaceRoot({
  model,
  selectedDocumentId,
  onSelectDocument,
}: Readonly<{
  model: ReturnType<typeof normalizeViewModel>;
  selectedDocumentId?: string | null;
  onSelectDocument: (selection: WorkspaceNavigationSelection) => void;
}>) {
  return (
    <nav aria-label={`${model.workspaceName} hierarchy`} style={panelStyles.section}>
      <h2 style={panelStyles.sectionTitle}>Workspace files</h2>
      <ul style={panelStyles.tree}>
        <WorkspaceNodeView
          node={model.root}
          path={[model.workspaceName]}
          selectedDocumentId={selectedDocumentId}
          workspaceId={model.workspaceId}
          onSelectDocument={onSelectDocument}
        />
      </ul>
    </nav>
  );
}

function ProjectList({
  model,
  selectedDocumentId,
  onSelectDocument,
}: Readonly<{
  model: ReturnType<typeof normalizeViewModel>;
  selectedDocumentId?: string | null;
  onSelectDocument: (selection: WorkspaceNavigationSelection) => void;
}>) {
  return (
    <section aria-label="Projects" style={panelStyles.section}>
      <h2 style={panelStyles.sectionTitle}>Projects</h2>
      <div style={{ display: "grid", gap: "14px" }}>
        {model.projects.map((project) => (
          <ProjectNavigation
            key={project.id}
            project={project}
            selectedDocumentId={selectedDocumentId}
            workspaceId={model.workspaceId}
            workspaceName={model.workspaceName}
            onSelectDocument={onSelectDocument}
          />
        ))}
      </div>
    </section>
  );
}

function ProjectNavigation({
  project,
  selectedDocumentId,
  workspaceId,
  workspaceName,
  onSelectDocument,
}: Readonly<{
  project: ReturnType<typeof normalizeViewModel>["projects"][number];
  selectedDocumentId?: string | null | undefined;
  workspaceId: string;
  workspaceName: string;
  onSelectDocument: (selection: WorkspaceNavigationSelection) => void;
}>) {
  return (
    <article style={panelStyles.project} data-project-id={project.id}>
      <ProjectHeader name={project.name} keyLabel={project.key} status={project.status} />
      <ul style={panelStyles.tree}>
        <WorkspaceNodeView
          node={project.root}
          path={[workspaceName, project.name]}
          projectId={project.id}
          selectedDocumentId={selectedDocumentId}
          workspaceId={workspaceId}
          onSelectDocument={onSelectDocument}
        />
      </ul>
    </article>
  );
}

function ProjectHeader({
  name,
  keyLabel,
  status,
}: Readonly<{ name: string; keyLabel: string; status: string }>) {
  return (
    <div style={panelStyles.projectHeader}>
      <div style={{ color: "var(--color-text-primary)", fontSize: "14px", fontWeight: 700 }}>
        {name}
      </div>
      <div style={panelStyles.nodeMeta}>
        <span>{keyLabel}</span>
        <span>{status}</span>
      </div>
    </div>
  );
}

function SelectedEditorContext({
  selectedDocument,
}: Readonly<{ selectedDocument: WorkspaceNavigationSelection | undefined }>) {
  return (
    <section
      aria-label="Selected editor context"
      style={panelStyles.selectedContext}
      data-workspace-editor-context="selected-document"
    >
      <div style={panelStyles.sectionTitle}>Editor context</div>
      <div style={{ color: "var(--color-text-primary)", fontSize: "14px", fontWeight: 700 }}>
        {selectedDocument?.title ?? "No document selected"}
      </div>
      {selectedDocument ? (
        <div style={{ color: "var(--color-text-secondary)", fontSize: "12px", lineHeight: 1.45 }}>
          {selectedDocument.path.join(" / ")}
        </div>
      ) : null}
    </section>
  );
}
