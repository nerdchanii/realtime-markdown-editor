# F-ENGINE-POC: Collaboration Engine Evaluation

## Purpose

Select the collaboration engine through evidence while keeping the product model independent from the chosen implementation.

## MVP Scope

- Compare Tiptap + Yjs/Hocuspocus and Yorkie + ProseMirror against CE requirements and Rich editing needs.
- Evaluate simultaneous editing, presence, offline merge, persistence, Markdown source/Split support, and adapter isolation.
- Record the decision and tradeoffs in ADR form before locking the final engine.
- Keep engine-specific document state behind an adapter boundary.

## Out of Scope / Backlog

- Building full implementations for every candidate.
- Supporting multiple engines at runtime.
- Exposing CRDT or OT internal types in product-facing APIs.

## Linked Requirement IDs

- `ARCH-01`
- `ARCH-02`
- `ARCH-03`
- `RES-01`
- `RES-03`
- `NFR-01`

## Acceptance Summary

The final engine choice is backed by a POC or equivalent evaluation, and the ADR explains how the selected approach satisfies realtime editing, presence, offline merge, and rich Markdown editing needs.

## Open Questions / Research

- Which candidate best preserves standard Markdown source and export while still supporting Rich editing.
- How each candidate persists and rehydrates document state for checkpoints and offline sync.
