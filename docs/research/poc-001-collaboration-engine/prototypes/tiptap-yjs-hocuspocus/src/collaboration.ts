import { HocuspocusProvider } from '@hocuspocus/provider'
import { IndexeddbPersistence } from 'y-indexeddb'
import * as Y from 'yjs'

export type CollaborationSession = {
  document: Y.Doc
  provider: HocuspocusProvider
  indexeddb: IndexeddbPersistence
}

export function createCollaborationSession(documentName: string, serverUrl: string): CollaborationSession {
  const document = new Y.Doc()
  const indexeddb = new IndexeddbPersistence(documentName, document)
  const provider = new HocuspocusProvider({
    url: serverUrl,
    name: documentName,
    document,
  })

  return {
    document,
    provider,
    indexeddb,
  }
}
