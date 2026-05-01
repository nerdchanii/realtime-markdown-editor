---
title: TASK-090-presence-caret-label-legibility
status: todo
phase: P11
task_type: parallel-ui
task_mode: blocking
owner: unassigned
depends_on:
  - TASK-084
write_set:
  - apps/web/src/features/editor/**
  - e2e/ce-02-presence.spec.ts
  - docs/product/editor/presence.md
  - docs/requirements/items/REQ-PRESENCE-CARET-LABEL-LEGIBILITY.md
  - tasks/todo/TASK-090-presence-caret-label-legibility.md
  - tasks/active/TASK-090-presence-caret-label-legibility.md
  - tasks/archive/TASK-090-presence-caret-label-legibility.md
forbidden_paths:
  - .note/**
  - apps/api/**
  - apps/collab/**
related_requirements:
  - REQ-PRESENCE-CARET-LABEL-LEGIBILITY
  - REQ-PRESENCE-MEMBER-AWARENESS
  - CE-02-PRESENCE
review_required: true
---

# TASK-090: Presence Caret Label Legibility

## 목표

Remote caret를 더 명확한 visual weight로 표시하고 member name label을 editor surface 안에서 함께 보여준다.

## 배경

- `REQ-PRESENCE-CARET-LABEL-LEGIBILITY`는 색상만으로 remote user를 식별하기 어려운 문제를 닫는다.
- `TASK-084`가 editor adapter internals를 변경 중이므로, 이 task는 `TASK-084` 완료 후 시작한다.

## 범위

### 포함

- Remote caret 두께/marker 개선.
- Remote member name label 표시.
- Selection-only 상태에서도 member identity 유지.
- Label이 editable Markdown content로 들어가지 않도록 보장.
- CE-02 또는 visual smoke 검증.

### 제외

- Server/collab runtime 변경.
- Presence avatars in top bar.
- Comments-aware presence.
- Reading vs editing intent state.

## 인수 조건

- Alice 화면에서 Bob caret가 thin 1px line처럼 묻히지 않는다.
- Bob display name label이 caret 또는 selection 근처에 보인다.
- Selection range만 있어도 member identity를 잃지 않는다.
- Label은 Markdown body content가 아니다.

## 검증

- 실행 명령: `scripts/with-node.sh pnpm --filter @rme/web typecheck`
- 기대 결과: web typecheck passes.
- 실행 명령: `scripts/with-node.sh pnpm test:e2e -- e2e/ce-02-presence.spec.ts`
- 기대 결과: CE-02 presence path passes with caret/member label evidence.

## Review

- Visual/design review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.

## Archive Checklist

- [ ] `status`를 `archived`로 변경했다.
- [ ] 파일을 `tasks/archive/`로 이동했다.
- [ ] 검증 결과를 이 문서에 기록했다.
- [ ] 필요한 공식 문서 업데이트를 완료했다.
- [ ] 관련 CE/REQ evidence 또는 follow-up을 기록했다.
