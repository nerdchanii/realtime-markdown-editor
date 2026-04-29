---
title: ADR-0003 Storage Alignment
status: archived
phase: P0
task_type: contract
task_mode: blocking
owner: main-agent
depends_on:
  - TASK-010
write_set:
  - docs/adr/0003-storage-strategy.md
  - docs/domain/models/checkpoint.md
  - docs/domain/rules/collaboration-boundaries.md
  - docs/product/editor/history.md
  - packages/contracts/src/http/index.ts
  - packages/contracts/src/contract-surface.type-test.ts
forbidden_paths:
  - .note/**
  - apps/web/**
  - apps/api/src/modules/**
  - apps/collab/**
related_requirements:
  - CE-03-OFFLINE-MERGE
  - CE-04-REVISION-HISTORY
  - REQ-HISTORY-CHECKPOINTS
  - REQ-HISTORY-AUTOSAVE-SEPARATION
review_required: true
---

# TASK-011: ADR-0003 Storage Alignment

## 목표

ADR-0003 V1 storage decision을 문서와 contract DTO에 반영한다.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- Human-approved decision: 2026-04-30에 ADR-0003 V1이 CE skeleton storage policy로 승인되었다.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Checkpoint artifact를 inspectable Markdown snapshot과 artifact metadata로 정의한다.
- Live Yjs binary persistence와 product revision snapshot artifact를 별도 개념으로 유지한다.
- CE-04 read-only snapshot inspect path contract를 정의한다.

### 제외

- Production S3/R2/MinIO setup.
- Restore, branching, publication visibility policy.
- Web UI 또는 API module 구현.

## 계약과 의존성

| Task       | Mode       | Depends on | Unlocks                            | Notes                                    |
| ---------- | ---------- | ---------- | ---------------------------------- | ---------------------------------------- |
| `TASK-011` | `blocking` | `TASK-010` | `TASK-013`, `TASK-014`, `TASK-015` | Checkpoint artifact와 inspect shape 확정 |

- 안정 contract: ADR-0003 V1 승인 정책.
- mock 허용 여부: local-compatible artifact adapter policy 허용.

## Write Set

수정 가능:

- `docs/adr/0003-storage-strategy.md`
- `docs/domain/models/checkpoint.md`
- `docs/domain/rules/collaboration-boundaries.md`
- `docs/product/editor/history.md`
- `packages/contracts/src/http/index.ts`
- `packages/contracts/src/contract-surface.type-test.ts`

수정 금지:

- `.note/**`
- `apps/web/**`
- `apps/api/src/modules/**`
- `apps/collab/**`

## 인수 조건

- ADR-0003이 V1 CE skeleton storage policy로 accepted 상태를 표현한다.
- V1 checkpoint snapshot envelope가 inspectable Markdown snapshot과 artifact metadata로 정의된다.
- Live Yjs binary persistence와 product revision snapshot artifact가 분리되어 설명된다.
- CE-04 read-only snapshot inspect path가 정의된다.
- Contract DTO와 type surface test가 결정된 snapshot inspect shape와 일치한다.

## 검증

- 실행 명령: `pnpm --filter @rme/contracts typecheck`
- 기대 결과: contracts package typecheck가 통과한다.
- 실행 명령: `pnpm typecheck`
- 기대 결과: repo TypeScript build가 통과한다.
- 실행 명령: `pnpm arch:check`
- 기대 결과: architecture checks가 통과한다.
- 실행 명령: `pnpm format:check`
- 기대 결과: formatting check가 통과한다.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: downstream worker는 이 task가 archive되기 전 checkpoint inspect contract를 임의로 구현하지 않는다.

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`로 이동했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
- [x] follow-up 또는 blocker를 기록했다.

## 메모

- ADR-0003 policy 변경이 필요하면 downstream work를 시작하지 않고 owner decision을 먼저 받는다.
- Verification results recorded on 2026-04-30:
  - `node -v`: passed, output `v24.15.0`.
  - `pnpm -v`: passed, output `10.28.2`.
  - TDD red check: `pnpm --filter @rme/contracts typecheck` failed after adding `CheckpointSnapshotInspectDto` and `checkpoints` type expectations, with missing export and missing `SeedReviewContextDto.checkpoints`.
  - TDD green check: `pnpm --filter @rme/contracts typecheck` passed after adding the checkpoint inspect DTO and seed checkpoint list.
  - `pnpm typecheck`: passed.
  - `pnpm arch:check`: passed, output included `no dependency violations found`.
  - `pnpm format:check`: passed, output `All matched files use Prettier code style!`.
- Review results:
  - Spec compliance review approved ADR/domain/product/contract alignment.
  - Code quality review approved with no Critical, Important, or Minor issues.
- Commit opinion: eligible after archive; actual changed files are within declared write set.

## Completion Notes

- Archived after spec and code quality review approval.
- No unresolved blocker.
