---
title: TASK-072-prisma-postgres-persistence-foundation
status: archived
phase: P10
task_type: parallel-backend
task_mode: blocking
owner: unassigned
depends_on:
  - TASK-071
write_set:
  - apps/api/package.json
  - package.json
  - pnpm-lock.yaml
  - apps/api/prisma/**
  - apps/api/src/**/database*
  - apps/api/src/modules/**/adapters/*prisma*
  - apps/api/src/modules/**/ports/**
  - apps/api/src/modules/documents/documents.module.ts
  - apps/api/src/modules/workspace/workspace.module.ts
  - apps/api/src/modules/identity/identity.module.ts
  - apps/api/src/modules/collaboration/collaboration.module.ts
  - apps/api/src/app.module.ts
forbidden_paths:
  - .note/**
  - apps/web/**
  - apps/collab/**
related_requirements:
  - CE-01
  - CE-03
  - CE-04
review_required: true
---

# TASK-072: Prisma/Postgres Persistence Foundation

## 목표

Product metadata와 latest Markdown projection을 위한 Postgres/Prisma persistence foundation을 도입한다.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- storage 결정: `docs/adr/0003-storage-strategy.md`.
- 실행 계획: `tasks/exec-plan/05-productization-platform.md`.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- API package Prisma dependency/configuration.
- Postgres initial schema and migration for users, sessions, workspaces, memberships, projects, folders, documents, properties, link edges, artifacts, checkpoints, live collaboration metadata.
- Prisma adapters and ports for product persistence.
- `InMemoryDocumentRepository` normal runtime binding 제거 또는 dev-only isolation.

### 제외

- Auth endpoint behavior.
- Document CRUD controller behavior.
- Frontend API migration.

## 계약과 의존성

| Task       | Mode       | Depends on | Unlocks                            | Notes                         |
| ---------- | ---------- | ---------- | ---------------------------------- | ----------------------------- |
| `TASK-072` | `blocking` | `TASK-071` | `TASK-074`, `TASK-075`, `TASK-078` | DB schema와 persistence ports |

- 안정 contract: `TASK-071` product route/DTO inventory.
- Persistence schema must support the canonical DTO/route inventory in `packages/contracts/src/http/routes.ts`.
- mock 허용 여부: runtime mock은 dev/test 전용이어야 한다.
- domain code remains Prisma-free.

## Write Set

수정 가능:

- `apps/api/package.json`
- `package.json`
- `pnpm-lock.yaml`
- `apps/api/prisma/**`
- `apps/api/src/**/database*`
- `apps/api/src/modules/**/adapters/*prisma*`
- `apps/api/src/modules/**/ports/**`
- `apps/api/src/modules/documents/documents.module.ts`
- `apps/api/src/modules/workspace/workspace.module.ts`
- `apps/api/src/modules/identity/identity.module.ts`
- `apps/api/src/modules/collaboration/collaboration.module.ts`
- `apps/api/src/app.module.ts`

수정 금지:

- `.note/**`
- `apps/web/**`
- `apps/collab/**`

## 인수 조건

- Prisma와 Postgres migration이 구성된다.
- Initial schema가 product metadata와 live collaboration state metadata를 포함한다.
- Domain code는 Prisma import를 갖지 않는다.
- Product runtime은 `InMemoryDocumentRepository`에 바인딩되지 않는다.
- Migration apply command가 task result에 기록된다.

## 검증

- 실행 명령: `pnpm install` if dependencies change
- 기대 결과: lockfile and workspace dependencies are updated.
- 실행 명령: `pnpm --filter @rme/api typecheck`
- 기대 결과: API typecheck가 통과한다.
- 실행 명령: `pnpm arch:check`
- 기대 결과: architecture boundary check가 통과한다.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: DB/storage decision conflict 발견 시 중단한다.

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`로 이동했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 이 작업 범위에서 추가 공식 문서 업데이트가 필요하지 않음을 확인했다.
- [x] follow-up 또는 blocker를 기록했다.

## 메모

- Suggested worktree group: serial gate after `TASK-071`, before backend parallel work.
- Started by main orchestrator after `TASK-071` was archived and independently verified.
- Write-set expansion approved by user on 2026-04-30:
  - Added Nest DI/composition wiring files for module provider/import wiring only.
  - Do not implement auth/session APIs, collaboration session behavior, or product route controllers in this task.
  - Stop and route to dependent tasks if those behaviors become necessary.

## Result

Archived on 2026-04-30 after introducing the API Prisma/Postgres persistence foundation.

Changed files:

- `apps/api/package.json`
- `pnpm-lock.yaml`
- `apps/api/prisma/schema.prisma`
- `apps/api/prisma/migrations/20260430000000_init/migration.sql`
- `apps/api/prisma/migrations/migration_lock.toml`
- `apps/api/src/database/database.module.ts`
- `apps/api/src/database/database.service.ts`
- `apps/api/src/modules/documents/adapters/prisma-document-content-repository.ts`
- `apps/api/src/modules/documents/adapters/prisma-document-repository.ts`
- `apps/api/src/modules/documents/adapters/prisma-document-repository.test.ts`
- `apps/api/src/modules/documents/ports/document-content-repository.ts`
- `apps/api/src/modules/documents/documents.module.ts`
- `apps/api/src/app.module.ts`

Acceptance status:

- Prisma and Postgres migration are configured.
- Initial schema covers users, sessions, workspaces, memberships, projects, folders, documents,
  document properties, link edges, artifact metadata, revisions/checkpoints/publications/autosaves,
  latest Markdown projection, and live collaboration state/session metadata.
- Domain and port code remain Prisma-free; Prisma imports are limited to the database service and
  Prisma adapter/composition boundary.
- Product runtime no longer binds `DOCUMENT_REPOSITORY` to `InMemoryDocumentRepository`.
- Migration apply command: `pnpm --filter @rme/api db:migrate:deploy` with `DATABASE_URL` set for
  the target Postgres database. For local migration creation, use
  `pnpm --filter @rme/api db:migrate:dev`.

Verification results:

- `pnpm install`: passed after dependency changes.
- `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/realtime_markdown_editor pnpm --filter @rme/api exec prisma validate --schema prisma/schema.prisma`: passed.
- `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/realtime_markdown_editor pnpm --filter @rme/api db:generate`: passed.
- `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/realtime_markdown_editor pnpm --filter @rme/api exec prisma format --schema prisma/schema.prisma`: passed.
- `pnpm --filter @rme/api exec tsx --test --test-concurrency=1 src/modules/documents/adapters/prisma-document-repository.test.ts`: passed, 2 tests.
- `pnpm --filter @rme/api typecheck`: passed.
- `pnpm arch:check`: passed, no dependency violations.
- Main orchestrator rerun:
  - Corrected `WorkspaceMembershipRole` in Prisma schema and initial migration to `owner` /
    `member` to preserve the approved first role model.
  - `pnpm install`: passed.
  - `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/realtime_markdown_editor pnpm --filter @rme/api exec prisma validate --schema prisma/schema.prisma`: passed.
  - `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/realtime_markdown_editor pnpm --filter @rme/api db:generate`: passed.
  - `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/realtime_markdown_editor pnpm --filter @rme/api exec prisma format --schema prisma/schema.prisma`: passed.
  - `pnpm --filter @rme/api exec tsx --test --test-concurrency=1 src/modules/documents/adapters/prisma-document-repository.test.ts`: passed, 2 tests.
  - `pnpm --filter @rme/api typecheck`: passed.
  - `pnpm arch:check`: passed, no dependency violations.

Follow-up notes:

- Checkpoint snapshot payload storage and product checkpoint route behavior remain deferred to
  `TASK-078`.
- Auth/session behavior, workspace/document CRUD APIs, and collaboration session behavior remain
  deferred to their dependent tasks.
- Prisma CLI 7.x now requires a new datasource adapter/config flow; this task intentionally pins
  Prisma 6.19.0 to keep the current Nest runtime on the conventional `DATABASE_URL` setup.
