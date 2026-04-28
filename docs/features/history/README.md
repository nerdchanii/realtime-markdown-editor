# F-HISTORY: Checkpoint and History

## Purpose

Provide reviewable document history while keeping ordinary autosave/save separate from intentional checkpoints.

## MVP Scope

- Let a user create an explicit checkpoint with a user-entered message.
- Store and display checkpoint author, creation time, message, and content snapshot or equivalent artifact.
- Show checkpoint/history entries in chronological order.
- Keep autosave/save status separate from checkpoint creation.

## Out of Scope / Backlog

- Full diff viewer.
- Restore-as-new-branch workflows.
- Approval workflows for checkpoints.
- Automatic semantic summaries of changes.

## Linked Requirement IDs

- `CE-04`
- `FR-05`
- `FR-06`
- `ARCH-04`

## Acceptance Summary

The reviewer can create a checkpoint with a message, then open history and see the checkpoint's author, timestamp, message, and document content snapshot or equivalent artifact.

## Open Questions / Research

- Whether checkpoint snapshots are stored as Markdown, CRDT update artifacts, rendered HTML, or a combination.
- Whether the MVP needs restore behavior or only read-only history inspection.
