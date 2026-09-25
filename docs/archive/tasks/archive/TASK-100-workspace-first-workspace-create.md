---
title: TASK-100-workspace-first-workspace-create
status: archived
phase: P12
task_type: integration
task_mode: blocking
owner: unassigned
depends_on:
  - TASK-098
write_set:
  - apps/api/src/modules/identity/adapters/prisma-auth-session-repository.ts
  - apps/api/src/modules/identity/adapters/prisma-auth-session-repository.test.ts
  - apps/web/src/app/App.tsx
  - apps/web/src/app/FirstWorkspaceForm.tsx
  - apps/web/src/styles/global.css
  - e2e/product-first-workspace.spec.ts
  - e2e/support/product-fixtures.ts
  - docs/requirements/items/REQ-WORKSPACE-LIFECYCLE-MANAGEMENT.md
  - tasks/archive/TASK-100-workspace-first-workspace-create.md
forbidden_paths:
  - .note/**
related_requirements:
  - REQ-WORKSPACE-LIFECYCLE-MANAGEMENT
review_required: true
---

# TASK-100: First Workspace Creation

## Goal

Make the product `no-workspace` state reachable by account-only sessions and replace its placeholder
with normal workspace creation UI.

## Scope

- Allowed authenticated product sessions for users that do not yet have workspace memberships.
- Preserved workspace-scoped session rejection when a requested workspace membership is missing.
- Added a first-workspace form in the editor shell that creates a workspace through the existing
  product API.
- Added a product e2e covering an account with no workspaces creating its first workspace.

## Remaining Requirement Scope

`REQ-WORKSPACE-LIFECYCLE-MANAGEMENT` remains open. Workspace delete/archive policy, project
delete/archive policy, folder/document move UI, and consolidated lifecycle acceptance coverage still
need follow-up tasks.

## Verification

- `scripts/with-node.sh pnpm --filter @rme/api typecheck`
- `scripts/with-node.sh pnpm --filter @rme/web typecheck`
- `scripts/with-node.sh pnpm --filter @rme/api test -- src/modules/identity/adapters/prisma-auth-session-repository.test.ts`
- `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/realtime_markdown_editor COLLAB_PORT=4001 RME_COLLAB_PORT=4001 scripts/with-node.sh pnpm test:e2e -- e2e/product-first-workspace.spec.ts`
- `scripts/with-node.sh pnpm lint`
- `scripts/with-node.sh pnpm format:check`

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`에 기록했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
