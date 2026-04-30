import { useCallback, useEffect, useState } from "react";

import type { CollaborationSessionDto } from "@rme/contracts";

import type {
  CollaborationAdapter,
  CollaborationDocumentOptions,
  CollaborationDocumentState,
} from "../ports/collaboration-adapter";
import { useAwarenessPresence, useAwarenessSelectionUpdate } from "./tiptap-yjs-awareness";
import { resolveRouteCollaborationSession } from "./tiptap-yjs-route-session";
import { createRuntime, replaceYText, type TiptapYjsRuntime } from "./tiptap-yjs-runtime";
import {
  createRealtimeSyncStatus,
  type RuntimeSyncSnapshot,
  useRuntimeSyncSnapshot,
} from "./tiptap-yjs-sync-status";

export const tiptapYjsCollaborationProviderName = "features.editor.collaboration.tiptap-yjs";

export function createTiptapYjsCollaborationAdapter(): CollaborationAdapter {
  return {
    providerName: tiptapYjsCollaborationProviderName,
    useDocument: useTiptapYjsDocument,
  };
}

function useTiptapYjsDocument(options: CollaborationDocumentOptions): CollaborationDocumentState {
  const [runtime, setRuntime] = useState<TiptapYjsRuntime | null>(null);
  const [session, setSession] = useState<CollaborationSessionDto | null>(options.session ?? null);
  const [markdown, setMarkdown] = useState(options.initialMarkdown);
  useCollaborationSession(options, setSession);
  useTiptapYjsRuntime(session, setRuntime);
  useYTextState(runtime, options.initialMarkdown, setMarkdown);
  const syncSnapshot = useRuntimeSyncSnapshot(runtime);
  const presence = useAwarenessPresence(session, runtime, options.initialPresence);
  const updateMarkdown = useYTextUpdate(runtime, setMarkdown);
  const updateSelection = useAwarenessSelectionUpdate(session, runtime);

  return {
    markdown,
    updateMarkdown,
    updateSelection,
    editorExtensions: runtime?.extensions,
    bootstrapMarkdown: createBootstrapMarkdown(runtime, syncSnapshot, markdown),
    syncStatus: createSyncStatus(options, session, runtime, syncSnapshot),
    presence,
    providerName: tiptapYjsCollaborationProviderName,
  };
}

function useCollaborationSession(
  options: CollaborationDocumentOptions,
  setSession: (session: CollaborationSessionDto | null) => void,
) {
  const { documentId, session: initialSession } = options;

  useEffect(() => {
    const abortController = new AbortController();
    void resolveCollaborationSession(
      documentId,
      initialSession ?? null,
      abortController.signal,
      setSession,
    );
    return () => abortController.abort();
  }, [documentId, initialSession, setSession]);
}

async function resolveCollaborationSession(
  documentId: string,
  initialSession: CollaborationSessionDto | null,
  signal: AbortSignal,
  setSession: (session: CollaborationSessionDto | null) => void,
) {
  try {
    const session = await resolveRouteCollaborationSession(documentId, initialSession);
    if (!signal.aborted) setSession(session);
  } catch {
    if (!signal.aborted) setSession(initialSession);
  }
}

function useTiptapYjsRuntime(
  session: CollaborationSessionDto | null,
  setRuntime: (runtime: TiptapYjsRuntime | null) => void,
) {
  useEffect(() => {
    if (!session) {
      setRuntime(null);
      return undefined;
    }

    const runtime = createRuntime(session);
    setRuntime(runtime);

    return () => runtime.destroy();
  }, [session, setRuntime]);
}

function useYTextState(
  runtime: TiptapYjsRuntime | null,
  initialMarkdown: string,
  setMarkdown: (markdown: string) => void,
) {
  useEffect(() => {
    if (!runtime) {
      setMarkdown(initialMarkdown);
      return undefined;
    }

    const updateMarkdown = () => setMarkdown(runtime.markdown.toString());
    runtime.markdown.observe(updateMarkdown);
    updateMarkdown();

    return () => runtime.markdown.unobserve(updateMarkdown);
  }, [initialMarkdown, runtime, setMarkdown]);
}

function useYTextUpdate(runtime: TiptapYjsRuntime | null, setMarkdown: (markdown: string) => void) {
  return useCallback(
    (nextMarkdown: string) => {
      setMarkdown(nextMarkdown);
      if (!runtime) return;
      runtime.markdown.doc?.transact(() => replaceYText(runtime.markdown, nextMarkdown));
    },
    [runtime, setMarkdown],
  );
}

function createSyncStatus(
  options: CollaborationDocumentOptions,
  session: CollaborationSessionDto | null,
  runtime: TiptapYjsRuntime | null,
  syncSnapshot: RuntimeSyncSnapshot,
) {
  if (!session) {
    return options.initialSyncStatus;
  }

  return createRealtimeSyncStatus(session.documentKey, runtime, syncSnapshot);
}

function createBootstrapMarkdown(
  runtime: TiptapYjsRuntime | null,
  syncSnapshot: RuntimeSyncSnapshot,
  markdown: string,
): string | undefined {
  if (!runtime || !syncSnapshot.providerSynced) return undefined;
  const bootstrapMarkdown = markdown.trim().length > 0 ? markdown : "";
  return bootstrapMarkdown.length > 0 ? markdown : undefined;
}
