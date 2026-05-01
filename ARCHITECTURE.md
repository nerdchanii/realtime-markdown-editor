---
title: ARCHITECTURE.md
status: living
last_updated: 2026-04-29
related_documents:
  - subject.md
  - docs/compliance/subject-matrix.md
  - docs/architecture/README.md
  - docs/domain/README.md
  - docs/product/README.md
  - "docs/adr/*"
---

# ARCHITECTURE.md

## Architecture Purpose

The architecture must turn the collaboration requirements in `subject.md` into a trustworthy team
workspace document product. CE-01 through CE-05 are product stories from `subject.md`; detailed
requirements such as identity, authorization, persistence, and UX quality make those stories usable
as a real product.

Key quality goals:

- Do not lose authored content during concurrent editing and reconnect flows.
- Make collaboration state observable without manual refresh.
- Keep the Markdown body portable and define the export policy clearly.
- Keep the domain model independent from editor, sync, storage, browser, and deployment providers.
- Keep login, session, workspace membership, authorship, and document access trustworthy.
- Fail clearly when local runtime prerequisites such as database configuration or migrations are
  missing.

## System Context

The system is a browser-based collaborative Markdown editor backed by server-side collaboration and persistence boundaries.

- Browser UI: editor, preview, presence display, checkpoint/history inspector, and workspace shell.
- Collaboration engine: Tiptap + Yjs + Hocuspocus, hidden behind adapters.
- Backend application: owns workspace, identity, document, collaboration, checkpoint metadata, and artifact use-case flow.
- Durable data: relational metadata plus S3-compatible object artifact storage.
- Local persistence: browser-local state for open-page offline editing and reconnect merge.
- Future integrations: workflow hooks, notifications, external automation, PWA/desktop packaging.

## Boundary Rules

- Domain code does not directly depend on Yjs, Hocuspocus, Yorkie, ProseMirror, IndexedDB, S3 SDK, browser APIs, or UI components.
- Provider-specific behavior stays behind infrastructure adapters.
- Application use cases own use-case flow, transaction boundaries, and sync orchestration.
- Presentation code calls application APIs and does not directly mutate durable domain state.
- The first TypeScript monorepo keeps domain code app-private under `apps/api`; it does not introduce a shared domain package.
- NestJS modules are composition and dependency-injection boundaries. Domain entities and values remain plain TypeScript with no Nest decorators.
- `DocumentState` is a workflow-facing domain value/state, separate from sync/autosave status and checkpoint history.
- Future HTTP, realtime, and MCP server interfaces call application use cases. Protocol shapes are interface adapter concerns, not domain concepts.

## Core Runtime Scenario

The first end-to-end product path follows the subject requirement flow on top of product-shaped
identity, workspace, document, persistence, and UI boundaries.

1. Two members open the same workspace-scoped document from a seeded workspace/project/root-folder context.
2. Two members edit the same Markdown document at the same time.
3. Remote cursor and selection presence are displayed.
4. One client loses the network, keeps editing the open document, reconnects, and unique text from both sides is merged without loss.
5. The reviewer opens checkpoint/history and inspects an earlier document state.
6. The reviewer checks Markdown rich preview or split preview.

## Architecture Map

- Detailed architecture rules: `docs/architecture/README.md`
- Backend module and Clean Architecture rules: `docs/architecture/backend.md`
- Frontend feature and editor-first rules: `docs/architecture/frontend.md`
- Domain model and terminology: `docs/domain/README.md`
- Product surface: `docs/product/README.md`
- Subject compliance map: `docs/compliance/subject-matrix.md`
- Requirement registry: `docs/requirements/registry.md`
- Decision records: `docs/adr/*`

## Open Follow-ups

- Cross-module domain import enforcement and current violation cleanup are implementation follow-ups.
- Checkpoint artifact format and inspect path remain open under ADR-0003.
- Workflow hooks, workflow execution, publish/draft visibility, and ownership-based visibility remain deferred until workflow capability promotion.
