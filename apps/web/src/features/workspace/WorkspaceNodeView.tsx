import { useState } from "react";

import { panelStyles } from "./styles";
import { createWorkspaceDocumentSelection, isFolderNode } from "./tree-utils";
import type { WorkspaceNavigationNode, WorkspaceNavigationSelection } from "./types";
import { ChevronDown, FileText, Folder, Trash2 } from "lucide-react";

type WorkspaceNodeViewProps = Readonly<{
  node: WorkspaceNavigationNode;
  path: readonly string[];
  selectedDocumentId?: string | null | undefined;
  selectedFolderId?: string | null | undefined;
  workspaceId: string;
  projectId?: string | null | undefined;
  onSelectFolder: (folderId: string) => void;
  onSelectDocument: (selection: WorkspaceNavigationSelection) => void;
  onDeleteDocument: (documentId: string) => void;
  onDeleteFolder: (folderId: string) => void;
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
      <ChildNodes {...props} path={props.path} />
    </li>
  );
}

function FolderNodeView(props: WorkspaceNodeViewProps) {
  const { node } = props;
  const [isExpanded, setIsExpanded] = useState(true);
  const isSelected = node.id === props.selectedFolderId;

  return (
    <li data-node-kind={node.kind} data-node-id={node.id}>
      <div style={folderRowStyle(isSelected)}>
        <button
          type="button"
          style={{
            ...folderToggleStyle,
            transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
          }}
          aria-label={isExpanded ? `Collapse ${node.name}` : `Expand ${node.name}`}
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((current) => !current)}
        >
          <ChevronDown size={16} color="#90a1b9" />
        </button>
        <button
          type="button"
          style={folderSelectStyle}
          aria-current={isSelected ? "true" : undefined}
          onClick={() => {
            if (isSelected) {
              setIsExpanded((current) => !current);
              return;
            }
            props.onSelectFolder(node.id);
          }}
        >
          <Folder size={16} color="#90a1b9" />
          <span style={{ ...panelStyles.nodeTitle, fontWeight: 500 }}>{node.name}</span>
        </button>
        <button
          type="button"
          style={nodeDeleteStyle}
          aria-label={`Delete ${node.name}`}
          onClick={(event) => {
            event.stopPropagation();
            if (!confirmDelete(`Delete folder "${node.name}" and everything inside it?`)) return;
            props.onDeleteFolder(node.id);
          }}
        >
          <Trash2 size={13} />
        </button>
      </div>
      {isExpanded ? <ChildNodes {...props} path={[...props.path, node.name]} /> : null}
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
  onDeleteDocument,
}: WorkspaceNodeViewProps) {
  const isSelected = node.id === selectedDocumentId;
  const selection = createWorkspaceDocumentSelection(node, workspaceId, projectId, path);

  return (
    <li data-node-kind={node.kind} data-node-id={node.id}>
      <div style={documentRowStyle(isSelected)}>
        <button
          type="button"
          style={documentButtonStyle(isSelected)}
          aria-current={isSelected ? "page" : undefined}
          data-testid={`workspace-document-${node.id}`}
          onClick={() => onSelectDocument(selection)}
        >
          <span style={panelStyles.nodeContent}>
            <span style={panelStyles.nodeLabel}>
              <FileText
                size={16}
                color={isSelected ? "var(--color-accent)" : "currentColor"}
                style={{ flexShrink: 0 }}
              />
              <span style={{ ...panelStyles.nodeTitle, fontWeight: isSelected ? 500 : 400 }}>
                {node.name}
              </span>
            </span>
          </span>
        </button>
        <button
          type="button"
          style={nodeDeleteStyle}
          aria-label={`Delete ${node.name}`}
          onClick={(event) => {
            event.stopPropagation();
            if (!confirmDelete(`Delete document "${node.name}"?`)) return;
            onDeleteDocument(node.id);
          }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </li>
  );
}

function documentButtonStyle(isSelected: boolean) {
  return {
    ...panelStyles.nodeButton,
    flex: 1,
    background: isSelected ? "#eff6ff" : "transparent",
    color: isSelected ? "#1447e6" : "#45556c",
  };
}

function folderRowStyle(isSelected: boolean) {
  return {
    display: "flex",
    alignItems: "center",
    borderRadius: "4px",
    background: isSelected ? "#eff6ff" : "transparent",
    color: isSelected ? "#1447e6" : "#45556c",
  };
}

function documentRowStyle(isSelected: boolean) {
  return {
    display: "flex",
    alignItems: "center",
    borderRadius: "4px",
    background: isSelected ? "#eff6ff" : "transparent",
    color: isSelected ? "#1447e6" : "#45556c",
  };
}

const folderToggleStyle = {
  display: "inline-flex",
  width: "22px",
  height: "28px",
  flex: "0 0 auto",
  alignItems: "center",
  justifyContent: "center",
  border: 0,
  background: "transparent",
  cursor: "pointer",
  padding: 0,
};

function confirmDelete(message: string): boolean {
  if (typeof globalThis.confirm !== "function") return true;
  return globalThis.confirm(message);
}

const folderSelectStyle = {
  ...panelStyles.nodeButton,
  flex: 1,
  padding: "6px 6px 6px 0px",
  gap: "4px",
  background: "transparent",
};

const nodeDeleteStyle = {
  display: "inline-flex",
  width: "22px",
  height: "22px",
  flex: "0 0 auto",
  alignItems: "center",
  justifyContent: "center",
  border: 0,
  borderRadius: "4px",
  background: "transparent",
  color: "#90a1b9",
  cursor: "pointer",
  padding: 0,
};
