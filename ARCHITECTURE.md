---
title: ARCHITECTURE.md
status: living
last_updated: 2026-04-28
related_documents:
  - subject.md
  - docs/compliance/subject-matrix.md
  - docs/domain/README.md
  - docs/adr/0001-domain-first-collaboration-engine-isolation.md
---

# ARCHITECTURE.md

## Architecture Purpose

The architecture must prove the collaboration requirements in `subject.md` while allowing the product to grow into a team workspace document tool. The key quality goals are:

- Do not lose authored content during concurrent editing and reconnect flows.
- Make collaboration state observable without manual refresh.
- Keep the Markdown body portable and define the export policy clearly.
- Keep the domain model independent from editor, sync, storage, browser, and deployment providers.
- Let local reviewers run the product without production operations complexity.

## System Context

The system is a browser-based collaborative Markdown editor backed by a server-side collaboration and persistence layer.

- Browser UI: editor, preview, presence display, history, and workspace shell.
- Collaboration engine: selected after POC and hidden behind an adapter.
- Backend application: handles workspace, document, membership, history, and artifact use cases.
- Durable data: relational metadata and S3-compatible object artifact storage.
- Local persistence: browser-local document persistence for open-page offline/reconnect flows.
- Future integrations: notifications, workflow hooks, desktop/PWA packaging, and external automation adapters.

## Boundary Rules

- Domain code does not directly depend on Yjs, Hocuspocus, Yorkie, ProseMirror, IndexedDB, S3 SDK, browser Notification API, or UI components.
- Provider-specific behavior stays behind infrastructure adapters.
- Application services own use case flow, transaction boundaries, and sync orchestration.
- Presentation code calls application APIs and does not directly mutate durable domain state.
- `DocumentState` is a domain concept, not just a UI badge.
- Queryable metadata, collaboration artifacts, blob assets, local persistence, and ephemeral realtime state are not collapsed into one storage responsibility.

## Core Runtime Scenario

The first end-to-end product skeleton follows the subject requirement flow.

1. Two members open the same workspace document.
2. Two members edit the same Markdown document at the same time.
3. Remote cursor and selection presence are displayed.
4. One client loses the network, keeps editing the open document, reconnects, and unique text from both sides is merged without loss.
5. The reviewer opens checkpoint/history and inspects an earlier document state.
6. The reviewer checks Markdown rich preview or split preview.

## Architecture Map

- Domain model and terminology: `docs/domain/README.md`
- Subject compliance map: `docs/compliance/subject-matrix.md`
- Requirement registry: `docs/requirements/registry.md`
- product surface: `docs/product/README.md`
- POC evidence: `docs/research/poc-001-collaboration-engine/README.md`
- ADR:
  - `docs/adr/0001-domain-first-collaboration-engine-isolation.md`
  - `docs/adr/0002-collaboration-engine-poc-bench.md`
  - `docs/adr/0003-storage-strategy.md`
  - `docs/adr/0004-document-lifecycle-policy.md`
  - `docs/adr/0005-ui-shell-scope-model.md`

## Risks And Open Decisions

- The final collaboration engine is not selected until the POC result exists.
- An accepted final synchronization ADR is required after the POC.
- Open-page offline editing is in MVP scope. Installable PWA and desktop packaging are portability guardrails, not current implementation scope.
- Workflow hooks are deferred, but `DocumentState` stays separate so hooks can attach later.
