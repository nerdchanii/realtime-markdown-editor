---
title: TASK-073-api-runtime-validation-error-envelope-cors
status: blocked
phase: P10
task_type: parallel-backend
task_mode: blocking
owner: unassigned
depends_on:
  - TASK-071
write_set:
  - packages/contracts/src/http/**
  - apps/api/src/main.ts
  - apps/api/src/**/*.controller.ts
  - apps/api/src/**/interfaces/**
  - apps/api/src/**/*.spec.ts
  - apps/api/test/**
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

# TASK-073: API Runtime Validation, Error Envelope, And CORS

## 목표

API boundary에 centralized CORS, request validation, stable JSON error envelope를 적용한다.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- route/DTO source: `TASK-071`.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Centralized CORS configuration.
- Params, query, body request validation.
- Error envelope: `code`, `message`, optional `details`, optional `requestId`.
- API tests for validation/authz/resource errors.

### 제외

- Prisma/Postgres schema.
- Auth/session implementation beyond response envelope integration.
- Frontend handling.

## 계약과 의존성

| Task       | Mode       | Depends on | Unlocks                            | Notes                      |
| ---------- | ---------- | ---------- | ---------------------------------- | -------------------------- |
| `TASK-073` | `blocking` | `TASK-071` | `TASK-074`, `TASK-075`, `TASK-079` | runtime boundary hardening |

- 안정 contract: `TASK-071` DTO and runtime schema strategy.
- Runtime schema source: `packages/contracts/src/http/schemas.ts` descriptor catalog.
- Error envelope source: `ApiErrorResponseDto` from `packages/contracts/src/http/index.ts`.
- mock 허용 여부: test-only fixtures allowed.
- invalid IDs/body return `400`; unauthenticated `401`; forbidden `403`; missing resources `404`.

## Write Set

수정 가능:

- `packages/contracts/src/http/**`
- `apps/api/src/main.ts`
- `apps/api/src/**/*.controller.ts`
- `apps/api/src/**/interfaces/**`
- `apps/api/src/**/*.spec.ts`
- `apps/api/test/**`

수정 금지:

- `.note/**`
- `apps/api/prisma/**`
- `apps/web/**`
- `apps/collab/**`

## 인수 조건

- Per-route wildcard CORS가 centralized CORS로 대체된다.
- Request validation이 params, query, body에 존재한다.
- Stable JSON error envelope가 모든 boundary error에 적용된다.
- Validation implementation follows the `TASK-071` schema descriptor strategy rather than domain classes or provider SDK types.
- 주요 status code semantics가 test로 고정된다.

## 검증

- 실행 명령: `pnpm --filter @rme/api test`
- 기대 결과: API tests가 통과한다.
- 실행 명령: `pnpm --filter @rme/api typecheck`
- 기대 결과: API typecheck가 통과한다.
- 실행 명령: `pnpm lint`
- 기대 결과: lint가 통과한다.

## Verification Results

- `pnpm --filter @rme/api test`: blocked by sandbox IPC failure:
  `Error: listen EPERM: operation not permitted /var/folders/_3/9jl9wf6x36b67_f40c_9vpt40000gn/T/tsx-501/56244.pipe`.
  Escalated rerun was rejected because the task instructions say to report this exact `tsx`
  IPC block for the main orchestrator.
- `pnpm --filter @rme/api typecheck`: failed. The remaining errors are the markdown export
  controller/use case still using the pre-TASK-071 public `CreateMarkdownExportRequestDto`
  shape with `documentId`, `properties`, and `markdownBody`.
- `pnpm lint`: passed.
- Main orchestrator confirmation:
  - `pnpm --filter @rme/api typecheck`: failed with errors in
    `apps/api/src/modules/documents/interfaces/markdown-export.controller.ts` and
    `apps/api/src/modules/documents/use-cases/export-markdown-use-case.ts` because
    `CreateMarkdownExportRequestDto` is now the product request body `{ filename?: string }`.
  - `apps/api/src/modules/documents/use-cases/export-markdown-use-case.ts` is outside the
    declared TASK-073 write set.
  - `TASK-074` and `TASK-075` were returned to `tasks/todo/` because `TASK-073` is blocked and
    downstream tasks must not be active before this gate archives.

## Blocked

TASK-073 cannot be completed within the declared write set because
`apps/api/src/modules/documents/use-cases/export-markdown-use-case.ts` is outside the task write
set but still imports `CreateMarkdownExportRequestDto` as its internal use-case input. TASK-071
narrowed that public request DTO to `{ filename?: string }` so the export route can resolve
document content and properties server-side. A follow-up or orchestrator decision is needed to
change the export use-case input to a local/server-side input type, or to explicitly expand
TASK-073's write set to include that use-case file. Widening the public request DTO would make the
schema descriptor and CE-05 export path less clear, so I did not do that.

Required decision:

- Approve expanding TASK-073's write set to include
  `apps/api/src/modules/documents/use-cases/export-markdown-use-case.ts` for export use-case input
  separation only, or assign a separate prerequisite/follow-up task before TASK-073 can archive.

Decision on 2026-04-30:

- Do not expand TASK-073's write set.
- Created prerequisite `TASK-073A: Markdown Export Input Boundary`.
- TASK-073 remains blocked until `TASK-073A` is archived.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: route contract 변경이 필요하면 downstream을 멈추고 `TASK-071`로 되돌린다.

## Archive Checklist

- [ ] `status`를 `archived`로 변경했다.
- [ ] 파일을 `tasks/archive/`로 이동했다.
- [ ] 검증 결과를 이 문서에 기록했다.
- [ ] 필요한 공식 문서 업데이트를 완료했다.
- [ ] follow-up 또는 blocker를 기록했다.

## 메모

- Candidate parallel worktree after `TASK-071`: `.worktrees/task-073-runtime-boundary`.
- Started by main orchestrator after `TASK-072` was archived and independently verified.
