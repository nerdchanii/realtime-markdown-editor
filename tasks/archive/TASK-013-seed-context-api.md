---
title: Seed Review Context API
status: archived
phase: P1
task_type: parallel-backend
task_mode: parallel
owner: worker
depends_on:
  - TASK-011
  - TASK-012
write_set:
  - apps/api/src/modules/**
  - apps/api/src/app.module.ts
  - packages/contracts/src/**
forbidden_paths:
  - .note/**
  - apps/web/**
  - apps/collab/**
related_requirements:
  - REQ-WORKSPACE-DOCUMENT-SCOPE
  - REQ-IDENTITY-MEMBERSHIP
  - REQ-PRESENCE-MEMBER-AWARENESS
  - REQ-PROPERTIES-OUTSIDE-BODY
  - REQ-LINKS-BACKLINKS-STANDARD-MARKDOWN
review_required: true
---

# TASK-013: Seed Review Context API

## 목표

UI와 e2e가 사용할 seeded workspace review context API와 DTO surface를 만든다.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- 선행 contract: `TASK-011`, `TASK-012`.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Seeded workspace, project, folders, documents, members, properties, backlinks placeholder data를 반환한다.
- Collaboration session metadata는 provider-neutral shape로만 포함한다.
- API domain/application data를 `@rme/contracts` DTO로 명시적으로 map한다.

### 제외

- Web UI 변경.
- Hocuspocus/Yjs/Tiptap provider integration.
- Real persistence adapter.

## 계약과 의존성

| Task       | Mode       | Depends on             | Unlocks    | Notes                       |
| ---------- | ---------- | ---------------------- | ---------- | --------------------------- |
| `TASK-013` | `parallel` | `TASK-011`, `TASK-012` | `TASK-016` | Seed context API/view model |

- 안정 contract: `TASK-011` snapshot DTO shape, `TASK-012` frontend boundary names.
- mock 허용 여부: seed/static in-memory data 허용.

## Write Set

수정 가능:

- `apps/api/src/modules/**`
- `apps/api/src/app.module.ts`
- `packages/contracts/src/**`

수정 금지:

- `.note/**`
- `apps/web/**`
- `apps/collab/**`

## 인수 조건

- API가 seeded workspace, project, folders, documents, members, properties, backlinks placeholder data, collaboration session metadata를 반환할 수 있다.
- API domain types는 `@rme/contracts` DTO로 명시적으로 mapping된다.
- Provider-specific collaboration types가 API domain에 노출되지 않는다.

## 검증

- 실행 명령: `pnpm --filter @rme/api typecheck`
- 기대 결과: API package typecheck가 통과한다.
- 실행 명령: `pnpm typecheck`
- 기대 결과: repo TypeScript build가 통과한다.
- 실행 명령: `pnpm arch:check`
- 기대 결과: architecture checks가 통과한다.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: frontend worker와 write set이 겹치면 중단한다.

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`로 이동했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
- [x] follow-up 또는 blocker를 기록했다.

## 메모

- This task may proceed in parallel with `TASK-014` and `TASK-015` after its encoded `depends_on` tasks are complete.
- Plan 01 graph role is represented as `task_type: parallel-backend` plus `task_mode: parallel` per `tasks/README.md` metadata rules.
- Worker completion summary:
  - Added `GET /review-context/seed`.
  - Added seeded workspace/project/folder/document/member/property/backlink/history data.
  - Added explicit API read-model to `@rme/contracts` DTO mapping.
  - Split seed fixture after root lint found `max-lines` in the service file.
- Verification results recorded on 2026-04-30:
  - `node -v`: passed, output `v24.15.0`.
  - `pnpm -v`: passed, output `10.28.2`.
  - `pnpm --filter @rme/api typecheck`: passed.
  - `pnpm typecheck`: passed.
  - `pnpm lint`: passed after fixture split.
  - `pnpm arch:check`: passed, output included `no dependency violations found`.
  - `pnpm format:check`: passed, output `All matched files use Prettier code style!`.
- Main-session review fixes:
  - Aligned `FolderKindDto` and seed folder kinds with the accepted domain kinds:
    `workspaceRoot`, `projectRoot`, `regular`, and `inbox`.
  - Kept project root folders anchored to their project by using `parentFolderId: null`
    for the `projectRoot` fixture.
  - Aligned structural root folder names with ADR-0006 by deriving them from the
    workspace/project display names.
  - Preserved ADR-0003 V1 checkpoint semantics: checkpoint artifacts expose inspectable
    Markdown snapshot metadata and remain separate from live Yjs persistence.
  - Added an HTTP smoke test for `GET /review-context/seed`; the first run exposed a
    real Nest injection failure, fixed with explicit `@Inject(SeedReviewContextService)`.
- Verification refresh after review fixes:
  - `pnpm typecheck`: passed and refreshed project-reference declarations.
  - `pnpm --filter @rme/api typecheck`: passed.
  - `pnpm --filter @rme/api exec tsx --tsconfig tsconfig.json --test src/modules/review-context/seed-review-context.controller.smoke.ts`: passed after sandbox escalation for `tsx` IPC.
  - `pnpm arch:check`: passed.
  - `pnpm format:check`: passed.
- Worker commit opinion: safe after main-session review/archive; changed files are within declared write set.
- Final re-review: passed with no critical, important, or minor findings.
