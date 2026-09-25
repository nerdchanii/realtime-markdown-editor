---
title: TASK-101-product-account-create
status: archived
phase: P12
task_type: integration
task_mode: blocking
owner: unassigned
depends_on:
  - TASK-094
  - TASK-100
write_set:
  - packages/contracts/src/http/index.ts
  - packages/contracts/src/http/routes.ts
  - packages/contracts/src/http/schemas.ts
  - apps/api/src/modules/identity/identity.module.ts
  - apps/api/src/modules/identity/adapters/prisma-account-repository.ts
  - apps/api/src/modules/identity/interfaces/account.controller.ts
  - apps/api/src/modules/identity/ports/account-repository.ts
  - apps/api/src/modules/identity/use-cases/account-service.ts
  - apps/api/src/modules/identity/use-cases/account-service.test.ts
  - apps/web/src/app/AuthScreen.tsx
  - apps/web/src/lib/api-client/index.ts
  - e2e/product-account-create.spec.ts
  - docs/requirements/items/REQ-PRODUCTION-ACCOUNT-MANAGEMENT.md
  - tasks/archive/TASK-101-product-account-create.md
forbidden_paths:
  - .note/**
related_requirements:
  - REQ-PRODUCTION-ACCOUNT-MANAGEMENT
review_required: true
---

# TASK-101: Product Account Create

## Goal

Add a normal product path for creating a local account and entering the workspace onboarding flow.

## Scope

- Added `POST /accounts` contract metadata and wire DTOs.
- Added an identity account service, repository port, Prisma repository, and controller.
- Added account creation to the auth screen, followed by session creation.
- Added an e2e proving a new user can create a local account and reach workspace onboarding.

## Remaining Requirement Scope

`REQ-PRODUCTION-ACCOUNT-MANAGEMENT` remains open. Profile update and account deactivation mutations
are still not exposed by the contracts, API, or UI.

## Verification

- `scripts/with-node.sh pnpm --filter @rme/api typecheck`
- `scripts/with-node.sh pnpm --filter @rme/web typecheck`
- `scripts/with-node.sh pnpm --filter @rme/contracts test`
- `scripts/with-node.sh pnpm --filter @rme/api test -- src/modules/identity/use-cases/account-service.test.ts`
- `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/realtime_markdown_editor COLLAB_PORT=4001 RME_COLLAB_PORT=4001 scripts/with-node.sh pnpm test:e2e -- e2e/product-account-create.spec.ts`
- `scripts/with-node.sh pnpm lint`
- `scripts/with-node.sh pnpm format:check`

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`에 기록했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
