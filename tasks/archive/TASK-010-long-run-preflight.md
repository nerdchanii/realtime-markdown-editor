---
title: Long-Run Preflight And Task Materialization
status: archived
phase: P0
task_type: contract
task_mode: blocking
owner: main-agent
depends_on: []
write_set:
  - tasks/todo/TASK-010-long-run-preflight.md
  - tasks/active/TASK-010-long-run-preflight.md
  - tasks/archive/TASK-010-long-run-preflight.md
  - tasks/todo/TASK-011-storage-decision.md
  - tasks/todo/TASK-012-ui-boundary-slots.md
  - tasks/todo/TASK-013-seed-context-api.md
  - tasks/todo/TASK-014-workspace-navigation-shell.md
  - tasks/todo/TASK-015-editor-surface-slots.md
  - tasks/todo/TASK-016-shell-integration.md
  - tasks/todo/TASK-017-foundation-shell-exit-review.md
forbidden_paths:
  - .note/**
  - apps/**
  - packages/**
  - docs/**
related_requirements:
  - CE-01-CONCURRENT-EDITING
  - CE-02-PRESENCE
  - CE-03-OFFLINE-MERGE
  - CE-04-REVISION-HISTORY
  - CE-05-RICH-PREVIEW
review_required: true
---

# TASK-010: Long-Run Preflight And Task Materialization

## 목표

Plan 01 작업을 concrete task 파일로 분해하고 Node/pnpm 실행 환경을 확인한다.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- 실행 계획: `tasks/exec-plan/README.md`, `tasks/exec-plan/01-foundation-shell.md`.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- `TASK-010`부터 `TASK-017`까지 `tasks/todo/`에 생성한다.
- 각 task에 `task_mode`, `write_set`, `forbidden_paths`, acceptance, verification, review fields를 기록한다.
- Node `v24.15.0` 및 pnpm `10.28.2` 사용 가능 여부를 확인한다.

### 제외

- Plan 01 implementation 직접 수행.
- `TASK-011` 이후 contract/docs/code 변경.
- `.note/**` 기반 요구사항 추가.

## 계약과 의존성

| Task       | Mode       | Depends on | Unlocks                | Notes                                              |
| ---------- | ---------- | ---------- | ---------------------- | -------------------------------------------------- |
| `TASK-010` | `blocking` | 없음       | `TASK-011`, `TASK-012` | 환경 preflight와 Plan 01 task materialization 소유 |

- 안정 contract: `tasks/README.md`의 task lifecycle과 Plan 01 execution graph.
- mock 허용 여부: 해당 없음.
- checklist는 최대 2단까지만 사용하고, 복잡한 dependency는 위 table로 표현한다.

## Write Set

수정 가능:

- `tasks/todo/TASK-010-long-run-preflight.md`
- `tasks/active/TASK-010-long-run-preflight.md`
- `tasks/archive/TASK-010-long-run-preflight.md`
- `tasks/todo/TASK-011-storage-decision.md`
- `tasks/todo/TASK-012-ui-boundary-slots.md`
- `tasks/todo/TASK-013-seed-context-api.md`
- `tasks/todo/TASK-014-workspace-navigation-shell.md`
- `tasks/todo/TASK-015-editor-surface-slots.md`
- `tasks/todo/TASK-016-shell-integration.md`
- `tasks/todo/TASK-017-foundation-shell-exit-review.md`

수정 금지:

- `.note/**`
- `apps/**`
- `packages/**`
- `docs/**`

## 인수 조건

- 모든 Plan 01 task 파일이 `tasks/_templates/TASK-TEMPLATE.md` 형식을 따른다.
- 모든 Plan 01 task가 execution graph의 dependency gate를 보존한다.
- `node -v`가 Node 24를 보고하거나 Node/pnpm 명령은 `fnm exec --using 24.15.0 --` 경로로 실행된다고 기록한다.
- `pnpm -v` 또는 `fnm exec --using 24.15.0 -- pnpm -v`가 `10.28.2`를 보고한다.

## 검증

- 실행 명령: `node -v`
- 기대 결과: `v24.x`를 보고한다.
- 실행 명령: `fnm exec --using 24.15.0 -- node -v`
- 기대 결과: `v24.15.0`을 보고한다.
- 실행 명령: `pnpm -v`
- 기대 결과: `10.28.2`를 보고한다.
- 실행 명령: `fnm exec --using 24.15.0 -- pnpm -v`
- 기대 결과: `10.28.2`를 보고한다.
- 실행 명령: `pnpm format:check`
- 기대 결과: formatting check가 통과한다.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 해당 없음.
- Orchestration guardrail 확인: approved contract/design 없이 downstream implementation worker를 시작하지 않는다.

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`로 이동했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
- [x] follow-up 또는 blocker를 기록했다.

## 메모

- Verification results recorded on 2026-04-30:
  - `node -v`: passed, output `v24.15.0`.
  - `fnm exec --using 24.15.0 -- node -v`: passed, output `v24.15.0`.
  - `pnpm -v`: passed, output `10.28.2`.
  - `fnm exec --using 24.15.0 -- pnpm -v`: passed, output `10.28.2`.
  - `pnpm format:check`: first run failed on the eight new task files; after `pnpm exec prettier --write` for those files, rerun passed with `All matched files use Prettier code style!`.
- Spec compliance review:
  - Initial review found ambiguous parallel graph mode representation; `TASK-013`, `TASK-014`, and `TASK-015` now document the `task_type: parallel-*` plus `task_mode: parallel` mapping required by `tasks/README.md`.
  - Second review found overlapping `apps/web/src/styles/**` ownership between `TASK-014` and `TASK-015`; shared/global styles are now owned by `TASK-012` or `TASK-016`, and the parallel UI task write sets are disjoint.
  - A later quality review noted that `TASK-014` and `TASK-015` should not drift from Plan 01's explicit `Depends on` column; those task files now depend only on `TASK-012` and record the `TASK-011` unlock-column ambiguity in notes.
- Final review result:
  - Final focused spec/quality review approved the task-file set with no Critical, Important, or Minor issues.

## Completion Notes

- No blocker.
- Next unlocked tasks: `TASK-011`, `TASK-012`.
