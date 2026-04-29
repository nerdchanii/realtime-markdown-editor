---
title: tasks/exec-plan/02-collaboration-persistence.md
status: active
purpose: collaboration runtime and persistence execution plan
---

# 02 Collaboration And Persistence

## Goal

Integrate the selected Tiptap + Yjs + Hocuspocus collaboration path behind hard runtime boundaries, then add persistence, checkpoint, and presence behavior needed for `CE-01` through `CE-04`.

## Official Inputs

- `docs/adr/0001-domain-first-collaboration-engine-isolation.md`
- `docs/adr/0002-collaboration-engine-poc-bench.md`
- `docs/adr/0003-storage-strategy.md`
- `docs/adr/0004-document-lifecycle-policy.md`
- `docs/domain/rules/collaboration-boundaries.md`
- `docs/domain/rules/document-lifecycle.md`
- `docs/product/editor/concurrent-editing.md`
- `docs/product/editor/offline-merge.md`
- `docs/product/editor/presence.md`
- `docs/product/editor/history.md`
- `packages/contracts/README.md`

## Execution Graph

| Task       | Mode               | Depends on                         | Unlocks                | Notes                                                |
| ---------- | ------------------ | ---------------------------------- | ---------------------- | ---------------------------------------------------- |
| `TASK-020` | `blocking`         | Plan 01                            | `TASK-021`, `TASK-022` | Collaboration dependency owner and package topology  |
| `TASK-021` | `parallel-backend` | `TASK-020`                         | `TASK-024`             | API provider-neutral collaboration session contract  |
| `TASK-022` | `parallel-backend` | `TASK-020`                         | `TASK-024`             | `apps/collab` Hocuspocus runtime skeleton            |
| `TASK-023` | `parallel-ui`      | `TASK-020`                         | `TASK-024`             | Web collaboration adapter port                       |
| `TASK-024` | `integration`      | `TASK-021`, `TASK-022`, `TASK-023` | `TASK-025`, `TASK-026` | CE-01 concurrent editing integration                 |
| `TASK-025` | `parallel-backend` | `TASK-024`                         | `TASK-028`             | Live collaboration persistence boundary              |
| `TASK-026` | `parallel-ui`      | `TASK-024`                         | `TASK-028`             | Open-page offline local persistence and reconnect UI |
| `TASK-027` | `parallel-backend` | `TASK-011`, `TASK-024`             | `TASK-028`             | Checkpoint/revision metadata and artifact adapter    |
| `TASK-028` | `integration`      | `TASK-025`, `TASK-026`, `TASK-027` | `TASK-029`, `TASK-030` | CE-03 and CE-04 backend integration                  |
| `TASK-029` | `parallel-ui`      | `TASK-028`                         | `TASK-031`             | Presence UI from awareness payload                   |
| `TASK-030` | `parallel-ui`      | `TASK-028`                         | `TASK-031`             | History UI backed by checkpoint inspect API          |
| `TASK-031` | `verification`     | `TASK-029`, `TASK-030`             | Plan 03                | Collaboration/persistence exit review                |

## Task Details

### TASK-020: Collaboration Dependency And Runtime Topology

Own all package and lockfile edits for collaboration dependencies.

Write set:

- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `apps/collab/**`
- `apps/api/package.json`
- `apps/web/package.json`
- `docs/architecture/backend.md`
- `docs/domain/rules/collaboration-boundaries.md`

Acceptance:

- `apps/collab` exists as a separate runtime package.
- Dependency owner is recorded in the task file.
- Hocuspocus/Yjs/Tiptap dependencies are installed in the package that uses them.
- `apps/collab` does not import `apps/api/src/**`.
- Root scripts can start API, web, and collab in local development.

Verification:

- `pnpm install`
- `pnpm typecheck`
- `pnpm arch:check`
- `pnpm format:check`

### TASK-021: API Collaboration Session Contract

Implement provider-neutral session issuance in API.

Write set:

- `apps/api/src/modules/collaboration/**`
- `apps/api/src/modules/documents/**`
- `packages/contracts/src/realtime/**`
- `packages/contracts/src/http/**`

Forbidden paths:

- `apps/collab/**`
- `apps/web/**`

Acceptance:

- API returns collaboration session DTO for seeded document and member.
- Session contract includes document key, realtime URL, current member, allowed members, and sync state.
- API maps domain/application data into contract DTOs explicitly.
- No Yjs, Hocuspocus, Tiptap, or ProseMirror types enter API domain files.

Verification:

- `pnpm --filter @rme/api typecheck`
- `pnpm --filter @rme/contracts typecheck`
- `pnpm arch:check`

### TASK-022: Collab Runtime Skeleton

Build `apps/collab` as the realtime runtime.

Write set:

- `apps/collab/**`
- `package.json`

Forbidden paths:

- `apps/api/src/modules/**`
- `apps/web/**`

Acceptance:

- Hocuspocus server starts separately from API.
- Runtime validates provider-neutral session shape through a port/client boundary.
- Runtime can host one seeded Yjs document.
- Runtime has a boundary test or architecture check proving it does not import API source.

Verification:

- `pnpm --filter @rme/collab typecheck`
- `pnpm arch:check`

### TASK-023: Web Collaboration Adapter Port

Add a frontend adapter boundary for realtime editor providers.

Write set:

- `apps/web/src/features/editor/**`
- `apps/web/src/lib/api-client/**`
- `apps/web/src/app/**`

Forbidden paths:

- `apps/api/**`
- `apps/collab/**`

