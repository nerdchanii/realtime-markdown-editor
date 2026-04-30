---
title: TASK-074-auth-session-owner-member-authorization
status: archived
phase: P10
task_type: parallel-backend
task_mode: parallel
owner: unassigned
depends_on:
  - TASK-072
  - TASK-073
write_set:
  - apps/api/src/modules/identity/**
  - apps/api/src/modules/workspace/**
  - apps/api/src/modules/collaboration/**
  - packages/contracts/src/http/**
  - apps/api/src/**/*.spec.ts
  - apps/api/test/**
forbidden_paths:
  - .note/**
  - apps/web/**
  - apps/collab/**
related_requirements:
  - CE-01
  - CE-02
  - CE-03
  - CE-04
review_required: true
---

# TASK-074: Auth Session And Owner/Member Authorization

## 목표

DB-backed session과 httpOnly cookie 기반 current user/membership boundary를 추가한다.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- dependencies: `TASK-072` Prisma foundation, `TASK-073` validation/error boundary.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Login/session/me API.
- httpOnly session cookie.
- DB lookup 기반 current workspace membership.
- owner/member authorization guard.
- public API request에서 `memberId`, `authorMembershipId` trust 제거.

### 제외

- editor/viewer/admin role expansion.
- external identity provider.
- frontend login UI beyond test fixtures unless explicitly coordinated by `TASK-082`.

## 계약과 의존성

| Task       | Mode       | Depends on             | Unlocks                | Notes                   |
| ---------- | ---------- | ---------------------- | ---------------------- | ----------------------- |
| `TASK-074` | `parallel` | `TASK-072`, `TASK-073` | `TASK-077`, `TASK-082` | first identity boundary |

- 안정 contract: owner/member only.
- Canonical auth route source: `POST/GET/DELETE /auth/session` from
  `packages/contracts/src/http/routes.ts`.
- Product route request DTOs do not trust `memberId` or `authorMembershipId`; current membership is session-derived.
- mock 허용 여부: test-only session fixtures allowed.
- If auth route contract needs changing, stop and route to main orchestrator.

## Write Set

수정 가능:

- `apps/api/src/modules/identity/**`
- `apps/api/src/modules/workspace/**`
- `apps/api/src/modules/collaboration/**`
- `packages/contracts/src/http/**`
- `apps/api/src/**/*.spec.ts`
- `apps/api/test/**`

수정 금지:

- `.note/**`
- `apps/web/**`
- `apps/collab/**`

## 인수 조건

- Login/session/me API exists.
- Current user is derived from an httpOnly session cookie.
- Current workspace membership is derived by DB lookup.
- Owner/member guards protect workspace/document/collaboration/checkpoint actions.
- Public API no longer trusts member identifiers from request data.

## 검증

- 실행 명령: `pnpm --filter @rme/api test`
- 기대 결과: API tests가 통과한다.
- 실행 명령: `pnpm --filter @rme/api typecheck`
- 기대 결과: API typecheck가 통과한다.

### 완료 검증 결과

- `fnm use`: succeeded in `.worktrees/task-074-auth` with Node `v24.15.0`.
- `node -v`: `v24.15.0`.
- `pnpm -v`: `10.28.2`.
- `pnpm exec tsc -b packages/contracts`: passed.
- `pnpm --filter @rme/api test`: passed, 15 tests, 0 failures.
- `pnpm --filter @rme/api typecheck`: passed.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: role model expansion은 금지한다.

### 완료 Review 결과

- Spec/scope reviewer: found document checkpoint/export guard gaps outside TASK-074 production write set and auth session role DTO concern; no forbidden UI path touches.
- Code quality reviewer: found malformed cookie parsing risk; fixed by treating malformed session cookie encoding as absent/invalid.
- Boundary/write-set reviewer: found retired collaboration session/checkpoint routes still trusting public member identifiers. The retired collaboration document session route was unmounted as TASK-074-owned auth boundary work. Retired checkpoint route ownership is deferred to TASK-078 and was not included in the TASK-074 commit. Also noted task file move is outside declared write set, but it is required by the task workflow.

### Follow-up / Scope Concern

- `apps/api/src/modules/documents/interfaces/checkpoints.controller.ts` still reads checkpoint authorship data from the request body and should be moved to session-derived membership by the documents/checkpoint owner. This production path is outside TASK-074's write set and was explicitly not changed.
- Retired `POST /collaboration/documents/:documentId/checkpoints` route ownership and the checkpoint smoke-test move to canonical `POST /documents/:documentId/checkpoints` are TASK-078-owned and intentionally left out of TASK-074.
- `apps/api/src/modules/documents/interfaces/markdown-export.controller.ts` still lacks a session membership guard. This production path is outside TASK-074's write set and was not changed.
- Existing seed/review DTO role vocabulary still contains `editor`/`viewer`; TASK-074's DB-backed session and collaboration membership lookup is constrained to the Prisma `owner`/`member` model, but public DTO cleanup requires coordinated contract/seed-context work outside this task's allowed production paths.

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`로 이동했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
- [x] follow-up 또는 blocker를 기록했다.

## 메모

- Suggested worktree: `.worktrees/task-074-auth`.
