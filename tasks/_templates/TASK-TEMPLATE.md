---
title: TASK-000-example
status: todo
phase: none
task_type: contract
owner: unassigned
depends_on: []
write_set:
  - tasks/_templates/TASK-TEMPLATE.md
forbidden_paths:
  - .note/**
related_requirements: []
review_required: true
---

# TASK-000: Example

## 목표

작업 목표를 한 문장으로 적는다.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- 포함할 변경.

### 제외

- 제외할 변경.

## 계약과 의존성

- 선행 task: 없음.
- 안정 contract: 없음.
- mock 허용 여부: 허용하지 않음.

## Write Set

수정 가능:

- `tasks/_templates/TASK-TEMPLATE.md`

수정 금지:

- `.note/**`

## 인수 조건

- 검증 가능한 완료 조건을 적는다.
- CE/REQ와 관련되면 관련 ID와 evidence 기준을 적는다.

## 검증

- 실행 명령: `pnpm format:check`
- 기대 결과: formatting check가 통과한다.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 해당 없음.

## Archive Checklist

- [ ] `status`를 `archived`로 변경했다.
- [ ] 파일을 `tasks/archive/`로 이동했다.
- [ ] 검증 결과를 이 문서에 기록했다.
- [ ] 필요한 공식 문서 업데이트를 완료했다.
- [ ] follow-up 또는 blocker를 기록했다.

## 메모

- 관련 문서와 결정 사항.