Acceptance:

- Editor feature depends on a provider-neutral collaboration adapter interface.
- Provider-specific Tiptap/Yjs setup is isolated in one adapter area.
- Mock editor provider remains usable for UI tests until integration.

Verification:

- `pnpm --filter @rme/web typecheck`
- `pnpm lint`
- `pnpm arch:check`

### TASK-024: CE-01 Concurrent Editing Integration

Connect API session, collab runtime, and web adapter.

Write set:

- `apps/api/src/modules/collaboration/**`
- `apps/collab/**`
- `apps/web/src/features/editor/**`
- `apps/web/src/lib/api-client/**`
- `packages/contracts/src/**`
- `playwright.config.ts`
- `package.json`

Acceptance:

- Two browser contexts opening the same seeded document converge without manual refresh.
- CE-01 e2e passes.
- Provider-specific imports remain out of API domain and contracts.

Verification:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm arch:check`
- `pnpm test:e2e e2e/ce-01-concurrent-editing.spec.ts`

### TASK-025: Live Collaboration Persistence Boundary

Add local-compatible live Yjs document persistence without treating it as revision history.

Write set:

- `apps/collab/**`
- `docs/adr/0003-storage-strategy.md`
- `docs/domain/rules/collaboration-boundaries.md`

Acceptance:

- Collab runtime can persist and reload live collaboration state through an adapter boundary.
- The task explicitly states this is live Yjs binary persistence, not product revision artifact history.
- Provider choice is local-compatible and swappable.

Verification:

- `pnpm --filter @rme/collab typecheck`
- `pnpm arch:check`
- `pnpm format:check`

### TASK-026: Open-Page Offline Merge

Implement CE-03 open-page offline editing and reconnect merge behavior.

Write set:

- `apps/web/src/features/editor/**`
- `apps/web/src/features/document/**`
- `apps/web/src/lib/api-client/**`
- `packages/contracts/src/realtime/**`

Acceptance:

- Local edits made while a browser context is offline remain visible locally.
- Remote edits made while the first context is offline merge after reconnect.
- Sync state shows offline/reconnecting/pending local changes without using danger styling unless data loss occurs.
- CE-03 e2e passes.

Verification:

- `pnpm --filter @rme/web typecheck`
- `pnpm lint`
- `pnpm test:e2e e2e/ce-03-offline-merge.spec.ts`

### TASK-027: Checkpoint Metadata And Artifact Adapter

Implement explicit checkpoint creation and snapshot storage.

Write set:

- `apps/api/src/modules/documents/**`
- `apps/api/src/modules/collaboration/**`
- `packages/contracts/src/http/**`
- `docs/product/editor/history.md`

Acceptance:

- Checkpoint creation stores author membership, timestamp, message, and snapshot artifact reference.
- Autosave/sync events do not appear as user-authored checkpoints.
- Read-only inspect API returns previous Markdown snapshot content.
- Restore/branching is not implemented.

Verification:

- `pnpm --filter @rme/api typecheck`
- `pnpm --filter @rme/contracts typecheck`
- `pnpm arch:check`

### TASK-028: Persistence And History Integration

Integrate live collab persistence with explicit checkpoint history.

Write set:

- `apps/api/src/modules/**`
- `apps/collab/**`
- `packages/contracts/src/**`

Acceptance:

- Current collaborative content can be captured into an explicit checkpoint.
- Checkpoint inspect returns snapshot content from artifact boundary.
- `saved`, sync status, autosave, checkpoint, revision, and publication terms are not collapsed into one field.

Verification:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm arch:check`
- `pnpm test:e2e e2e/ce-04-history.spec.ts`

### TASK-029: Presence Integration

Render membership-based remote cursor and selection awareness.

Write set:

- `apps/web/src/features/editor/**`
- `apps/web/src/features/document/**`
- `apps/collab/**`
- `packages/contracts/src/realtime/**`

Acceptance:

- Remote cursor and selected range are visible with member name/color.
- Presence updates without manual refresh.
- CE-02 e2e passes.

Verification:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm arch:check`
- `pnpm test:e2e e2e/ce-02-presence.spec.ts`

### TASK-030: History UI Integration

Connect history panel to checkpoint metadata and inspect API.

Write set:

- `apps/web/src/features/history/**`
- `apps/web/src/features/document/**`
- `apps/web/src/lib/api-client/**`
- `packages/contracts/src/http/**`

Acceptance:

- Reviewer can create checkpoint with message.
- History list shows author, timestamp, and message.
- Selecting an item opens read-only snapshot viewer.
- CE-04 e2e passes.

Verification:

- `pnpm --filter @rme/web typecheck`
- `pnpm lint`
- `pnpm test:e2e e2e/ce-04-history.spec.ts`

### TASK-031: Collaboration/Persistence Exit Review

Review CE-01 through CE-04 before product surface polish.

Write set:

- `tasks/archive/**`
- `tasks/todo/**`
- `tasks/active/**`

Acceptance:

- CE-01, CE-02, CE-03, and CE-04 targeted e2e specs pass.
- All boundary checks pass.
- Remaining CE-05/product-surface tasks are listed in plan 03 task files.

Verification:

- `pnpm check`
- `pnpm test:e2e e2e/ce-01-concurrent-editing.spec.ts`
- `pnpm test:e2e e2e/ce-02-presence.spec.ts`
- `pnpm test:e2e e2e/ce-03-offline-merge.spec.ts`
- `pnpm test:e2e e2e/ce-04-history.spec.ts`
