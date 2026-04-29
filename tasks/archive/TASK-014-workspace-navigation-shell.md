---
title: Workspace Navigation Shell
status: archived
phase: P1
task_type: parallel-ui
task_mode: parallel
owner: worker
depends_on:
  - TASK-012
write_set:
  - apps/web/src/features/workspace/**
forbidden_paths:
  - .note/**
  - apps/api/**
  - apps/collab/**
  - apps/web/src/features/editor/**
  - apps/web/src/features/history/**
  - apps/web/src/styles/**
related_requirements:
  - REQ-WORKSPACE-DOCUMENT-SCOPE
  - REQ-WORKSPACE-HIERARCHY
review_required: true
---

# TASK-014: Workspace Navigation Shell

## 목표

Seed 또는 mock data를 사용해 workspace/project/folder/document navigation shell을 구현한다.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- UI 기준 문서: `DESIGN.md`.
- 선행 contract: `TASK-012`.

## 범위

### 포함

- Workspace, project, folder, document navigation surface.
- Seeded document 선택 state.
- Root folders를 일반 movable folder처럼 보이지 않게 표현한다.

### 제외

- Editor internals, history UI, API endpoint 구현.
- Graph view, wikilinks, multi-document pane split.

## 계약과 의존성

| Task       | Mode       | Depends on | Unlocks    | Notes                   |
| ---------- | ---------- | ---------- | ---------- | ----------------------- |
| `TASK-014` | `parallel` | `TASK-012` | `TASK-016` | Workspace navigation UX |

- 안정 contract: `TASK-012` frontend slot and feature boundary.
- mock 허용 여부: 허용. `TASK-016`에서 seed context와 연결한다.

## Write Set

수정 가능:

- `apps/web/src/features/workspace/**`

수정 금지:

- `.note/**`
- `apps/api/**`
- `apps/collab/**`
- `apps/web/src/features/editor/**`
- `apps/web/src/features/history/**`
- `apps/web/src/styles/**`

## 인수 조건

- Reviewer가 workspace, project, folder, document navigation을 볼 수 있다.
- Root folders는 일반 movable folder처럼 표시되지 않는다.
- Seeded document 선택이 central editor context를 갱신할 수 있는 이벤트/상태를 제공한다.
- UI가 single scratch page가 아니라 workspace product처럼 느껴진다.

## 검증

- 실행 명령: `pnpm --filter @rme/web typecheck`
- 기대 결과: web package typecheck가 통과한다.
- 실행 명령: `pnpm lint`
- 기대 결과: lint가 통과한다.
- 실행 명령: `pnpm format:check`
- 기대 결과: formatting check가 통과한다.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: editor/history feature internals는 수정하지 않는다.

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`로 이동했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
- [x] follow-up 또는 blocker를 기록했다.

## 메모

- This task is UI-only and should keep mock replacement explicit.
- Plan 01 graph role is represented as `task_type: parallel-ui` plus `task_mode: parallel` per `tasks/README.md` metadata rules.
- Shared/global styles are owned by `TASK-012` or `TASK-016` so this parallel write set stays disjoint from `TASK-015`.
- Plan 01's table also lists `TASK-011` as unlocking this task, but the materialized dependency follows the graph's explicit `Depends on` column.
- Worker completion summary:
  - Added seeded mock workspace/project/folder/document navigation within the workspace feature.
  - Root folders render as system roots rather than movable folders.
  - Selection state is internal to the workspace feature and exposed through `onSelectDocument` plus `workspace:document-selected`.
- Verification results recorded on 2026-04-30:
  - `node -v`: passed, output `v24.15.0`.
  - `pnpm -v`: passed, output `10.28.2`.
  - `pnpm --filter @rme/web typecheck`: passed.
  - `pnpm lint`: passed after `TASK-013` fixture split.
  - `pnpm format:check`: passed.
- Main-session review fixes:
  - Made controlled selection explicit: parent-provided `selectedDocumentId` drives
    highlight/context, while local state remains the fallback for mock navigation.
  - Centralized document selection payload creation in `tree-utils.ts`.
  - Replaced synthetic sentinel selection values with explicit `null` project/folder IDs.
  - Aligned workspace mock folder kinds with domain terms: `inbox` and `regular`.
  - Clarified the handoff contract: `onSelectDocument` is the canonical integration
    callback for TASK-016; `workspace:document-selected` is an observational bridge for
    review/debug tooling.
  - Allowed `selectedDocumentId: null` as the controlled empty-selection state without
    falling back to seeded selection.
- Verification refresh after review fixes:
  - `pnpm --filter @rme/web typecheck`: passed.
  - `pnpm lint`: passed.
  - `pnpm format:check`: passed.
- Worker commit opinion: safe after main-session review/archive; changed files are within declared write set.
- Final re-review: passed with no critical, important, or minor findings.
