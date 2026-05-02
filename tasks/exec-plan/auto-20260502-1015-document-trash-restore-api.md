---
title: auto-20260502-1015-document-trash-restore-api
status: active
purpose: add canonical product API contracts for listing and restoring archived documents
---

# Document Trash Restore API ExecPlan

## Goal

Advance `REQ-DOCUMENT-TRASH-RESTORE` by adding the backend and contract surface for workspace Trash
listing and document restore, without taking on the UI workflow in the same phase.

## Official Inputs

- `docs/requirements/items/REQ-DOCUMENT-TRASH-RESTORE.md`
- `docs/domain/rules/document-lifecycle.md`
- `docs/product/ui-capability-gap-log.md`
- `packages/contracts/src/http/routes.ts`
- `packages/contracts/src/http/index.ts`
- `packages/contracts/src/http/schemas.ts`
- `apps/api/src/modules/documents/interfaces/documents-product.controller.ts`
- `apps/api/src/modules/documents/use-cases/document-product-service.ts`
- `apps/api/src/modules/documents/adapters/prisma-document-product-repository.ts`

## Execution Graph

| Task       | Mode     | Depends on | Unlocks        | Notes                                                             |
| ---------- | -------- | ---------- | -------------- | ----------------------------------------------------------------- |
| `TASK-095` | blocking | `TASK-092` | Trash UI phase | Contract/API slice for archived document list and restore action. |

## Write Sets

Allowed:

- `packages/contracts/src/http/index.ts`
- `packages/contracts/src/http/routes.ts`
- `packages/contracts/src/http/schemas.ts`
- `apps/api/src/modules/documents/ports/document-product-repository.ts`
- `apps/api/src/modules/documents/use-cases/document-product-service.ts`
- `apps/api/src/modules/documents/interfaces/documents-product.controller.ts`
- `apps/api/src/modules/documents/interfaces/documents-product.controller.smoke.ts`
- `apps/api/src/modules/documents/adapters/prisma-document-product-repository.ts`
- `apps/web/src/lib/api-client/index.ts`
- `docs/domain/rules/document-lifecycle.md`
- `docs/requirements/items/REQ-DOCUMENT-TRASH-RESTORE.md`
- `docs/product/ui-capability-gap-log.md`
- `tasks/exec-plan/auto-20260502-1015-document-trash-restore-api.md`
- `tasks/archive/TASK-095-document-trash-restore-api.md`

Forbidden:

- `.note/**`
- `README.md`
- Product Trash UI wiring outside the API client.

## Acceptance

- HTTP contracts include `GET /workspaces/:workspaceId/trash/documents`.
- HTTP contracts include `POST /documents/:documentId/restore`.
- Product controller routes authorize through current session workspace/document access.
- Repository/service list archived workspace documents without mixing them into active folder lists.
- Restore clears archive state only if the original folder path is still active.
- Smoke coverage proves delete, active-list exclusion, Trash list, restore, and active-list
  reappearance.
- Requirement docs keep UI wiring as the remaining blocker.

## Verification

- `scripts/with-node.sh pnpm --filter @rme/contracts typecheck`
- `scripts/with-node.sh pnpm --filter @rme/api typecheck`
- `scripts/with-node.sh pnpm --filter @rme/api test`
- `scripts/with-node.sh pnpm requirements:index`
- `scripts/with-node.sh pnpm format:check`
