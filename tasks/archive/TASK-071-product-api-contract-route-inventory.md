---
title: TASK-071-product-api-contract-route-inventory
status: archived
phase: P10
task_type: contract
task_mode: blocking
owner: unassigned
depends_on:
  - TASK-070
write_set:
  - packages/contracts/src/http/**
  - packages/contracts/src/index.ts
  - docs/architecture/backend.md
  - tasks/todo/TASK-07*.md
  - tasks/todo/TASK-08*.md
  - tasks/active/TASK-07*.md
  - tasks/active/TASK-08*.md
forbidden_paths:
  - .note/**
  - apps/api/prisma/**
  - apps/web/**
  - apps/collab/**
related_requirements:
  - CE-01
  - CE-02
  - CE-03
  - CE-04
  - CE-05
review_required: true
---

# TASK-071: Product API Contract And Route Inventory

## 목표

Implementation worker가 시작되기 전에 durable product API surface와 route ownership을 확정한다.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- 관련 아키텍처 문서: `ARCHITECTURE.md`, `docs/architecture/README.md`, `docs/adr/`.
- 실행 계획: `tasks/exec-plan/05-productization-platform.md`.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- auth/session, workspace, project, folder, document, document content, properties, links/backlinks, checkpoints, exports, image upload, collaboration session route contract.
- seed/review route의 dev-only 분류.
- DTO와 runtime schema strategy 선택.
- downstream task scope 조정이 필요하면 task 문서 업데이트.

### 제외

- Prisma schema 구현.
- API controller implementation.
- frontend migration.

## 계약과 의존성

| Task       | Mode       | Depends on | Unlocks                | Notes                                  |
| ---------- | ---------- | ---------- | ---------------------- | -------------------------------------- |
| `TASK-071` | `blocking` | `TASK-070` | `TASK-072`, `TASK-073` | product API route ownership와 DTO 확정 |

- 안정 contract: CE acceptance는 `subject.md`와 compliance matrix 기준.
- mock 허용 여부: implementation mock은 허용하지 않음. Contract-only placeholder는 가능.
- downstream worker가 contract change를 요구하면 이 task로 되돌린다.

## Write Set

수정 가능:

- `packages/contracts/src/http/**`
- `packages/contracts/src/index.ts`
- `docs/architecture/backend.md`
- `tasks/todo/TASK-07*.md`
- `tasks/todo/TASK-08*.md`
- `tasks/active/TASK-07*.md`
- `tasks/active/TASK-08*.md`

수정 금지:

- `.note/**`
- `apps/api/prisma/**`
- `apps/web/**`
- `apps/collab/**`

## 인수 조건

- Canonical product routes가 listed areas 전체에 대해 정의된다.
- `POST /documents/:documentId/checkpoints`가 canonical checkpoint creation route다.
- Collaboration routes는 checkpoint creation을 소유하지 않는다.
- Seed/review routes는 dev-only로 식별된다.
- DTO와 runtime schema strategy가 명시된다.

## 검증

- 실행 명령: `pnpm --filter @rme/contracts typecheck`
- 기대 결과: contracts package typecheck가 통과한다.
- 실행 명령: `pnpm format:check`
- 기대 결과: formatting check가 통과한다.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: downstream worker는 이 task의 contract를 벗어나면 중단한다.

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`로 이동했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
- [x] follow-up 또는 blocker를 기록했다.

## 완료 기록

### 변경 파일

- `packages/contracts/src/http/index.ts`
- `packages/contracts/src/http/routes.ts`
- `packages/contracts/src/http/schemas.ts`
- `docs/architecture/backend.md`
- `tasks/todo/TASK-072-prisma-postgres-persistence-foundation.md`
- `tasks/todo/TASK-073-api-runtime-validation-error-envelope-cors.md`
- `tasks/todo/TASK-074-auth-session-owner-member-authorization.md`
- `tasks/todo/TASK-075-workspace-folder-document-product-apis.md`
- `tasks/todo/TASK-076-current-markdown-projection-serialization-contract.md`
- `tasks/todo/TASK-077-db-backed-collaboration-session-live-yjs-persistence.md`
- `tasks/todo/TASK-078-checkpoint-metadata-artifact-split.md`
- `tasks/todo/TASK-079-artifact-backed-image-upload-api.md`
- `tasks/todo/TASK-080-frontend-product-api-migration.md`
- `tasks/todo/TASK-081-template-ui-absorption-undo-redo-image-insert.md`
- `tasks/todo/TASK-082-product-runtime-integration.md`
- `tasks/todo/TASK-083-productization-verification-gate.md`

### 검증 결과

- `pnpm --filter @rme/contracts typecheck`: 통과.
- `pnpm format:check`: 통과.
- Route/schema sanity check: `packages/contracts/src/http/routes.ts`의 84개 schema reference가 `packages/contracts/src/http/schemas.ts` catalog 43개 descriptor 안에서 모두 resolve됨.
- Main orchestrator rerun:
  - `pnpm --filter @rme/contracts typecheck`: 통과.
  - `pnpm format:check`: 통과.
  - route/schema import sanity check: 33 routes, 43 schemas, 0 missing schema refs.

### Review 결과

- Spec, code quality, boundary review를 수행했다.
- Review 지적 사항:
  - route schema response refs가 catalog에 없던 문제: response descriptor를 추가해 해결.
  - multipart image upload request DTO와 schema 불일치: `MultipartFilePartDto`를 추가해 해결.
  - write set 경고: `tasks/exec-plan/README.md`, `tasks/exec-plan/05-productization-platform.md`, `tasks/archive/TASK-070-productization-task-materialization.md`는 phase agent 시작 전 main orchestrator dirty baseline이며 TASK-071에서 수정하지 않았다.

### Acceptance

- Canonical product route inventory를 `packages/contracts/src/http/routes.ts`에 정의했다.
- `POST /documents/:documentId/checkpoints`를 canonical checkpoint creation route로 고정했다.
- Collaboration route는 product checkpoint creation을 소유하지 않으며 기존 collaboration checkpoint route를 retired로 분류했다.
- `GET /review-context/seed`, `GET /collaboration/sessions/seed`를 dev-only로 분류했다.
- DTO와 runtime schema strategy를 `packages/contracts/src/http/index.ts`와 `packages/contracts/src/http/schemas.ts`에 명시했다.

### Follow-up / Risk

- `TASK-073`이 schema descriptor catalog를 Nest runtime validation과 centralized error envelope로 실제 적용해야 한다.
- `TASK-076`이 export/checkpoint의 server-resolved current Markdown content handoff를 구현해야 한다.

## 메모

- Phase agent prompt must include `tasks/_templates/SUBAGENT-PREAMBLE.md`, the model policy, write set, forbidden paths, dependencies, and verification commands.
- Started by main orchestrator after `TASK-070` was archived.
