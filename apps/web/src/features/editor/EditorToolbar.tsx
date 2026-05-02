import type { Editor } from "@tiptap/core";
import { useCallback, useEffect, useState } from "react";
import type { DocumentId } from "@rme/contracts";

import { ChevronDownIcon } from "@/components/tiptap-icons/chevron-down-icon";
import { HeadingButton } from "@/components/tiptap-ui/heading-button";
import { useHeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu";
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button";
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button";
import { LinkPopover } from "@/components/tiptap-ui/link-popover";
import { ListButton } from "@/components/tiptap-ui/list-button";
import { MarkButton } from "@/components/tiptap-ui/mark-button";
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button";
import { Button as TiptapButton } from "@/components/tiptap-ui-primitive/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/tiptap-ui-primitive/dropdown-menu";
import { Spacer } from "@/components/tiptap-ui-primitive/spacer";
import { Toolbar, ToolbarGroup, ToolbarSeparator } from "@/components/tiptap-ui-primitive/toolbar";
import {
  createCollaborationCheckpoint,
  createMarkdownExport,
  updateDocumentContent,
  type ApiClient,
} from "@/lib/api-client";

import { CollaboratorStack } from "./CollaboratorStack";
import type { PresenceMember } from "./ports/collaboration-adapter";

export function EditorToolbar({
  editor,
  markdown,
  presence,
  apiClient,
  documentId,
  exportTitle,
  isReadOnly = false,
  onSaved,
  persistedMarkdown,
}: Readonly<{
  editor: Editor | null;
  markdown: string;
  presence: readonly PresenceMember[];
  apiClient?: ApiClient | undefined;
  documentId?: string | undefined;
  exportTitle: string;
  isReadOnly?: boolean | undefined;
  onSaved?: (() => void) | undefined;
  persistedMarkdown: string;
}>) {
  return (
    <Toolbar
      aria-label="Editor formatting toolbar"
      data-testid="editor-format-toolbar"
      style={{ minHeight: "48px", padding: "0 16px", gap: "8px" }}
      variant="fixed"
    >
      <ToolbarGroup>
        <TextStyleDropdown editor={editor} />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton data-testid="editor-bold-button" editor={editor} type="bold" />
        <MarkButton data-testid="editor-italic-button" editor={editor} type="italic" />
        <MarkButton data-testid="editor-strike-button" editor={editor} type="strike" />
        <MarkButton data-testid="editor-inline-code-button" editor={editor} type="code" />
        <LinkPopover data-testid="editor-link-button" editor={editor} />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ListButton data-testid="editor-bullet-list-button" editor={editor} type="bulletList" />
        <ListButton data-testid="editor-task-button" editor={editor} type="taskList" />
        <ListButton data-testid="editor-ordered-list-button" editor={editor} type="orderedList" />
        <BlockquoteButton data-testid="editor-quote-button" editor={editor} />
        <CodeBlockButton editor={editor} />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <UndoRedoButton action="undo" data-testid="editor-undo-button" editor={editor} />
        <UndoRedoButton action="redo" data-testid="editor-redo-button" editor={editor} />
      </ToolbarGroup>

      <Spacer />

      <ToolbarGroup aria-label="Collaborators" style={{ gap: "0", marginRight: "4px" }}>
        <CollaboratorStack members={presence} />
      </ToolbarGroup>

      <ToolbarGroup>
        <CheckpointSaveButton
          key={documentId}
          apiClient={apiClient}
          documentId={documentId}
          isReadOnly={isReadOnly}
          markdown={markdown}
          onSaved={onSaved}
          persistedMarkdown={persistedMarkdown}
        />
        <ExportMenuButton
          apiClient={apiClient}
          documentId={documentId}
          isReadOnly={isReadOnly}
          markdown={markdown}
          title={exportTitle}
        />
      </ToolbarGroup>
    </Toolbar>
  );
}

function CheckpointSaveButton({
  apiClient,
  documentId,
  isReadOnly,
  markdown,
  onSaved,
  persistedMarkdown,
}: Readonly<{
  apiClient?: ApiClient | undefined;
  documentId?: string | undefined;
  isReadOnly: boolean;
  markdown: string;
  onSaved?: (() => void) | undefined;
  persistedMarkdown: string;
}>) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "failed">("idle");
  const [savedSnapshot, setSavedSnapshot] = useState(() => ({
    persistedMarkdown,
    savedMarkdown: persistedMarkdown,
  }));
  const savedMarkdown =
    savedSnapshot.persistedMarkdown === persistedMarkdown
      ? savedSnapshot.savedMarkdown
      : persistedMarkdown;
  const hasUnsavedChanges = markdown !== savedMarkdown;
  const canSave = Boolean(apiClient && documentId && status !== "saving" && hasUnsavedChanges);
  const displayStatus = status === "saved" && hasUnsavedChanges ? "idle" : status;
  const runSave = useCallback(() => {
    if (!apiClient || !documentId || !canSave) return;

    void saveCheckpoint({
      apiClient,
      documentId,
      markdown,
      onCheckpointSaved: () => {
        setSavedSnapshot({ persistedMarkdown, savedMarkdown: markdown });
      },
      onSaved,
      setStatus,
    });
  }, [apiClient, canSave, documentId, markdown, onSaved, persistedMarkdown]);

  useEffect(() => {
    if (!canSave || isReadOnly) return undefined;

    const handleSaveShortcut = (event: KeyboardEvent) => {
      if (!isSaveShortcut(event)) return;
      event.preventDefault();
      runSave();
    };

    window.addEventListener("keydown", handleSaveShortcut);
    return () => window.removeEventListener("keydown", handleSaveShortcut);
  }, [canSave, isReadOnly, runSave]);

  if (!apiClient || !documentId || isReadOnly) return null;

  return (
    <TiptapButton
      aria-label={saveAriaLabel(displayStatus)}
      data-disabled={!canSave}
      disabled={!canSave}
      onClick={runSave}
      role="button"
      tabIndex={-1}
      type="button"
      variant="ghost"
    >
      <span className="tiptap-button-text">{saveLabel(displayStatus)}</span>
    </TiptapButton>
  );
}

