---
title: TASK-064-workspace-tree-and-document-entry-points
status: archived
phase: P10
task_type: parallel-ui
task_mode: parallel
owner: unassigned
depends_on:
  - TASK-061
write_set:
  - apps/web/src/features/workspace/**
  - apps/web/src/app/**
  - apps/web/src/lib/api-client/**
  - packages/contracts/src/http/**
  - e2e/task-045-reviewer-flow.spec.ts
  - e2e/product-workspace-document-entrypoints.spec.ts
forbidden_paths:
  - .note/**
related_requirements:
  - REQ-WORKSPACE-DOCUMENT-SCOPE
  - REQ-WORKSPACE-HIERARCHY
review_required: true
---

# TASK-064: Workspace Tree And Document Entry Points

## 목표

Make the left navigation read as a real workspace/folder/document tree and provide credible
document creation and selection entrypoints.

## 배경

- Product criteria: `docs/product/workspace/workspace-hierarchy.md`.
- Domain criteria: `docs/domain/README.md` and workspace/folder/document model docs.
- Recovery baseline: `TASK-060` found no interrupted workspace partial diff to preserve.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Improve visual hierarchy for workspace, project, folder, and document nodes.
- Add a clear create-new-Markdown-document entrypoint.
- Make created documents selectable and openable in the editor, using staged/mock persistence only
  if this task records the boundary explicitly.
- Remove internal scaffolding labels such as provider or replacement-point names from product UI.
- Add or update product smoke e2e coverage for document creation and selection.

### 제외

- Production workspace/project/folder CRUD persistence unless explicitly promoted.
- Auth, RBAC, or admin controls.
- Rich editor implementation.

## 계약과 의존성

| Task       | Mode          | Depends on | Unlocks    | Notes                         |
| ---------- | ------------- | ---------- | ---------- | ----------------------------- |
| `TASK-064` | `parallel-ui` | `TASK-061` | `TASK-067` | Uses shadcn/token foundation. |

- 안정 contract: workspace-scoped seeded review document remains reachable for CE tests.
- mock 허용 여부: staged document creation may be client-local only if clearly documented in UI code
  and follow-up notes.

## Write Set

수정 가능:

- `apps/web/src/features/workspace/**`
- `apps/web/src/app/**`
- `apps/web/src/lib/api-client/**`
- `packages/contracts/src/http/**` only if contract changes are required.
- `e2e/task-045-reviewer-flow.spec.ts` or a new product smoke spec.

수정 금지:

- `.note/**`
- Editor collaboration internals.

## 인수 조건

- Workspace/project/folder/document hierarchy reads visually as a tree.
- Reviewer can create a new Markdown document from a clear entrypoint.
- The new document becomes selectable and opens in the editor.
- Folder/workspace create/edit/delete controls are staged visibly or documented as deferred if not
  implemented in this plan.
- The tree does not show internal scaffolding text such as replacement-point/provider names.

## 검증

- 실행 명령: `pnpm --filter @rme/web typecheck`
- 실행 명령: `pnpm lint`
- 실행 명령: product smoke e2e for document creation and selection.
- 기대 결과: all commands pass.

## 검증 결과

- `pnpm --filter @rme/web typecheck` -> passed.
- `pnpm lint` -> passed.
- `pnpm test:e2e e2e/product-workspace-document-entrypoints.spec.ts` -> passed as part of the final
  full e2e run.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요 if contracts change.
- Orchestration guardrail 확인: keep CE seeded document path visible.

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`로 이동했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
- [x] follow-up 또는 blocker를 기록했다.
