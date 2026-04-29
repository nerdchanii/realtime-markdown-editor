import { Cloud, Database, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import type { LocalCacheStatus, ProviderStatus } from '../types'

type StatusBarProps = {
  providerStatus: ProviderStatus
  localCacheStatus: LocalCacheStatus
  pendingLocalChanges: number
  lastSyncedAt: string | null
  manualOffline: boolean
  onToggleConnection: () => void
}

function formatTime(value: string | null) {
  if (!value) {
    return 'Not synced'
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(value))
}

export function StatusBar({
  providerStatus,
  localCacheStatus,
  pendingLocalChanges,
  lastSyncedAt,
  manualOffline,
  onToggleConnection,
}: StatusBarProps) {
  const connected = providerStatus === 'connected'
  const connectionLabel = connected ? 'Connected' : providerStatus === 'connecting' ? 'Connecting' : 'Offline'

  return (
    <div className="status-bar" aria-label="Sync status" data-poc-sync-status>
      <span
        className={connected ? 'status-pill status-pill-success' : 'status-pill status-pill-warning'}
        data-poc-connection-status={providerStatus}
      >
        {connected ? <Wifi size={14} /> : <WifiOff size={14} />}
        {connectionLabel}
      </span>
      <span className="status-pill" data-poc-local-cache-status={localCacheStatus}>
        <Database size={14} />
        {localCacheStatus === 'ready' ? 'Local cache ready' : 'Local cache loading'}
      </span>
      <span
        className={pendingLocalChanges > 0 ? 'status-pill status-pill-warning' : 'status-pill'}
        data-poc-pending-local-changes={pendingLocalChanges}
      >
        <Cloud size={14} />
        {pendingLocalChanges > 0 ? `${pendingLocalChanges} pending` : formatTime(lastSyncedAt)}
      </span>
      <button type="button" className="toolbar-button" onClick={onToggleConnection} data-poc-network-toggle>
        <RefreshCw size={15} />
        {manualOffline || providerStatus === 'disconnected' ? 'Reconnect' : 'Go offline'}
      </button>
    </div>
  )
}
