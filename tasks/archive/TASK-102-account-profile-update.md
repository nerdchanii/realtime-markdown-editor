---
title: TASK-102-account-profile-update
status: archived
phase: P12
task_type: integration
task_mode: blocking
owner: unassigned
depends_on:
  - TASK-101
write_set:
  - packages/contracts/src/http/index.ts
  - packages/contracts/src/http/routes.ts
  - packages/contracts/src/http/schemas.ts
  - apps/api/src/modules/identity/adapters/prisma-account-repository.ts
  - apps/api/src/modules/identity/interfaces/account.controller.ts
  - apps/api/src/modules/identity/ports/account-repository.ts
  - apps/api/src/modules/identity/use-cases/account-service.ts
  - apps/api/src/modules/identity/use-cases/account-service.test.ts
  - apps/web/src/app/TopBarSettingsPanels.tsx
  - apps/web/src/lib/api-client/index.ts
  - e2e/product-account-profile.spec.ts
  - docs/requirements/items/REQ-PRODUCTION-ACCOUNT-MANAGEMENT.md
  - tasks/archive/TASK-102-account-profile-update.md
forbidden_paths:
  - .note/**
related_requirements:
  - REQ-PRODUCTION-ACCOUNT-MANAGEMENT
review_required: true
---

# TASK-102: Account Profile Update

## Goal

Replace the read-only account profile placeholder with an authenticated profile name update flow.

## Scope

- Added `PATCH /accounts/me/profile` contract metadata and request DTO.
- Extended the account service/repository/controller path to update the signed-in user's name.
- Replaced the User settings read-only name field with an editable account form.
- Added an e2e proving the saved profile name persists after page reload.

## Requirement Closure

`REQ-PRODUCTION-ACCOUNT-MANAGEMENT` is closed by this task. Account deactivation/delete remains a
documented policy boundary rather than an executable mutation in the initial product scope.

## Verification

- `scripts/with-node.sh pnpm --filter @rme/api typecheck`
- `scripts/with-node.sh pnpm --filter @rme/web typecheck`
- `scripts/with-node.sh pnpm --filter @rme/contracts test`
- `scripts/with-node.sh pnpm --filter @rme/api test -- src/modules/identity/use-cases/account-service.test.ts`
- `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/realtime_markdown_editor COLLAB_PORT=4001 RME_COLLAB_PORT=4001 scripts/with-node.sh pnpm test:e2e -- e2e/product-account-profile.spec.ts`
- `scripts/with-node.sh pnpm lint`
- `scripts/with-node.sh pnpm format:check`

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`에 기록했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
