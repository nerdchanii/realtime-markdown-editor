---
title: TASK-029-presence-integration
status: archived
phase: P5
task_type: feature
task_mode: parallel-ui
owner: codex
depends_on:
  - TASK-028
write_set:
  - apps/web/src/features/editor/**
  - apps/web/src/features/document/**
  - apps/collab/**
  - packages/contracts/src/realtime/**
forbidden_paths:
  - .note/**
related_requirements:
  - CE-02
review_required: true
---

# TASK-029: Presence Integration

## 목표

Render membership-based remote cursor and selection awareness.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- 실행 계획: `tasks/exec-plan/02-collaboration-persistence.md`.
- product 기준: `docs/product/editor/presence.md`.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Remote cursor and selected range rendering with member name/color.
- Awareness updates without manual refresh.
- CE-02 e2e pass.

### 제외

- RBAC/admin membership management.
- Production identity provider.

## 계약과 의존성

| Task       | Mode          | Depends on | Unlocks    | Notes                      |
| ---------- | ------------- | ---------- | ---------- | -------------------------- |
| `TASK-029` | `parallel-ui` | `TASK-028` | `TASK-031` | Membership-based presence. |

- 안정 contract: integrated realtime/persistence path from `TASK-028`.
- mock 허용 여부: CE-02 must verify live awareness behavior.

## Write Set

수정 가능:

- `apps/web/src/features/editor/**`
- `apps/web/src/features/document/**`
- `apps/collab/**`
- `packages/contracts/src/realtime/**`

수정 금지:

- `.note/**`

## 인수 조건

- Remote cursor and selected range are visible with member name/color.
- Presence updates without manual refresh.
- CE-02 e2e passes.

## 검증

- 실행 명령: `pnpm typecheck`
- 실행 명령: `pnpm lint`
- 실행 명령: `pnpm arch:check`
- 실행 명령: `pnpm test:e2e e2e/ce-02-presence.spec.ts`
- 기대 결과: all commands pass on Node `v24.15.0`.

## 검증 결과

- Runtime: `node -v` -> `v24.15.0`; `pnpm -v` -> `10.28.2`.
- `pnpm typecheck` -> passed.
- `pnpm lint` -> passed.
- `pnpm arch:check` -> passed.
- `pnpm test:e2e e2e/ce-02-presence.spec.ts` -> passed (`1 passed`).

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: do not start before `TASK-028` is archived.

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`로 이동했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
- [x] follow-up 또는 blocker를 기록했다.

## 메모

- Unblocks `TASK-031` with `TASK-030`.
- Remote presence now derives from Hocuspocus awareness state rather than static seed-only badges.
- No blocker.
