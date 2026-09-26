import { useEffect, useState, useSyncExternalStore } from "react";
import type * as Y from "yjs";

import type { TypeModule } from "./document";
import type { DocumentEntry, LocalWorkspace } from "./local-workspace";

export function useDocumentList(workspace: LocalWorkspace): DocumentEntry[] {
  return useSyncExternalStore(workspace.subscribe, workspace.list);
}

export function useOpenDocument(workspace: LocalWorkspace, id: string | null): Y.Doc | null {
  const [opened, setOpened] = useState<{ id: string; doc: Y.Doc } | null>(null);
  useEffect(() => {
    if (!id) return undefined;
    let active = true;
    void workspace.openDocument(id).then((doc) => {
      if (active) setOpened({ id, doc });
    });
    return () => {
      active = false;
    };
  }, [workspace, id]);
  // A document that is still opening is reported as null, never as the previous one.
  return opened && opened.id === id ? opened.doc : null;
}

// Core does not know the content root, so it listens to every document update and lets the type
// module project the title.
export function useDocumentTitle(doc: Y.Doc | null, module: TypeModule): string {
  return useSyncExternalStore(
    (onChange) => {
      if (!doc) return () => undefined;
      doc.on("update", onChange);
      return () => doc.off("update", onChange);
    },
    () => (doc ? titleSnapshot(doc, module) : ""),
  );
}

// Parsing runs only when the text changed, not on every render.
const titles = new WeakMap<Y.Doc, { text: string; title: string }>();

function titleSnapshot(doc: Y.Doc, module: TypeModule): string {
  const text = module.toText(doc);
  const cached = titles.get(doc);
  if (cached?.text === text) return cached.title;
  const title = module.title(doc);
  titles.set(doc, { text, title });
  return title;
}
