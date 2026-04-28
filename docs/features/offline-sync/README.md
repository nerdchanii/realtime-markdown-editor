# F-OFFLINE-SYNC: IndexedDB Offline Editing and Resync

## Purpose

Allow recent documents to remain usable during network interruption and automatically merge local edits after reconnection.

## MVP Scope

- Persist recently opened document state in IndexedDB.
- Allow offline viewing and editing for recent documents.
- Resync local offline edits with server state after reconnection.
- Provide a minimal PWA app shell so the core interface and offline status can load without network.
- Show online, offline, reconnecting, or syncing status in the UI.

## Out of Scope / Backlog

- Whole-workspace or whole-vault offline cache.
- Manual conflict resolution UI as the primary merge path.
- Long-term offline-first mobile app behavior.

## Linked Requirement IDs

- `CE-03`
- `FR-11`
- `FR-12`
- `NFR-01`
- `NFR-04`
- `UX-07`
- `ARCH-06`
- `BL-05`

## Acceptance Summary

A recently opened document can be edited while disconnected. After reconnection, local offline edits and server-side edits converge into one document without discarding the user's offline text.

## Open Questions / Research

- Exact recent-document retention policy.
- Whether offline editing is supported in all editor modes or initially limited by the selected collaboration engine.
- How much shell functionality must work offline beyond opening recent documents and showing sync state.
