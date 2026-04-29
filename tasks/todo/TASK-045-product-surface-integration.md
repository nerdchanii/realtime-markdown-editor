---
title: TASK-045-product-surface-integration
status: todo
phase: P7
task_type: integration
task_mode: integration
owner: unassigned
depends_on:
  - TASK-041
  - TASK-042
  - TASK-043
  - TASK-044
write_set:
  - apps/api/src/modules/**
  - apps/web/src/**
  - packages/contracts/src/**
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

# TASK-045: Product Surface Integration

## 목표

Connect modes, properties, backlinks, export, and workspace navigation into one reviewer flow.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- 실행 계획: `tasks/exec-plan/03-product-surface-compliance.md`.
- product 기준: `docs/product/README.md`, `docs/product/editor/**`, `docs/product/workspace/workspace-hierarchy.md`.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Integrated reviewer flow across workspace navigation, editor, properties, backlinks, preview modes, history, and export.
- Stable CE selectors.
- Product smoke coverage if needed.

### 제외

- Deferred product scope not promoted by Plan 03.
- CE requirement reinterpretation.

## 계약과 의존성

| Task       | Mode          | Depends on                                     | Unlocks                | Notes                       |
| ---------- | ------------- | ---------------------------------------------- | ---------------------- | --------------------------- |
| `TASK-045` | `integration` | `TASK-041`, `TASK-042`, `TASK-043`, `TASK-044` | `TASK-046`, `TASK-047` | Product surface integration |

- 안정 contract: all Plan 03 parallel feature tasks archived.
- mock 허용 여부: no mock-only product acceptance.

## Write Set

수정 가능:

- `apps/api/src/modules/**`
- `apps/web/src/**`
- `packages/contracts/src/**`
- `e2e/**`

수정 금지:

- `.note/**`

## 인수 조건

- Reviewer can start at workspace navigation, open seeded document, edit collaboratively, inspect properties/backlinks, switch preview modes, create history checkpoint, inspect snapshot, and export Markdown.
- CE selectors remain stable.
- No product extension hides the CE-01 through CE-05 path.

## 검증

- 실행 명령: `pnpm typecheck`
- 실행 명령: `pnpm lint`
- 실행 명령: `pnpm arch:check`
- 실행 명령: `pnpm test:e2e`
- 기대 결과: all commands pass on Node `v24.15.0`.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: do not start before `TASK-041` through `TASK-044` are archived.

## Archive Checklist

- [ ] `status`를 `archived`로 변경했다.
- [ ] 파일을 `tasks/archive/`로 이동했다.
- [ ] 검증 결과를 이 문서에 기록했다.
- [ ] 필요한 공식 문서 업데이트를 완료했다.
- [ ] follow-up 또는 blocker를 기록했다.

## 메모

- Unblocks `TASK-046` and `TASK-047`.
