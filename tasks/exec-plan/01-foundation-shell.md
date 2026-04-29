---
title: tasks/exec-plan/01-foundation-shell.md
status: active
purpose: foundation and workspace shell execution plan
---

# 01 Foundation And Workspace Shell

## Goal

Prepare the long-run execution surface and build a mock-backed workspace-scoped editor shell that later collaboration work can connect to without rewriting the UI.

## Official Inputs

- `subject.md`
- `docs/compliance/subject-matrix.md`
- `docs/requirements/registry.md`
- `docs/product/README.md`
- `docs/product/workspace/workspace-hierarchy.md`
- `docs/product/workspace/user-membership.md`
- `docs/product/editor/properties.md`
- `docs/product/editor/links-backlinks.md`
- `ARCHITECTURE.md`
- `docs/architecture/frontend.md`
- `DESIGN.md`
- `tasks/README.md`

## Execution Graph

| Task       | Mode               | Depends on                         | Unlocks                            | Notes                                                    |
| ---------- | ------------------ | ---------------------------------- | ---------------------------------- | -------------------------------------------------------- |
| `TASK-010` | `blocking`         | 없음                               | `TASK-011`, `TASK-012`             | Environment preflight and plan task materialization      |
| `TASK-011` | `blocking`         | `TASK-010`                         | `TASK-013`, `TASK-014`, `TASK-015` | ADR-0003 checkpoint artifact and inspect path decision   |
| `TASK-012` | `blocking`         | `TASK-010`                         | `TASK-013`, `TASK-014`, `TASK-015` | Frontend layout slots and import boundary rules          |
| `TASK-013` | `parallel-backend` | `TASK-011`, `TASK-012`             | `TASK-016`                         | Seed review context API/view model                       |
| `TASK-014` | `parallel-ui`      | `TASK-012`                         | `TASK-016`                         | Workspace navigation shell                               |
| `TASK-015` | `parallel-ui`      | `TASK-012`                         | `TASK-016`                         | Editor surface slots with mock providers                 |
| `TASK-016` | `integration`      | `TASK-013`, `TASK-014`, `TASK-015` | `TASK-017`                         | Connect shell to seed context and stabilize first screen |
| `TASK-017` | `verification`     | `TASK-016`                         | Plan 02                            | Foundation/shell exit review                             |

## Task Details

### TASK-010: Long-Run Preflight And Task Materialization

Create concrete task files for this plan segment under `tasks/todo/`.

Write set:

- `tasks/todo/TASK-010-long-run-preflight.md`
- `tasks/todo/TASK-011-storage-decision.md`
- `tasks/todo/TASK-012-ui-boundary-slots.md`
- `tasks/todo/TASK-013-seed-context-api.md`
- `tasks/todo/TASK-014-workspace-navigation-shell.md`
- `tasks/todo/TASK-015-editor-surface-slots.md`
- `tasks/todo/TASK-016-shell-integration.md`
- `tasks/todo/TASK-017-foundation-shell-exit-review.md`

Acceptance:

- Each task uses `tasks/_templates/TASK-TEMPLATE.md`.
- Each task has `task_mode`, `write_set`, `forbidden_paths`, acceptance, verification, and review fields.
- `node -v` reports Node 24.
- `pnpm -v` reports `10.28.2`.

Verification:

- `node -v`
- `pnpm -v`
- `pnpm format:check`

### TASK-011: ADR-0003 Storage Alignment

Align docs and contracts with the human-approved ADR-0003 V1 storage decision.

Write set:

- `docs/adr/0003-storage-strategy.md`
- `docs/domain/models/checkpoint.md`
- `docs/domain/rules/collaboration-boundaries.md`
- `docs/product/editor/history.md`
- `packages/contracts/src/http/index.ts`
- `packages/contracts/src/contract-surface.type-test.ts`

Human-approved decision:

- On 2026-04-30, the project owner approved ADR-0003 V1 for the CE skeleton.
- V1 checkpoint artifacts are inspectable Markdown snapshots plus artifact metadata.
- Live Yjs binary persistence and product revision snapshot artifacts remain separate concepts.
- Production S3/R2/MinIO setup is not required for the first skeleton; a local-compatible adapter is acceptable.

Acceptance:

- ADR-0003 is accepted for the V1 CE skeleton storage policy.
- V1 checkpoint snapshot envelope is defined as inspectable Markdown snapshot plus artifact metadata.
- Live Yjs binary persistence and product revision snapshot artifacts remain separate concepts.
- Read-only snapshot inspect path is defined for CE-04.
- Contract DTOs match the decided snapshot inspect shape.

