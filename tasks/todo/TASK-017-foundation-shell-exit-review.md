---
title: Foundation/Shell Exit Review
status: todo
phase: P1
task_type: verification
task_mode: verification
owner: unassigned
depends_on:
  - TASK-016
write_set:
  - tasks/active/TASK-017-foundation-shell-exit-review.md
  - tasks/archive/TASK-010-long-run-preflight.md
  - tasks/archive/TASK-011-storage-decision.md
  - tasks/archive/TASK-012-ui-boundary-slots.md
  - tasks/archive/TASK-013-seed-context-api.md
  - tasks/archive/TASK-014-workspace-navigation-shell.md
  - tasks/archive/TASK-015-editor-surface-slots.md
  - tasks/archive/TASK-016-shell-integration.md
  - tasks/archive/TASK-017-foundation-shell-exit-review.md
  - tasks/active/TASK-011-storage-decision.md
  - tasks/active/TASK-012-ui-boundary-slots.md
  - tasks/active/TASK-013-seed-context-api.md
  - tasks/active/TASK-014-workspace-navigation-shell.md
  - tasks/active/TASK-015-editor-surface-slots.md
  - tasks/active/TASK-016-shell-integration.md
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

# TASK-017: Foundation/Shell Exit Review

## 목표

Plan 02 collaboration runtime work를 시작하기 전에 Plan 01 결과와 blocker를 검토한다.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- 선행 작업: `TASK-010`부터 `TASK-016`.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Plan 01 task lifecycle archive/blocked 상태 검토.
- `pnpm check`와 e2e listing verification.
- First screen manual open path와 Plan 02 blockers 기록.

### 제외

- Plan 02 task implementation.
- App source, packages, official docs 수정.

## 계약과 의존성

| Task       | Mode           | Depends on | Unlocks | Notes                  |
| ---------- | -------------- | ---------- | ------- | ---------------------- |
| `TASK-017` | `verification` | `TASK-016` | Plan 02 | Foundation exit review |

- 안정 contract: archived Plan 01 task outputs.
- mock 허용 여부: Plan 01 shell에서는 허용하되 Plan 02 blockers에 real provider replacement를 기록한다.

## Write Set

수정 가능:

- `tasks/active/TASK-017-foundation-shell-exit-review.md`
- `tasks/archive/TASK-010-long-run-preflight.md`
- `tasks/archive/TASK-011-storage-decision.md`
- `tasks/archive/TASK-012-ui-boundary-slots.md`
- `tasks/archive/TASK-013-seed-context-api.md`
- `tasks/archive/TASK-014-workspace-navigation-shell.md`
- `tasks/archive/TASK-015-editor-surface-slots.md`
- `tasks/archive/TASK-016-shell-integration.md`
- `tasks/archive/TASK-017-foundation-shell-exit-review.md`
- `tasks/active/TASK-011-storage-decision.md`
- `tasks/active/TASK-012-ui-boundary-slots.md`
- `tasks/active/TASK-013-seed-context-api.md`
- `tasks/active/TASK-014-workspace-navigation-shell.md`
- `tasks/active/TASK-015-editor-surface-slots.md`
- `tasks/active/TASK-016-shell-integration.md`

수정 금지:

- `.note/**`
- `apps/**`
- `packages/**`
- `docs/**`

## 인수 조건

- 모든 Plan 01 task files는 archived이거나 명시적 blocker reason을 가진다.
- `pnpm check`가 통과하거나 CE e2e expected failures가 구체적으로 문서화된다.
- 현재 first screen은 `pnpm dev`로 수동 open 가능하다.
- Plan 02 blockers가 task file에 기록된다.

## 검증

- 실행 명령: `pnpm check`
- 기대 결과: root check가 통과하거나 residual expected failures가 이 task에 기록된다.
- 실행 명령: `pnpm exec playwright test --list`
- 기대 결과: e2e specs listing이 성공한다.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: Plan 02 blocking task를 시작하기 전 Plan 01 gate를 통과하거나 blocker decision을 받는다.

## Archive Checklist

- [ ] `status`를 `archived`로 변경했다.
- [ ] 파일을 `tasks/archive/`로 이동했다.
- [ ] 검증 결과를 이 문서에 기록했다.
- [ ] 필요한 공식 문서 업데이트를 완료했다.
- [ ] follow-up 또는 blocker를 기록했다.

## 메모

- This task is verification-only and should not change product code.