function isSaveShortcut(event: KeyboardEvent) {
  return (event.metaKey || event.ctrlKey) && !event.shiftKey && event.key.toLowerCase() === "s";
}

async function saveCheckpoint(
  input: Readonly<{
    apiClient: ApiClient;
    documentId: string;
    markdown: string;
    onCheckpointSaved: () => void;
    onSaved?: (() => void) | undefined;
    setStatus: (status: "idle" | "saving" | "saved" | "failed") => void;
  }>,
) {
  input.setStatus("saving");

  try {
    await updateDocumentContent(input.apiClient, input.documentId as DocumentId, {
      markdownBody: input.markdown,
      source: "collaboration-projection",
    });
    await createCollaborationCheckpoint(input.apiClient, input.documentId, {
      message: "Manual checkpoint",
    });
    input.onCheckpointSaved();
    input.setStatus("saved");
    input.onSaved?.();
  } catch {
    input.setStatus("failed");
  }
}

function saveLabel(status: "idle" | "saving" | "saved" | "failed") {
  if (status === "saving") return "Saving...";
  if (status === "saved") return "Saved";
  if (status === "failed") return "Retry save";
  return "Save";
}

function saveAriaLabel(status: "idle" | "saving" | "saved" | "failed") {
  if (status === "saving") return "Saving document checkpoint";
  if (status === "saved") return "Document checkpoint saved";
  if (status === "failed") return "Retry saving document checkpoint";
  return "Save document checkpoint";
}

