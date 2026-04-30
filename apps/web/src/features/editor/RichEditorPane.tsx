import type { Editor } from "@tiptap/core";
import Link from "@tiptap/extension-link";
import { Markdown } from "@tiptap/markdown";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

import type { EditorSelectionSnapshot } from "./ports/collaboration-adapter";
import { richEditorPaneStyle } from "./styles";

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
}: Readonly<{
  markdown: string;
  onMarkdownChange: (markdown: string) => void;
  onSelectionChange: (selection: EditorSelectionSnapshot) => void;
}>) {
  const editor = useRichMarkdownEditor({ markdown, onMarkdownChange, onSelectionChange });

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
}: Readonly<{
  markdown: string;
  onMarkdownChange: (markdown: string) => void;
  onSelectionChange: (selection: EditorSelectionSnapshot) => void;
}>) {
  const editor = useEditor(
    createRichEditorOptions(markdown, {
      onMarkdownChange,
      onSelectionChange,
    }),
  );

  useEffect(() => {
    if (!editor || markdown === readEditorMarkdown(editor)) return;

    writeEditorMarkdown(editor, markdown);
  }, [editor, markdown]);

  return editor;
}

function createRichEditorOptions(
  markdown: string,
  handlers: Readonly<{
    onMarkdownChange: (markdown: string) => void;
    onSelectionChange: (selection: EditorSelectionSnapshot) => void;
  }>,
) {
  return {
    extensions: createRichEditorExtensions(),
    content: markdown,
    immediatelyRender: false,
    editorProps: { attributes: createRichEditorAttributes() },
    onUpdate: ({ editor }: { editor: Editor }) => publishRichMarkdown(editor, handlers),
    onSelectionUpdate: ({ editor }: { editor: Editor }) => publishRichSelection(editor, handlers),
  };
}

function createRichEditorExtensions() {
  return [
    StarterKit.configure({ undoRedo: false, link: false }),
    Link.configure({ autolink: true, openOnClick: false }),
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
    class: "tiptap-rich-editor",
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
  const setContent = editor.commands.setContent as MarkdownSetContent;
  setContent(markdown, {
    contentType: "markdown",
    emitUpdate: false,
  });
}
