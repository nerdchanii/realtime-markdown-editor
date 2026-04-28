# F-STORAGE: Durable and Local Storage Roles

## Purpose

Define storage responsibilities so document metadata, collaboration artifacts, history, offline state, and optional realtime support do not collapse into one ambiguous store.

## MVP Scope

- Use RDB/Postgres as the durable baseline for metadata and relationships.
- Use object storage or equivalent artifact storage for checkpoint snapshots or large revision artifacts when needed.
- Use IndexedDB for recent-document local persistence.
- Treat Redis as optional support for presence, pub/sub, or cache, not as primary durable storage.
- Keep autosave/save state and checkpoint artifacts distinguishable.

## Out of Scope / Backlog

- Multi-region replication.
- Enterprise backup and restore policies.
- Search indexing architecture.
- Redis as a mandatory durable source of truth.

## Linked Requirement IDs

- `FR-06`
- `FR-11`
- `NFR-04`
- `ARCH-04`
- `ARCH-05`
- `ARCH-06`
- `ARCH-08`
- `RES-02`

## Acceptance Summary

The architecture can explain where workspace/document metadata, document body state, checkpoint artifacts, and offline local state live. Redis, if used, is documented as optional supporting infrastructure.

## Open Questions / Research

- Whether object storage is needed in the first runnable MVP or can be represented by local filesystem/development storage with the same boundary.
- Whether Redis meaningfully improves local demo reliability or only adds operational complexity.
