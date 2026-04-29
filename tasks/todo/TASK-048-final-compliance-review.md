---
title: TASK-048-final-compliance-review
status: todo
phase: P9
task_type: verification
task_mode: verification
owner: unassigned
depends_on:
  - TASK-046
  - TASK-047
write_set:
  - tasks/archive/**
  - docs/compliance/subject-matrix.md
  - README.md
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

# TASK-048: Final Compliance Review

## 목표

Close the long-run with a spec compliance review and code quality review.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- 실행 계획: `tasks/exec-plan/03-product-surface-compliance.md`.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- CE evidence review against official requirements.
- Archived task verification review.
- README and subject matrix final alignment.

### 제외

- New product implementation.
- CE requirement reinterpretation.

## 계약과 의존성

| Task       | Mode           | Depends on             | Unlocks | Notes                   |
| ---------- | -------------- | ---------------------- | ------- | ----------------------- |
| `TASK-048` | `verification` | `TASK-046`, `TASK-047` | 완료    | Final compliance review |

- 안정 contract: reviewer docs and full verification pass complete.
- mock 허용 여부: not applicable.

## Write Set

수정 가능:

- `tasks/archive/**`
- `docs/compliance/subject-matrix.md`
- `README.md`

수정 금지:

- `.note/**`

## 인수 조건

- Every CE row in `docs/compliance/subject-matrix.md` has product-code evidence.
- Archived task files contain verification results.
- Product extensions included in this long-run have visible reviewer paths.
- Deferred items are documented and do not appear half-implemented in the main reviewer path.

## 검증

- 실행 명령: `pnpm check`
- 실행 명령: `pnpm test:e2e`
- 실행 명령: manual code review against `subject.md` and `docs/compliance/subject-matrix.md`
- 기대 결과: all commands pass on Node `v24.15.0`.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: do not start before `TASK-046` and `TASK-047` are archived.

## Archive Checklist

- [ ] `status`를 `archived`로 변경했다.
- [ ] 파일을 `tasks/archive/`로 이동했다.
- [ ] 검증 결과를 이 문서에 기록했다.
- [ ] 필요한 공식 문서 업데이트를 완료했다.
- [ ] follow-up 또는 blocker를 기록했다.

## 메모

- Primary exec-plan completes only after this task is archived.
