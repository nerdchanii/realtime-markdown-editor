import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCaret from '@tiptap/extension-collaboration-caret'
import Link from '@tiptap/extension-link'
import { Table } from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import { Markdown } from '@tiptap/markdown'
import { ExternalLink, FileText, Users } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CheckpointPanel } from './components/CheckpointPanel'
import { MarkdownPreview } from './components/MarkdownPreview'
import { ModeTabs } from './components/ModeTabs'
import { StatusBar } from './components/StatusBar'
import { createCollaborationSession, type CollaborationSession } from './collaboration'
import { buildMemberUrl, getDocumentName, getMemberFromSearch, MEMBERS } from './identity'
import { normalizeMode, readEditorMarkdown, STARTER_MARKDOWN, writeEditorMarkdown } from './markdown'
import type { Checkpoint, EditorMode, LocalCacheStatus, Member, ProviderStatus } from './types'
import './App.css'

type AwarenessLike = {
  getStates: () => Map<number, { user?: Member }>
  on: (event: 'change', callback: () => void) => void
  off: (event: 'change', callback: () => void) => void
  setLocalStateField: (key: string, value: unknown) => void
}

type ConnectableProvider = {
  connect: () => void
  disconnect: () => void
  destroy: () => void
  on: (event: string, callback: (payload?: unknown) => void) => void
  off: (event: string, callback: (payload?: unknown) => void) => void
  awareness: AwarenessLike
}

type ProviderStatusPayload = {
  status?: ProviderStatus
}

const hocuspocusUrl = import.meta.env.VITE_HOCUSPOCUS_URL ?? 'ws://127.0.0.1:1234'
const checkpointApiUrl = import.meta.env.VITE_CHECKPOINT_API ?? 'http://127.0.0.1:1235'

declare global {
  interface Window {
    __pocInsertTextAfterAnchor?: (anchorText: string, text: string) => boolean
  }
}

async function fetchCheckpoints(documentName: string): Promise<Checkpoint[]> {
  const response = await fetch(`${checkpointApiUrl}/checkpoints?documentName=${encodeURIComponent(documentName)}`)

  if (!response.ok) {
    throw new Error(`Checkpoint API returned ${response.status}`)
  }

  const payload = (await response.json()) as { checkpoints?: Checkpoint[] }
  return payload.checkpoints ?? []
}

function makeCheckpointBody(documentName: string, member: Member, message: string, markdown: string) {
  return {
    documentName,
    authorId: member.id,
    authorName: member.name,
    message,
    markdown,
  }
}

function useCollaboration(documentName: string): CollaborationSession {
  return useMemo(() => createCollaborationSession(documentName, hocuspocusUrl), [documentName])
}

