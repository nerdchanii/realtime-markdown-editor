---
title: TASK-083-productization-verification-gate
status: todo
phase: P10
task_type: verification
task_mode: verification
owner: unassigned
depends_on:
  - TASK-082
write_set:
  - README.md
  - docs/compliance/subject-matrix.md
  - docs/requirements/registry.md
  - tasks/active/**
  - tasks/archive/**
  - e2e/**
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

# TASK-083: Productization Verification Gate

## 목표

Productization 결과가 tests뿐 아니라 product/runtime expectation과 CE evidence를 충족하는지 최종 검증한다.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- dependencies: `TASK-082`.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Full `pnpm check`.
- Full `pnpm test:e2e`.
- Manual reviewer path documentation.
- README local Postgres/object storage/product login/bootstrap/reviewer flow update.
- Compliance matrix evidence truth check.
- Deferred items placed in backlog rather than hidden as implementation gaps.

### 제외

- Feature implementation except test robustness fixes in `e2e/**`.
- New product scope not in official docs or `05-productization-platform.md`.

## 계약과 의존성

| Task       | Mode           | Depends on | Unlocks | Notes              |
| ---------- | -------------- | ---------- | ------- | ------------------ |
| `TASK-083` | `verification` | `TASK-082` | 완료    | final release gate |

- 안정 contract: integrated product runtime from `TASK-082`.
- mock 허용 여부: normal reviewer path cannot require seed/review APIs except dev bootstrap.
- Verify seed/review routes remain dev-only according to `packages/contracts/src/http/routes.ts`.
- Failures become blocker notes or scoped fixes.

## Write Set

수정 가능:

- `README.md`
- `docs/compliance/subject-matrix.md`
- `docs/requirements/registry.md`
- `tasks/active/**`
- `tasks/archive/**`
- `e2e/**`

수정 금지:

- `.note/**`

## 인수 조건

- `pnpm check` passes.
- Full `pnpm test:e2e` passes.
- Manual reviewer path is documented.
- README explains product login/bootstrap, local Postgres/object storage setup, and reviewer flow.
- Compliance matrix evidence statements are true for product code.
- Known deferred items are in backlog, not hidden in implementation gaps.

## 검증

- 실행 명령: `pnpm check`
- 기대 결과: full check passes.
- 실행 명령: `pnpm test:e2e`
- 기대 결과: full e2e suite passes.
- 실행 명령: manual smoke of login, open document, collaborate, undo/redo, checkpoint, refresh, export, upload image.
- 기대 결과: reviewer product flow works.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: final evidence must cite official docs, not `.note/**`.

## Archive Checklist

- [ ] `status`를 `archived`로 변경했다.
- [ ] 파일을 `tasks/archive/`로 이동했다.
- [ ] 검증 결과를 이 문서에 기록했다.
- [ ] 필요한 공식 문서 업데이트를 완료했다.
- [ ] follow-up 또는 blocker를 기록했다.

## 메모

- Final gate commands: `pnpm check`, `pnpm test:e2e`.
