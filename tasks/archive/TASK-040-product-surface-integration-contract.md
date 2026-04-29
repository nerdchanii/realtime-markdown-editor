---
title: TASK-040-product-surface-integration-contract
status: archived
phase: P6
task_type: contract
task_mode: blocking
owner: codex
depends_on:
  - TASK-031
write_set:
  - packages/contracts/src/http/**
  - apps/api/src/modules/documents/**
  - apps/web/src/features/document/**
  - apps/web/src/features/editor/**
  - apps/web/src/features/workspace/**
  - docs/product/editor/properties.md
  - docs/product/editor/links-backlinks.md
  - docs/product/editor/markdown-export.md
forbidden_paths:
  - .note/**
related_requirements:
  - CE-05
review_required: true
---

# TASK-040: Product Surface Integration Contract

## 목표

Lock the surface contract before parallel UI/backend polish.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- 실행 계획: `tasks/exec-plan/03-product-surface-compliance.md`.
- product 기준: `docs/product/editor/properties.md`, `docs/product/editor/links-backlinks.md`, `docs/product/editor/markdown-export.md`.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Document detail DTO or explicit endpoints for properties and backlink projection.
- YAML frontmatter plus standard Markdown export representation.
- Mock provider and real API field alignment.

### 제외

- Reinterpreting CE requirements.
- Workflow hooks/builders, publish/draft visibility policy, RBAC/admin, restore/branching.

## 계약과 의존성

| Task       | Mode       | Depends on | Unlocks                                        | Notes                    |
| ---------- | ---------- | ---------- | ---------------------------------------------- | ------------------------ |
| `TASK-040` | `blocking` | `TASK-031` | `TASK-041`, `TASK-042`, `TASK-043`, `TASK-044` | Product surface contract |

- 안정 contract: Plan 02 CE-01 through CE-04 exit gate.
- mock 허용 여부: mock fields must align with real API fields.

## Write Set

수정 가능:

- `packages/contracts/src/http/**`
- `apps/api/src/modules/documents/**`
- `apps/web/src/features/document/**`
- `apps/web/src/features/editor/**`
- `apps/web/src/features/workspace/**`
- `docs/product/editor/properties.md`
- `docs/product/editor/links-backlinks.md`
- `docs/product/editor/markdown-export.md`

수정 금지:

- `.note/**`

## 인수 조건

- Document detail DTO includes properties and link/backlink projection data or explicit endpoints.
- Export representation is YAML frontmatter plus standard Markdown body.
- Product surface contract does not redefine CE requirements.
- Mock provider fields and real API fields are aligned.

## 검증

- 실행 명령: `pnpm --filter @rme/contracts typecheck`
- 실행 명령: `pnpm typecheck`
- 실행 명령: `pnpm arch:check`
- 실행 명령: `pnpm format:check`
- 기대 결과: all commands pass on Node `v24.15.0`.

## 검증 결과

- Runtime: `node -v` -> `v24.15.0`; `pnpm -v` -> `10.28.2`.
- `pnpm --filter @rme/contracts typecheck` -> passed.
- `pnpm typecheck` -> passed.
- `pnpm arch:check` -> passed.
- `pnpm format:check` -> passed.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: do not start `TASK-041` through `TASK-044` before this contract is archived.

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`로 이동했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
- [x] follow-up 또는 blocker를 기록했다.

## 메모

- Plan 03 blocking task.
- Contract review: properties remain on `DocumentDetailDto.properties`; links/backlinks use explicit `DocumentConnectionsDto`; Markdown export uses `MarkdownExportDto` with YAML frontmatter plus standard Markdown body.
- Reviewer subagent timed out and was closed; local review found no blocking write-set or acceptance issue.
- No blocker.
