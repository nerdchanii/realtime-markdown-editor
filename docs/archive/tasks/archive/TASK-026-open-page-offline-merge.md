---
title: TASK-026-open-page-offline-merge
status: archived
phase: P3
task_type: feature
task_mode: parallel-ui
owner: worker-019ddb0e-4333-79b3-880c-0a9f3292df9c
depends_on:
  - TASK-024
write_set:
  - apps/web/src/features/editor/**
  - apps/web/src/features/document/**
  - apps/web/src/lib/api-client/**
  - packages/contracts/src/realtime/**
forbidden_paths:
  - .note/**
related_requirements:
  - CE-03
review_required: true
---

# TASK-026: Open-Page Offline Merge

## 목표

Implement CE-03 open-page offline editing and reconnect merge behavior.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- 실행 계획: `tasks/exec-plan/02-collaboration-persistence.md`.
- product 기준: `docs/product/editor/offline-merge.md`.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Offline local edits remain visible in the open page.
- Remote edits merge after reconnect.
- Sync state shows offline/reconnecting/pending local changes.

### 제외

- Full offline workspace cache.
- Restore or branching.

## 계약과 의존성

| Task       | Mode          | Depends on | Unlocks    | Notes                          |
| ---------- | ------------- | ---------- | ---------- | ------------------------------ |
| `TASK-026` | `parallel-ui` | `TASK-024` | `TASK-028` | CE-03 open-page offline merge. |

- 안정 contract: CE-01 realtime integration from `TASK-024`.
- mock 허용 여부: no mock-only behavior for CE-03 acceptance.

## Write Set

수정 가능:

- `apps/web/src/features/editor/**`
- `apps/web/src/features/document/**`
- `apps/web/src/lib/api-client/**`
- `packages/contracts/src/realtime/**`

수정 금지:

- `.note/**`

## 인수 조건

- Local edits made while a browser context is offline remain visible locally.
- Remote edits made while the first context is offline merge after reconnect.
- Sync state shows offline/reconnecting/pending local changes without using danger styling unless data loss occurs.
- CE-03 e2e passes.

## 검증

- 실행 명령: `pnpm --filter @rme/web typecheck`
- 실행 명령: `pnpm lint`
- 실행 명령: `pnpm test:e2e e2e/ce-03-offline-merge.spec.ts`
- 기대 결과: all commands pass on Node `v24.15.0`.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 해당 없음.
- Orchestration guardrail 확인: do not start before CE-01 integration is archived.

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`로 이동했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
- [x] follow-up 또는 blocker를 기록했다.

## 메모

- CE-03 failure at Plan 01 exit is expected until this task and integration are complete.
- Verification:
  - `node -v` -> `v24.15.0`
  - `pnpm -v` -> `10.28.2`
  - `pnpm --filter @rme/web typecheck` -> pass.
  - `pnpm lint` -> pass.
  - `pnpm test:e2e e2e/ce-03-offline-merge.spec.ts` -> pass.
- Worker reported CE-03 needed sandbox escalation because `tsx` could not create its IPC pipe in
  the sandbox.
- Worker reported acceptance met and no unresolved TASK-026 blocker.
