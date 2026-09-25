---
title: auto-20260502-1040-document-trash-restore-ui
status: active
purpose: close document trash restore requirement with product UI and e2e evidence
---

# Document Trash Restore UI ExecPlan

## Goal

Close `REQ-DOCUMENT-TRASH-RESTORE` by wiring the product workspace navigation Trash panel to the
canonical Trash list and restore APIs added by `TASK-095`.

## Official Inputs

- `docs/requirements/items/REQ-DOCUMENT-TRASH-RESTORE.md`
- `docs/requirements/completed/REQ-DOCUMENT-TRASH-RESTORE.md`
- `docs/product/ui-capability-gap-log.md`
- `docs/domain/rules/document-lifecycle.md`
- `apps/web/src/features/workspace/index.tsx`
- `apps/web/src/app/product-workspace-providers.ts`
- `apps/web/src/lib/api-client/index.ts`
- `tasks/archive/TASK-095-document-trash-restore-api.md`

## Execution Graph

| Task       | Mode     | Depends on | Unlocks | Notes                                                  |
| ---------- | -------- | ---------- | ------- | ------------------------------------------------------ |
| `TASK-096` | blocking | `TASK-095` | done    | Product UI wiring plus e2e evidence for Trash/restore. |

## Write Sets

Allowed:

- `apps/web/src/features/workspace/index.tsx`
- `apps/web/src/features/workspace/types.ts`
- `apps/web/src/app/product-workspace-navigation.ts`
- `apps/web/src/app/product-workspace-view-model.ts`
- `apps/web/src/app/product-workspace-providers.ts`
- `apps/web/src/styles/global.css`
- `e2e/product-trash-restore.spec.ts`
- `docs/requirements/registry.md`
- `docs/requirements/items/REQ-DOCUMENT-TRASH-RESTORE.md`
- `docs/requirements/completed/REQ-DOCUMENT-TRASH-RESTORE.md`
- `docs/product/ui-capability-gap-log.md`
- `tasks/exec-plan/auto-20260502-1040-document-trash-restore-ui.md`
- `tasks/archive/TASK-096-document-trash-restore-ui.md`

Forbidden:

- `.note/**`
- `README.md`
- Backend contract/API changes beyond the already committed `TASK-095` surface.

## Acceptance

- Workspace navigation exposes a Trash panel.
- Trash panel lists archived documents from product APIs.
- Restore action calls the product restore API and returns the restored document to active
  navigation/editor state.
- Product e2e proves delete, active-list exclusion, Trash list, restore, and active navigation
  reappearance.
- `REQ-DOCUMENT-TRASH-RESTORE` moves to completed requirements and `UI-GAP-008` is closed.

## Verification

- `scripts/with-node.sh pnpm --filter @rme/web typecheck`
- `scripts/with-node.sh pnpm --filter @rme/web test`
- `DATABASE_URL=<local test db> COLLAB_PORT=4001 RME_COLLAB_PORT=4001 scripts/with-node.sh pnpm test:e2e -- e2e/product-trash-restore.spec.ts`
- `scripts/with-node.sh pnpm requirements:index`
- `scripts/with-node.sh pnpm format:check`
