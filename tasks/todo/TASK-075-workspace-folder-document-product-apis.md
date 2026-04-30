---
title: TASK-075-workspace-folder-document-product-apis
status: todo
phase: P10
task_type: parallel-backend
task_mode: parallel
owner: unassigned
depends_on:
  - TASK-072
  - TASK-073
write_set:
  - apps/api/src/modules/workspace/**
  - apps/api/src/modules/documents/**
  - packages/contracts/src/http/**
  - apps/api/src/**/*.spec.ts
  - apps/api/test/**
forbidden_paths:
  - .note/**
  - apps/web/**
  - apps/collab/**
related_requirements:
  - CE-01
  - CE-03
  - CE-05
review_required: true
---

# TASK-075: Workspace, Folder, And Document Product APIs

## 목표

Durable workspace/project/folder/document CRUD product API를 추가한다.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- product hierarchy: `docs/product/workspace/workspace-hierarchy.md`.
- dependencies: `TASK-072`, `TASK-073`.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Workspace/project/folder/document create/list/read/update/move/soft-delete APIs.
- Exactly-one-folder-per-document invariant.
- Root folder immutability.
- Document properties stored outside Markdown body.
- Link/backlink projection read API or explicit staging behind `TASK-076`.

### 제외

- Tiptap serialization contract.
- Frontend migration.
- Collaboration live state persistence.

## 계약과 의존성

| Task       | Mode       | Depends on             | Unlocks                            | Notes                     |
| ---------- | ---------- | ---------------------- | ---------------------------------- | ------------------------- |
| `TASK-075` | `parallel` | `TASK-072`, `TASK-073` | `TASK-076`, `TASK-080`, `TASK-082` | durable product API layer |

- 안정 contract: `TASK-071` route inventory and `TASK-072` persistence ports.
- Canonical route source: `packages/contracts/src/http/routes.ts`.
- Runtime schema source: `packages/contracts/src/http/schemas.ts`.
- mock 허용 여부: API tests may use isolated test DB/fixtures.
- Contract changes stop downstream workers.

## Write Set

수정 가능:

- `apps/api/src/modules/workspace/**`
- `apps/api/src/modules/documents/**`
- `packages/contracts/src/http/**`
- `apps/api/src/**/*.spec.ts`
- `apps/api/test/**`

수정 금지:

- `.note/**`
- `apps/web/**`
- `apps/collab/**`

## 인수 조건

- Workspace/project/folder/document CRUD APIs exist.
- Implemented route paths match the canonical `TASK-071` route inventory.
- Every document has exactly one folder.
- Root folders cannot be moved/deleted.
- Document properties are stored outside Markdown body.
- Link/backlink projection read API exists or is explicitly staged behind `TASK-076`.

## 검증

- 실행 명령: `pnpm --filter @rme/api test`
- 기대 결과: API tests가 통과한다.
- 실행 명령: `pnpm --filter @rme/api typecheck`
- 기대 결과: API typecheck가 통과한다.
- 실행 명령: `pnpm arch:check`
- 기대 결과: architecture boundary check가 통과한다.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: product scope expansion은 backlog로 둔다.

## Archive Checklist

- [ ] `status`를 `archived`로 변경했다.
- [ ] 파일을 `tasks/archive/`로 이동했다.
- [ ] 검증 결과를 이 문서에 기록했다.
- [ ] 필요한 공식 문서 업데이트를 완료했다.
- [ ] follow-up 또는 blocker를 기록했다.

## 메모

- `TASK-075` is a blocking content/API gate before `TASK-076` and UI product migration.
