import { HocuspocusProvider } from "@hocuspocus/provider";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCaret from "@tiptap/extension-collaboration-caret";
import Link from "@tiptap/extension-link";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useEffect, useState } from "react";
import * as Y from "yjs";

import type { CollaborationSessionDto, RealtimeMemberDto } from "@rme/contracts";

import { createMockApiClient, fetchCollaborationSession } from "@/lib/api-client";

import type {
  CollaborationAdapter,
  CollaborationDocumentOptions,
  CollaborationDocumentState,
} from "../ports/collaboration-adapter";

export const tiptapYjsCollaborationProviderName = "features.editor.collaboration.tiptap-yjs";

type TiptapYjsRuntime = Readonly<{
  document: Y.Doc;
  markdown: Y.Text;
  provider: HocuspocusProvider;
  extensions: readonly unknown[];
  destroy: () => void;
}>;

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
  const updateMarkdown = useYTextUpdate(runtime, setMarkdown);

  return {
    markdown,
    updateMarkdown,
    syncStatus: createSyncStatus(options, session, runtime),
    presence: options.initialPresence,
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
    const member = readRouteMember();
    const session = await fetchCollaborationSession(createMockApiClient(), documentId, member);
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

function createRuntime(session: CollaborationSessionDto): TiptapYjsRuntime {
  const document = new Y.Doc();
  const markdown = document.getText("markdown");
  const provider = createProvider(session, document);
  const member = findCurrentMember(session);
  const extensions = createExtensions(document, provider, member);

  return {
    document,
    markdown,
    provider,
    extensions,
    destroy: () => destroyRuntime(provider, document),
  };
}

function createProvider(session: CollaborationSessionDto, document: Y.Doc) {
  return new HocuspocusProvider({
    url: session.realtimeUrl,
    name: session.documentKey,
    document,
  });
}

function createExtensions(
  document: Y.Doc,
  provider: HocuspocusProvider,
  member: RealtimeMemberDto,
) {
  return [
    StarterKit.configure({ undoRedo: false }),
    Link.configure({ openOnClick: false }),
    Collaboration.configure({ document }),
    CollaborationCaret.configure({
      provider,
      user: { id: member.id, name: member.displayName, color: member.color },
    }),
  ];
}

function findCurrentMember(session: CollaborationSessionDto): RealtimeMemberDto {
  const member = session.members.find((candidate) => candidate.id === session.currentMemberId);

  if (!member) {
    throw new Error("Collaboration session must include the current member");
  }

  return member;
}

function createSyncStatus(
  options: CollaborationDocumentOptions,
  session: CollaborationSessionDto | null,
  runtime: TiptapYjsRuntime | null,
) {
  if (!session) {
    return options.initialSyncStatus;
  }

  return {
    label: runtime ? "Realtime" : options.initialSyncStatus.label,
    detail: runtime ? `Realtime document ${session.documentKey}` : "Waiting for session",
    pendingEdits: runtime?.provider.unsyncedChanges ?? options.initialSyncStatus.pendingEdits,
  };
}

function replaceYText(markdown: Y.Text, nextMarkdown: string) {
  const currentMarkdown = markdown.toString();
  if (currentMarkdown === nextMarkdown) return;

  const prefixLength = commonPrefixLength(currentMarkdown, nextMarkdown);
  const suffixLength = commonSuffixLength(currentMarkdown, nextMarkdown, prefixLength);
  const deleteLength = currentMarkdown.length - prefixLength - suffixLength;
  const insertText = nextMarkdown.slice(prefixLength, nextMarkdown.length - suffixLength);

  if (deleteLength > 0) markdown.delete(prefixLength, deleteLength);
  if (insertText.length > 0) markdown.insert(prefixLength, insertText);
}

function commonPrefixLength(left: string, right: string): number {
  const maxLength = Math.min(left.length, right.length);
  let index = 0;
  while (index < maxLength && left[index] === right[index]) index += 1;
  return index;
}

function commonSuffixLength(left: string, right: string, prefixLength: number): number {
  const maxLength = Math.min(left.length, right.length) - prefixLength;
  let length = 0;
  while (
    length < maxLength &&
    left[left.length - 1 - length] === right[right.length - 1 - length]
  ) {
    length += 1;
  }
  return length;
}

function readRouteMember(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("member");
}

function destroyRuntime(provider: HocuspocusProvider, document: Y.Doc) {
  provider.destroy();
  document.destroy();
}
