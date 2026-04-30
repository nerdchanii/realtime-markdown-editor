import { useState } from "react";

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
  WorkspaceDocumentCreateRequest,
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
      <DocumentCreateEntryPoint model={model} selectedDocument={selectedDocument} />
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
        <span style={panelStyles.badge}>{model.currentMemberLabel}</span>
        <span style={panelStyles.badge}>Seeded review</span>
      </div>
      <div style={{ color: "var(--color-text-secondary)", fontSize: "13px", lineHeight: 1.45 }}>
        {model.workspaceDescription}
      </div>
    </div>
  );
}

function DocumentCreateEntryPoint({
  model,
  selectedDocument,
}: Readonly<{
  model: ReturnType<typeof normalizeViewModel>;
  selectedDocument: WorkspaceNavigationSelection | undefined;
}>) {
  const [title, setTitle] = useState("Untitled decision note");
  const createDocument = useDocumentCreateAction(model, selectedDocument, title, setTitle);

  if (!model.onCreateDocument) return null;

  return (
    <form
      aria-label="Create Markdown document"
      style={panelStyles.createForm}
      onSubmit={(event) => {
        event.preventDefault();
        createDocument();
      }}
    >
      <label style={panelStyles.sectionTitle} htmlFor="workspace-new-document-title">
        New Markdown document
      </label>
      <DocumentCreateFields title={title} onTitleChange={setTitle} />
    </form>
  );
}

function useDocumentCreateAction(
  model: ReturnType<typeof normalizeViewModel>,
  selectedDocument: WorkspaceNavigationSelection | undefined,
  title: string,
  setTitle: (title: string) => void,
) {
  return () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    model.onCreateDocument?.({
      title: trimmedTitle,
      folderId: selectedDocument?.folderId ?? null,
      projectId: selectedDocument?.projectId ?? null,
    });
    setTitle("Untitled decision note");
  };
}

function DocumentCreateFields({
  title,
  onTitleChange,
}: Readonly<{ title: string; onTitleChange: (title: string) => void }>) {
  return (
    <div style={panelStyles.createRow}>
      <input
        id="workspace-new-document-title"
        aria-label="New document title"
        value={title}
        onChange={(event) => onTitleChange(event.currentTarget.value)}
        style={panelStyles.createInput}
      />
      <button type="submit" style={panelStyles.createButton} data-testid="create-document-button">
        New
      </button>
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
