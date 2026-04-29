# Tiptap + Yjs + Hocuspocus POC

This prototype is the Tiptap/Yjs/Hocuspocus slice for `POC-001`. It is intentionally self-contained inside this folder and does not change the product app or shared architecture docs.

## What It Demonstrates

- Tiptap rich editor using `@tiptap/extension-collaboration` and `@tiptap/extension-collaboration-caret`.
- Yjs document sync through a local `@hocuspocus/server` WebSocket.
- Stable Alice/Bob identity from `?user=alice` or `?user=bob`.
- Rich, Source, Split, and Preview modes backed by `@tiptap/markdown`.
- Browser-local Yjs persistence through `y-indexeddb` for open-page offline edits.
- Sync/offline status and a manual disconnect/reconnect control.
- Manual checkpoint creation with inspectable Markdown snapshots.

## Run

```bash
cd docs/research/poc-001-collaboration-engine/prototypes/tiptap-yjs-hocuspocus
pnpm install
pnpm server
pnpm dev
```

Open two browser windows:

- Alice: `http://127.0.0.1:5173/?user=alice`
- Bob: `http://127.0.0.1:5173/?user=bob`

Run `pnpm server` and `pnpm dev` in separate terminals. The Hocuspocus WebSocket listens on `ws://127.0.0.1:1234`. The local checkpoint API listens on `http://127.0.0.1:1235`.

## Manual Review Notes

1. Edit the same document in the Alice and Bob windows. Text should converge without refresh.
2. Move the cursor and select text in one window. The other window should show the collaborator caret/selection label.
3. Click `Go offline` in Alice, edit locally, edit different text in Bob, then click `Reconnect` in Alice. Both edits should remain after sync catches up.
4. Use `Save` in the checkpoint panel, then select the checkpoint to inspect the rendered snapshot.
5. Switch Rich, Source, Split, and Preview modes. Markdown should remain editable and previewable.

## POC Limits

- The local server keeps Yjs updates and checkpoints in memory only.
- Checkpoints store Markdown exported by the client at save time; they are not durable revision storage.
- Source mode replaces the collaborative editor document from Markdown text on edit. This is acceptable for the POC but needs harder round-trip testing before a product decision.
- `@tiptap/markdown` is marked beta in the official Tiptap docs, so Markdown edge cases remain a key evaluation risk.

## Package References

Package names follow the current official docs for Tiptap collaboration, Hocuspocus, and Tiptap Markdown:

- `@hocuspocus/server`
- `@hocuspocus/provider`
- `@tiptap/react`
- `@tiptap/starter-kit`
- `@tiptap/extension-collaboration`
- `@tiptap/extension-collaboration-caret`
- `@tiptap/markdown`
- `yjs`
- `y-indexeddb`
