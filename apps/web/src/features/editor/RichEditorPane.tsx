import type { AnyExtension, Editor } from "@tiptap/core";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import Link from "@tiptap/extension-link";
import { Markdown } from "@tiptap/markdown";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef, type MutableRefObject } from "react";

import type { EditorSelectionSnapshot } from "./ports/collaboration-adapter";
import { richEditorPaneStyle } from "./styles";

import "@/components/tiptap-node/blockquote-node/blockquote-node.scss";
import "@/components/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap-node/heading-node/heading-node.scss";
import "@/components/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";

type MarkdownCapableEditor = Editor & {
  getMarkdown?: () => string;
};

type MarkdownSetContent = (
  content: string,
  options: { contentType: "markdown"; emitUpdate?: boolean },
) => boolean;

export function RichEditorPane({
  markdown,
  onMarkdownChange,
  onSelectionChange,
  onEditorChange,
  collaborationExtensions,
  bootstrapMarkdown,
  editable = true,
}: Readonly<{
  markdown: string;
  onMarkdownChange: (markdown: string) => void;
  onSelectionChange: (selection: EditorSelectionSnapshot) => void;
  onEditorChange?: ((editor: Editor | null) => void) | undefined;
  collaborationExtensions?: readonly AnyExtension[] | undefined;
  bootstrapMarkdown?: string | undefined;
  editable?: boolean | undefined;
}>) {
  const editor = useRichMarkdownEditor({
    markdown,
    onMarkdownChange,
    onSelectionChange,
    onEditorChange,
    collaborationExtensions,
    bootstrapMarkdown,
    editable,
  });

  return (
    <section aria-label="Rich Markdown editor" data-testid="editor-rich-tiptap-surface">
      <EditorContent editor={editor} />
    </section>
  );
}

function useRichMarkdownEditor({
  markdown,
  onMarkdownChange,
  onSelectionChange,
  onEditorChange,
  collaborationExtensions,
  bootstrapMarkdown,
  editable,
}: RichMarkdownEditorOptions) {
  const bootstrappedMarkdownRef = useRef<string | null>(null);
  const editor = useEditor(
    createRichEditorOptions(markdown, {
      onMarkdownChange,
      onSelectionChange,
      collaborationExtensions,
      editable,
    }),
    [collaborationExtensions, editable],
  );

  useExternalMarkdownSync(editor, markdown, collaborationExtensions);
  useCollaborationBootstrap(
    editor,
    bootstrapMarkdown,
    collaborationExtensions,
    bootstrappedMarkdownRef,
  );
  usePublishEditorInstance(editor, onEditorChange);

  return editor;
}

type RichMarkdownEditorOptions = Readonly<{
  markdown: string;
  onMarkdownChange: (markdown: string) => void;
  onSelectionChange: (selection: EditorSelectionSnapshot) => void;
  onEditorChange?: ((editor: Editor | null) => void) | undefined;
  collaborationExtensions?: readonly AnyExtension[] | undefined;
  bootstrapMarkdown?: string | undefined;
  editable: boolean;
}>;

function useExternalMarkdownSync(
  editor: Editor | null,
  markdown: string,
  collaborationExtensions: readonly AnyExtension[] | undefined,
) {
  useEffect(() => {
    if (!editor || markdown === readEditorMarkdown(editor)) return;
    if (hasCollaborationExtensions(collaborationExtensions)) return;

    writeEditorMarkdown(editor, markdown);
  }, [collaborationExtensions, editor, markdown]);
}

function useCollaborationBootstrap(
  editor: Editor | null,
  bootstrapMarkdown: string | undefined,
  collaborationExtensions: readonly AnyExtension[] | undefined,
  bootstrappedMarkdownRef: MutableRefObject<string | null>,
) {
  useEffect(() => {
    const bootstrap = bootstrapMarkdown;
    if (bootstrap === undefined) return;
    if (!shouldBootstrapEditor(editor, collaborationExtensions)) return;
    if (bootstrappedMarkdownRef.current === bootstrap) return;

    bootstrappedMarkdownRef.current = bootstrap;
    writeEditorMarkdownWithUpdate(editor, bootstrap, true);
  }, [bootstrapMarkdown, bootstrappedMarkdownRef, collaborationExtensions, editor]);
}

