---
title: TASK-030-history-ui-integration
status: archived
phase: P5
task_type: feature
task_mode: parallel-ui
owner: codex
depends_on:
  - TASK-028
write_set:
  - apps/web/src/features/history/**
  - apps/web/src/features/document/**
  - apps/web/src/lib/api-client/**
  - packages/contracts/src/http/**
forbidden_paths:
  - .note/**
related_requirements:
  - CE-04
review_required: true
---

# TASK-030: History UI Integration

## 목표

Connect history panel to checkpoint metadata and inspect API.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- 실행 계획: `tasks/exec-plan/02-collaboration-persistence.md`.
- product 기준: `docs/product/editor/history.md`.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Create checkpoint with message from reviewer UI.
- History list author/timestamp/message display.
- Read-only snapshot viewer for selected history item.

### 제외

- Restore.
- Branching.
- Publication visibility policy.

## 계약과 의존성

| Task       | Mode          | Depends on | Unlocks    | Notes                  |
| ---------- | ------------- | ---------- | ---------- | ---------------------- |
| `TASK-030` | `parallel-ui` | `TASK-028` | `TASK-031` | Checkpoint history UI. |

- 안정 contract: checkpoint inspect API from `TASK-028`.
- mock 허용 여부: no mock-only CE-04 acceptance.

## Write Set

수정 가능:

- `apps/web/src/features/history/**`
- `apps/web/src/features/document/**`
- `apps/web/src/lib/api-client/**`
- `packages/contracts/src/http/**`

수정 금지:

- `.note/**`

## 인수 조건

- Reviewer can create checkpoint with message.
- History list shows author, timestamp, and message.
- Selecting an item opens read-only snapshot viewer.
- CE-04 e2e passes.

## 검증

- 실행 명령: `pnpm --filter @rme/web typecheck`
- 실행 명령: `pnpm lint`
- 실행 명령: `pnpm test:e2e e2e/ce-04-history.spec.ts`
- 기대 결과: all commands pass on Node `v24.15.0`.

## 검증 결과

- Runtime: `node -v` -> `v24.15.0`; `pnpm -v` -> `10.28.2`.
- `pnpm --filter @rme/web typecheck` -> passed.
- `pnpm lint` -> passed.
- `pnpm test:e2e e2e/ce-04-history.spec.ts` -> passed (`1 passed`).

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 해당 없음.
- Orchestration guardrail 확인: do not start before `TASK-028` is archived.

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`로 이동했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
- [x] follow-up 또는 blocker를 기록했다.

## 메모

- Unblocks `TASK-031` with `TASK-029`.
- History UI now creates collaboration checkpoints through the API client and inspects created snapshots from the artifact boundary.
- No blocker.
