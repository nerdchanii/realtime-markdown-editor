---
title: Shell Integration
status: archived
phase: P1
task_type: integration
task_mode: integration
owner: main
depends_on:
  - TASK-013
  - TASK-014
  - TASK-015
write_set:
  - apps/web/src/app/**
  - apps/web/src/lib/api-client/**
  - apps/web/src/features/**
  - apps/web/src/styles/**
  - apps/api/src/modules/**
  - packages/contracts/src/**
forbidden_paths:
  - .note/**
  - apps/collab/**
related_requirements:
  - CE-01-CONCURRENT-EDITING
  - CE-02-PRESENCE
  - CE-03-OFFLINE-MERGE
  - CE-04-REVISION-HISTORY
  - CE-05-RICH-PREVIEW
  - REQ-WORKSPACE-DOCUMENT-SCOPE
  - REQ-IDENTITY-MEMBERSHIP
review_required: true
---

# TASK-016: Shell Integration

## 목표

Seed context API, workspace navigation shell, editor slots를 하나의 reviewer first screen으로 연결한다.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- 선행 작업: `TASK-013`, `TASK-014`, `TASK-015`.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- `/?member=alice&document=seed-review-plan` review route behavior.
- Alice/Bob member identity query-param 또는 selector flow.
- Workspace navigation, document header, editor area, properties, backlinks, history panel integration.
- CE e2e selector smoke 상태 확인.

### 제외

- Realtime collaboration runtime.
- CE e2e를 모두 통과시키기 위한 provider behavior.
- `apps/collab/**` runtime work.

## 계약과 의존성

| Task       | Mode          | Depends on                         | Unlocks    | Notes                   |
| ---------- | ------------- | ---------------------------------- | ---------- | ----------------------- |
| `TASK-016` | `integration` | `TASK-013`, `TASK-014`, `TASK-015` | `TASK-017` | Shell-to-seed 연결 소유 |

- 안정 contract: archived outputs from `TASK-013`, `TASK-014`, `TASK-015`.
- mock 허용 여부: 허용. CE realtime/history/preview expected failures는 task result에 명시한다.

## Write Set

수정 가능:

- `apps/web/src/app/**`
- `apps/web/src/lib/api-client/**`
- `apps/web/src/features/**`
- `apps/web/src/styles/**`
- `apps/api/src/modules/**`
- `packages/contracts/src/**`

수정 금지:

- `.note/**`
- `apps/collab/**`

## 인수 조건

- `/?member=alice&document=seed-review-plan`이 seeded workspace document를 연다.
- Alice와 Bob identity는 query-param 또는 UI selector로 선택 가능하다.
- Shell은 workspace navigation, document header, editor area, properties, backlinks, history panel을 렌더링한다.
- CE e2e tests는 shell selector 누락이 아니라 미구현 realtime/history/preview behavior 때문에만 실패한다.

## 검증

- 실행 명령: `pnpm typecheck`
- 기대 결과: repo TypeScript build가 통과한다.
- 실행 명령: `pnpm lint`
- 기대 결과: lint가 통과한다.
- 실행 명령: `pnpm arch:check`
- 기대 결과: architecture checks가 통과한다.
- 실행 명령: `pnpm exec playwright test --list`
- 기대 결과: e2e specs listing이 성공한다.
- 실행 명령: `pnpm test:e2e e2e/ce-01-concurrent-editing.spec.ts`
- 기대 결과: shell selectors가 존재하며 remaining failure가 realtime behavior 범위로 기록된다.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: parallel task drift를 한곳에서 통합하고 contract 변경이 필요하면 downstream을 중단한다.

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`로 이동했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
- [x] follow-up 또는 blocker를 기록했다.

## 메모

- Expected CE failures must be concrete and limited before moving to `TASK-017`.
- Main-session integration summary:
  - Connected the web app to `GET /review-context/seed` through `apps/web/src/lib/api-client`.
  - Added reviewer route parsing for `/?member=alice&document=seed-review-plan`.
  - Mapped seed DTOs into workspace navigation, document context, editor, presence,
    backlinks, and history view models.
  - Added CORS read access for the seed route through the review-context controller.
  - Aligned seeded member identity to Alice/Bob for the accepted CE presence path.
  - Fixed reviewer-route identity so `?member=alice|bob` drives the active member label
    and local/remote presence range in the editor surface.
  - Normalized reviewer member route values case-insensitively and supports the review
    shorthand `alice|bob`, full member IDs, and display names.
  - Fixed workspace document selection so editor and history view models rehydrate from
    the selected seed document instead of staying keyed to the original route alias.
  - Keyed editor/history subtrees by selected document id so their local mock state
    remounts cleanly when workspace navigation changes document.
- Verification results recorded on 2026-04-30:
  - `node -v`: passed, output `v24.15.0`.
  - `pnpm -v`: passed, output `10.28.2`.
  - `pnpm --filter @rme/api typecheck`: passed.
  - `pnpm --filter @rme/web typecheck`: passed.
  - `pnpm typecheck`: passed.
  - `pnpm lint`: passed.
  - `pnpm arch:check`: passed.
  - `pnpm format:check`: passed.
  - `pnpm exec playwright test --list`: passed and listed 5 CE specs.
  - `pnpm --filter @rme/api exec tsx --tsconfig tsconfig.json --test src/modules/review-context/seed-review-context.controller.smoke.ts`: passed after sandbox escalation for `tsx` IPC.
  - `pnpm test:e2e e2e/ce-02-presence.spec.ts e2e/ce-04-history.spec.ts e2e/ce-05-rich-preview.spec.ts`: passed after sandbox escalation for the Playwright dev server.
  - `pnpm test:e2e e2e/ce-02-presence.spec.ts e2e/ce-04-history.spec.ts e2e/ce-05-rich-preview.spec.ts`: passed again after identity/selection fixes.
  - `pnpm test:e2e e2e/ce-02-presence.spec.ts`: passed after member route normalization.
  - `pnpm test:e2e e2e/ce-01-concurrent-editing.spec.ts`: failed at cross-context convergence only; selectors and local editor editing worked, but Bob's text did not appear in Alice's editor without realtime provider behavior. Rerun alone after the rehydration fix showed the same provider-only failure mode.
  - `pnpm test:e2e e2e/ce-03-offline-merge.spec.ts`: failed at offline merge/convergence only; selectors and local offline edit worked, but Bob's online edit did not merge into Alice's editor without realtime/offline provider behavior.
- Expected remaining CE gaps:
  - CE-01 and CE-03 require provider-backed realtime/offline merge behavior in Plan 02.
  - CE-02, CE-04, and CE-05 now pass on the integrated shell.
- Final re-review: passed with no critical, important, or minor findings.
