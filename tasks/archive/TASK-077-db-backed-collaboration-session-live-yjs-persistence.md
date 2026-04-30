---
title: TASK-077-db-backed-collaboration-session-live-yjs-persistence
status: archived
phase: P10
task_type: parallel-backend
task_mode: parallel
owner: unassigned
depends_on:
  - TASK-074
  - TASK-076
  - local Docker Postgres bootstrap and migrations
write_set:
  - apps/api/src/modules/collaboration/**
  - apps/collab/src/**
  - packages/contracts/src/http/**
  - packages/contracts/src/realtime/**
  - apps/collab/src/**/*.spec.ts
  - e2e/ce-01-concurrent-editing.spec.ts
  - e2e/ce-03-offline-merge.spec.ts
forbidden_paths:
  - .note/**
  - apps/api/src/modules/documents/**
  - apps/web/**
related_requirements:
  - CE-01
  - CE-02
  - CE-03
review_required: true
---

# TASK-077: DB-Backed Collaboration Session And Live Yjs Persistence

## 목표

Seed-backed collaboration runtime을 DB-backed product collaboration session과 live Yjs persistence로 대체한다.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- dependencies: `TASK-074`, `TASK-076`.
- Docker Postgres was provisioned with `pnpm db:up`, migrations passed, and DB-backed reload proof
  passed before archive.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Authenticated membership check for collaboration session issuance.
- Provider-neutral session contract between API and collab runtime.
- Hocuspocus live Yjs provider state persistence and rehydration to Postgres.
- Reload after collab service restart.
- Boundary assertion that `apps/collab` does not import API domain/use-case files.

### 제외

- Checkpoint creation route ownership.
- Checkpoint Markdown snapshot artifact storage.
- Export artifact creation.
- DB Markdown projection as live editing source of truth.
- Frontend toolbar/editor UI.
- Document CRUD APIs.

## 계약과 의존성

| Task       | Mode       | Depends on             | Unlocks    | Notes                              |
| ---------- | ---------- | ---------------------- | ---------- | ---------------------------------- |
| `TASK-077` | `parallel` | `TASK-074`, `TASK-076` | `TASK-082` | product collab runtime persistence |

- 안정 contract: auth membership session and serialization contract.
- Canonical session route: `POST /documents/:documentId/collaboration-sessions`.
- Live Yjs persistence is provider state for active collaboration rehydration. It must not be
  merged with checkpoint Markdown snapshot artifacts or export file representations.
- Retired route guardrail: do not revive `POST /collaboration/documents/:documentId/checkpoints`.
- Product framing guardrail: CE-01 through CE-03 acceptance must exercise normal product
  collaboration behavior. Do not claim acceptance from `/review-context/seed`, URL member spoofing,
  fabricated document ids, local React-only state, fallback persistence, or label/button-only
  assertions.
- mock 허용 여부: collab tests may use explicit test fixtures only.
- If checkpoint ownership is needed, stop and route to `TASK-078`/main orchestrator.

## Write Set

수정 가능:

- `apps/api/src/modules/collaboration/**`
- `apps/collab/src/**`
- `packages/contracts/src/http/**`
- `packages/contracts/src/realtime/**`
- `apps/collab/src/**/*.spec.ts`
- `e2e/ce-01-concurrent-editing.spec.ts`
- `e2e/ce-03-offline-merge.spec.ts`

수정 금지:

- `.note/**`
- `apps/api/src/modules/documents/**`
- `apps/web/**`

## 인수 조건

- Collaboration session issuance checks authenticated membership.
- Product session issuance uses `POST /documents/:documentId/collaboration-sessions`.
- Hocuspocus session loading uses provider-neutral contract data from product APIs or DB-backed session client.
- Live Yjs state persists to Postgres and reloads after collab service restart.
- DB Markdown projection is used only according to `TASK-076` fallback/bootstrap policy, not as
  a replacement for live Yjs state.
- `apps/collab` does not import API domain/use-case files.

## 검증

- 실행 전 버전: `node -v` -> `v24.15.0`; `pnpm -v` -> `10.28.2`.
- 실행 명령: `pnpm db:up`
- 결과: 통과. Docker Postgres `postgres:16` starts on `${POSTGRES_HOST_PORT:-5432}:5432` and the
  `DATABASE_URL` database exists. Safe local verification used host port `55432`.
- 실행 명령: `pnpm db:migrate`
- 결과: 통과. Prisma migrations applied to the current `DATABASE_URL` database.
- 실행 명령: `pnpm --filter @rme/collab typecheck`
- 결과: 통과.
- 실행 명령: `pnpm --filter @rme/api typecheck`
- 결과: 통과.
- 실행 명령: `pnpm arch:check`
- 결과: 통과. `apps/collab`에서 API domain/use-case import 없음.
- 추가 실행 명령:
  `pnpm exec tsx --test apps/collab/src/config.spec.ts apps/collab/src/session/product-collaboration-session-client.spec.ts apps/collab/src/yjs-document-store.spec.ts`
- 결과: 통과. Product defaults do not enable seed/memory fallback; fallback behavior is explicit
  opt-in coverage only.
- 추가 실행 명령:
  `pnpm --filter @rme/api test -- src/modules/collaboration/collaboration.module.test.ts src/modules/collaboration/interfaces/internal-collaboration-runtime.controller.test.ts src/modules/collaboration/adapters/prisma-live-yjs-document-state-repository.test.ts src/modules/collaboration/use-cases/live-yjs-document-state-use-case.test.ts`
- 결과: 통과. 전체 API test runner 기준 38개 통과. Nest-resolved collaboration module
  smoke test covers Prisma repository DI for internal runtime store/load.
- Real DB-backed proof:
  - DB: `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:55432/realtime_markdown_editor`.
  - Fallback flags explicitly false:
    `RME_COLLAB_ENABLE_LIVE_YJS_PERSISTENCE_FALLBACK=false`,
    `RME_API_ENABLE_SEED_RUNTIME_SESSION_FALLBACK=false`.
  - Minimal product rows seeded for
    `workspace_task077_http/document_task077_http_yjs`.
  - HTTP `api-postgres` proof stored a Yjs update through
    `HttpLiveYjsPersistenceAdapter`, loaded it back, and loaded the provider-neutral runtime
    session through `ProductCollaborationSessionClient`.
  - Fresh API runtime restart then loaded the same Yjs state from Postgres:
    `markdown="# TASK-077 persisted through api-postgres"`,
    `documentKey=workspace_task077_http/document_task077_http_yjs`, `members=1`.
  - Direct Prisma verification found `LiveCollaborationState` with
    `syncStatus=synced`, `artifactKind=collaborationState`, and stored Yjs artifact bytes.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: `apps/collab` must remain API-domain independent.

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`로 이동했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
- [x] follow-up 또는 blocker를 기록했다.

## 메모

- Start only after `TASK-074` and `TASK-076` are archived.
- Real local Postgres bootstrap, migrations, and DB-backed reload proof are required before archive.
- Coordinator narrowed write set removed `packages/contracts/src/http/**` and
  `e2e/ce-01-concurrent-editing.spec.ts` from editable ownership; neither was edited.
- TASK-078 owns `apps/api/src/modules/collaboration/interfaces/collaboration-session.controller.ts`;
  TASK-077 did not edit it.
- Product/default runtime fails visibly on product session load or `api-postgres` live Yjs
  persistence failure. Seed session and memory persistence fallbacks are explicit dev-only opt-ins:
  `RME_API_ENABLE_SEED_RUNTIME_SESSION_FALLBACK=true` and
  `RME_COLLAB_ENABLE_LIVE_YJS_PERSISTENCE_FALLBACK=true`.
- Product `api-postgres` live Yjs persistence/reload was verified against Docker Postgres on
  host port `55432`; no fallback persistence was used as acceptance evidence.
