---
title: TASK-050-e2e-session-isolation
status: archived
phase: user-request
task_type: verification
task_mode: integration
owner: codex
depends_on:
  - TASK-048
write_set:
  - apps/api/src/modules/collaboration/**
  - apps/api/src/modules/review-context/**
  - apps/collab/src/seed/**
  - e2e/**
  - tasks/active/TASK-050-e2e-session-isolation.md
  - tasks/archive/TASK-050-e2e-session-isolation.md
forbidden_paths:
  - .note/**
related_requirements:
  - CE-01
  - CE-02
  - CE-03
review_required: true
---

# TASK-050: E2E Session Isolation

## 목표

Make parallel e2e expectations compatible with shared realtime collaboration and add a 4-session
collaborative editing spec.

## 배경

- `TASK-048` found that `pnpm test:e2e` fails under default parallel workers because specs share the
  same realtime document and use per-character text expectations.
- User approved adjusting e2e output expectations rather than forcing one worker, and requested a
  4-session collaborative editing e2e.
- User identified seed member mismatch under `apps/collab/src/seed`.

## 범위

### 포함

- Align seeded collaboration member vocabulary across API/collab review paths.
- Make existing CE e2e text edits robust under parallel shared document execution.
- Add a 4-session collaboration e2e using four seeded identities.

### 제외

- Changing Playwright worker count.
- Reinterpreting CE acceptance.
- Production identity provider.

## 계약과 의존성

| Task       | Mode          | Depends on | Unlocks    | Notes                           |
| ---------- | ------------- | ---------- | ---------- | ------------------------------- |
| `TASK-050` | `integration` | `TASK-048` | `TASK-048` | Unblocks final e2e verification |

- 안정 contract: reviewer seed remains local/mock-compatible.
- mock 허용 여부: seeded identities are acceptable for reviewer/e2e paths.

## Write Set

수정 가능:

- `apps/api/src/modules/collaboration/**`
- `apps/api/src/modules/review-context/**`
- `apps/collab/src/seed/**`
- `e2e/**`
- `tasks/active/TASK-050-e2e-session-isolation.md`
- `tasks/archive/TASK-050-e2e-session-isolation.md`

수정 금지:

- `.note/**`

## 인수 조건

- Existing CE e2e specs pass under default `pnpm test:e2e` workers.
- A new 4-session collaborative editing e2e verifies all four sessions converge on all four edits.
- Seeded collaboration identities are consistent enough for Alice, Bob, Carol, and Dana reviewer
  sessions.

## 검증

- 실행 명령: `pnpm typecheck`
- 실행 명령: `pnpm lint`
- 실행 명령: `pnpm arch:check`
- 실행 명령: `pnpm format:check`
- 실행 명령: `pnpm test:e2e`
- 기대 결과: commands pass on Node `v24.15.0`.

## 검증 결과

- Runtime: `node -v` -> `v24.15.0`; `pnpm -v` -> `10.28.2`.
- `pnpm typecheck` -> passed.
- `pnpm lint` -> passed.
- `pnpm arch:check` -> passed.
- `pnpm format:check` -> passed.
- `pnpm test:e2e` -> passed, 7 tests under default 4-worker execution.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: keep `TASK-048` blocked until this task passes.

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`로 이동했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
- [x] follow-up 또는 blocker를 기록했다.

## 메모

- Separate task to avoid mixing e2e changes into blocked `TASK-048`.
- Added Carol and Dana seeded reviewer identities.
- Aligned collab seed vocabulary with API reviewer seed IDs.
- Existing CE e2e specs now use atomic line insertion or non-strict presence lookup where parallel
  shared sessions make duplicate member identity expected.
- Added explicit 4-session collaborative editing e2e.
- No blocker.