export function App() {
  const member = useMemo(() => getMemberFromSearch(window.location.search), [])
  const peerMember = member.id === 'alice' ? MEMBERS.bob : MEMBERS.alice
  const documentName = useMemo(() => getDocumentName(window.location.search), [])
  const initialMode = useMemo(() => normalizeMode(new URLSearchParams(window.location.search).get('mode')), [])
  const session = useCollaboration(documentName)
  const provider = session.provider as ConnectableProvider
  const providerStatusRef = useRef<ProviderStatus>('connecting')
  const seededRef = useRef(false)

  const [mode, setMode] = useState<EditorMode>(initialMode)
  const [markdown, setMarkdown] = useState('')
  const [sourceDraft, setSourceDraft] = useState('')
  const [providerStatus, setProviderStatus] = useState<ProviderStatus>('connecting')
  const [localCacheStatus, setLocalCacheStatus] = useState<LocalCacheStatus>('loading')
  const [manualOffline, setManualOffline] = useState(false)
  const [pendingLocalChanges, setPendingLocalChanges] = useState(0)
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null)
  const [activeMembers, setActiveMembers] = useState<Member[]>([member])
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([])
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<Checkpoint | null>(null)
  const [checkpointLoading, setCheckpointLoading] = useState(false)
  const [checkpointError, setCheckpointError] = useState<string | null>(null)

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          undoRedo: false,
          link: false,
        }),
        Link.configure({
          autolink: true,
          openOnClick: false,
        }),
        Table.configure({
          resizable: true,
        }),
        TableRow,
        TableHeader,
        TableCell,
        TaskList,
        TaskItem.configure({
          nested: true,
        }),
        Markdown.configure({
          markedOptions: {
            gfm: true,
            breaks: false,
          },
          indentation: {
            style: 'space',
            size: 2,
          },
        }),
        Collaboration.configure({
          document: session.document,
        }),
        CollaborationCaret.configure({
          provider: session.provider,
          user: {
            name: member.name,
            color: member.color,
            id: member.id,
          },
        }),
      ],
      editorProps: {
        attributes: {
          class: 'tiptap-editor',
          'aria-label': 'Collaborative Markdown editor',
        },
      },
    },
    [session.document, session.provider, member.id, member.name, member.color],
  )

  const loadCheckpoints = useCallback(async () => {
    setCheckpointLoading(true)
    setCheckpointError(null)

    try {
      const nextCheckpoints = await fetchCheckpoints(documentName)
      setCheckpoints(nextCheckpoints)
      setSelectedCheckpoint((current) => current ?? nextCheckpoints[0] ?? null)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Checkpoint API unavailable'
      setCheckpointError(message)
    } finally {
      setCheckpointLoading(false)
    }
  }, [documentName])

  useEffect(() => {
    const awareness = provider.awareness

    function updateMembers() {
      const remoteMembers = Array.from(awareness.getStates().values())
        .map((state) => state.user)
        .filter((state): state is Member => Boolean(state?.id && state.name && state.color))

      const unique = new Map(remoteMembers.map((remoteMember) => [remoteMember.id, remoteMember]))
      unique.set(member.id, member)
      setActiveMembers(Array.from(unique.values()))
    }

    awareness.setLocalStateField('user', member)
    awareness.on('change', updateMembers)
    updateMembers()

    return () => awareness.off('change', updateMembers)
  }, [member, provider.awareness])

  useEffect(() => {
    function handleProviderStatus(payload?: unknown) {
      const status = (payload as ProviderStatusPayload | undefined)?.status ?? 'connecting'
      providerStatusRef.current = status
      setProviderStatus(status)

      if (status === 'connected') {
        setManualOffline(false)
        setPendingLocalChanges(0)
        setLastSyncedAt(new Date().toISOString())
      }
    }

    function handleSynced() {
      setPendingLocalChanges(0)
      setLastSyncedAt(new Date().toISOString())
    }

    provider.on('status', handleProviderStatus)
    provider.on('synced', handleSynced)

    return () => {
      provider.off('status', handleProviderStatus)
      provider.off('synced', handleSynced)
    }
  }, [provider])

  useEffect(() => {
    let disposed = false

    function handleLocalSynced() {
      if (!disposed) {
        setLocalCacheStatus('ready')
      }
    }

    if (session.indexeddb.synced) {
      setLocalCacheStatus('ready')
    }

    session.indexeddb.on('synced', handleLocalSynced)
    void session.indexeddb.whenSynced.then(handleLocalSynced)

    return () => {
      disposed = true
      session.indexeddb.off('synced', handleLocalSynced)
    }
  }, [session.indexeddb])

  useEffect(() => {
    if (!editor) {
      return undefined
    }

    function insertTextAfterAnchor(anchorText: string, text: string) {
      let insertAt: number | null = null

      editor.state.doc.descendants((node, position) => {
        if (insertAt !== null || !node.isText || !node.text) {
          return insertAt === null
        }

        const anchorOffset = node.text.indexOf(anchorText)
        if (anchorOffset === -1) {
          return true
        }

        insertAt = position + anchorOffset + anchorText.length
        return false
      })

      if (insertAt === null) {
        return false
      }

      editor.chain().focus().insertContentAt(insertAt, ` ${text}`).run()
      return true
    }

    window.__pocInsertTextAfterAnchor = insertTextAfterAnchor

    function handleUpdate() {
      const nextMarkdown = readEditorMarkdown(editor)
      setMarkdown(nextMarkdown)
      setSourceDraft(nextMarkdown)

      if (providerStatusRef.current !== 'connected') {
        setPendingLocalChanges((count) => count + 1)
      }
    }

    editor.on('update', handleUpdate)
    handleUpdate()

    return () => {
      editor.off('update', handleUpdate)
      delete window.__pocInsertTextAfterAnchor
    }
  }, [editor])

  useEffect(() => {
    if (!editor || seededRef.current || localCacheStatus !== 'ready' || providerStatus !== 'connected') {
      return
    }

    if (editor.state.doc.textContent.trim().length === 0) {
      writeEditorMarkdown(editor, STARTER_MARKDOWN)
    }

    seededRef.current = true
  }, [editor, localCacheStatus, providerStatus])

  useEffect(() => {
    void loadCheckpoints()
  }, [loadCheckpoints])

  useEffect(() => {
    return () => {
      session.indexeddb.destroy()
      provider.destroy()
      session.document.destroy()
    }
  }, [provider, session.document, session.indexeddb])

  function handleSourceChange(nextMarkdown: string) {
    setSourceDraft(nextMarkdown)
    setMarkdown(nextMarkdown)
    writeEditorMarkdown(editor, nextMarkdown)
  }

  function handleToggleConnection() {
    if (manualOffline || providerStatus === 'disconnected') {
      setManualOffline(false)
      setProviderStatus('connecting')
      provider.connect()
      return
    }

    setManualOffline(true)
    setProviderStatus('disconnected')
    providerStatusRef.current = 'disconnected'
    provider.disconnect()
  }

  async function handleCreateCheckpoint(message: string) {
    const currentMarkdown = readEditorMarkdown(editor) || markdown || sourceDraft
    const response = await fetch(`${checkpointApiUrl}/checkpoints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(makeCheckpointBody(documentName, member, message, currentMarkdown)),
    })

    if (!response.ok) {
      throw new Error(`Checkpoint API returned ${response.status}`)
    }

    const payload = (await response.json()) as { checkpoint: Checkpoint }
    setCheckpoints((current) => [payload.checkpoint, ...current])
    setSelectedCheckpoint(payload.checkpoint)
  }

  const peerUrl = buildMemberUrl(peerMember.id, window.location.search)
  const showEditor = mode === 'rich' || mode === 'split'
  const showSource = mode === 'source'
  const showPreview = mode === 'preview' || mode === 'split'

  return (
    <div className="app-shell">
      <aside className="workspace-pane">
        <div className="brand-block">
          <div className="brand-icon">
            <FileText size={18} />
          </div>
          <div>
            <p className="eyebrow">POC-001</p>
            <h1>Collaboration engine</h1>
          </div>
        </div>

        <div className="document-block">
          <p className="field-label">Document</p>
          <p className="document-name">{documentName}</p>
          <p className="document-path">Workspace / Research / Shared editor</p>
        </div>

        <div className="member-block">
          <p className="field-label">Current member</p>
          <div className="member-row">
            <span className="avatar" style={{ '--member-color': member.color } as React.CSSProperties}>
              {member.initials}
            </span>
            <div>
              <p className="member-name">{member.name}</p>
              <p className="member-role">{member.role}</p>
            </div>
          </div>
          <a className="peer-link" href={peerUrl} target="_blank" rel="noreferrer">
            <ExternalLink size={14} />
            Open {peerMember.name}
          </a>
        </div>

        <div className="presence-block">
          <div className="section-title">
            <Users size={15} />
            Presence
          </div>
          {activeMembers.map((activeMember) => (
            <div key={activeMember.id} className="member-row compact" data-poc-presence-member={activeMember.id}>
              <span className="avatar small" style={{ '--member-color': activeMember.color } as React.CSSProperties}>
                {activeMember.initials}
              </span>
              <span>{activeMember.name}</span>
            </div>
          ))}
        </div>
      </aside>

      <main className="editor-pane">
        <header className="editor-toolbar">
          <ModeTabs activeMode={mode} onChange={setMode} />
          <StatusBar
            providerStatus={providerStatus}
            localCacheStatus={localCacheStatus}
            pendingLocalChanges={pendingLocalChanges}
            lastSyncedAt={lastSyncedAt}
            manualOffline={manualOffline}
            onToggleConnection={handleToggleConnection}
          />
        </header>

        <section className={mode === 'split' ? 'editor-grid editor-grid-split' : 'editor-grid'}>
          {showEditor ? (
            <div className="editor-surface" data-poc-rich-editor>
              <EditorContent editor={editor} />
            </div>
          ) : null}

          {showSource ? (
            <textarea
              className="source-editor"
              data-poc-editor-source
              value={sourceDraft}
              onChange={(event) => handleSourceChange(event.target.value)}
              spellCheck={false}
              aria-label="Markdown source"
            />
          ) : null}

          {showPreview ? (
            <div className="preview-surface" data-poc-preview>
              <MarkdownPreview markdown={markdown || sourceDraft} />
            </div>
          ) : null}
        </section>
      </main>

      <aside className="inspector-pane">
        <CheckpointPanel
          checkpoints={checkpoints}
          selectedCheckpoint={selectedCheckpoint}
          loading={checkpointLoading}
          error={checkpointError}
          onRefresh={loadCheckpoints}
          onCreate={handleCreateCheckpoint}
          onSelect={setSelectedCheckpoint}
        />
      </aside>
    </div>
  )
}
