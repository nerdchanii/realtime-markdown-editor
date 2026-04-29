export type MemberId = 'alice' | 'bob'

export type Member = {
  id: MemberId
  name: string
  initials: string
  role: string
  color: string
}

export type EditorMode = 'rich' | 'source' | 'split' | 'preview'

export type ProviderStatus = 'connecting' | 'connected' | 'disconnected'

export type LocalCacheStatus = 'loading' | 'ready'

export type Checkpoint = {
  id: string
  documentName: string
  authorId: string
  authorName: string
  message: string
  markdown: string
  createdAt: string
}

