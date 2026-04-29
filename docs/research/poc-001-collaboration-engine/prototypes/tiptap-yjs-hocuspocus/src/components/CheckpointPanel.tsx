import { Camera, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { MarkdownPreview } from './MarkdownPreview'
import type { Checkpoint } from '../types'

type CheckpointPanelProps = {
  checkpoints: Checkpoint[]
  selectedCheckpoint: Checkpoint | null
  loading: boolean
  error: string | null
  onRefresh: () => void
  onCreate: (message: string) => Promise<void>
  onSelect: (checkpoint: Checkpoint) => void
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function CheckpointPanel({
  checkpoints,
  selectedCheckpoint,
  loading,
  error,
  onRefresh,
  onCreate,
  onSelect,
}: CheckpointPanelProps) {
  const [message, setMessage] = useState('POC checkpoint')
  const [creating, setCreating] = useState(false)

  async function handleCreate() {
    setCreating(true)

    try {
      await onCreate(message)
      setMessage('POC checkpoint')
    } finally {
      setCreating(false)
    }
  }

  return (
    <section className="checkpoint-panel" aria-label="Checkpoints">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">History</p>
          <h2>Checkpoints</h2>
        </div>
        <button type="button" className="icon-button" onClick={onRefresh} title="Refresh checkpoints">
          <RefreshCw size={15} />
        </button>
      </div>

      <label className="field-label" htmlFor="checkpoint-message">
        Message
      </label>
      <div className="checkpoint-create">
        <input
          id="checkpoint-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Checkpoint message"
        />
        <button type="button" className="primary-button" onClick={handleCreate} disabled={creating}>
          <Camera size={15} />
          Save
        </button>
      </div>

      {error ? <p className="inline-error">{error}</p> : null}

      <div className="checkpoint-list" aria-busy={loading}>
        {checkpoints.length === 0 ? <p className="empty-state">No checkpoints yet.</p> : null}
        {checkpoints.map((checkpoint) => (
          <button
            key={checkpoint.id}
            type="button"
            className={
              selectedCheckpoint?.id === checkpoint.id
                ? 'checkpoint-item checkpoint-item-active'
                : 'checkpoint-item'
            }
            onClick={() => onSelect(checkpoint)}
          >
            <span className="checkpoint-message">{checkpoint.message}</span>
            <span className="checkpoint-meta">
              {checkpoint.authorName} · {formatDate(checkpoint.createdAt)}
            </span>
          </button>
        ))}
      </div>

      <div className="snapshot-view">
        <p className="eyebrow">Snapshot</p>
        {selectedCheckpoint ? (
          <MarkdownPreview markdown={selectedCheckpoint.markdown} compact />
        ) : (
          <p className="empty-state">Select a checkpoint.</p>
        )}
      </div>
    </section>
  )
}

