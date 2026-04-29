---
title: TASK-025-live-collaboration-persistence-boundary
status: todo
phase: P3
task_type: persistence
task_mode: parallel-backend
owner: unassigned
depends_on:
  - TASK-024
write_set:
  - apps/collab/**
  - docs/adr/0003-storage-strategy.md
  - docs/domain/rules/collaboration-boundaries.md
forbidden_paths:
  - .note/**
related_requirements:
  - CE-03
  - CE-04
review_required: true
---

# TASK-025: Live Collaboration Persistence Boundary

## 목표

Add local-compatible live Yjs document persistence without treating it as revision history.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- 실행 계획: `tasks/exec-plan/02-collaboration-persistence.md`.
- ADR 기준: `docs/adr/0003-storage-strategy.md`.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Swappable local-compatible live Yjs persistence adapter.
- Clear documentation that live Yjs binary persistence is separate from product revision artifacts.

### 제외

- Explicit checkpoint/revision artifact implementation.
- Restore or branching.

## 계약과 의존성

| Task       | Mode               | Depends on | Unlocks    | Notes                          |
| ---------- | ------------------ | ---------- | ---------- | ------------------------------ |
| `TASK-025` | `parallel-backend` | `TASK-024` | `TASK-028` | Live collab state persistence. |

- 안정 contract: CE-01 realtime integration from `TASK-024`.
- mock 허용 여부: local-compatible adapter is acceptable.

## Write Set

수정 가능:

- `apps/collab/**`
- `docs/adr/0003-storage-strategy.md`
- `docs/domain/rules/collaboration-boundaries.md`

수정 금지:

- `.note/**`

## 인수 조건

- Collab runtime can persist and reload live collaboration state through an adapter boundary.
- The task explicitly states this is live Yjs binary persistence, not product revision artifact history.
- Provider choice is local-compatible and swappable.

## 검증

- 실행 명령: `pnpm --filter @rme/collab typecheck`
- 실행 명령: `pnpm arch:check`
- 실행 명령: `pnpm format:check`
- 기대 결과: all commands pass on Node `v24.15.0`.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: do not collapse live persistence with checkpoint artifacts.

## Archive Checklist

- [ ] `status`를 `archived`로 변경했다.
- [ ] 파일을 `tasks/archive/`로 이동했다.
- [ ] 검증 결과를 이 문서에 기록했다.
- [ ] 필요한 공식 문서 업데이트를 완료했다.
- [ ] follow-up 또는 blocker를 기록했다.

## 메모

- ADR-0003 V1 policy applies.
