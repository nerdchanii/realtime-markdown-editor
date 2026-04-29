---
title: TASK-046-reviewer-readme-scenario
status: todo
phase: P8
task_type: docs
task_mode: docs
owner: unassigned
depends_on:
  - TASK-045
write_set:
  - README.md
  - docs/compliance/subject-matrix.md
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

# TASK-046: Reviewer README And Scenario

## 목표

Expand root README for final local review.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- 실행 계획: `tasks/exec-plan/03-product-surface-compliance.md`.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Install/run/reviewer URL documentation.
- Seeded identities and CE scenario order.
- Included/deferred product extension summary.
- Subject matrix evidence updates for behavior that exists.

### 제외

- Citing `.note/**`.
- Claiming unsupported or deferred behavior.

## 계약과 의존성

| Task       | Mode   | Depends on | Unlocks    | Notes                  |
| ---------- | ------ | ---------- | ---------- | ---------------------- |
| `TASK-046` | `docs` | `TASK-045` | `TASK-048` | Reviewer documentation |

- 안정 contract: product surface integration from `TASK-045`.
- mock 허용 여부: documentation must describe actual reviewer path.

## Write Set

수정 가능:

- `README.md`
- `docs/compliance/subject-matrix.md`

수정 금지:

- `.note/**`

## 인수 조건

- README explains install, run, seeded identities, reviewer URL, and CE scenario order.
- README identifies included product extensions and intentionally deferred items.
- Subject matrix evidence statements reference product behavior that exists.
- README does not cite `.note/**`.

## 검증

- 실행 명령: `pnpm format:check`
- 기대 결과: formatting check passes on Node `v24.15.0`.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 해당 없음.
- Boundary review 필요 여부: 해당 없음.
- Orchestration guardrail 확인: do not start before `TASK-045` is archived.

## Archive Checklist

- [ ] `status`를 `archived`로 변경했다.
- [ ] 파일을 `tasks/archive/`로 이동했다.
- [ ] 검증 결과를 이 문서에 기록했다.
- [ ] 필요한 공식 문서 업데이트를 완료했다.
- [ ] follow-up 또는 blocker를 기록했다.

## 메모

- Unblocks `TASK-048` with `TASK-047`.
