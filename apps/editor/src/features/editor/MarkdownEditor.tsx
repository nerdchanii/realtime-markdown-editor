import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { useEffect, useRef } from "react";
import { yCollab, yUndoManagerKeymap } from "y-codemirror.next";
import * as Y from "yjs";

import { livePreview } from "../../types/markdown/live-preview";
import { markdownContent } from "../../types/markdown/module";

import "./editor-content.css";

interface MarkdownEditorProps {
  doc: Y.Doc;
}

// CodeMirror 6 bound to the document's `content` Y.Text. Local slice: no awareness yet, so no remote
// cursors; slice 2 passes the provider's awareness here.
export function MarkdownEditor({ doc }: MarkdownEditorProps) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!host.current) return undefined;
    const text = markdownContent(doc);
    const undoManager = new Y.UndoManager(text);
    const view = new EditorView({
      parent: host.current,
      state: EditorState.create({
        doc: text.toString(),
        extensions: [
          keymap.of([...yUndoManagerKeymap, ...defaultKeymap, indentWithTab]),
          markdown({ base: markdownLanguage }),
          EditorView.lineWrapping,
          EditorView.contentAttributes.of({ "aria-label": "문서 본문" }),
          livePreview,
          yCollab(text, null, { undoManager }),
        ],
      }),
    });
    view.focus();
    return () => {
      view.destroy();
      undoManager.destroy();
    };
  }, [doc]);

  return <div className="markdown-editor" ref={host} />;
}
