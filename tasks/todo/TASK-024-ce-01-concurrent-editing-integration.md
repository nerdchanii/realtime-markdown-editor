---
title: TASK-024-ce-01-concurrent-editing-integration
status: todo
phase: P2
task_type: integration
task_mode: integration
owner: unassigned
depends_on:
  - TASK-021
  - TASK-022
  - TASK-023
write_set:
  - apps/api/src/modules/collaboration/**
  - apps/collab/**
  - apps/web/src/features/editor/**
  - apps/web/src/lib/api-client/**
  - packages/contracts/src/**
  - playwright.config.ts
  - package.json
forbidden_paths:
  - .note/**
related_requirements:
  - CE-01
review_required: true
---

# TASK-024: CE-01 Concurrent Editing Integration

## 목표

Connect API session, collab runtime, and web adapter so CE-01 concurrent editing passes.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- 실행 계획: `tasks/exec-plan/02-collaboration-persistence.md`.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- API session, collab runtime, and web adapter integration.
- Two-context seeded document convergence.
- E2E coverage through `e2e/ce-01-concurrent-editing.spec.ts`.

### 제외

- Offline merge.
- Explicit checkpoint history.
- Presence UI beyond what is needed for CE-01.

## 계약과 의존성

| Task       | Mode          | Depends on                         | Unlocks                | Notes                |
| ---------- | ------------- | ---------------------------------- | ---------------------- | -------------------- |
| `TASK-024` | `integration` | `TASK-021`, `TASK-022`, `TASK-023` | `TASK-025`, `TASK-026` | CE-01 realtime path. |

- 안정 contract: provider-neutral session and adapter contracts from upstream tasks.
- mock 허용 여부: mock may remain for non-realtime paths but CE-01 must use realtime behavior.

## Write Set

수정 가능:

- `apps/api/src/modules/collaboration/**`
- `apps/collab/**`
- `apps/web/src/features/editor/**`
- `apps/web/src/lib/api-client/**`
- `packages/contracts/src/**`
- `playwright.config.ts`
- `package.json`

수정 금지:

- `.note/**`

## 인수 조건

- Two browser contexts opening the same seeded document converge without manual refresh.
- CE-01 e2e passes.
- Provider-specific imports remain out of API domain and contracts.

## 검증

- 실행 명령: `pnpm typecheck`
- 실행 명령: `pnpm lint`
- 실행 명령: `pnpm arch:check`
- 실행 명령: `pnpm test:e2e e2e/ce-01-concurrent-editing.spec.ts`
- 기대 결과: all commands pass on Node `v24.15.0`.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: do not start until all upstream tasks are archived.

## Archive Checklist

- [ ] `status`를 `archived`로 변경했다.
- [ ] 파일을 `tasks/archive/`로 이동했다.
- [ ] 검증 결과를 이 문서에 기록했다.
- [ ] 필요한 공식 문서 업데이트를 완료했다.
- [ ] follow-up 또는 blocker를 기록했다.

## 메모

- CE-01 failure at Plan 01 exit is expected until this integration is complete.
