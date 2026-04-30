---
title: TASK-060-recovery-audit-and-task-materialization
status: archived
phase: P10
task_type: contract
task_mode: blocking
owner: unassigned
depends_on: []
write_set:
  - tasks/todo/**
  - tasks/exec-plan/04-editor-ux-recovery.md
  - apps/web/src/features/workspace/WorkspaceNodeView.tsx
  - apps/web/src/features/workspace/index.tsx
  - apps/web/src/features/workspace/types.ts
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

# TASK-060: Recovery Audit And Task Materialization

## 목표

Lock the editor UX recovery baseline and create executable follow-up tasks before any product code
feature work starts.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`,
  `docs/requirements/registry.md`.
- 실행 계획: `tasks/exec-plan/04-editor-ux-recovery.md`.
- 디자인 기준: `DESIGN.md`.
- POC 기준: `docs/research/poc-001-collaboration-engine/result.md` and the
  `docs/research/poc-001-collaboration-engine/prototypes/tiptap-yjs-hocuspocus/src/**`
  implementation.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Create concrete `tasks/todo/TASK-060` through `TASK-068` files.
- Record current implementation gaps against subject, design, and POC behavior.
- Decide the interrupted workspace partial-edit baseline.
- Declare each follow-up task write set, dependency, and verification command.

### 제외

- Product code feature implementation.
- CE requirement reinterpretation.
- New architecture decisions not already covered by the current docs and ADRs.

## Current Implementation Gap Audit

| Area              | Current evidence                                                                                  | Gap                                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Rich editor       | `apps/web/src/features/editor/EditorWorkspaceBody.tsx` renders `MarkdownPreview` for `rich` mode. | Rich mode is read-only preview, not an editable Tiptap `EditorContent` surface.                                   |
| Markdown state    | `SourcePane` owns textarea editing and the adapter syncs a `Y.Text` markdown string.              | Rich/source/split modes do not yet share a real Tiptap editor model with Markdown portability boundaries.         |
| Presence          | `PresenceLayer` renders detached badges from awareness labels.                                    | CE-02 evidence exists but product UX does not show remote caret/selection at document positions.                  |
| POC carryover     | Tiptap/Yjs/Hocuspocus dependencies and runtime extensions exist in the web app.                   | The app creates Tiptap collaboration extensions but does not mount an editable Tiptap surface that uses them.     |
| shadcn primitives | UI controls are native buttons/inputs and inline styles.                                          | Primitive controls are not standardized through shadcn, and styling is scattered across inline objects.           |
| Design tokens     | `global.css` has a subset of `DESIGN.md` colors.                                                  | Border hierarchy, density, typography, semantic tokens, and panel treatment are incomplete.                       |
| Workspace         | Navigation reads seeded hierarchy and still displays `replacementPoint`.                          | It lacks product-grade folder/document entrypoints and exposes internal scaffolding text.                         |
| History           | Checkpoint creation and browsing are present in one compact inspector.                            | Creation, revision browsing, selected state, and read-only snapshot inspection need clearer separation.           |
| Properties        | Properties are editable text/date/checkbox inputs near title.                                     | Add/delete behavior and supported property type affordances are incomplete.                                       |
| User/membership   | Seeded Alice/Bob membership supports reviewer flow.                                               | Mock boundary is visible only as seed copy and needs route/docs clarity so it does not look like production auth. |

## Interrupted Workspace Diff Decision

Baseline check on 2026-04-30:

- `git status --short` showed no tracked changes in
  `apps/web/src/features/workspace/WorkspaceNodeView.tsx`,
  `apps/web/src/features/workspace/index.tsx`, or `apps/web/src/features/workspace/types.ts`.
- `git diff --` for those three files was empty.
- Decision: no partial workspace edits are present to revert or absorb. `TASK-064` owns the future
  workspace tree and document-entrypoint refactor from the clean current baseline.

## 계약과 의존성

| Task       | Mode       | Depends on | Unlocks                            | Notes                                    |
| ---------- | ---------- | ---------- | ---------------------------------- | ---------------------------------------- |
| `TASK-060` | `blocking` | 없음       | `TASK-061`, `TASK-062`, `TASK-066` | Baseline audit and task materialization. |

- 안정 contract: CE-01 through CE-05 remain defined by `docs/compliance/subject-matrix.md`.
- mock 허용 여부: seeded/mock identity is allowed only for reviewer setup and must stay explicit.

## Write Set

수정 가능:

- `tasks/todo/**`
- `tasks/exec-plan/04-editor-ux-recovery.md`
- `apps/web/src/features/workspace/WorkspaceNodeView.tsx`
- `apps/web/src/features/workspace/index.tsx`
- `apps/web/src/features/workspace/types.ts`

수정 금지:

- `.note/**`
- Product implementation files outside the three workspace baseline files.

## 인수 조건

- Current implementation gaps are recorded against `subject.md`, `DESIGN.md`, and POC behavior.
- The interrupted workspace partial edits are either reverted or explicitly absorbed into
  `TASK-064`.
- Every follow-up task has a declared write set and verification command.
- No product code feature work starts before the task files exist.

## 검증

- 실행 명령: `git status --short`
- 실행 명령: `pnpm format:check`
- 기대 결과: only expected task/exec-plan files are changed and formatting passes.

## 검증 결과

- `git status --short` -> only `tasks/exec-plan/04-editor-ux-recovery.md` and `tasks/todo/**`
  were changed before archiving this task.
- `pnpm format:check` -> passed after formatting newly added Markdown task files.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: implementation work for `TASK-061` and later must not begin
  before this task is reviewed or explicitly accepted.

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`로 이동했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
- [x] follow-up 또는 blocker를 기록했다.

## 메모

- This task intentionally creates the recovery queue rather than changing product behavior.
- Follow-up implementation proceeds through `TASK-061` to `TASK-068`.
