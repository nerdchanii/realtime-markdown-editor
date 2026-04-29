---
title: TASK-027-checkpoint-metadata-artifact-adapter
status: todo
phase: P3
task_type: persistence
task_mode: parallel-backend
owner: unassigned
depends_on:
  - TASK-011
  - TASK-024
write_set:
  - apps/api/src/modules/documents/**
  - apps/api/src/modules/collaboration/**
  - packages/contracts/src/http/**
  - docs/product/editor/history.md
forbidden_paths:
  - .note/**
related_requirements:
  - CE-04
review_required: true
---

# TASK-027: Checkpoint Metadata And Artifact Adapter

## 목표

Implement explicit checkpoint creation and snapshot storage.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- 실행 계획: `tasks/exec-plan/02-collaboration-persistence.md`.
- ADR 기준: `docs/adr/0003-storage-strategy.md`.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Checkpoint metadata with author membership, timestamp, message, and artifact reference.
- Snapshot artifact adapter returning inspectable Markdown content.
- History product doc updates as needed.

### 제외

- Restore.
- Branching.
- Publish/draft visibility policy.

## 계약과 의존성

| Task       | Mode               | Depends on             | Unlocks    | Notes                         |
| ---------- | ------------------ | ---------------------- | ---------- | ----------------------------- |
| `TASK-027` | `parallel-backend` | `TASK-011`, `TASK-024` | `TASK-028` | Checkpoint artifact boundary. |

- 안정 contract: ADR-0003 V1 storage policy and CE-01 integration.
- mock 허용 여부: local-compatible artifact adapter is acceptable.

## Write Set

수정 가능:

- `apps/api/src/modules/documents/**`
- `apps/api/src/modules/collaboration/**`
- `packages/contracts/src/http/**`
- `docs/product/editor/history.md`

수정 금지:

- `.note/**`

## 인수 조건

- Checkpoint creation stores author membership, timestamp, message, and snapshot artifact reference.
- Autosave/sync events do not appear as user-authored checkpoints.
- Read-only inspect API returns previous Markdown snapshot content.
- Restore/branching is not implemented.

## 검증

- 실행 명령: `pnpm --filter @rme/api typecheck`
- 실행 명령: `pnpm --filter @rme/contracts typecheck`
- 실행 명령: `pnpm arch:check`
- 기대 결과: all commands pass on Node `v24.15.0`.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: keep artifact snapshots separate from live Yjs persistence.

## Archive Checklist

- [ ] `status`를 `archived`로 변경했다.
- [ ] 파일을 `tasks/archive/`로 이동했다.
- [ ] 검증 결과를 이 문서에 기록했다.
- [ ] 필요한 공식 문서 업데이트를 완료했다.
- [ ] follow-up 또는 blocker를 기록했다.

## 메모

- ADR-0003 V1 read-only inspect path returns Markdown snapshot from artifact boundary.
