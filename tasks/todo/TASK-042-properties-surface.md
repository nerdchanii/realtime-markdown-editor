---
title: TASK-042-properties-surface
status: todo
phase: P6
task_type: feature
task_mode: parallel-ui
owner: unassigned
depends_on:
  - TASK-040
write_set:
  - apps/api/src/modules/documents/**
  - apps/web/src/features/document/**
  - apps/web/src/lib/api-client/**
  - packages/contracts/src/http/**
forbidden_paths:
  - .note/**
related_requirements: []
review_required: true
---

# TASK-042: Properties Surface

## 목표

Implement document properties outside Markdown body.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- 실행 계획: `tasks/exec-plan/03-product-surface-compliance.md`.
- product 기준: `docs/product/editor/properties.md`.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Properties near the document title, outside editor body.
- V1 property types already represented in contract.
- Member property using workspace membership identity.

### 제외

- RBAC/admin membership management.
- Production identity provider.

## 계약과 의존성

| Task       | Mode          | Depends on | Unlocks    | Notes             |
| ---------- | ------------- | ---------- | ---------- | ----------------- |
| `TASK-042` | `parallel-ui` | `TASK-040` | `TASK-045` | Properties UI/API |

- 안정 contract: product surface contract from `TASK-040`.
- mock 허용 여부: mock and API behavior must stay aligned.

## Write Set

수정 가능:

- `apps/api/src/modules/documents/**`
- `apps/web/src/features/document/**`
- `apps/web/src/lib/api-client/**`
- `packages/contracts/src/http/**`

수정 금지:

- `.note/**`

## 인수 조건

- Properties appear near document title, not inside editor body.
- Supported v1 property types are text, status/select, date, member, and checkbox if already represented.
- Editing a property does not mutate Markdown body.
- Member property uses workspace membership identity.

## 검증

- 실행 명령: `pnpm typecheck`
- 실행 명령: `pnpm lint`
- 실행 명령: `pnpm arch:check`
- 기대 결과: all commands pass on Node `v24.15.0`.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: do not start before `TASK-040` is archived.

## Archive Checklist

- [ ] `status`를 `archived`로 변경했다.
- [ ] 파일을 `tasks/archive/`로 이동했다.
- [ ] 검증 결과를 이 문서에 기록했다.
- [ ] 필요한 공식 문서 업데이트를 완료했다.
- [ ] follow-up 또는 blocker를 기록했다.

## 메모

- Parallel with `TASK-041`, `TASK-043`, and `TASK-044` after `TASK-040`.
