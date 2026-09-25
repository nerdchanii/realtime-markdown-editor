---
title: Frontend Boundary And Layout Slots
status: archived
phase: P0
task_type: contract
task_mode: blocking
owner: worker
depends_on:
  - TASK-010
write_set:
  - apps/web/src/app/**
  - apps/web/src/features/workspace/**
  - apps/web/src/features/document/**
  - apps/web/src/features/editor/**
  - apps/web/src/features/history/**
  - apps/web/src/lib/api-client/**
  - apps/web/src/styles/**
  - .dependency-cruiser.cjs
  - scripts/check-architecture.mjs
  - docs/architecture/frontend.md
forbidden_paths:
  - .note/**
  - apps/api/**
  - apps/collab/**
  - packages/contracts/src/**
related_requirements:
  - CE-01-CONCURRENT-EDITING
  - CE-02-PRESENCE
  - CE-05-RICH-PREVIEW
  - REQ-WORKSPACE-DOCUMENT-SCOPE
  - REQ-PROPERTIES-OUTSIDE-BODY
  - REQ-LINKS-BACKLINKS-STANDARD-MARKDOWN
review_required: true
---

# TASK-012: Frontend Boundary And Layout Slots

## 목표

Plan 01 UI 구현을 나누기 전에 frontend feature boundary와 layout slots를 확정한다.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- UI 기준 문서: `DESIGN.md`, `docs/architecture/frontend.md`.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- `App.tsx`가 feature internals 대신 feature slots를 조합하도록 정리한다.
- Workspace, document, editor, history, API client boundary를 명명한다.
- Feature 간 내부 import 금지 규칙과 API source import 금지 규칙을 architecture check에 반영한다.
- Mock provider replacement point를 문서화한다.

### 제외

- API seed endpoint 구현.
- Collaboration provider integration.
- CE e2e 통과를 목표로 한 realtime behavior.

## 계약과 의존성

| Task       | Mode       | Depends on | Unlocks                            | Notes                            |
| ---------- | ---------- | ---------- | ---------------------------------- | -------------------------------- |
| `TASK-012` | `blocking` | `TASK-010` | `TASK-013`, `TASK-014`, `TASK-015` | Frontend split과 import boundary |

- 안정 contract: editor-first shell, feature boundary, mock replacement points.
- mock 허용 여부: 허용. 실제 provider는 Plan 02 integration task에서 교체한다.

## Write Set

수정 가능:

- `apps/web/src/app/**`
- `apps/web/src/features/workspace/**`
- `apps/web/src/features/document/**`
- `apps/web/src/features/editor/**`
- `apps/web/src/features/history/**`
- `apps/web/src/lib/api-client/**`
- `apps/web/src/styles/**`
- `.dependency-cruiser.cjs`
- `scripts/check-architecture.mjs`
- `docs/architecture/frontend.md`

수정 금지:

- `.note/**`
- `apps/api/**`
- `apps/collab/**`
- `packages/contracts/src/**`

## 인수 조건

- `App.tsx`는 feature internals를 직접 소유하지 않고 shell slots를 composition한다.
- Workspace, document, editor, history, API client boundaries가 명시된다.
- Frontend feature code는 다른 feature internals를 import하지 않는다.
- Frontend code는 `apps/api/src/**`를 import하지 않는다.
- Mock provider replacement points가 이름으로 추적 가능하다.

## 검증

- 실행 명령: `pnpm --filter @rme/web typecheck`
- 기대 결과: web package typecheck가 통과한다.
- 실행 명령: `pnpm lint`
- 기대 결과: lint가 통과한다.
- 실행 명령: `pnpm arch:check`
- 기대 결과: architecture checks가 통과한다.
- 실행 명령: `pnpm format:check`
- 기대 결과: formatting check가 통과한다.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: `TASK-014`와 `TASK-015` worker는 이 task의 boundary를 벗어나지 않는다.

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`로 이동했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
- [x] follow-up 또는 blocker를 기록했다.

## 메모

- This task owns boundary setup only; visual shell implementation belongs to downstream UI tasks.
- Worker completion summary:
  - Implemented public feature slots for workspace, document, editor, and history.
  - Added `app.providers.mock`, feature provider mock markers, and `lib.api-client.mock` replacement points.
  - Added architecture checks for frontend API source imports and cross-feature internals.
  - Initial quality review found downstream UI scope creep; the slot implementations were trimmed back to boundary placeholders and CSS was reduced to shell-level responsive layout.
- Verification results recorded on 2026-04-30:
  - `node -v`: passed, output `v24.15.0`.
  - `pnpm -v`: passed, output `10.28.2`.
  - `pnpm --filter @rme/web typecheck`: passed.
  - `pnpm lint`: passed.
  - `pnpm arch:check`: passed, output included `no dependency violations found`.
  - `pnpm format:check`: passed, output `All matched files use Prettier code style!`.
- Worker commit opinion: commit after review/archive; changes are within declared write set.
- Review results:
  - Spec compliance review approved the frontend boundary implementation.
  - Initial code quality review requested trimming downstream UI scope; follow-up review approved after slots were reduced to boundary placeholders and shell CSS was made responsive.

## Completion Notes

- Archived after spec and code quality review approval.
- No unresolved blocker.
