import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import yorkie, {
  Client,
  DocSyncStatus,
  StreamConnectionStatus,
  type Document as YorkieDocument,
  type Unsubscribe,
} from '@yorkie-js/sdk';
import { EditorState, Plugin } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { remoteSelectionPlugin, YorkieProseMirrorBinding } from '@yorkie-js/prosemirror';
import type { MemberIdentity } from '../collaboration/identity';
import { buildCheckpoint, sortCheckpointsNewestFirst, type Checkpoint } from '../collaboration/checkpoints';
import type { PresencePeer, PresenceState, YorkieRoot } from '../collaboration/types';
import { renderMarkdown } from '../markdown/renderMarkdown';
import { viewModes, type ViewMode } from '../ui/viewModes';
import { editorPlugins, toolbarCommands } from './editorCommands';
import {
  editorSchema,
  initialMarkdown,
  parseMarkdownToDoc,
  serializeDocToMarkdown,
} from './markdownDocument';

type ConnectionStatus = 'connecting' | 'online' | 'offline' | 'reconnecting' | 'error';
type SyncStatus = 'idle' | 'synced' | 'sync-failed' | 'pending';

type CollaborativeEditorProps = {
  documentKey: string;
  member: MemberIdentity;
  mode: ViewMode;
  peerUrl: string;
  onModeChange: (mode: ViewMode) => void;
};

const yorkieRpcAddr = import.meta.env.VITE_YORKIE_RPC_ADDR ?? 'http://localhost:8080';

declare global {
  interface Window {
    __pocInsertTextAfterAnchor?: (anchorText: string, text: string) => boolean;
  }
}

function insertTextAfterAnchor(view: EditorView, anchorText: string, text: string) {
  let insertAt: number | null = null;

  view.state.doc.descendants((node, position) => {
    if (insertAt !== null || !node.isText || !node.text) {
      return insertAt === null;
    }

    const anchorOffset = node.text.indexOf(anchorText);
    if (anchorOffset === -1) {
      return true;
    }

    insertAt = position + anchorOffset + anchorText.length;
    return false;
  });

  if (insertAt === null) {
    return false;
  }

  view.dispatch(view.state.tr.insertText(` ${text}`, insertAt).scrollIntoView());
  view.focus();
  return true;
}

