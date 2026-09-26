import { useEffect, useState, useSyncExternalStore } from "react";
import type * as Y from "yjs";

import { metaMap, readMeta, type DocumentMeta } from "./document";
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

export function useDocumentMeta(doc: Y.Doc | null): DocumentMeta | null {
  return useSyncExternalStore(
    (onChange) => {
      if (!doc) return () => undefined;
      const meta = metaMap(doc);
      meta.observe(onChange);
      return () => meta.unobserve(onChange);
    },
    () => (doc ? metaSnapshot(doc) : null),
  );
}

// useSyncExternalStore needs a stable snapshot between changes.
const snapshots = new WeakMap<Y.Doc, { key: string; meta: DocumentMeta | null }>();

function metaSnapshot(doc: Y.Doc): DocumentMeta | null {
  const meta = readMeta(doc);
  const key = JSON.stringify(meta);
  const cached = snapshots.get(doc);
  if (cached?.key === key) return cached.meta;
  snapshots.set(doc, { key, meta });
  return meta;
}
