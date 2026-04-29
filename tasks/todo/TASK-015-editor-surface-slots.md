---
title: Editor Surface Slots
status: todo
phase: P1
task_type: parallel-ui
task_mode: parallel
owner: unassigned
depends_on:
  - TASK-012
write_set:
  - apps/web/src/features/document/**
  - apps/web/src/features/editor/**
  - apps/web/src/features/history/**
forbidden_paths:
  - .note/**
  - apps/api/**
  - apps/collab/**
  - apps/web/src/features/workspace/**
  - apps/web/src/styles/**
related_requirements:
  - CE-01-CONCURRENT-EDITING
  - CE-04-REVISION-HISTORY
  - CE-05-RICH-PREVIEW
  - REQ-PROPERTIES-OUTSIDE-BODY
  - REQ-LINKS-BACKLINKS-STANDARD-MARKDOWN
review_required: true
---

# TASK-015: Editor Surface Slots

## 목표

Mock provider 기반으로 central editor, document header, properties, backlinks, sync status, history slots를 만든다.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- UI 기준 문서: `DESIGN.md`.
- 선행 contract: `TASK-012`.

## 범위

### 포함

- Editor-first first screen slots.
- Document properties surface outside Markdown body.
- Backlinks visible surface backed by mock or seed data.
- CE e2e selectors가 사용할 stable `data-testid` hooks.
- Mock provider replacement note.

### 제외

- Workspace navigation feature 변경.
- API integration, realtime collaboration, real history persistence.
- Workflow hooks, graph view, wikilinks.

## 계약과 의존성

| Task       | Mode       | Depends on | Unlocks    | Notes                       |
| ---------- | ---------- | ---------- | ---------- | --------------------------- |
| `TASK-015` | `parallel` | `TASK-012` | `TASK-016` | Editor-facing mock surfaces |

- 안정 contract: `TASK-012` frontend slot and feature boundary.
- mock 허용 여부: 허용. `TASK-016`과 Plan 02에서 real providers로 교체한다.

## Write Set

수정 가능:

- `apps/web/src/features/document/**`
- `apps/web/src/features/editor/**`
- `apps/web/src/features/history/**`

수정 금지:

- `.note/**`
- `apps/api/**`
- `apps/collab/**`
- `apps/web/src/features/workspace/**`
- `apps/web/src/styles/**`

## 인수 조건

- 첫 화면은 editor workspace다.
- Document properties는 Markdown body 밖에 표시된다.
- Backlinks는 seed/mock 기반이라도 visible surface가 있다.
- Editor area는 CE e2e specs에 필요한 stable `data-testid` hooks를 노출한다.
- Mock provider replacement가 task file 또는 nearby code note로 문서화된다.

## 검증

- 실행 명령: `pnpm --filter @rme/web typecheck`
- 기대 결과: web package typecheck가 통과한다.
- 실행 명령: `pnpm lint`
- 기대 결과: lint가 통과한다.
- 실행 명령: `pnpm test:e2e -- --list`
- 기대 결과: e2e specs listing이 성공한다.
- 실행 명령: `pnpm format:check`
- 기대 결과: formatting check가 통과한다.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: workspace navigation write set과 겹치면 중단한다.

## Archive Checklist

- [ ] `status`를 `archived`로 변경했다.
- [ ] 파일을 `tasks/archive/`로 이동했다.
- [ ] 검증 결과를 이 문서에 기록했다.
- [ ] 필요한 공식 문서 업데이트를 완료했다.
- [ ] follow-up 또는 blocker를 기록했다.

## 메모

- CE behavior may remain unimplemented here, but selectors must not block later e2e work.
- Plan 01 graph role is represented as `task_type: parallel-ui` plus `task_mode: parallel` per `tasks/README.md` metadata rules.
- Shared/global styles are owned by `TASK-012` or `TASK-016` so this parallel write set stays disjoint from `TASK-014`.
- Plan 01's table also lists `TASK-011` as unlocking this task, but the materialized dependency follows the graph's explicit `Depends on` column.
