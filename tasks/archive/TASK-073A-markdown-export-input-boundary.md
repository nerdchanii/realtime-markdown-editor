---
title: TASK-073A-markdown-export-input-boundary
status: archived
phase: P10
task_type: contract
task_mode: blocking
owner: main-orchestrator
depends_on:
  - TASK-071
  - TASK-072
write_set:
  - apps/api/src/modules/documents/interfaces/markdown-export.controller.ts
  - apps/api/src/modules/documents/use-cases/export-markdown-use-case.ts
  - apps/api/src/modules/documents/use-cases/export-markdown-use-case.test.ts
  - apps/api/src/modules/documents/documents.module.ts
  - tasks/active/TASK-073A-markdown-export-input-boundary.md
  - tasks/archive/TASK-073A-markdown-export-input-boundary.md
  - tasks/active/TASK-073-api-runtime-validation-error-envelope-cors.md
forbidden_paths:
  - .note/**
  - apps/web/**
  - apps/collab/**
related_requirements:
  - CE-05
  - REQ-MARKDOWN-EXPORT-FRONTMATTER
  - REQ-MARKDOWN-PORTABILITY
review_required: true
---

# TASK-073A: Markdown Export Input Boundary

## 목표

`POST /documents/:documentId/export`의 public request body를 `{ filename?: string }`으로 유지하면서, export identity와 content/properties를 server-side input boundary로 분리한다.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- `TASK-071`에서 `CreateMarkdownExportRequestDto`는 `{ filename?: string }`으로 좁혀졌다.
- `TASK-073`은 `ExportMarkdownUseCase`가 public DTO를 internal input으로 계속 사용해서 typecheck가 막힌 상태다.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- `ExportMarkdownUseCase`가 `CreateMarkdownExportRequestDto`를 internal input type으로 import/use하지 않게 변경.
- Public input은 `filename`만 허용.
- Export target identity는 route `documentId`에서 온다.
- Markdown body와 properties는 server-side repositories/use-case dependencies에서 resolve.
- Filename은 download/display label로만 취급하고 identity/storage key로 사용하지 않는다.
- Focused use-case test 추가.

### 제외

- Auth/session APIs.
- Product CRUD APIs.
- Checkpoint creation behavior.
- Collaboration runtime behavior.
- Frontend export flow.

## 계약과 의존성

| Task        | Mode       | Depends on             | Unlocks    | Notes                              |
| ----------- | ---------- | ---------------------- | ---------- | ---------------------------------- |
| `TASK-073A` | `blocking` | `TASK-071`, `TASK-072` | `TASK-073` | export input boundary prerequisite |

- 안정 contract: `CreateMarkdownExportRequestDto` remains `{ filename?: string }`.
- mock 허용 여부: focused tests may use in-memory fake repositories.
- `TASK-073` remains blocked until this task is archived.

## Write Set

수정 가능:

- `apps/api/src/modules/documents/interfaces/markdown-export.controller.ts`
- `apps/api/src/modules/documents/use-cases/export-markdown-use-case.ts`
- `apps/api/src/modules/documents/use-cases/export-markdown-use-case.test.ts`
- `apps/api/src/modules/documents/documents.module.ts`
- `tasks/active/TASK-073A-markdown-export-input-boundary.md`
- `tasks/archive/TASK-073A-markdown-export-input-boundary.md`
- `tasks/active/TASK-073-api-runtime-validation-error-envelope-cors.md`

수정 금지:

- `.note/**`
- `apps/web/**`
- `apps/collab/**`

## 인수 조건

- `ExportMarkdownUseCase` no longer imports or uses `CreateMarkdownExportRequestDto`.
- Controller accepts public body `{ filename?: string }` and route `documentId`.
- Use case resolves document properties and current Markdown projection server-side.
- Export filename is only a display/download label.
- `TASK-073` blocker is updated to point to this prerequisite result.

## 검증

- 실행 명령: `pnpm --filter @rme/api exec tsx --test --test-concurrency=1 src/modules/documents/use-cases/export-markdown-use-case.test.ts`
- 기대 결과: focused export boundary test passes.
- 결과:
  - Red: failed before implementation with `TypeError: Cannot read properties of undefined (reading 'map')`, proving the use case still expected request-body properties.
  - Green: passed after implementation, 1 test.
- 실행 명령: `pnpm --filter @rme/api typecheck`
- 기대 결과: API typecheck no longer fails on markdown export input boundary.
- 결과: 통과.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: `TASK-073`은 이 prerequisite이 archived 된 뒤 재개한다.

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`로 이동했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
- [x] follow-up 또는 blocker를 기록했다.

## 메모

- Created by main orchestrator after user decision to avoid expanding `TASK-073` write set.
- Archived before resuming `TASK-073`.
