import { HocuspocusProvider } from "@hocuspocus/provider";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCaret from "@tiptap/extension-collaboration-caret";
import Link from "@tiptap/extension-link";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useState } from "react";
import * as Y from "yjs";

import type { CollaborationSessionDto, RealtimeMemberDto } from "@rme/contracts";

import type {
  CollaborationAdapter,
  CollaborationDocumentOptions,
  CollaborationDocumentState,
} from "../ports/collaboration-adapter";

export const tiptapYjsCollaborationProviderName = "features.editor.collaboration.tiptap-yjs";

type TiptapYjsRuntime = Readonly<{
  document: Y.Doc;
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
  useTiptapYjsRuntime(options, setRuntime);

  return {
    markdown: options.initialMarkdown,
    updateMarkdown: noop,
    syncStatus: createSyncStatus(options, runtime),
    presence: options.initialPresence,
    providerName: tiptapYjsCollaborationProviderName,
  };
}

function useTiptapYjsRuntime(
  options: CollaborationDocumentOptions,
  setRuntime: (runtime: TiptapYjsRuntime | null) => void,
) {
  const { session } = options;

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

function createRuntime(session: CollaborationSessionDto): TiptapYjsRuntime {
  const document = new Y.Doc();
  const provider = createProvider(session, document);
  const member = findCurrentMember(session);
  const extensions = createExtensions(document, provider, member);

  return {
    document,
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

function createSyncStatus(options: CollaborationDocumentOptions, runtime: TiptapYjsRuntime | null) {
  if (!options.session) {
    return options.initialSyncStatus;
  }

  return {
    label: runtime ? "Connecting" : options.initialSyncStatus.label,
    detail: runtime ? `Realtime document ${options.session.documentKey}` : "Waiting for session",
    pendingEdits: runtime?.provider.unsyncedChanges ?? options.initialSyncStatus.pendingEdits,
  };
}

function destroyRuntime(provider: HocuspocusProvider, document: Y.Doc) {
  provider.destroy();
  document.destroy();
}

function noop() {
  return undefined;
}
