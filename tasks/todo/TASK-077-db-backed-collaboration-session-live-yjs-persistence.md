---
title: TASK-077-db-backed-collaboration-session-live-yjs-persistence
status: todo
phase: P10
task_type: parallel-backend
task_mode: parallel
owner: unassigned
depends_on:
  - TASK-074
  - TASK-076
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
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Authenticated membership check for collaboration session issuance.
- Provider-neutral session contract between API and collab runtime.
- Hocuspocus live Yjs state persistence to Postgres.
- Reload after collab service restart.
- Boundary assertion that `apps/collab` does not import API domain/use-case files.

### 제외

- Checkpoint creation route ownership.
- Frontend toolbar/editor UI.
- Document CRUD APIs.

## 계약과 의존성

| Task       | Mode       | Depends on             | Unlocks    | Notes                              |
| ---------- | ---------- | ---------------------- | ---------- | ---------------------------------- |
| `TASK-077` | `parallel` | `TASK-074`, `TASK-076` | `TASK-082` | product collab runtime persistence |

- 안정 contract: auth membership session and serialization contract.
- Canonical session route: `POST /documents/:documentId/collaboration-sessions`.
- Retired route guardrail: do not revive `POST /collaboration/documents/:documentId/checkpoints`.
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
- `apps/collab` does not import API domain/use-case files.

## 검증

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

- Start only after `TASK-074` and `TASK-076` are archived.
