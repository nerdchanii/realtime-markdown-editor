---
title: TASK-077-db-backed-collaboration-session-live-yjs-persistence
status: blocked
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
- Current blocker: real local Postgres must be provisioned with `pnpm db:up`, migrations must pass
  with `pnpm db:migrate`, and DB-backed reload proof must run before retrying implementation.
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

- 실행 명령: `pnpm db:up`
- 기대 결과: Docker Postgres `postgres:16` starts on `${POSTGRES_HOST_PORT:-5432}:5432` and the
  `DATABASE_URL` database exists. Use `.env.example` safe values when host port 5432 is occupied.
- 실행 명령: `pnpm db:migrate`
- 기대 결과: Prisma migrations apply to the current `DATABASE_URL` database.
- 실행 명령: `pnpm --filter @rme/collab typecheck`
- 기대 결과: collab typecheck가 통과한다.
- 실행 명령: `pnpm --filter @rme/api typecheck`
- 기대 결과: API typecheck가 통과한다.
- 실행 명령: `pnpm arch:check`
- 기대 결과: architecture boundary check가 통과한다.
- 실행 명령: `pnpm test:e2e e2e/ce-01-concurrent-editing.spec.ts e2e/ce-03-offline-merge.spec.ts`
- 기대 결과: CE collaboration e2e pass.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: `apps/collab` must remain API-domain independent.

## Archive Checklist

- [ ] `status`를 `archived`로 변경했다.
- [ ] 파일을 `tasks/archive/`로 이동했다.
- [ ] 검증 결과를 이 문서에 기록했다.
- [ ] 필요한 공식 문서 업데이트를 완료했다.
- [ ] follow-up 또는 blocker를 기록했다.

## 메모

- Start only after `TASK-074` and `TASK-076` are archived and the real local Postgres bootstrap,
  migrations, and DB-backed reload proof are available.
