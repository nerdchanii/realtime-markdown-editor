---
title: TASK-022-collab-runtime-skeleton
status: archived
phase: P2
task_type: runtime
task_mode: parallel-backend
owner: worker-019ddaf9-3ec5-7be3-abd8-d9a62a426267
depends_on:
  - TASK-020
write_set:
  - apps/collab/**
  - package.json
forbidden_paths:
  - .note/**
  - apps/api/src/modules/**
  - apps/web/**
related_requirements:
  - CE-01
  - CE-02
  - CE-03
review_required: true
---

# TASK-022: Collab Runtime Skeleton

## 목표

Build `apps/collab` as the standalone realtime runtime skeleton.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- 실행 계획: `tasks/exec-plan/02-collaboration-persistence.md`.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Startable Hocuspocus runtime separate from API.
- Provider-neutral session validation through a port/client boundary.
- One seeded Yjs document host path.
- Boundary test or architecture evidence that `apps/collab` does not import API source.

### 제외

- API session contract implementation.
- Web adapter implementation.
- Live persistence or checkpoint artifacts.

## 계약과 의존성

| Task       | Mode               | Depends on | Unlocks    | Notes                      |
| ---------- | ------------------ | ---------- | ---------- | -------------------------- |
| `TASK-022` | `parallel-backend` | `TASK-020` | `TASK-024` | Standalone collab runtime. |

- 안정 contract: package topology from `TASK-020`.
- mock 허용 여부: seeded in-memory document is allowed.

## Write Set

수정 가능:

- `apps/collab/**`
- `package.json`

수정 금지:

- `.note/**`
- `apps/api/src/modules/**`
- `apps/web/**`

## 인수 조건

- Hocuspocus server starts separately from API.
- Runtime validates provider-neutral session shape through a port/client boundary.
- Runtime can host one seeded Yjs document.
- Runtime has a boundary test or architecture check proving it does not import API source.

## 검증

- 실행 명령: `pnpm --filter @rme/collab typecheck`
- 실행 명령: `pnpm arch:check`
- 기대 결과: all commands pass on Node `v24.15.0`.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: do not edit API modules or web files.

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`로 이동했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
- [x] follow-up 또는 blocker를 기록했다.

## 메모

- Unblocks `TASK-024` with `TASK-021` and `TASK-023`.
- Verification:
  - `node -v` -> `v24.15.0`
  - `pnpm -v` -> `10.28.2`
  - `pnpm --filter @rme/collab typecheck` -> pass.
  - `pnpm --filter @rme/collab test` -> pass.
  - `pnpm arch:check` -> pass.
  - `pnpm lint` -> pass after collab lint fixes.
  - `pnpm format:check` -> pass.
- Worker reported `pnpm --filter @rme/collab build` passed and `pnpm --filter @rme/collab start`
  started locally after port escalation, then was stopped.
- Lint follow-up handled by main session:
  - extracted seeded session payload to keep function length inside lint limit.
  - imported `URL` from `node:url` in the boundary test.
- Worker reported acceptance met and no unresolved TASK-022 blockers.
