---
title: TASK-044-markdown-export
status: archived
phase: P6
task_type: feature
task_mode: parallel-backend
owner: codex
depends_on:
  - TASK-040
write_set:
  - apps/api/src/modules/documents/**
  - apps/web/src/features/document/**
  - apps/web/src/lib/api-client/**
  - packages/contracts/src/http/**
  - docs/product/editor/markdown-export.md
forbidden_paths:
  - .note/**
related_requirements: []
review_required: true
---

# TASK-044: Markdown Export

## 목표

Implement Markdown export with frontmatter.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- 실행 계획: `tasks/exec-plan/03-product-surface-compliance.md`.
- product 기준: `docs/product/editor/markdown-export.md`.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Export output with YAML frontmatter for properties followed by standard Markdown body.
- API/client path for reviewer export.
- Documentation alignment for Markdown export.

### 제외

- Product-only Markdown syntax.
- Publish/draft visibility policy.

## 계약과 의존성

| Task       | Mode               | Depends on | Unlocks    | Notes                  |
| ---------- | ------------------ | ---------- | ---------- | ---------------------- |
| `TASK-044` | `parallel-backend` | `TASK-040` | `TASK-045` | Export endpoint and UI |

- 안정 contract: product surface contract from `TASK-040`.
- mock 허용 여부: export can use local-compatible adapter if contract remains explicit.

## Write Set

수정 가능:

- `apps/api/src/modules/documents/**`
- `apps/web/src/features/document/**`
- `apps/web/src/lib/api-client/**`
- `packages/contracts/src/http/**`
- `docs/product/editor/markdown-export.md`

수정 금지:

- `.note/**`

## 인수 조건

- Export output contains YAML frontmatter for properties followed by standard Markdown body.
- Internal storage still keeps properties outside body.
- Export does not introduce product-only Markdown syntax.

## 검증

- 실행 명령: `pnpm typecheck`
- 실행 명령: `pnpm lint`
- 실행 명령: `pnpm arch:check`
- 기대 결과: all commands pass on Node `v24.15.0`.

## 검증 결과

- Runtime: `node -v` -> `v24.15.0`; `pnpm -v` -> `10.28.2`.
- `pnpm typecheck` -> passed.
- `pnpm lint` -> passed.
- `pnpm arch:check` -> passed.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: do not start before `TASK-040` is archived.

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`로 이동했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
- [x] follow-up 또는 blocker를 기록했다.

## 메모

- Parallel with `TASK-041`, `TASK-042`, and `TASK-043` after `TASK-040`.
- Added `POST /documents/:documentId/export`, API-client support, and document-surface export action.
- Export output is YAML frontmatter from properties followed by the standard Markdown editor body.
- No blocker.
