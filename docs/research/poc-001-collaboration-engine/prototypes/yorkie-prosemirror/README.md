---
title: Yorkie ProseMirror Prototype
status: prototype
scope: docs/research/poc-001-collaboration-engine/prototypes/yorkie-prosemirror
---

# Yorkie ProseMirror Prototype

Minimal Vite + React + TypeScript prototype for the shared collaboration-engine POC.

## What this demonstrates

- Yorkie client wiring to `http://localhost:8080`.
- ProseMirror editor bound to Yorkie Tree CRDT through `@yorkie-js/prosemirror`.
- Remote selection plugin and cursor overlay from the Yorkie ProseMirror binding.
- Stable reviewer identities via query param:
  - Alice: `?user=alice`
  - Bob: `?user=bob`
- Source, Rich, Split, and Preview controls.
- Sync, offline/reconnect, pending local edit, and presence status UI.
- Explicit checkpoint snapshots stored in the Yorkie document root.

## Run

From this folder:

```bash
pnpm install
pnpm dev
```

In a separate terminal, start the local Yorkie server:

```bash
yorkie server
```

The Yorkie CLI serves RPC on `8080` by default. The prototype does not add server infra in this repository.

Open two browser sessions:

```text
http://127.0.0.1:5173/?user=alice
http://127.0.0.1:5173/?user=bob
```

Use the same `doc` query param in both URLs to test a separate document:

```text
http://127.0.0.1:5173/?user=alice&doc=release-brief
http://127.0.0.1:5173/?user=bob&doc=release-brief
```

## Manual POC path

1. Open Alice and Bob against the same document key.
2. In Rich mode, edit different paragraphs and confirm both browsers converge without refresh.
3. Select text in Rich mode and confirm the other browser shows remote selection and cursor overlay.
4. Use browser devtools or OS networking to take one browser offline, edit locally, reconnect, and confirm both unique edits remain.
5. Create a checkpoint from the inspector and select it from History to inspect the snapshot.
6. Switch Source, Split, and Preview modes and confirm the Markdown preview renders headings, lists, code, tables, and links.

## Notes and limits

- This is a POC prototype, not the final product adapter boundary.
- The external Yorkie server uses in-memory persistence unless started with MongoDB per Yorkie server options.
- ProseMirror uses the CommonMark schema from `prosemirror-markdown`; GitHub-flavored tables render in Source/Split preview, but full table-structured rich editing is outside this prototype slice.
- Checkpoints are explicit POC snapshots in the Yorkie document root, separate from Yorkie server revisions.

## Verification

```bash
pnpm test
pnpm build
```
