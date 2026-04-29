import { randomUUID } from 'node:crypto'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { Server } from '@hocuspocus/server'
import * as Y from 'yjs'

type StoredCheckpoint = {
  id: string
  documentName: string
  authorId: string
  authorName: string
  message: string
  markdown: string
  createdAt: string
}

type CheckpointInput = {
  documentName?: unknown
  authorId?: unknown
  authorName?: unknown
  message?: unknown
  markdown?: unknown
}

type HocuspocusDocumentPayload = {
  document: Y.Doc
  documentName: string
}

const hocuspocusPort = Number(process.env.HOCUSPOCUS_PORT ?? 1234)
const checkpointPort = Number(process.env.CHECKPOINT_PORT ?? 1235)

const documentSnapshots = new Map<string, Uint8Array>()
const checkpoints = new Map<string, StoredCheckpoint[]>()

const collaborationServer = new Server({
  name: 'tiptap-yjs-hocuspocus-poc',
  port: hocuspocusPort,
  debounce: 300,
  maxDebounce: 1200,
  async onLoadDocument({ document, documentName }: HocuspocusDocumentPayload) {
    const snapshot = documentSnapshots.get(documentName)

    if (snapshot) {
      Y.applyUpdate(document, snapshot)
    }

    return document
  },
  async onStoreDocument({ document, documentName }: HocuspocusDocumentPayload) {
    documentSnapshots.set(documentName, Y.encodeStateAsUpdate(document))
  },
  async onChange({ documentName }: HocuspocusDocumentPayload) {
    console.log(`[hocuspocus] changed ${documentName}`)
  },
  async onListen({ port }: { port: number }) {
    console.log(`[hocuspocus] websocket ws://127.0.0.1:${port}`)
  },
})

function sendJson(response: ServerResponse, statusCode: number, payload: unknown) {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8',
  })
  response.end(JSON.stringify(payload, null, 2))
}

function sendEmpty(response: ServerResponse, statusCode: number) {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  response.end()
}

async function readBody(request: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = []

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  return Buffer.concat(chunks).toString('utf8')
}

function readString(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback
}

async function handleCheckpointsRequest(request: IncomingMessage, response: ServerResponse, url: URL) {
  if (request.method === 'GET') {
    const documentName = url.searchParams.get('documentName') ?? 'shared-poc-document'
    sendJson(response, 200, {
      checkpoints: checkpoints.get(documentName) ?? [],
    })
    return
  }

  if (request.method === 'POST') {
    const body = await readBody(request)
    const parsed = JSON.parse(body || '{}') as CheckpointInput
    const documentName = readString(parsed.documentName, 'shared-poc-document')
    const checkpoint: StoredCheckpoint = {
      id: randomUUID(),
      documentName,
      authorId: readString(parsed.authorId, 'unknown'),
      authorName: readString(parsed.authorName, 'Unknown'),
      message: readString(parsed.message, 'Manual checkpoint'),
      markdown: readString(parsed.markdown, ''),
      createdAt: new Date().toISOString(),
    }

    const existing = checkpoints.get(documentName) ?? []
    const next = [checkpoint, ...existing].slice(0, 20)
    checkpoints.set(documentName, next)

    sendJson(response, 201, { checkpoint })
    return
  }

  sendJson(response, 405, { error: 'Method not allowed' })
}

const checkpointServer = createServer(async (request, response) => {
  try {
    if (request.method === 'OPTIONS') {
      sendEmpty(response, 204)
      return
    }

    const url = new URL(request.url ?? '/', `http://${request.headers.host ?? '127.0.0.1'}`)

    if (url.pathname === '/health') {
      sendJson(response, 200, {
        ok: true,
        hocuspocusPort,
        checkpointPort,
        documents: documentSnapshots.size,
      })
      return
    }

    if (url.pathname === '/checkpoints') {
      await handleCheckpointsRequest(request, response, url)
      return
    }

    sendJson(response, 404, { error: 'Not found' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown checkpoint server error'
    sendJson(response, 500, { error: message })
  }
})

collaborationServer.listen()
checkpointServer.listen(checkpointPort, '127.0.0.1', () => {
  console.log(`[checkpoints] http://127.0.0.1:${checkpointPort}`)
})

function shutdown() {
  checkpointServer.close()
  collaborationServer.destroy()
}

process.once('SIGINT', shutdown)
process.once('SIGTERM', shutdown)

