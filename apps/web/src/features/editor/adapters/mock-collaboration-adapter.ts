import { useCallback, useEffect, useMemo, useState } from "react";

import type {
  CollaborationAdapter,
  CollaborationDocumentOptions,
  CollaborationDocumentState,
} from "../ports/collaboration-adapter";

export const mockCollaborationProviderName = "features.editor.collaboration.mock";

export const mockCollaborationAdapter: CollaborationAdapter = {
  providerName: mockCollaborationProviderName,
  useDocument: useMockMarkdownDocument,
};

export function createMockCollaborationAdapter(): CollaborationAdapter {
  return mockCollaborationAdapter;
}

export function useMockMarkdownDocument({
  documentId,
  initialMarkdown,
  initialPresence,
  initialSyncStatus,
}: CollaborationDocumentOptions): CollaborationDocumentState {
  const storageKey = useMemo(() => `rme:mock-markdown:${documentId}`, [documentId]);
  const channelName = useMemo(() => `rme:mock-markdown:${documentId}:channel`, [documentId]);
  const [markdown, setMarkdown] = useState(() => readStoredMarkdown(storageKey, initialMarkdown));
  useStorageSync(storageKey, setMarkdown);
  useChannelSync(channelName, setMarkdown);

  const updateMarkdown = useCallback(
    (nextMarkdown: string) => {
      setMarkdown(nextMarkdown);
      persistMarkdown(storageKey, channelName, nextMarkdown);
    },
    [channelName, storageKey],
  );

  return {
    markdown,
    updateMarkdown,
    updateSelection: () => undefined,
    syncStatus: initialSyncStatus,
    presence: initialPresence,
    providerName: mockCollaborationProviderName,
  };
}

function useStorageSync(storageKey: string, setMarkdown: (markdown: string) => void) {
  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === storageKey && event.newValue !== null) {
        setMarkdown(event.newValue);
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, [setMarkdown, storageKey]);
}

function useChannelSync(channelName: string, setMarkdown: (markdown: string) => void) {
  useEffect(() => {
    if (!canUseBroadcastChannel()) {
      return undefined;
    }

    const channel = new BroadcastChannel(channelName);
    channel.onmessage = (event: MessageEvent<string>) => setMarkdown(event.data);

    return () => channel.close();
  }, [channelName, setMarkdown]);
}

function readStoredMarkdown(storageKey: string, fallback: string) {
  if (typeof window === "undefined") {
    return fallback;
  }

  return window.localStorage.getItem(storageKey) ?? fallback;
}

function persistMarkdown(storageKey: string, channelName: string, markdown: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(storageKey, markdown);
  publishMarkdown(channelName, markdown);
}

function publishMarkdown(channelName: string, markdown: string) {
  if (!canUseBroadcastChannel()) {
    return;
  }

  const channel = new BroadcastChannel(channelName);
  channel.postMessage(markdown);
  channel.close();
}

function canUseBroadcastChannel() {
  return typeof BroadcastChannel !== "undefined";
}
