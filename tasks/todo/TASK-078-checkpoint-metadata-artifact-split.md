---
title: TASK-078-checkpoint-metadata-artifact-split
status: blocked
phase: P10
task_type: parallel-backend
task_mode: parallel
owner: unassigned
depends_on:
  - TASK-072
  - TASK-076
write_set:
  - apps/api/src/modules/documents/**
  - apps/api/src/modules/artifacts/**
  - apps/api/src/**/artifacts/**
  - packages/contracts/src/http/**
  - apps/api/src/**/*.spec.ts
  - e2e/ce-04-history.spec.ts
forbidden_paths:
  - .note/**
  - apps/web/**
  - apps/collab/**
related_requirements:
  - CE-04
  - REQ-MARKDOWN-PORTABILITY
review_required: true
---

# TASK-078: Checkpoint Metadata And Artifact Split

## 목표

Checkpoint history를 Postgres metadata와 artifact-backed snapshot payload로 분리해 product persistence로 전환한다.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- dependencies: `TASK-072`, `TASK-076`.
- Current classification: backend-ready, integration-blocked by `TASK-080`. Keep unarchived until
  CE-04 passes through the canonical product route in the normal UI.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Checkpoint metadata in Postgres.
- Snapshot Markdown payload through artifact storage port.
- Artifact metadata in Postgres.
- Canonical `POST /documents/:documentId/checkpoints`.
- Removal of retired `POST /collaboration/documents/:documentId/checkpoints`.
- Smoke-test migration from retired collaboration checkpoint route to canonical documents checkpoint route.
- Refresh/API restart persistence evidence.

### 제외

- Collaboration-owned checkpoint creation.
- Frontend migration except e2e test adjustment.
- Image upload behavior.

## 계약과 의존성

| Task       | Mode       | Depends on             | Unlocks                | Notes                           |
| ---------- | ---------- | ---------------------- | ---------------------- | ------------------------------- |
| `TASK-078` | `parallel` | `TASK-072`, `TASK-076` | `TASK-080`, `TASK-082` | checkpoint artifact persistence |

- 안정 contract: `TASK-076` server-resolved current content.
- Canonical route source: `POST /documents/:documentId/checkpoints` from
  `packages/contracts/src/http/routes.ts`.
- Request contract: `CreateCheckpointRequestDto` carries checkpoint message only;
  API derives author membership from session and resolves Markdown snapshot server-side.
- Checkpoint snapshot artifacts are explicit Markdown history artifacts. They are separate from
  live Yjs binary/provider persistence owned by `TASK-077`.
- mock 허용 여부: local filesystem/in-memory artifact adapter may exist only as explicit dev/test adapter.
- Collaboration checkpoint route is removed here unless an explicit transitional blocker is recorded.
- Product framing guardrail: CE-04 is a product history feature, not an evaluator-only e2e path.
  Do not claim acceptance from `/review-context/seed`, URL member spoofing, fabricated document ids,
  retired checkpoint routes, local React-only state, fallback persistence, or label/button-only
  assertions.

## Write Set

수정 가능:

- `apps/api/src/modules/documents/**`
- `apps/api/src/modules/artifacts/**`
- `apps/api/src/**/artifacts/**`
- `packages/contracts/src/http/**`
- `apps/api/src/**/*.spec.ts`
- `e2e/ce-04-history.spec.ts`

수정 금지:

- `.note/**`
- `apps/web/**`
- `apps/collab/**`

## 인수 조건

- Checkpoint metadata is stored in Postgres.
- Snapshot Markdown payload is stored through artifact storage port.
- Artifact metadata is stored in Postgres.
- `POST /documents/:documentId/checkpoints` is canonical.
- Collaboration routes do not create checkpoints.
- Retired collaboration checkpoint smoke coverage is moved to the canonical documents checkpoint route.
- Snapshot inspect reads Markdown snapshot artifacts, not live Yjs provider state.
- List and inspect work after refresh and API restart.

## 검증

- 실행 명령: `pnpm --filter @rme/api test`
- 기대 결과: API tests가 통과한다.
- 실행 명령: `pnpm test:e2e e2e/ce-04-history.spec.ts`
- 기대 결과: CE-04 history e2e passes through the canonical product route.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: checkpoint creation belongs to documents API.

## Archive Checklist

- [ ] `status`를 `archived`로 변경했다.
- [ ] 파일을 `tasks/archive/`로 이동했다.
- [ ] 검증 결과를 이 문서에 기록했다.
- [ ] 필요한 공식 문서 업데이트를 완료했다.
- [ ] follow-up 또는 blocker를 기록했다.

## 메모

- Suggested worktree: `.worktrees/task-078-checkpoints`.
- Do not archive while CE-04 still depends on TASK-080 product auth/API-client/UI migration.
