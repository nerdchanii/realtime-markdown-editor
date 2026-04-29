import { useCallback, useEffect, useMemo, useState } from "react";

type MockMarkdownDocumentOptions = Readonly<{
  documentId: string;
  initialMarkdown: string;
}>;

export function useMockMarkdownDocument({
  documentId,
  initialMarkdown,
}: MockMarkdownDocumentOptions) {
  const storageKey = useMemo(() => `rme:mock-markdown:${documentId}`, [documentId]);
  const channelName = useMemo(() => `rme:mock-markdown:${documentId}:channel`, [documentId]);
  const [markdown, setMarkdown] = useState(() => readStoredMarkdown(storageKey, initialMarkdown));
  useStorageSync(storageKey, setMarkdown);
  useChannelSync(channelName, setMarkdown);

  const updateMarkdown = useCallback(
    (nextMarkdown: string) => {
      setMarkdown(nextMarkdown);
      window.localStorage.setItem(storageKey, nextMarkdown);
      publishMarkdown(channelName, nextMarkdown);
    },
    [channelName, storageKey],
  );

  return { markdown, updateMarkdown };
}

function useStorageSync(storageKey: string, setMarkdown: (markdown: string) => void) {
  useEffect(() => {
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
    const channel = new BroadcastChannel(channelName);
    channel.onmessage = (event: MessageEvent<string>) => {
      setMarkdown(event.data);
    };

    return () => channel.close();
  }, [channelName, setMarkdown]);
}

function readStoredMarkdown(storageKey: string, fallback: string) {
  if (typeof window === "undefined") {
    return fallback;
  }

  return window.localStorage.getItem(storageKey) ?? fallback;
}

function publishMarkdown(channelName: string, markdown: string) {
  const channel = new BroadcastChannel(channelName);
  channel.postMessage(markdown);
  channel.close();
}
