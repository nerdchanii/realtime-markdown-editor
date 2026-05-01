---
title: TASK-091-ce-acceptance-test-decoupling
status: todo
phase: P11
task_type: verification
task_mode: blocking
owner: qa-agent
scope_note: decouple CE acceptance tests from initial UI implementation details
depends_on:
  - TASK-084
write_set:
  - docs/compliance/subject-matrix.md
  - docs/requirements/items/REQ-CE-ACCEPTANCE-TEST-DECOUPLING.md
  - e2e/ce-*.spec.ts
  - e2e/support/**
  - tasks/todo/TASK-091-ce-acceptance-test-decoupling.md
  - tasks/active/TASK-091-ce-acceptance-test-decoupling.md
  - tasks/archive/TASK-091-ce-acceptance-test-decoupling.md
forbidden_paths:
  - .note/**
  - apps/api/**
  - apps/collab/**
  - apps/web/src/**
  - packages/**
related_requirements:
  - REQ-CE-ACCEPTANCE-TEST-DECOUPLING
  - CE-01-CONCURRENT-EDITING
  - CE-02-PRESENCE
  - CE-03-OFFLINE-MERGE
  - CE-04-REVISION-HISTORY
  - CE-05-RICH-PREVIEW
review_required: true
---

# TASK-091: CE Acceptance Test Decoupling

## 목표

CE e2e를 초기 UI 구현 세부사항이 아니라 `subject.md` 기반 사용자 행동 계약을 검증하는 acceptance test로
정리한다.

## 배경

- `TASK-086` UI refresh가 진행되면 기존 레이아웃, copy, seed 문서명, helper route가 바뀔 수 있다.
- CE-01~CE-05는 낮추면 안 되지만, 테스트가 초기 구현을 보존하는 방식으로 굳어지면 UI 개선과 productization을
  방해한다.
- 이 task는 product source code를 수정하지 않고, 테스트 정책과 e2e 검증 경계를 정리한다.

## 범위

### 포함

- `e2e/ce-*.spec.ts`의 assertion을 사용자 관점 결과 중심으로 재검토한다.
- 특정 layout/copy/seed/test-id/adapter internals에 묶인 assertion을 helper 또는 contract 단위로 분리한다.
- CE별 필수 evidence를 `docs/compliance/subject-matrix.md`와 일관되게 정리한다.
- 기존 spec을 바로 개편하기 어렵다면 legacy smoke와 acceptance spec의 역할을 명확히 분리한다.

### 제외

- CE-01~CE-05 기준 완화.
- Product source code 수정.
- Server/API/domain/persistence/authorization 정책 변경.
- UI refresh 구현.

## 인수 조건

- CE e2e는 사용자 결과를 검증하고 초기 UI 세부사항을 제품 계약처럼 고정하지 않는다.
- UI copy 또는 pane composition 변경만으로 CE acceptance가 깨지지 않는 구조다.
- 보안/권한/도메인 정책은 가능한 API/use-case/contract 테스트로 분리되어 있고 CE e2e가 과도하게 떠맡지 않는다.
- `docs/compliance/subject-matrix.md`의 evidence 설명이 새 테스트 정책과 일치한다.
- Product source code 변경 없이 완료한다. 필요한 hook이 발견되면 별도 task로 기록한다.

## 검증

- 실행 명령: `scripts/with-node.sh pnpm exec playwright test e2e/ce-01-concurrent-editing.spec.ts e2e/ce-02-presence.spec.ts e2e/ce-03-offline-merge.spec.ts e2e/ce-04-revision-history.spec.ts e2e/ce-05-rich-preview.spec.ts`
- 기대 결과: CE acceptance tests pass.
- 실행 명령: `scripts/with-node.sh pnpm format:check`
- 기대 결과: changed Markdown and e2e files are formatted.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Visual/design review 필요 여부: 불필요.

## Archive Checklist

- [ ] `status`를 `archived`로 변경했다.
- [ ] 파일을 `tasks/archive/`로 이동했다.
- [ ] 검증 결과를 이 문서에 기록했다.
- [ ] 필요한 공식 문서 업데이트를 완료했다.
- [ ] 관련 CE/REQ evidence 또는 follow-up을 기록했다.
