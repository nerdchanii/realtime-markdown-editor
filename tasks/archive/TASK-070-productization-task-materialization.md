---
title: TASK-070-productization-task-materialization
status: archived
phase: P10
task_type: docs
task_mode: orchestration
owner: main-orchestrator
depends_on: []
write_set:
  - tasks/todo/**
  - tasks/active/**
  - tasks/archive/**
  - tasks/exec-plan/05-productization-platform.md
forbidden_paths:
  - .note/**
related_requirements:
  - CE-01
  - CE-02
  - CE-03
  - CE-04
  - CE-05
review_required: true
---

# TASK-070: Productization Task Materialization

## 목표

`tasks/exec-plan/05-productization-platform.md`를 `TASK-070`부터 `TASK-083`까지의 실행 가능한 task 파일로 구체화하고, ADR-0007 이후 baseline을 잠근다.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- productization 실행 계획: `tasks/exec-plan/05-productization-platform.md`.
- task lifecycle와 delegation 규칙: `tasks/README.md`, `tasks/_templates/SUBAGENT-PREAMBLE.md`.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- `TASK-070`부터 `TASK-083`까지의 concrete task file 생성.
- 각 task의 dependency, write set, forbidden paths, verification command 기록.
- phase/subagent 실행 방식과 worktree split 계획 기록.
- ADR-0007/editor recovery baseline 상태 확인.

### 제외

- product API, DB, auth, collab, editor 구현 변경.
- `.note/**` 기반 acceptance 재정의.

## 계약과 의존성

| Task       | Mode            | Depends on | Unlocks    | Notes                                    |
| ---------- | --------------- | ---------- | ---------- | ---------------------------------------- |
| `TASK-070` | `orchestration` | 없음       | `TASK-071` | task graph와 post-ADR-0007 baseline 확정 |

- 안정 contract: `05-productization-platform.md`의 execution graph.
- mock 허용 여부: 해당 없음.
- downstream implementation은 이 task 완료 전 시작하지 않는다.

## Write Set

수정 가능:

- `tasks/todo/**`
- `tasks/active/**`
- `tasks/archive/**`
- `tasks/exec-plan/05-productization-platform.md`

수정 금지:

- `.note/**`
- product implementation paths

## 인수 조건

- `TASK-070`부터 `TASK-083`까지의 task 파일이 template frontmatter를 따른다.
- 모든 task가 non-overlapping write set 또는 명시적 integration mode를 가진다.
- phase-agent prompt에는 model policy와 subagent delegation model이 포함된다.
- ADR-0007/editor recovery baseline이 implementation 시작 전에 기록된다.

## 검증

- 실행 명령: `git status --short`
- 기대 결과: dirty changes가 task materialization 범위와 기존 계획 문서에 한정된다.
- 결과: 통과. Dirty changes are limited to `tasks/exec-plan/README.md`, `tasks/exec-plan/05-productization-platform.md`, `tasks/active/TASK-070-productization-task-materialization.md`, and `tasks/todo/TASK-071` through `TASK-083`.
- 실행 명령: `pnpm format:check`
- 기대 결과: task markdown formatting check가 통과한다.
- 결과: 통과. `All matched files use Prettier code style!`

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 해당 없음.
- Boundary review 필요 여부: 해당 없음.
- Orchestration guardrail 확인: approved contract/design 없이 implementation worker를 시작하지 않는다.

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`로 이동했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
- [x] follow-up 또는 blocker를 기록했다.

## 메모

- 2026-04-30 baseline: `docs/adr/0007-rich-markdown-authoring-surface.md` exists and is committed on `main`.
- Recent baseline commit: `46f4e0f feat(web): make TipTap rich editor primary surface`.
- Current dirty worktree before materialization: `tasks/exec-plan/README.md` modified, `tasks/exec-plan/05-productization-platform.md` untracked.
- No dirty changes were present under `apps/**`, `packages/**`, `docs/adr/0007-rich-markdown-authoring-surface.md`, `ARCHITECTURE.md`, `DESIGN.md`, or `subject.md`.
- Worktree split note: `.worktrees/` exists and `git check-ignore -q .worktrees` passed.
- Follow-up: `TASK-071` is the next blocking contract task.
