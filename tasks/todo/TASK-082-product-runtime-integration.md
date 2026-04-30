---
title: TASK-082-product-runtime-integration
status: todo
phase: P10
task_type: integration
task_mode: integration
owner: unassigned
depends_on:
  - TASK-077
  - TASK-078
  - TASK-079
  - TASK-080
  - TASK-081
write_set:
  - apps/api/**
  - apps/collab/**
  - apps/web/**
  - e2e/**
  - docs/**
  - tasks/active/**
  - tasks/archive/**
forbidden_paths:
  - .note/**
related_requirements:
  - CE-01
  - CE-02
  - CE-03
  - CE-04
  - CE-05
review_required: true
---

# TASK-082: Product Runtime Integration

## 목표

Backend, collaboration runtime, frontend 결과를 하나의 authenticated product runtime path로 통합한다.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- dependencies: product backend, collab, UI tasks.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Logged-in member opens a workspace document.
- Rich editor collaboration and presence integration.
- Checkpoint persistence/reload/inspect.
- Server/current content Markdown export.
- Artifact-backed image upload and insertion.
- Dev-only seed APIs.
- Integration seams between already-archived backend, collab, and UI tasks.

### 제외

- New product scope not in official docs or `05-productization-platform.md`.
- Role expansion beyond owner/member.
- Restore/branching/workflow integrations.
- New feature implementation that belongs to unfinished prerequisite tasks.
- Evaluation-harness UI.

## 계약과 의존성

| Task       | Mode          | Depends on                                                 | Unlocks    | Notes                   |
| ---------- | ------------- | ---------------------------------------------------------- | ---------- | ----------------------- |
| `TASK-082` | `integration` | `TASK-077`, `TASK-078`, `TASK-079`, `TASK-080`, `TASK-081` | `TASK-083` | final product path join |

- 안정 contract: archived outputs from prerequisite tasks.
- mock 허용 여부: dev bootstrap only; normal runtime product APIs.
- Normal runtime route source: `packages/contracts/src/http/routes.ts`.
- Dev-only seed routes remain limited to local bootstrap and are not normal product dependencies.
- Integration owns cross-cutting seams only after parallel task merge. Feature gaps must go back
  to the owning prerequisite task or become explicit blockers.

## Write Set

수정 가능:

- `apps/api/**`
- `apps/collab/**`
- `apps/web/**`
- `e2e/**`
- `docs/**`
- `tasks/active/**`
- `tasks/archive/**`

수정 금지:

- `.note/**`

## 인수 조건

- A logged-in member opens a workspace document.
- The rich editor is collaborative.
- Presence appears inside the rich editor surface.
- Checkpoints persist, reload, and inspect.
- Markdown export uses server/current content.
- Image upload and insertion work through artifact references.
- Seed APIs are dev-only.
- CE evidence is verified through product behavior and tests, not visible compliance UI.

## 검증

- 실행 명령: `pnpm check`
- 기대 결과: full check passes.
- 실행 명령: `pnpm test:e2e e2e/ce-01-concurrent-editing.spec.ts e2e/ce-02-presence.spec.ts e2e/ce-03-offline-merge.spec.ts e2e/ce-04-history.spec.ts e2e/ce-05-rich-preview.spec.ts`
- 기대 결과: CE e2e suite passes.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: merge one worktree at a time and run smallest relevant verification after each merge.

## Archive Checklist

- [ ] `status`를 `archived`로 변경했다.
- [ ] 파일을 `tasks/archive/`로 이동했다.
- [ ] 검증 결과를 이 문서에 기록했다.
- [ ] 필요한 공식 문서 업데이트를 완료했다.
- [ ] follow-up 또는 blocker를 기록했다.

## 메모

- This is the final integration task before full verification gate.