Verification:

- `pnpm --filter @rme/contracts typecheck`
- `pnpm typecheck`
- `pnpm arch:check`
- `pnpm format:check`

### TASK-012: Frontend Boundary And Layout Slots

Create UI boundaries before splitting UI implementation.

Write set:

- `apps/web/src/app/**`
- `apps/web/src/features/workspace/**`
- `apps/web/src/features/document/**`
- `apps/web/src/features/editor/**`
- `apps/web/src/features/history/**`
- `apps/web/src/lib/api-client/**`
- `apps/web/src/styles/**`
- `.dependency-cruiser.cjs`
- `scripts/check-architecture.mjs`
- `docs/architecture/frontend.md`

Acceptance:

- `App.tsx` composes feature slots instead of owning feature internals.
- Workspace, document, editor, history, and API client boundaries are explicit.
- Frontend feature code does not import other feature internals.
- Frontend code does not import `apps/api/src/**`.
- Mock provider replacement points are named.

Verification:

- `pnpm --filter @rme/web typecheck`
- `pnpm lint`
- `pnpm arch:check`
- `pnpm format:check`

### TASK-013: Seed Review Context API

Expose a stable seed review context for UI and e2e.

Write set:

- `apps/api/src/modules/**`
- `apps/api/src/app.module.ts`
- `packages/contracts/src/**`

Forbidden paths:

- `apps/web/**`

Acceptance:

- API can return seeded workspace, project, folders, documents, members, properties, backlinks placeholder data, and collaboration session metadata.
- API domain types are mapped explicitly into `@rme/contracts` DTOs.
- No provider-specific collaboration types leak into API domain.

Verification:

- `pnpm --filter @rme/api typecheck`
- `pnpm typecheck`
- `pnpm arch:check`

### TASK-014: Workspace Navigation Shell

Build the workspace hierarchy UX with mock or seed data.

Write set:

- `apps/web/src/features/workspace/**`
- `apps/web/src/styles/**`

Forbidden paths:

- `apps/api/**`
- `apps/web/src/features/editor/**`
- `apps/web/src/features/history/**`

Acceptance:

- Reviewer sees workspace, project, folder, and document navigation.
- Root folders are not presented as normal movable folders.
- Selecting the seeded document updates the central editor context.
- The UI feels like a workspace product, not a single scratch page.

Verification:

- `pnpm --filter @rme/web typecheck`
- `pnpm lint`
- `pnpm format:check`

### TASK-015: Editor Surface Slots

Build central editor, document header, properties area, backlinks area, sync status slot, and history slot using mock providers.

Write set:

- `apps/web/src/features/document/**`
- `apps/web/src/features/editor/**`
- `apps/web/src/features/history/**`
- `apps/web/src/styles/**`

Forbidden paths:

- `apps/api/**`
- `apps/web/src/features/workspace/**`

Acceptance:

- The first screen is the editor workspace.
- Document properties are displayed outside Markdown body.
- Backlinks have a visible surface even if backed by seed data.
- Editor area exposes stable `data-testid` hooks required by CE e2e specs.
- Mock provider replacement is documented in the task file.

Verification:

- `pnpm --filter @rme/web typecheck`
- `pnpm lint`
- `pnpm test:e2e -- --list`
- `pnpm format:check`

### TASK-016: Shell Integration

Connect seed context to workspace shell and editor slots.

Write set:

- `apps/web/src/app/**`
- `apps/web/src/lib/api-client/**`
- `apps/web/src/features/**`
- `apps/api/src/modules/**`
- `packages/contracts/src/**`

Acceptance:

- `/?member=alice&document=seed-review-plan` opens the seeded workspace document.
- Alice and Bob identities are selectable or query-param driven.
- The shell renders workspace navigation, document header, editor area, properties, backlinks, and history panel.
- CE e2e tests fail only for unimplemented realtime/history/preview behavior, not missing shell selectors.

Verification:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm arch:check`
- `pnpm exec playwright test --list`
- `pnpm test:e2e e2e/ce-01-concurrent-editing.spec.ts`

### TASK-017: Foundation/Shell Exit Review

Review plan 01 completion before starting collaboration runtime work.

Write set:

- `tasks/archive/**`
- `tasks/todo/**`
- `tasks/active/**`

Acceptance:

- All plan 01 task files are archived or explicitly blocked with reason.
- `pnpm check` passes, except CE e2e expected failures remain documented.
- The current first screen can be manually opened through `pnpm dev`.
- Plan 02 blockers are listed.

Verification:

- `pnpm check`
- `pnpm exec playwright test --list`
