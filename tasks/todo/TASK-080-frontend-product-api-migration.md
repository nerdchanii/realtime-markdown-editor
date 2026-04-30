---
title: TASK-080-frontend-product-api-migration
status: todo
phase: P10
task_type: parallel-ui
task_mode: parallel
owner: unassigned
depends_on:
  - TASK-075
  - TASK-078 backend-ready canonical checkpoint contract
write_set:
  - apps/web/src/lib/api-client/**
  - apps/web/src/app/**
  - apps/web/src/features/workspace/**
  - apps/web/src/features/history/**
  - apps/web/src/features/document/**
  - e2e/ce-04-history.spec.ts
  - e2e/task-045-reviewer-flow.spec.ts
forbidden_paths:
  - .note/**
  - apps/api/**
  - apps/collab/**
related_requirements:
  - CE-04
  - CE-05
review_required: true
---

# TASK-080: Frontend Product API Migration

## 목표

Workspace/document/history UI를 seed/local-only state에서 canonical product API로 이동한다.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- UI 기준: `DESIGN.md`.
- dependencies: `TASK-075`, plus `TASK-078` backend-ready canonical checkpoint contract. This task
  may start before `TASK-078` archives because CE-04 product-path verification is blocked on
  product auth/API-client/UI migration.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Workspace/document data load from product APIs.
- Checkpoint list load on mount/refresh.
- Checkpoint creation through canonical documents route.
- Cross-user refresh visibility for checkpoint updates.
- Dev seed route dependency isolated to local bootstrap.
- Editor-first product UI keeps CE coverage as behavior/e2e evidence, not visible checklist UI.

### 제외

- Backend route creation.
- Tiptap toolbar absorption and image insertion.
- Raw Markdown source/split preview.
- CE/compliance/reviewer dashboard UI.

## 계약과 의존성

| Task       | Mode       | Depends on                         | Unlocks    | Notes                     |
| ---------- | ---------- | ---------------------------------- | ---------- | ------------------------- |
| `TASK-080` | `parallel` | `TASK-075`, TASK-078 backend-ready | `TASK-082` | frontend product API path |

- 안정 contract: product APIs and checkpoint route from backend tasks.
- Canonical route source: `packages/contracts/src/http/routes.ts`.
- Checkpoint creation uses `POST /documents/:documentId/checkpoints`; collaboration checkpoint
  route is not a frontend product dependency.
- CE-01 through CE-05 are first product validation stories, not user-facing navigation labels,
  badges, or checklist panels.
- Product framing guardrail: do not claim acceptance when the path depends on
  `/review-context/seed`, URL member spoofing, fabricated document ids, retired checkpoint routes,
  local React-only state, fallback persistence, or label/button-only assertions.
- mock 허용 여부: UI tests may use explicit test bootstrap only.
- Contract changes stop work and return to main orchestrator.

## Write Set

수정 가능:

- `apps/web/src/lib/api-client/**`
- `apps/web/src/app/**`
- `apps/web/src/features/workspace/**`
- `apps/web/src/features/history/**`
- `apps/web/src/features/document/**`
- `e2e/ce-04-history.spec.ts`
- `e2e/task-045-reviewer-flow.spec.ts`

수정 금지:

- `.note/**`
- `apps/api/**`
- `apps/collab/**`

## 인수 조건

- Workspace/document data loads from product APIs.
- Checkpoint list loads from API on mount/refresh.
- Creating a checkpoint refetches or updates from the canonical documents route.
- Other users can see checkpoint updates after refresh; polling/realtime event can be staged.
- Dev seed route dependency is isolated to local bootstrap.
- Normal UI does not expose CE/compliance/reviewer/test-evidence language.

## 검증

- 실행 명령: `pnpm --filter @rme/web typecheck`
- 기대 결과: web typecheck가 통과한다.
- 실행 명령: `pnpm test:e2e e2e/ce-04-history.spec.ts e2e/task-045-reviewer-flow.spec.ts`
- 기대 결과: CE-04 and reviewer flow e2e pass.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: product API replaces seed/review APIs in normal runtime.

## Archive Checklist

- [ ] `status`를 `archived`로 변경했다.
- [ ] 파일을 `tasks/archive/`로 이동했다.
- [ ] 검증 결과를 이 문서에 기록했다.
- [ ] 필요한 공식 문서 업데이트를 완료했다.
- [ ] follow-up 또는 blocker를 기록했다.

## 메모

- Suggested worktree: `.worktrees/task-080-frontend-api`.
