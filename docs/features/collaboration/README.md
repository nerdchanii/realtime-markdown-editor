# F-COLLAB: Realtime Collaborative Editing

## Purpose

Enable multiple workspace members to edit the same Markdown document at the same time without manual refresh or lost edits.

## MVP Scope

- Support at least two browser clients editing the same workspace document concurrently.
- Propagate text edits to other connected clients in near realtime.
- Preserve each user's unique input during simultaneous editing.
- Keep collaboration engine internals behind a boundary so product and domain models do not expose library-specific types.

## Out of Scope / Backlog

- Fine-grained document permissions.
- Branching, merge requests, or review workflows.
- Cross-document collaborative transactions.

## Linked Requirement IDs

- `CE-01`
- `CE-03`
- `NFR-01`
- `NFR-02`

## Acceptance Summary

Two browser sessions can open the same seeded workspace document. When each session edits different text, both clients converge to the same document content without a manual page refresh.

## Open Questions / Research

- Final engine choice depends on `F-ENGINE-POC`.
- The next requirements pass must verify whether any rich-editor behavior conflicts with Markdown portability.
