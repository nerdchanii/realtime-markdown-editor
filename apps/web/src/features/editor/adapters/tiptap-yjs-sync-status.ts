import { WebSocketStatus, type HocuspocusProvider } from "@hocuspocus/provider";
import { useEffect, useState } from "react";

export type RuntimeSyncSource = Readonly<{
  provider: HocuspocusProvider;
}>;

export type RuntimeSyncSnapshot = Readonly<{
  browserOnline: boolean;
  providerStatus: WebSocketStatus;
  providerSynced: boolean;
  pendingLocalEdits: number;
}>;

export function useRuntimeSyncSnapshot(runtime: RuntimeSyncSource | null): RuntimeSyncSnapshot {
  const [syncSnapshot, setSyncSnapshot] = useState(() => createRuntimeSyncSnapshot(runtime));

  useEffect(() => {
    if (!runtime) return undefined;

    const provider = runtime.provider;
    const updateSyncSnapshot = () => setSyncSnapshot(createRuntimeSyncSnapshot(runtime));
    const handleOnline = () => {
      updateSyncSnapshot();
      void provider.connect();
    };

    subscribeToProvider(provider, updateSyncSnapshot);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", updateSyncSnapshot);
    queueMicrotask(updateSyncSnapshot);

    return () => {
      unsubscribeFromProvider(provider, updateSyncSnapshot);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", updateSyncSnapshot);
    };
  }, [runtime]);

  if (!runtime) return createRuntimeSyncSnapshot(null);

  return syncSnapshot;
}

export function createRealtimeSyncStatus(
  documentKey: string,
  runtime: RuntimeSyncSource | null,
  syncSnapshot: RuntimeSyncSnapshot,
) {
  const { browserOnline, pendingLocalEdits, providerStatus, providerSynced } = syncSnapshot;

  if (!browserOnline) return createOfflineStatus(pendingLocalEdits);
  if (providerStatus === WebSocketStatus.Connecting) {
    return createReconnectingStatus(documentKey, pendingLocalEdits);
  }
  if (providerStatus === WebSocketStatus.Disconnected || !runtime) {
    return createDisconnectedStatus(documentKey, pendingLocalEdits);
  }
  if (pendingLocalEdits > 0) return createPendingStatus(documentKey, pendingLocalEdits);

  return {
    label: providerSynced ? "Synced" : "Realtime",
    detail: `Realtime document ${documentKey}`,
    pendingEdits: 0,
  };
}

function createRuntimeSyncSnapshot(runtime: RuntimeSyncSource | null): RuntimeSyncSnapshot {
  return {
    browserOnline: readBrowserOnline(),
    providerStatus:
      runtime?.provider.configuration.websocketProvider.status ?? WebSocketStatus.Disconnected,
    providerSynced: runtime?.provider.synced ?? false,
    pendingLocalEdits: runtime?.provider.unsyncedChanges ?? 0,
  };
}

function createOfflineStatus(pendingLocalEdits: number) {
  return {
    label: "Offline",
    detail:
      pendingLocalEdits > 0 ? "Open page is preserving local edits" : "Open page is disconnected",
    pendingEdits: pendingLocalEdits,
  };
}

function createReconnectingStatus(documentKey: string, pendingLocalEdits: number) {
  return {
    label: pendingLocalEdits > 0 ? "Pending local changes" : "Reconnecting",
    detail: `Reconnecting to ${documentKey}`,
    pendingEdits: pendingLocalEdits,
  };
}

function createDisconnectedStatus(documentKey: string, pendingLocalEdits: number) {
  return {
    label: "Reconnecting",
    detail: `Waiting for realtime document ${documentKey}`,
    pendingEdits: pendingLocalEdits,
  };
}

function createPendingStatus(documentKey: string, pendingLocalEdits: number) {
  return {
    label: "Pending local changes",
    detail: `Merging with realtime document ${documentKey}`,
    pendingEdits: pendingLocalEdits,
  };
}

function subscribeToProvider(provider: HocuspocusProvider, listener: () => void) {
  provider.on("status", listener);
  provider.on("synced", listener);
  provider.on("unsyncedChanges", listener);
  provider.on("disconnect", listener);
  provider.on("connect", listener);
}

function unsubscribeFromProvider(provider: HocuspocusProvider, listener: () => void) {
  provider.off("status", listener);
  provider.off("synced", listener);
  provider.off("unsyncedChanges", listener);
  provider.off("disconnect", listener);
  provider.off("connect", listener);
}

function readBrowserOnline() {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}
