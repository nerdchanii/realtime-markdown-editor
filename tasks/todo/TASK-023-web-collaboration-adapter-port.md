---
title: TASK-023-web-collaboration-adapter-port
status: todo
phase: P2
task_type: contract
task_mode: parallel-ui
owner: unassigned
depends_on:
  - TASK-020
write_set:
  - apps/web/src/features/editor/**
  - apps/web/src/lib/api-client/**
  - apps/web/src/app/**
forbidden_paths:
  - .note/**
  - apps/api/**
  - apps/collab/**
related_requirements:
  - CE-01
  - CE-02
  - CE-03
review_required: true
---

# TASK-023: Web Collaboration Adapter Port

## 목표

Add a frontend adapter boundary for realtime editor providers.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- 실행 계획: `tasks/exec-plan/02-collaboration-persistence.md`.
- UI 변경 기준: `DESIGN.md`.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Provider-neutral collaboration adapter interface in the editor feature.
- Provider-specific setup isolated in one adapter area.
- Existing mock editor provider kept available for UI tests until integration.

### 제외

- API session contract implementation.
- Collab runtime implementation.
- CE-01 e2e convergence.

## 계약과 의존성

| Task       | Mode          | Depends on | Unlocks    | Notes                     |
| ---------- | ------------- | ---------- | ---------- | ------------------------- |
| `TASK-023` | `parallel-ui` | `TASK-020` | `TASK-024` | Web editor provider port. |

- 안정 contract: package topology from `TASK-020`.
- mock 허용 여부: mock provider remains usable for shell/UI paths.

## Write Set

수정 가능:

- `apps/web/src/features/editor/**`
- `apps/web/src/lib/api-client/**`
- `apps/web/src/app/**`

수정 금지:

- `.note/**`
- `apps/api/**`
- `apps/collab/**`

## 인수 조건

- Editor feature depends on a provider-neutral collaboration adapter interface.
- Provider-specific Tiptap/Yjs setup is isolated in one adapter area.
- Mock editor provider remains usable for UI tests until integration.

## 검증

- 실행 명령: `pnpm --filter @rme/web typecheck`
- 실행 명령: `pnpm lint`
- 실행 명령: `pnpm arch:check`
- 기대 결과: all commands pass on Node `v24.15.0`.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: do not edit API or collab runtime files.

## Archive Checklist

- [ ] `status`를 `archived`로 변경했다.
- [ ] 파일을 `tasks/archive/`로 이동했다.
- [ ] 검증 결과를 이 문서에 기록했다.
- [ ] 필요한 공식 문서 업데이트를 완료했다.
- [ ] follow-up 또는 blocker를 기록했다.

## 메모

- Unblocks `TASK-024` with `TASK-021` and `TASK-022`.
