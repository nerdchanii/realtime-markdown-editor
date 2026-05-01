---
title: TASK-068-recovery-verification-and-visual-qa
status: archived
phase: P10
task_type: verification
task_mode: verification
owner: unassigned
depends_on:
  - TASK-067
write_set:
  - tasks/archive/**
  - README.md
  - docs/compliance/subject-matrix.md
  - docs/requirements/backlog/REQ-DEFERRED-RAW-MARKDOWN-SOURCE.md
forbidden_paths:
  - .note/**
related_requirements:
  - CE-01-CONCURRENT-EDITING
  - CE-02-PRESENCE
  - CE-03-OFFLINE-MERGE
  - CE-04-REVISION-HISTORY
  - CE-05-RICH-PREVIEW
review_required: true
---

# TASK-068: Recovery Verification And Visual QA

## 목표

Close the recovery plan with full automated verification, reviewer-flow visual QA, and explicit
deferred-item cleanup.

## 배경

- Final criteria: `tasks/exec-plan/04-editor-ux-recovery.md`.
- CE evidence map: `docs/compliance/subject-matrix.md`.
- Visual criteria: `DESIGN.md`.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Run root checks and full e2e suite.
- Manually review desktop seeded Alice/Bob editor flow.
- Confirm rich editing and remote presence in at least two browser sessions.
- Archive completed recovery tasks after verification results are recorded.
- Document remaining deferred items so they do not appear half-implemented in the main UI.

### 제외

- New implementation beyond verification fixes.
- New product scope after recovery.

## 계약과 의존성

| Task       | Mode           | Depends on | Unlocks | Notes                        |
| ---------- | -------------- | ---------- | ------- | ---------------------------- |
| `TASK-068` | `verification` | `TASK-067` | 완료    | Final recovery verification. |

- 안정 contract: all CE evidence remains mapped to `docs/compliance/subject-matrix.md`.
- mock 허용 여부: seeded reviewer setup is allowed and documented.

## Write Set

수정 가능:

- `tasks/archive/**`
- `README.md`
- `docs/compliance/subject-matrix.md`
- `docs/requirements/backlog/REQ-DEFERRED-RAW-MARKDOWN-SOURCE.md`
- Screenshot artifacts only if ignored or explicitly allowed by task policy.

수정 금지:

- `.note/**`
- Product implementation except minimal verification fixes explicitly recorded in this task.

## 인수 조건

- `pnpm check` passes.
- `pnpm test:e2e` passes.
- Manual visual QA confirms `DESIGN.md` alignment for desktop reviewer flow.
- Rich editing and remote presence are verified in at least two browser sessions.
- Remaining deferred items are explicitly listed and do not appear half-implemented in the main UI.

## 검증

- 실행 명령: `pnpm check`
- 실행 명령: `pnpm test:e2e`
- 실행 명령: manual browser review of seeded Alice/Bob flow.
- 기대 결과: all automated checks pass and manual findings are recorded.

## 검증 결과

- `pnpm check` -> passed.
- `pnpm test:e2e` -> passed, 10 tests.
- Visual QA screenshot captured from
  `http://127.0.0.1:5173/?member=alice&document=seed-review-plan`; editor-first three-panel
  layout, document properties, history, split preview, and remote presence overlay were reviewed.
- Visual QA follow-up fixed workspace root scaffolding copy that was visible in the tree.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: do not mark recovery complete while deferred features appear active
  in the main UI.

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`로 이동했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
- [x] follow-up 또는 blocker를 기록했다.
