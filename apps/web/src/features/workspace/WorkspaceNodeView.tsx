import { panelStyles } from "./styles";
import { createWorkspaceDocumentSelection, isFolderNode } from "./tree-utils";
import type { WorkspaceNavigationNode, WorkspaceNavigationSelection } from "./types";

type WorkspaceNodeViewProps = Readonly<{
  node: WorkspaceNavigationNode;
  path: readonly string[];
  selectedDocumentId?: string | null | undefined;
  workspaceId: string;
  projectId?: string | null | undefined;
  onSelectDocument: (selection: WorkspaceNavigationSelection) => void;
}>;

export function WorkspaceNodeView(props: WorkspaceNodeViewProps) {
  if (props.node.kind === "workspaceRoot" || props.node.kind === "projectRoot") {
    return <RootNodeView {...props} />;
  }

  if (isFolderNode(props.node)) {
    return <FolderNodeView {...props} />;
  }

  return <DocumentNodeView {...props} />;
}

function RootNodeView(props: WorkspaceNodeViewProps) {
  const { node } = props;

  return (
    <li style={panelStyles.rootNode} data-node-kind={node.kind} data-node-id={node.id}>
      <div style={panelStyles.rootLabel}>
        <span>{node.name}</span>
        <span>System root, not movable</span>
      </div>
      <ChildNodes {...props} path={props.path} />
    </li>
  );
}

function FolderNodeView(props: WorkspaceNodeViewProps) {
  const { node } = props;

  return (
    <li data-node-kind={node.kind} data-node-id={node.id}>
      <div style={panelStyles.nodeStatic}>
        <span aria-hidden="true">Folder</span>
        <span style={{ fontWeight: 650 }}>{node.name}</span>
      </div>
      <ChildNodes {...props} path={[...props.path, node.name]} />
    </li>
  );
}

function ChildNodes(props: WorkspaceNodeViewProps) {
  const { node } = props;

  if (!node.children?.length) {
    return null;
  }

  return (
    <ul style={panelStyles.children}>
      {node.children.map((child) => (
        <WorkspaceNodeView
          key={child.id}
          {...props}
          node={child}
          projectId={props.projectId ?? null}
        />
      ))}
    </ul>
  );
}

function DocumentNodeView({
  node,
  path,
  selectedDocumentId,
  workspaceId,
  projectId = null,
  onSelectDocument,
}: WorkspaceNodeViewProps) {
  const isSelected = node.id === selectedDocumentId;
  const selection = createWorkspaceDocumentSelection(node, workspaceId, projectId, path);

  return (
    <li data-node-kind={node.kind} data-node-id={node.id}>
      <button
        type="button"
        style={documentButtonStyle(isSelected)}
        aria-current={isSelected ? "page" : undefined}
        data-testid={`workspace-document-${node.id}`}
        onClick={() => onSelectDocument(selection)}
      >
        <span style={panelStyles.nodeContent}>
          <span style={panelStyles.nodeLabel}>
            <span aria-hidden="true">Doc</span>
            <span>{node.name}</span>
          </span>
          <DocumentMeta node={node} isSelected={isSelected} />
        </span>
      </button>
    </li>
  );
}

function DocumentMeta({
  node,
  isSelected,
}: Readonly<{ node: WorkspaceNavigationNode; isSelected: boolean }>) {
  return (
    <span
      style={{
        ...panelStyles.nodeMeta,
        color: isSelected ? "#ddf4ff" : "var(--color-text-muted)",
      }}
    >
      {node.status ? <span>{node.status}</span> : null}
      {node.updatedLabel ? <span>{node.updatedLabel}</span> : null}
      {node.ownerLabel ? <span>{node.ownerLabel}</span> : null}
    </span>
  );
}

function documentButtonStyle(isSelected: boolean) {
  return {
    ...panelStyles.nodeButton,
    background: isSelected ? "var(--color-accent)" : "transparent",
    color: isSelected ? "#ffffff" : "var(--color-text-primary)",
  };
}
