---
title: TASK-065-history-and-properties-ux
status: archived
phase: P10
task_type: parallel-ui
task_mode: parallel
owner: unassigned
depends_on:
  - TASK-061
  - TASK-062
write_set:
  - apps/web/src/features/history/**
  - apps/web/src/features/document/**
  - apps/web/src/lib/api-client/**
  - packages/contracts/src/http/**
  - e2e/ce-04-history.spec.ts
  - e2e/product-properties.spec.ts
forbidden_paths:
  - .note/**
related_requirements:
  - CE-04-REVISION-HISTORY
  - REQ-HISTORY-CHECKPOINTS
  - REQ-HISTORY-AUTOSAVE-SEPARATION
  - REQ-PROPERTIES-OUTSIDE-BODY
review_required: true
---

# TASK-065: History And Properties UX

## 목표

Redesign checkpoint history and document properties into clear, editable product surfaces.

## 배경

- Product criteria: `docs/product/editor/history.md` and `docs/product/editor/properties.md`.
- Subject criteria: CE-04 revision history.
- Design criteria: compact inspector and title-context surfaces from `DESIGN.md`.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Separate checkpoint creation from revision browsing.
- Show revision message, author, timestamp, and selected state.
- Keep snapshot inspection visibly read-only.
- Support add/edit/delete for currently supported property types without mutating Markdown body.
- Add or update CE-04 and product properties e2e coverage.

### 제외

- Full audit log or autosave timeline.
- Workflow hooks.
- Comments, suggestions, or mentions.

## 계약과 의존성

| Task       | Mode          | Depends on             | Unlocks    | Notes                                       |
| ---------- | ------------- | ---------------------- | ---------- | ------------------------------------------- |
| `TASK-065` | `parallel-ui` | `TASK-061`, `TASK-062` | `TASK-067` | Uses primitives and current document state. |

- 안정 contract: checkpoint history remains separate from ordinary sync/autosave state.
- mock 허용 여부: seeded checkpoints are allowed for reviewer setup.

## Write Set

수정 가능:

- `apps/web/src/features/history/**`
- `apps/web/src/features/document/**`
- `apps/web/src/lib/api-client/**`
- `packages/contracts/src/http/**` only if needed.
- `e2e/ce-04-history.spec.ts`
- Product smoke e2e for properties.

수정 금지:

- `.note/**`
- Collaboration runtime internals.

## 인수 조건

- History separates checkpoint creation from revision browsing.
- Checkpoint creation copy explains intent without in-app design commentary.
- Revision list entries show message, author, timestamp, and selected state.
- Snapshot inspection is clearly read-only.
- Properties appear near title/context and support add/edit/delete for the current supported
  property types.
- Property edits do not mutate Markdown body.

## 검증

- 실행 명령: `pnpm --filter @rme/web typecheck`
- 실행 명령: `pnpm lint`
- 실행 명령: `pnpm test:e2e e2e/ce-04-history.spec.ts`
- 실행 명령: product smoke e2e for property add/delete.
- 기대 결과: all commands pass.

## 검증 결과

- `pnpm --filter @rme/web typecheck` -> passed.
- `pnpm lint` -> passed.
- `pnpm test:e2e` -> passed, including CE-04 and `e2e/product-properties.spec.ts`.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요 if contracts change.
- Orchestration guardrail 확인: do not merge autosave and checkpoint concepts.

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`로 이동했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
- [x] follow-up 또는 blocker를 기록했다.
