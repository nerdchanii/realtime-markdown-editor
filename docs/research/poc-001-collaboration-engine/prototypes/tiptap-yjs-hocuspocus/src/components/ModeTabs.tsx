import { Code2, Columns2, Eye, PencilLine, type LucideIcon } from 'lucide-react'
import type { EditorMode } from '../types'

type ModeItem = {
  id: EditorMode
  label: string
  Icon: LucideIcon
}

const modes: ModeItem[] = [
  { id: 'rich', label: 'Rich', Icon: PencilLine },
  { id: 'source', label: 'Source', Icon: Code2 },
  { id: 'split', label: 'Split', Icon: Columns2 },
  { id: 'preview', label: 'Preview', Icon: Eye },
]

type ModeTabsProps = {
  activeMode: EditorMode
  onChange: (mode: EditorMode) => void
}

export function ModeTabs({ activeMode, onChange }: ModeTabsProps) {
  return (
    <div className="mode-tabs" role="tablist" aria-label="Editor mode">
      {modes.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={activeMode === id}
          className={activeMode === id ? 'mode-tab mode-tab-active' : 'mode-tab'}
          onClick={() => onChange(id)}
          title={label}
        >
          <Icon size={15} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}
