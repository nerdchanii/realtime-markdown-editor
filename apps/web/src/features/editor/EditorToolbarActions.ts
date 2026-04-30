import type { Editor } from "@tiptap/core";
import { useCallback, useRef, useState, type ChangeEvent, type RefObject } from "react";

import { createMockApiClient, uploadDocumentImage } from "@/lib/api-client";

export type EditorRef = RefObject<Editor | null>;
export type EditorCommand = (editor: Editor) => boolean;
export type RunEditorCommand = (command: EditorCommand) => void;

export function useEditorToolbarActions({
  editorRef,
  documentId,
}: Readonly<{ editorRef: EditorRef; documentId: string }>) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imageStatus, setImageStatus] = useState("");
  const runCommand = useCallback(
    (command: EditorCommand) => runEditorCommand(editorRef.current, command),
    [editorRef],
  );
  const handleLink = useCallback(() => handleEditorLink(editorRef.current), [editorRef]);
  const handleImageFile = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = takeSelectedFile(event);
      void uploadAndInsertImage({ file, editor: editorRef.current, documentId, setImageStatus });
    },
    [documentId, editorRef],
  );

  return { runCommand, handleLink, imageInputRef, handleImageFile, imageStatus };
}

export function undo(editor: Editor) {
  return editor.chain().focus().undo().run();
}

export function redo(editor: Editor) {
  return editor.chain().focus().redo().run();
}

export function h1(editor: Editor) {
  return editor.chain().focus().toggleHeading({ level: 1 }).run();
}

export function bullet(editor: Editor) {
  return editor.chain().focus().toggleBulletList().run();
}

export function ordered(editor: Editor) {
  return editor.chain().focus().toggleOrderedList().run();
}

export function task(editor: Editor) {
  return editor.chain().focus().insertContent("- [ ] ").run();
}

export function code(editor: Editor) {
  return editor.chain().focus().toggleCode().run();
}

export function codeBlock(editor: Editor) {
  return editor.chain().focus().toggleCodeBlock().run();
}

function runEditorCommand(editor: Editor | null, command: EditorCommand) {
  if (!editor) return;
  command(editor);
}

function handleEditorLink(editor: Editor | null) {
  if (!editor) return;
  if (editor.isActive("link")) {
    editor.chain().focus().unsetLink().run();
    return;
  }

  const href = window.prompt("Link URL");
  if (href) editor.chain().focus().setLink({ href }).run();
}

function takeSelectedFile(event: ChangeEvent<HTMLInputElement>) {
  const file = event.currentTarget.files?.[0] ?? null;
  event.currentTarget.value = "";
  return file;
}

async function uploadAndInsertImage(input: {
  file: File | null;
  editor: Editor | null;
  documentId: string;
  setImageStatus: (status: string) => void;
}) {
  if (!input.file || !input.editor) return;

  input.setImageStatus("Uploading image");
  try {
    const image = await uploadDocumentImage(createMockApiClient(), input.documentId, {
      file: input.file,
      altText: altTextFromFilename(input.file.name),
    });
    input.editor.chain().focus().insertContent(image.markdownImage).run();
    input.setImageStatus("Image inserted");
  } catch {
    input.setImageStatus("Image upload failed");
  }
}

function altTextFromFilename(filename: string): string {
  return (
    filename
      .replace(/\.[^.]+$/, "")
      .replace(/[-_]+/g, " ")
      .trim() || "Image"
  );
}
