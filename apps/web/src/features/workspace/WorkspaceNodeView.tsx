import type { KeyboardEvent, RefObject } from "react";
import { useEffect, useRef, useState } from "react";

import { panelStyles } from "./styles";
import { createWorkspaceDocumentSelection, isFolderNode } from "./tree-utils";
import type {
  WorkspaceFolderRenameRequest,
  WorkspaceNavigationNode,
  WorkspaceNavigationSelection,
} from "./types";
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
  onRenameFolder: (request: WorkspaceFolderRenameRequest) => void;
  siblingNames?: readonly string[];
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
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftName, setDraftName] = useState(node.name);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isSelected = node.id === props.selectedFolderId;
  const toggleFolder = () => {
    props.onSelectFolder(node.id);
    setIsExpanded((current) => !current);
  };
  const finishRenaming = () => {
    const nextName = draftName.trim();
    if (!nextName || isDuplicateSiblingName(nextName, node.name, props.siblingNames)) {
      setDraftName(node.name);
      setIsRenaming(false);
      return;
    }

    setIsRenaming(false);
    if (nextName !== node.name) props.onRenameFolder({ folderId: node.id, name: nextName });
  };

  useEffect(() => {
    if (!isRenaming) return;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [isRenaming]);

  return (
    <li data-node-kind={node.kind} data-node-id={node.id}>
      <div style={folderRowStyle(isSelected)}>
        <FolderToggle node={node} isExpanded={isExpanded} onToggle={toggleFolder} />
        <FolderNameControl
          draftName={draftName}
          inputRef={inputRef}
          isRenaming={isRenaming}
          isSelected={isSelected}
          node={node}
          onCancel={() => {
            setDraftName(node.name);
            setIsRenaming(false);
          }}
          onChange={setDraftName}
          onDoubleClick={() => {
            setDraftName(node.name);
            setIsRenaming(true);
          }}
          onFinish={finishRenaming}
          onToggle={toggleFolder}
        />
        <DeleteNodeButton
          label={`Delete ${node.name}`}
          message={`Delete folder "${node.name}" and everything inside it?`}
          onDelete={() => props.onDeleteFolder(node.id)}
        />
      </div>
      {isExpanded ? <ChildNodes {...props} path={[...props.path, node.name]} /> : null}
    </li>
  );
}

function FolderToggle({
  isExpanded,
  node,
  onToggle,
}: Readonly<{
  isExpanded: boolean;
  node: WorkspaceNavigationNode;
  onToggle: () => void;
}>) {
  return (
    <button
      type="button"
      style={{
        ...folderToggleStyle,
        transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
      }}
      aria-label={isExpanded ? `Collapse ${node.name}` : `Expand ${node.name}`}
      aria-expanded={isExpanded}
      onClick={onToggle}
    >
      <ChevronDown size={16} color="#90a1b9" />
    </button>
  );
}

function FolderNameControl({
  draftName,
  inputRef,
  isRenaming,
  isSelected,
  node,
  onCancel,
  onChange,
  onDoubleClick,
  onFinish,
  onToggle,
}: Readonly<{
  draftName: string;
  inputRef: RefObject<HTMLInputElement | null>;
  isRenaming: boolean;
  isSelected: boolean;
  node: WorkspaceNavigationNode;
  onCancel: () => void;
  onChange: (name: string) => void;
  onDoubleClick: () => void;
  onFinish: () => void;
  onToggle: () => void;
}>) {
  if (isRenaming) {
    return (
      <span style={folderRenameWrapStyle}>
        <Folder size={16} color="#90a1b9" />
        <input
          ref={inputRef}
          aria-label={`Rename ${node.name}`}
          value={draftName}
          onBlur={onFinish}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => handleRenameKeyDown(event, onFinish, onCancel)}
          style={folderRenameInputStyle}
        />
      </span>
    );
  }

  return (
    <button
      type="button"
      style={folderSelectStyle}
      aria-current={isSelected ? "true" : undefined}
      onClick={onToggle}
      onDoubleClick={onDoubleClick}
    >
      <Folder size={16} color="#90a1b9" />
      <span style={{ ...panelStyles.nodeTitle, fontWeight: 500 }}>{node.name}</span>
    </button>
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
          siblingNames={node.children?.map((sibling) => sibling.name) ?? []}
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
        <DeleteNodeButton
          label={`Delete ${node.name}`}
          message={`Delete document "${node.name}"?`}
          onDelete={() => onDeleteDocument(node.id)}
        />
      </div>
    </li>
  );
}

function DeleteNodeButton({
  label,
  message,
  onDelete,
}: Readonly<{
  label: string;
  message: string;
  onDelete: () => void;
}>) {
  return (
    <button
      type="button"
      className="workspace-node-delete"
      style={nodeDeleteStyle}
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
        if (!confirmDelete(message)) return;
        onDelete();
      }}
    >
      <Trash2 size={13} />
    </button>
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
    width: "100%",
    minWidth: 0,
    position: "relative" as const,
    overflow: "hidden",
    borderRadius: "4px",
    background: isSelected ? "#eff6ff" : "transparent",
    color: isSelected ? "#1447e6" : "#45556c",
  };
}

function documentRowStyle(isSelected: boolean) {
  return {
    display: "flex",
    alignItems: "center",
    width: "100%",
    minWidth: 0,
    position: "relative" as const,
    overflow: "hidden",
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

function handleRenameKeyDown(
  event: KeyboardEvent<HTMLInputElement>,
  onFinish: () => void,
  onCancel: () => void,
) {
  if (event.key === "Enter") {
    event.preventDefault();
    onFinish();
  }
  if (event.key === "Escape") {
    event.preventDefault();
    onCancel();
  }
}

function isDuplicateSiblingName(
  nextName: string,
  currentName: string,
  siblingNames: readonly string[] = [],
) {
  const normalizedNextName = nextName.trim().toLowerCase();
  const normalizedCurrentName = currentName.trim().toLowerCase();
  if (normalizedNextName === normalizedCurrentName) return false;

  return siblingNames.some((name) => name.trim().toLowerCase() === normalizedNextName);
}

const folderSelectStyle = {
  ...panelStyles.nodeButton,
  flex: 1,
  padding: "6px 6px 6px 0px",
  gap: "4px",
  background: "transparent",
};

const folderRenameWrapStyle = {
  ...panelStyles.nodeButton,
  flex: 1,
  padding: "6px 6px 6px 0px",
  gap: "4px",
  background: "transparent",
};

const folderRenameInputStyle = {
  minWidth: 0,
  flex: 1,
  border: "0",
  background: "transparent",
  color: "inherit",
  font: "inherit",
  outline: "0",
  padding: 0,
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