function usePublishEditorInstance(
  editor: Editor | null,
  onEditorChange: ((editor: Editor | null) => void) | undefined,
) {
  useEffect(() => {
    onEditorChange?.(editor);
    return () => onEditorChange?.(null);
  }, [editor, onEditorChange]);
}

function shouldBootstrapEditor(
  editor: Editor | null,
  collaborationExtensions: readonly AnyExtension[] | undefined,
): editor is Editor {
  if (!editor) return false;
  if (!hasCollaborationExtensions(collaborationExtensions)) return false;
  return isEditorEmptyForBootstrap(editor);
}

function createRichEditorOptions(
  markdown: string,
  handlers: Readonly<{
    onMarkdownChange: (markdown: string) => void;
    onSelectionChange: (selection: EditorSelectionSnapshot) => void;
    collaborationExtensions?: readonly AnyExtension[] | undefined;
    editable: boolean;
  }>,
) {
  const hasCollaborationExtensionList = hasCollaborationExtensions(
    handlers.collaborationExtensions,
  );

  return {
    extensions: createRichEditorExtensions(handlers.collaborationExtensions),
    ...(hasCollaborationExtensionList
      ? {}
      : { content: markdown, contentType: "markdown" as const }),
    editable: handlers.editable,
    immediatelyRender: false,
    editorProps: { attributes: createRichEditorAttributes() },
    onUpdate: ({ editor }: { editor: Editor }) => publishRichMarkdown(editor, handlers),
    onSelectionUpdate: ({ editor }: { editor: Editor }) => publishRichSelection(editor, handlers),
  };
}

export function createRichEditorExtensions(
  collaborationExtensions?: readonly AnyExtension[] | undefined,
) {
  if (collaborationExtensions && collaborationExtensions.length > 0) {
    return [
      ...collaborationExtensions,
      Markdown.configure({
        markedOptions: { gfm: true, breaks: false },
        indentation: { style: "space", size: 2 },
      }),
    ];
  }

  return [
    StarterKit.configure({ undoRedo: false, link: false }),
    Link.configure({ autolink: true, openOnClick: false }),
    TaskList,
    TaskItem.configure({ nested: true }),
    Markdown.configure({
      markedOptions: { gfm: true, breaks: false },
      indentation: { style: "space", size: 2 },
    }),
  ];
}

function createRichEditorAttributes() {
  return {
    "aria-label": "Rich Markdown editor",
    "data-testid": "rich-markdown-editor",
    class: "tiptap-rich-editor simple-editor",
    style: richEditorPaneStyle,
  };
}

function publishRichMarkdown(
  editor: Editor,
  handlers: Readonly<{ onMarkdownChange: (markdown: string) => void }>,
) {
  handlers.onMarkdownChange(readEditorMarkdown(editor));
}

function publishRichSelection(
  editor: Editor,
  handlers: Readonly<{ onSelectionChange: (selection: EditorSelectionSnapshot) => void }>,
) {
  handlers.onSelectionChange({
    anchor: editor.state.selection.anchor,
    head: editor.state.selection.head,
  });
}

function readEditorMarkdown(editor: Editor): string {
  const markdownEditor = editor as MarkdownCapableEditor;

  if (typeof markdownEditor.getMarkdown === "function") {
    return markdownEditor.getMarkdown();
  }

  return editor.getText();
}

function writeEditorMarkdown(editor: Editor, markdown: string) {
  writeEditorMarkdownWithUpdate(editor, markdown, false);
}

function writeEditorMarkdownWithUpdate(editor: Editor, markdown: string, emitUpdate: boolean) {
  const setContent = editor.commands.setContent as MarkdownSetContent;
  setContent(markdown, {
    contentType: "markdown",
    emitUpdate,
  });
}

function hasCollaborationExtensions(
  collaborationExtensions: readonly AnyExtension[] | undefined,
): boolean {
  return collaborationExtensions !== undefined && collaborationExtensions.length > 0;
}

function isEditorEmptyForBootstrap(editor: Editor): boolean {
  return editor.isEmpty || readEditorMarkdown(editor).trim().length === 0;
}
