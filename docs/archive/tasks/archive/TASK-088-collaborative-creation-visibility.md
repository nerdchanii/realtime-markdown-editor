---
title: TASK-088-collaborative-creation-visibility
status: archived
phase: P11
task_type: integration
task_mode: blocking
owner: unassigned
depends_on:
  - TASK-083
write_set:
  - apps/web/src/features/workspace/**
  - apps/web/src/features/history/**
  - apps/web/src/app/**
  - e2e/**
  - docs/product/workspace/workspace-hierarchy.md
  - docs/product/editor/history.md
  - docs/requirements/items/REQ-COLLABORATIVE-CREATION-VISIBILITY.md
  - tasks/todo/TASK-088-collaborative-creation-visibility.md
  - tasks/active/TASK-088-collaborative-creation-visibility.md
  - tasks/archive/TASK-088-collaborative-creation-visibility.md
forbidden_paths:
  - .note/**
  - apps/web/src/features/editor/adapters/**
related_requirements:
  - REQ-COLLABORATIVE-CREATION-VISIBILITY
  - REQ-WORKSPACE-HIERARCHY
  - REQ-HISTORY-CHECKPOINTS
review_required: true
---

# TASK-088: Collaborative Creation Visibility

## 목표

Document와 checkpoint 생성 결과가 생성자 client에만 머물지 않고 같은 workspace/document context를 보는 다른 활성 member에게도 product state로 보이게 한다.

## 배경

- `REQ-COLLABORATIVE-CREATION-VISIBILITY`는 document list와 checkpoint list의 cross-user propagation을 요구한다.
- 구현 방식은 refetch, polling, realtime event 중 하나로 좁혀야 한다.
- `TASK-084`가 editor adapter internals를 소유하므로 이 task는 editor adapter를 건드리지 않는다.

## 범위

### 포함

- Alice가 document를 만들면 Bob의 workspace document list에도 표시되는 product flow.
- Alice가 checkpoint를 만들면 Bob의 history list에도 표시되는 product flow.
- creator-only React state, dev seed route, URL spoofing에 의존하지 않는 검증.
- 선택한 propagation strategy를 product docs 또는 requirement next step에 반영.

### 제외

- Full realtime event bus 도입이 필요하면 별도 backend/platform task로 분리한다.
- Comments, notifications, activity feed.
- Editor adapter/Yjs persistence 변경.

## 인수 조건

- 다른 member session에서 새 document가 normal product path로 보인다.
- 다른 member session에서 새 checkpoint metadata와 inspectable snapshot이 normal product path로 보인다.
- propagation 방식과 한계가 문서에 남는다.

## 검증

- 실행 명령: `scripts/with-node.sh pnpm --filter @rme/web typecheck`
- 기대 결과: web typecheck passes.
- 실행 명령: targeted product e2e for cross-user document/checkpoint visibility
- 기대 결과: Alice-created document/checkpoint appears for Bob without manual seed route dependency.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`로 이동했다.
- [ ] 검증 결과를 이 문서에 기록했다.
- [ ] 필요한 공식 문서 업데이트를 완료했다.
- [ ] 관련 CE/REQ evidence 또는 follow-up을 기록했다.
