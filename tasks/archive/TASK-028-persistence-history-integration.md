---
title: TASK-028-persistence-history-integration
status: archived
phase: P4
task_type: integration
task_mode: integration
owner: main-session
depends_on:
  - TASK-025
  - TASK-026
  - TASK-027
write_set:
  - apps/api/src/modules/**
  - apps/collab/**
  - packages/contracts/src/**
forbidden_paths:
  - .note/**
related_requirements:
  - CE-03
  - CE-04
review_required: true
---

# TASK-028: Persistence And History Integration

## 목표

Integrate live collab persistence with explicit checkpoint history.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- 실행 계획: `tasks/exec-plan/02-collaboration-persistence.md`.
- ADR 기준: `docs/adr/0003-storage-strategy.md`.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Capture current collaborative content into an explicit checkpoint.
- Inspect checkpoint snapshot content from artifact boundary.
- Preserve term separation for saved/sync/autosave/checkpoint/revision/publication concepts.

### 제외

- History UI polish.
- Restore, branching, or publication visibility policy.

## 계약과 의존성

| Task       | Mode          | Depends on                         | Unlocks                | Notes                         |
| ---------- | ------------- | ---------------------------------- | ---------------------- | ----------------------------- |
| `TASK-028` | `integration` | `TASK-025`, `TASK-026`, `TASK-027` | `TASK-029`, `TASK-030` | CE-03 and CE-04 backend path. |

- 안정 contract: live persistence boundary and checkpoint artifact boundary.
- mock 허용 여부: local-compatible storage is acceptable.

## Write Set

수정 가능:

- `apps/api/src/modules/**`
- `apps/collab/**`
- `packages/contracts/src/**`

수정 금지:

- `.note/**`

## 인수 조건

- Current collaborative content can be captured into an explicit checkpoint.
- Checkpoint inspect returns snapshot content from artifact boundary.
- `saved`, sync status, autosave, checkpoint, revision, and publication terms are not collapsed into one field.

## 검증

- 실행 명령: `pnpm typecheck`
- 실행 명령: `pnpm lint`
- 실행 명령: `pnpm arch:check`
- 실행 명령: `pnpm test:e2e e2e/ce-04-history.spec.ts`
- 기대 결과: all commands pass on Node `v24.15.0`.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: do not start until all upstream tasks are archived.

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`로 이동했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
- [x] follow-up 또는 blocker를 기록했다.

## 메모

- Unblocks `TASK-029` and `TASK-030`.
- Verification:
  - `node -v` -> `v24.15.0`
  - `pnpm -v` -> `10.28.2`
  - `pnpm typecheck` -> pass.
  - `pnpm lint` -> pass.
  - `pnpm arch:check` -> pass.
  - `pnpm format:check` -> pass.
  - `pnpm test:e2e e2e/ce-04-history.spec.ts` -> pass.
- Integration notes:
  - collaboration module imports document checkpoint use cases through `DocumentsModule`.
  - collaboration checkpoint capture request explicitly declares `source: "collaboration"`.
  - checkpoint artifact inspect remains under the document artifact boundary from TASK-027.
  - restore, branching, and publication visibility policy remain excluded.
