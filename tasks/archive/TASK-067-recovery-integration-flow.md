---
title: TASK-067-recovery-integration-flow
status: archived
phase: P10
task_type: integration
task_mode: integration
owner: unassigned
depends_on:
  - TASK-063
  - TASK-064
  - TASK-065
  - TASK-066
write_set:
  - apps/web/src/**
  - packages/contracts/src/**
  - e2e/**
  - README.md
forbidden_paths:
  - .note/**
related_requirements:
  - CE-01-CONCURRENT-EDITING
  - CE-02-PRESENCE
  - CE-03-OFFLINE-MERGE
  - CE-04-REVISION-HISTORY
  - CE-05-RICH-PREVIEW
  - REQ-WORKSPACE-HIERARCHY
  - REQ-PROPERTIES-OUTSIDE-BODY
review_required: true
---

# TASK-067: Recovery Integration Flow

## 목표

Integrate editor, presence, workspace tree, properties, history, and reviewer documentation into one
coherent reviewer path.

## 배경

- Integration criteria: `tasks/exec-plan/04-editor-ux-recovery.md`.
- CE criteria: `docs/compliance/subject-matrix.md`.
- Product surface map: `docs/product/README.md`.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Connect outputs from `TASK-063`, `TASK-064`, `TASK-065`, and `TASK-066`.
- Resolve selector drift and update matching e2e tests.
- Confirm editor-first layout does not obscure CE evidence paths.
- Update README reviewer flow where needed.

### 제외

- New product features beyond recovery integration.
- Production auth, RBAC, comments, graph view, workflow hooks, or multi-document panes.

## 계약과 의존성

| Task       | Mode          | Depends on                                     | Unlocks    | Notes                      |
| ---------- | ------------- | ---------------------------------------------- | ---------- | -------------------------- |
| `TASK-067` | `integration` | `TASK-063`, `TASK-064`, `TASK-065`, `TASK-066` | `TASK-068` | Reviewer flow integration. |

- 안정 contract: CE-01 through CE-05 selectors remain stable or are updated with tests in the same
  task.
- mock 허용 여부: seeded reviewer setup remains allowed and explicit.

## Write Set

수정 가능:

- `apps/web/src/**`
- `packages/contracts/src/**`
- `e2e/**`
- `README.md`

수정 금지:

- `.note/**`
- Deferred product features not promoted by the recovery plan.

## 인수 조건

- Reviewer can open a workspace document, edit Rich mode, switch modes, see remote presence, create
  a document, edit properties, create a checkpoint, inspect a snapshot, and confirm preview.
- CE selectors remain stable or are updated with matching tests.
- Product extension surfaces do not obscure CE-01 through CE-05.
- No `.note/**` source is cited in official documentation.

## 검증

- 실행 명령: `pnpm typecheck`
- 실행 명령: `pnpm lint`
- 실행 명령: `pnpm arch:check`
- 실행 명령: `pnpm test:e2e e2e/task-045-reviewer-flow.spec.ts`
- 기대 결과: all commands pass.

## 검증 결과

- `pnpm typecheck` -> passed.
- `pnpm lint` -> passed.
- `pnpm arch:check` -> passed.
- `pnpm test:e2e e2e/task-045-reviewer-flow.spec.ts` -> passed as part of the final full e2e run.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: integrate completed task outputs only; do not re-own parallel task
  scope unless fixing integration drift.

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`로 이동했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
- [x] follow-up 또는 blocker를 기록했다.
