import type { DragEvent, RefObject } from "react";
import { useEffect, useRef, useState } from "react";

import { DeleteNodeButton } from "./DeleteNodeButton";
import {
  canDropOnFolder,
  readWorkspaceDragItem,
  type WorkspaceDragItem,
  writeWorkspaceDragItem,
} from "./drag-utils";
import {
  documentButtonStyle,
  documentRowStyle,
  folderRenameInputStyle,
  folderRenameWrapStyle,
  folderRowStyle,
  folderSelectStyle,
  folderToggleStyle,
} from "./node-view-styles";
import { handleRenameKeyDown, isDuplicateSiblingName } from "./rename-utils";
import { panelStyles } from "./styles";
import { createWorkspaceDocumentSelection, isFolderNode } from "./tree-utils";
import type {
  WorkspaceDocumentMoveRequest,
  WorkspaceDocumentRenameRequest,
  WorkspaceFolderMoveRequest,
  WorkspaceFolderMoveTarget,
  WorkspaceFolderRenameRequest,
  WorkspaceNavigationNode,
  WorkspaceNavigationSelection,
} from "./types";
import { ChevronDown, FileText, Folder } from "lucide-react";

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
  onRenameDocument: (request: WorkspaceDocumentRenameRequest) => void;
  onRenameFolder: (request: WorkspaceFolderRenameRequest) => void;
  onMoveFolder: (request: WorkspaceFolderMoveRequest) => void;
  onMoveDocument: (request: WorkspaceDocumentMoveRequest) => void;
  moveTargets: readonly WorkspaceFolderMoveTarget[];
  siblingNames?: readonly string[];
  dragItem: WorkspaceDragItem | null;
  onDragStart: (item: WorkspaceDragItem) => void;
  onDragEnd: () => void;
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
  const [isDragOver, setIsDragOver] = useState(false);
  const [draftName, setDraftName] = useState(node.name);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isSelected = node.id === props.selectedFolderId;
  const projectId = props.projectId ?? null;
  const canDrop = canDropOnFolder(node.id, projectId, props.dragItem, props.moveTargets);
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    const dragItem = props.dragItem ?? readWorkspaceDragItem(event.dataTransfer);
    if (!canDropOnFolder(node.id, projectId, dragItem, props.moveTargets) || !dragItem) return;

    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
    if (dragItem.kind === "document") {
      props.onMoveDocument({ documentId: dragItem.id, targetFolderId: node.id });
    } else {
      props.onMoveFolder({ folderId: dragItem.id, targetParentFolderId: node.id });
    }
    props.onDragEnd();
  };
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
      <div
        draggable={!isRenaming}
        data-testid={`workspace-folder-row-${node.id}`}
        onDragEnd={props.onDragEnd}
        onDragStart={(event) => {
          event.stopPropagation();
          const dragItem: WorkspaceDragItem = { kind: "folder", id: node.id, projectId };
          event.dataTransfer.effectAllowed = "move";
          writeWorkspaceDragItem(event.dataTransfer, dragItem);
          props.onDragStart(dragItem);
        }}
        onDragEnter={(event) => {
          const dragItem = props.dragItem ?? readWorkspaceDragItem(event.dataTransfer);
          if (!canDropOnFolder(node.id, projectId, dragItem, props.moveTargets)) return;
          event.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDragOver={(event) => {
          const dragItem = props.dragItem ?? readWorkspaceDragItem(event.dataTransfer);
          if (!canDropOnFolder(node.id, projectId, dragItem, props.moveTargets)) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
          setIsDragOver(true);
        }}
        onDrop={handleDrop}
        style={folderRowStyle(isSelected, isDragOver && canDrop)}
      >
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
  onRenameDocument,
  onDragStart,
  onDragEnd,
  siblingNames,
}: WorkspaceNodeViewProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftTitle, setDraftTitle] = useState(node.name);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isSelected = node.id === selectedDocumentId;
  const selection = createWorkspaceDocumentSelection(node, workspaceId, projectId, path);
  const finishRenaming = () => {
    const nextTitle = draftTitle.trim();
    if (!nextTitle || isDuplicateSiblingName(nextTitle, node.name, siblingNames)) {
      setDraftTitle(node.name);
      setIsRenaming(false);
      return;
    }

    setIsRenaming(false);
    if (nextTitle !== node.name) onRenameDocument({ documentId: node.id, title: nextTitle });
  };

  useEffect(() => {
    if (!isRenaming) return;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [isRenaming]);

  return (
    <li data-node-kind={node.kind} data-node-id={node.id}>
      <div
        draggable={!isRenaming}
        data-testid={`workspace-document-row-${node.id}`}
        onDragEnd={onDragEnd}
        onDragStart={(event) => {
          event.stopPropagation();
          const dragItem: WorkspaceDragItem = {
            kind: "document",
            id: node.id,
            folderId: node.folderId ?? null,
            projectId,
          };
          event.dataTransfer.effectAllowed = "move";
          writeWorkspaceDragItem(event.dataTransfer, dragItem);
          onDragStart(dragItem);
        }}
        style={documentRowStyle(isSelected)}
      >
        {isRenaming ? (
          <span style={folderRenameWrapStyle}>
            <FileText size={16} color={isSelected ? "var(--color-accent)" : "currentColor"} />
            <input
              ref={inputRef}
              aria-label={`Rename ${node.name}`}
              value={draftTitle}
              onBlur={finishRenaming}
              onChange={(event) => setDraftTitle(event.target.value)}
              onKeyDown={(event) =>
                handleRenameKeyDown(event, finishRenaming, () => {
                  setDraftTitle(node.name);
                  setIsRenaming(false);
                })
              }
              style={folderRenameInputStyle}
            />
          </span>
        ) : (
          <button
            type="button"
            style={documentButtonStyle(isSelected)}
            aria-current={isSelected ? "page" : undefined}
            data-testid={`workspace-document-${node.id}`}
            onClick={() => onSelectDocument(selection)}
            onDoubleClick={() => {
              setDraftTitle(node.name);
              setIsRenaming(true);
            }}
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
        )}
        <DeleteNodeButton
          label={`Delete ${node.name}`}
          message={`Delete document "${node.name}"?`}
          onDelete={() => onDeleteDocument(node.id)}
        />
      </div>
    </li>
  );
}