function ExportMenuButton({
  apiClient,
  documentId,
  isReadOnly,
  markdown,
  title,
}: Readonly<{
  apiClient?: ApiClient | undefined;
  documentId?: string | undefined;
  isReadOnly: boolean;
  markdown: string;
  title: string;
}>) {
  const [status, setStatus] = useState<"idle" | "exporting" | "failed">("idle");

  if (!apiClient || !documentId || isReadOnly) return null;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <TiptapButton
          aria-label="Document actions"
          disabled={status === "exporting"}
          role="button"
          tabIndex={-1}
          type="button"
          variant="ghost"
        >
          <span aria-hidden="true" className="tiptap-button-text">
            ...
          </span>
        </TiptapButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem
            disabled={status === "exporting"}
            onClick={() => {
              void exportMarkdown({
                apiClient,
                documentId,
                markdown,
                title,
                setStatus,
              });
            }}
          >
            {status === "exporting" ? "Exporting..." : "Export Markdown"}
          </DropdownMenuItem>
          {status === "failed" ? <DropdownMenuItem disabled>Export failed</DropdownMenuItem> : null}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

async function exportMarkdown(
  input: Readonly<{
    apiClient: ApiClient;
    documentId: string;
    markdown: string;
    title: string;
    setStatus: (status: "idle" | "exporting" | "failed") => void;
  }>,
) {
  input.setStatus("exporting");

  try {
    await updateDocumentContent(input.apiClient, input.documentId as DocumentId, {
      markdownBody: input.markdown,
      source: "collaboration-projection",
    });
    const result = await createMarkdownExport(input.apiClient, input.documentId, {
      filename: `${slugify(input.title)}.md`,
    });
    downloadMarkdownFile(result.filename, result.fileContents);
    input.setStatus("idle");
  } catch {
    input.setStatus("failed");
  }
}

function downloadMarkdownFile(filename: string, fileContents: string) {
  if (typeof window === "undefined") return;

  const blob = new Blob([fileContents], { type: "text/markdown;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const anchor = window.document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  window.document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}

function slugify(value: string) {
  return value.trim().toLowerCase().replaceAll(/\s+/g, "-") || "document";
}

function TextStyleDropdown({ editor }: Readonly<{ editor: Editor | null }>) {
  const { activeLevel, canToggle, isVisible } = useHeadingDropdownMenu({
    editor,
    levels: [1, 2],
    hideWhenUnavailable: false,
  });
  const isParagraphActive = Boolean(
    editor?.isEditable && !activeLevel && editor.isActive("paragraph"),
  );
  const isDisabled = !editor || !editor.isEditable || !canToggle;
  const label = activeLevel
    ? `Heading ${activeLevel}`
    : isParagraphActive
      ? "Paragraph"
      : "Text style";

  if (!isVisible) return null;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <TiptapButton
          aria-label="Text style"
          data-active-state={activeLevel || isParagraphActive ? "on" : "off"}
          data-disabled={isDisabled}
          disabled={isDisabled}
          role="button"
          tabIndex={-1}
          tooltip="Text style"
          type="button"
          variant="ghost"
        >
          <span className="tiptap-button-text">{label}</span>
          <ChevronDownIcon className="tiptap-button-dropdown-small" />
        </TiptapButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <ParagraphButton editor={editor} />
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <HeadingButton editor={editor} level={1} showTooltip={false} text="Heading 1" />
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <HeadingButton editor={editor} level={2} showTooltip={false} text="Heading 2" />
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ParagraphButton({ editor }: Readonly<{ editor: Editor | null }>) {
  const isActive = Boolean(
    editor?.isEditable && editor.isActive("paragraph") && !editor.isActive("heading"),
  );
  const canSetParagraph = Boolean(editor?.isEditable && editor.can().setParagraph());

  return (
    <TiptapButton
      aria-label="Paragraph"
      aria-pressed={isActive}
      data-active-state={isActive ? "on" : "off"}
      data-disabled={!canSetParagraph}
      disabled={!canSetParagraph}
      onClick={() => {
        editor?.chain().focus().setParagraph().run();
      }}
      role="button"
      showTooltip={false}
      tabIndex={-1}
      type="button"
      variant="ghost"
    >
      <span className="tiptap-button-text">Paragraph</span>
    </TiptapButton>
  );
}
