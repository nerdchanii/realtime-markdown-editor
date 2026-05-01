import type { Editor } from "@tiptap/react";
import { useCurrentEditor, useEditorState } from "@tiptap/react";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

function getActivePageEditor(editor: Editor): Editor | null {
  const storage = editor.storage as unknown as Record<string, unknown>;
  const pages = storage.pages as { activeEditor?: Editor | null } | undefined;
  if (!pages || !("activeEditor" in pages)) return null;
  return pages.activeEditor ?? null;
}

export function useTiptapEditor(providedEditor?: Editor | null): {
  editor: Editor | null;
  editorState?: Editor["state"] | undefined;
  canCommand?: Editor["can"] | undefined;
} {
  const { editor: coreEditor } = useCurrentEditor();
  const mainEditor = providedEditor ?? coreEditor;
  const activePageEditor = useActivePageEditor(mainEditor);
  const [destroyedEditor, setDestroyedEditor] = useState<Editor | null>(null);
  const storageEditor = activePageEditor === destroyedEditor ? null : activePageEditor;

  useEffect(() => {
    if (!storageEditor) return;

    const handleDestroy = () => setDestroyedEditor(storageEditor);

    storageEditor.on("destroy", handleDestroy);
    return () => {
      storageEditor.off("destroy", handleDestroy);
    };
  }, [storageEditor]);

  const editorState = useEditorState({
    editor: storageEditor ?? mainEditor,
    selector(context) {
      if (!context.editor) {
        return { editor: null, editorState: undefined, canCommand: undefined };
      }

      return {
        editor: context.editor,
        editorState: context.editor.state,
        canCommand: context.editor.can,
      };
    },
  });

  return editorState ?? { editor: null };
}

function useActivePageEditor(mainEditor: Editor | null): Editor | null {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!mainEditor) return () => {};
      mainEditor.on("update", onStoreChange);
      mainEditor.on("selectionUpdate", onStoreChange);
      return () => {
        mainEditor.off("update", onStoreChange);
        mainEditor.off("selectionUpdate", onStoreChange);
      };
    },
    [mainEditor],
  );
  const getSnapshot = useCallback(() => {
    return mainEditor ? getActivePageEditor(mainEditor) : null;
  }, [mainEditor]);

  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}