export function CollaborativeEditor({
  documentKey,
  member,
  mode,
  peerUrl,
  onModeChange,
}: CollaborativeEditorProps) {
  const editorMountRef = useRef<HTMLDivElement | null>(null);
  const editorWrapperRef = useRef<HTMLDivElement | null>(null);
  const cursorOverlayRef = useRef<HTMLDivElement | null>(null);
  const sourceApplyingRef = useRef(false);
  const viewRef = useRef<EditorView | null>(null);
  const bindingRef = useRef<YorkieProseMirrorBinding | null>(null);
  const clientRef = useRef<Client | null>(null);
  const docRef = useRef<YorkieDocument<YorkieRoot, PresenceState> | null>(null);

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [peers, setPeers] = useState<PresencePeer[]>([]);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [checkpointMessage, setCheckpointMessage] = useState('Before review pass');
  const [selectedCheckpointId, setSelectedCheckpointId] = useState<string | null>(null);
  const [logLines, setLogLines] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const previewHtml = useMemo(() => renderMarkdown(markdown), [markdown]);
  const selectedCheckpoint = checkpoints.find((checkpoint) => checkpoint.id === selectedCheckpointId);

  const refreshCheckpoints = useCallback(() => {
    const root = docRef.current?.getRoot();
    const rootCheckpoints = Array.isArray(root?.checkpoints) ? [...root.checkpoints] : [];
    setCheckpoints(sortCheckpointsNewestFirst(rootCheckpoints));
  }, []);

  const refreshPresence = useCallback(() => {
    const presences = docRef.current?.getPresences() ?? [];
    setPeers(
      presences
        .filter((entry): entry is PresencePeer => Boolean(entry.presence?.memberId))
        .sort((left, right) => left.presence.name.localeCompare(right.presence.name)),
    );
  }, []);

  const appendLog = useCallback((line: string) => {
    setLogLines((current) => [line, ...current].slice(0, 6));
  }, []);

  const syncCurrentDocument = useCallback(async () => {
    const client = clientRef.current;
    const doc = docRef.current;

    if (!client || !doc) {
      return;
    }

    setSyncStatus('pending');

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        await client.sync(doc);
        setSyncStatus('synced');
        setHasPendingChanges(doc.hasLocalChanges());
        setConnectionStatus('online');
        setError(null);
        return;
      } catch (syncError) {
        if (attempt === 2) {
          setSyncStatus('sync-failed');
          setConnectionStatus(navigator.onLine ? 'reconnecting' : 'offline');
          setError(syncError instanceof Error ? syncError.message : String(syncError));
          return;
        }

        await new Promise((resolve) => {
          window.setTimeout(resolve, 300);
        });
      }
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setConnectionStatus('reconnecting');
      void syncCurrentDocument();
    };
    const handleOffline = () => {
      setConnectionStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncCurrentDocument]);

  useEffect(() => {
    const mount = editorMountRef.current;
    const wrapper = editorWrapperRef.current;
    const overlay = cursorOverlayRef.current;

    if (!mount || !wrapper || !overlay) {
      return undefined;
    }

    let disposed = false;
    const unsubscribes: Unsubscribe[] = [];

    async function connect() {
      setConnectionStatus('connecting');
      setError(null);

      try {
        const client = new yorkie.Client({
          rpcAddr: yorkieRpcAddr,
          key: `${member.id}-${globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36)}`,
          metadata: {
            memberId: member.id,
            name: member.name,
          },
        });

        await client.activate();

        if (disposed) {
          await client.deactivate();
          return;
        }

        const doc = new yorkie.Document<YorkieRoot, PresenceState>(documentKey);
        await client.attach(doc, {
          initialRoot: {
            checkpoints: [],
          },
          initialPresence: {
            memberId: member.id,
            name: member.name,
            color: member.color,
            role: member.role,
            mode,
          },
        });

        if (disposed) {
          await client.detach(doc);
          await client.deactivate();
          return;
        }

        clientRef.current = client;
        docRef.current = doc;

        const view = new EditorView(mount, {
          state: EditorState.create({
            doc: parseMarkdownToDoc(initialMarkdown),
            schema: editorSchema,
            plugins: [
              ...editorPlugins,
              remoteSelectionPlugin(),
              new Plugin({
                view: () => ({
                  update(currentView, previousState) {
                    if (previousState.doc.eq(currentView.state.doc)) {
                      return;
                    }

                    setMarkdown(serializeDocToMarkdown(currentView.state.doc));
                  },
                }),
              }),
            ],
          }),
          dispatchTransaction(transaction) {
            const nextState = view.state.apply(transaction);
            view.updateState(nextState);
            if (!sourceApplyingRef.current) {
              setMarkdown(serializeDocToMarkdown(nextState.doc));
            }
            setHasPendingChanges(doc.hasLocalChanges());
          },
        });

        viewRef.current = view;
        window.__pocInsertTextAfterAnchor = (anchorText, text) => insertTextAfterAnchor(view, anchorText, text);

        const binding = new YorkieProseMirrorBinding(view, doc, 'tree', {
          client,
          cursors: {
            enabled: true,
            overlayElement: overlay as HTMLElement,
            wrapperElement: wrapper as HTMLElement,
            colors: ['#0969da', '#1a7f37', '#bf8700', '#8250df', '#cf222e'],
          },
          onLog: (type, message) => appendLog(`${type}: ${message}`),
        });

        binding.initialize();
        bindingRef.current = binding;

        unsubscribes.push(
          doc.subscribe(() => {
            setHasPendingChanges(doc.hasLocalChanges());
            refreshCheckpoints();
          }),
          doc.subscribe('presence', refreshPresence),
          doc.subscribe('others', refreshPresence),
          doc.subscribe('connection', (event) => {
            setConnectionStatus(
              event.value === StreamConnectionStatus.Connected ? 'online' : 'reconnecting',
            );
          }),
          doc.subscribe('sync', (event) => {
            setSyncStatus(event.value === DocSyncStatus.Synced ? 'synced' : 'sync-failed');
            setHasPendingChanges(doc.hasLocalChanges());
          }),
        );

        refreshPresence();
        refreshCheckpoints();
        setConnectionStatus('online');
        await client.sync(doc);
      } catch (connectError) {
        setConnectionStatus(navigator.onLine ? 'error' : 'offline');
        setSyncStatus('sync-failed');
        setError(connectError instanceof Error ? connectError.message : String(connectError));
      }
    }

    void connect();

    return () => {
      disposed = true;
      unsubscribes.forEach((unsubscribe) => unsubscribe());
      bindingRef.current?.destroy();
      viewRef.current?.destroy();
      delete window.__pocInsertTextAfterAnchor;
      bindingRef.current = null;
      viewRef.current = null;

      const client = clientRef.current;
      const doc = docRef.current;
      clientRef.current = null;
      docRef.current = null;

      if (client && doc) {
        void client.detach(doc).finally(() => {
          void client.deactivate();
        });
      }
    };
  }, [appendLog, documentKey, member, refreshCheckpoints, refreshPresence]);

  useEffect(() => {
    const doc = docRef.current;

    if (!doc) {
      return;
    }

    doc.update((_root, presence) => {
      presence.set({
        memberId: member.id,
        name: member.name,
        color: member.color,
        role: member.role,
        mode,
      });
    }, 'presence:mode');
    refreshPresence();
  }, [member, mode, refreshPresence]);

  function runToolbarCommand(commandId: string) {
    const command = toolbarCommands.find((item) => item.id === commandId);
    const view = viewRef.current;

    if (!command || !view) {
      return;
    }

    command.run(view.state, view.dispatch, view);
    view.focus();
  }

  function applySourceMarkdown(nextMarkdown: string) {
    setMarkdown(nextMarkdown);

    const view = viewRef.current;
    if (!view) {
      return;
    }

    sourceApplyingRef.current = true;
    const nextDoc = parseMarkdownToDoc(nextMarkdown);
    const transaction = view.state.tr
      .replaceWith(0, view.state.doc.content.size, nextDoc.content)
      .setMeta('source', true);
    view.dispatch(transaction);
    window.setTimeout(() => {
      sourceApplyingRef.current = false;
    }, 0);
  }

  async function createCheckpoint() {
    const doc = docRef.current;
    const client = clientRef.current;

    if (!doc || !client) {
      return;
    }

    const checkpoint = buildCheckpoint({
      authorId: member.id,
      authorName: member.name,
      markdown,
      message: checkpointMessage,
    });

    doc.update((root) => {
      if (!Array.isArray(root.checkpoints)) {
        root.checkpoints = [];
      }
      root.checkpoints.push(checkpoint);
    }, `checkpoint:${checkpoint.message}`);

    setSelectedCheckpointId(checkpoint.id);
    refreshCheckpoints();

    try {
      setSyncStatus('pending');
      await client.sync(doc);
      setSyncStatus('synced');
    } catch (syncError) {
      setSyncStatus('sync-failed');
      setError(syncError instanceof Error ? syncError.message : String(syncError));
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="document-title">
          <span className="workspace-label">Collaboration POC</span>
          <strong>Yorkie ProseMirror shared Markdown</strong>
          <span className="document-key">{documentKey}</span>
        </div>

        <div className="topbar-controls" aria-label="Editor controls">
          <div className="segmented-control" role="tablist" aria-label="View mode">
            {viewModes.map((viewMode) => (
              <button
                aria-selected={viewMode.id === mode}
                className={viewMode.id === mode ? 'is-active' : ''}
                key={viewMode.id}
                onClick={() => onModeChange(viewMode.id)}
                role="tab"
                type="button"
              >
                {viewMode.label}
              </button>
            ))}
          </div>

          <a className="peer-link" href={peerUrl} target="_blank" rel="noreferrer">
            Open peer
          </a>
        </div>
      </header>

      <main className="workspace">
        <aside className="sidebar" aria-label="Workspace context">
          <section className="identity-panel">
            <span className="panel-label">Signed in as</span>
            <div className="member-row">
              <span className="avatar" style={{ backgroundColor: member.color }} />
              <div>
                <strong>{member.name}</strong>
                <span>{member.role}</span>
              </div>
            </div>
          </section>

          <section className="status-panel" data-poc-sync-status>
            <span className="panel-label">Sync state</span>
            <StatusBadge label={connectionStatus} tone={connectionStatusTone(connectionStatus)} testId="connection" />
            <StatusBadge label={syncStatus} tone={syncStatusTone(syncStatus)} testId="sync" />
            <StatusBadge
              label={hasPendingChanges ? 'pending local edits' : 'no pending edits'}
              tone={hasPendingChanges ? 'warning' : 'success'}
              testId="pending-local-edits"
            />
            <span className="rpc-label">{yorkieRpcAddr}</span>
            {error ? <p className="error-text">{error}</p> : null}
          </section>

          <section className="presence-panel">
            <span className="panel-label">Presence</span>
            <div className="presence-list">
              {peers.map((peer) => (
                <div className="member-row compact" key={peer.clientID} data-poc-presence-member={peer.presence.memberId}>
                  <span className="avatar" style={{ backgroundColor: peer.presence.color }} />
                  <div>
                    <strong>{peer.presence.name}</strong>
                    <span>{peer.presence.mode}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>

        <section className="editor-area" aria-label="Collaborative editor">
          <div className="format-toolbar" aria-label="Rich editor toolbar">
            {toolbarCommands.map((command) => (
              <button key={command.id} onClick={() => runToolbarCommand(command.id)} type="button">
                {command.label}
              </button>
            ))}
          </div>

          <div className={`mode-grid mode-${mode}`}>
            <section className={mode === 'source' || mode === 'split' ? 'pane source-pane' : 'pane source-pane is-hidden'} aria-label="Markdown source">
              <textarea
                data-poc-editor-source
                spellCheck={false}
                value={markdown}
                onChange={(event) => applySourceMarkdown(event.target.value)}
              />
            </section>

            <section className={mode === 'rich' ? 'pane rich-pane' : 'pane rich-pane is-background-mounted'} aria-label="Rich editor">
              <div className="editor-wrapper" ref={editorWrapperRef} data-poc-rich-editor>
                <div className="prosemirror-host" ref={editorMountRef} />
                <div className="cursor-overlay" ref={cursorOverlayRef} />
              </div>
            </section>

            <section className={mode === 'preview' || mode === 'split' ? 'pane preview-pane' : 'pane preview-pane is-hidden'} aria-label="Rich preview">
              <article
                className="markdown-preview"
                data-poc-preview
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </section>
          </div>
        </section>

        <aside className="inspector" aria-label="Checkpoint history">
          <section className="checkpoint-create">
            <span className="panel-label">Checkpoint</span>
            <input
              value={checkpointMessage}
              onChange={(event) => setCheckpointMessage(event.target.value)}
              placeholder="Snapshot note"
            />
            <button onClick={createCheckpoint} type="button">
              Create snapshot
            </button>
          </section>

          <section className="checkpoint-list">
            <span className="panel-label">History</span>
            {checkpoints.length === 0 ? (
              <p className="muted-text">No snapshots yet.</p>
            ) : (
              checkpoints.map((checkpoint) => (
                <button
                  className={checkpoint.id === selectedCheckpointId ? 'checkpoint-item is-selected' : 'checkpoint-item'}
                  key={checkpoint.id}
                  onClick={() => setSelectedCheckpointId(checkpoint.id)}
                  type="button"
                >
                  <strong>{checkpoint.message}</strong>
                  <span>
                    {checkpoint.authorName} · {new Date(checkpoint.createdAt).toLocaleTimeString()}
                  </span>
                </button>
              ))
            )}
          </section>

          <section className="snapshot-preview">
            <span className="panel-label">Snapshot</span>
            {selectedCheckpoint ? (
              <pre>{selectedCheckpoint.markdown}</pre>
            ) : (
              <p className="muted-text">Select a checkpoint.</p>
            )}
          </section>

          <section className="sync-log">
            <span className="panel-label">Binding log</span>
            {logLines.length === 0 ? (
              <p className="muted-text">Waiting for editor activity.</p>
            ) : (
              logLines.map((line, index) => <code key={`${line}-${index}`}>{line}</code>)
            )}
          </section>
        </aside>
      </main>
    </div>
  );
}

function StatusBadge({
  label,
  tone,
  testId,
}: {
  label: string;
  tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
  testId?: string;
}) {
  return (
    <span className={`status-badge tone-${tone}`} data-poc-status={testId}>
      {label}
    </span>
  );
}

function connectionStatusTone(status: ConnectionStatus) {
  if (status === 'online') return 'success';
  if (status === 'offline' || status === 'reconnecting') return 'warning';
  if (status === 'error') return 'danger';
  return 'info';
}

function syncStatusTone(status: SyncStatus) {
  if (status === 'synced') return 'success';
  if (status === 'sync-failed') return 'danger';
  if (status === 'pending') return 'warning';
  return 'neutral';
}
