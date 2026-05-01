---
title: TASK-092-requirements-task-state-reconciliation
status: archived
phase: auto-20260502-0854-requirements-reconciliation
task_type: verification
task_mode: blocking
owner: codex
depends_on: []
write_set:
  - tasks/exec-plan/auto-20260502-0854-requirements-reconciliation.md
  - tasks/todo/TASK-092-requirements-task-state-reconciliation.md
  - tasks/active/TASK-092-requirements-task-state-reconciliation.md
  - tasks/archive/TASK-092-requirements-task-state-reconciliation.md
forbidden_paths:
  - .note/**
  - README.md
  - apps/**
  - packages/**
  - docs/requirements/items/**
  - docs/product/**
related_requirements:
  - REQ-PRODUCTION-ACCOUNT-MANAGEMENT
  - REQ-WORKSPACE-LIFECYCLE-MANAGEMENT
  - REQ-WORKSPACE-MEMBER-MANAGEMENT
  - REQ-DOCUMENT-TRASH-RESTORE
  - REQ-EDITOR-FIRST-UI-REFRESH
  - REQ-COLLABORATIVE-CREATION-VISIBILITY
  - REQ-DEV-LOCAL-PRODUCT-SEED-DATA
  - REQ-PRESENCE-CARET-LABEL-LEGIBILITY
  - REQ-CE-ACCEPTANCE-TEST-DECOUPLING
review_required: true
---

# TASK-092: Requirements Task State Reconciliation

## 목표

Archived status alone is not completion proof for `TASK-085` through `TASK-091`; classify each task
against current requirements, code, tests, and product docs, then record the next actionable
requirements.

## 배경

- `tasks/exec-plan/AUTONOMOUS-REQUIREMENTS-GOAL.md` requires an initial reconciliation mission.
- `docs/requirements/registry.md` still lists the relevant requirements in `docs/requirements/items/`.
- Several archived task files have unchecked verification, documentation, or evidence checklist
  items.
- Product quality gates require product-shaped auth, membership, authorization, data integrity, UX
  coherence, runtime operability, and contract discipline.

## 범위

### 포함

- Inspect current requirement files, archived `TASK-085` through `TASK-091`, code, tests, and docs.
- Classify each historical task as `complete-with-evidence`, `partial`, `skipped`, or
  `stale-or-invalid`.
- Record requirements that remain planned, need reopening, or can be closed by follow-up cleanup.
- Record verification commands and result.

### 제외

- Product implementation.
- Requirement status moves from `items/` to `completed/`.
- API, frontend, contract, or domain changes.
- `.note/**` evidence.

## 계약과 의존성

| Task       | Mode       | Depends on | Unlocks                | Notes                                         |
| ---------- | ---------- | ---------- | ---------------------- | --------------------------------------------- |
| `TASK-092` | `blocking` | 없음       | next requirement phase | Audit-only task; no implementation write set. |

- 안정 contract: official requirements and product quality gates.
- mock 허용 여부: 허용하지 않음.

## Audit Checklist

| Requirement or artifact   | Evidence inspected                                                                                                                                                                                                                                            | Result                   |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `TASK-085` archived claim | `tasks/archive/TASK-085-product-entry-and-account-ui.md`, `apps/web/src/app/AuthScreen.tsx`, `apps/web/src/app/TopBar.tsx`, `apps/api/src/modules/identity/use-cases/auth-session-service.ts`, `docs/requirements/items/REQ-PRODUCTION-ACCOUNT-MANAGEMENT.md` | `partial`                |
| `TASK-086` archived claim | `tasks/archive/TASK-086-design-md-ui-refresh-handoff.md`, `apps/web/src/app/App.tsx`, `apps/web/src/app/TopBar.tsx`, `docs/requirements/items/REQ-EDITOR-FIRST-UI-REFRESH.md`, `docs/product/ui-capability-gap-log.md`                                        | `partial`                |
| `TASK-087` archived claim | `tasks/archive/TASK-087-workspace-member-lifecycle-gap-inventory.md`, `docs/requirements/items/REQ-WORKSPACE-LIFECYCLE-MANAGEMENT.md`, `docs/requirements/items/REQ-WORKSPACE-MEMBER-MANAGEMENT.md`, workspace/document controllers and services              | `partial`                |
| `TASK-088` archived claim | `tasks/archive/TASK-088-collaborative-creation-visibility.md`, `apps/web/src/app/product-workspace-providers.ts`, `apps/web/src/features/history/useHistoryInspectorState.ts`, `docs/requirements/items/REQ-COLLABORATIVE-CREATION-VISIBILITY.md`             | `partial`                |
| `TASK-089` archived claim | `tasks/archive/TASK-089-local-product-seed-data.md`, `scripts/seed-local-product.mjs`, `package.json`, `e2e/support/product-fixtures.ts`, `docs/requirements/items/REQ-DEV-LOCAL-PRODUCT-SEED-DATA.md`                                                        | `partial`                |
| `TASK-090` archived claim | `tasks/archive/TASK-090-presence-caret-label-legibility.md`, `apps/web/src/features/editor/RichEditorPane.tsx`, `apps/web/src/styles/global.css`, `e2e/ce-02-presence.spec.ts`, `docs/product/editor/presence.md`                                             | `complete-with-evidence` |
| `TASK-091` archived claim | `tasks/archive/TASK-091-ce-acceptance-test-decoupling.md`, `e2e/ce-*.spec.ts`, `e2e/support/reviewer-session.ts`, `docs/requirements/items/REQ-CE-ACCEPTANCE-TEST-DECOUPLING.md`                                                                              | `partial`                |

## Classification Details

### `TASK-085`: `partial`

Evidence:

- Product UI has email/password login and session creation via `AuthScreen`.
- Product UI has logout through `TopBar` and `deleteAuthSession`.
- `loadProductWorkspace` prefers the authenticated current workspace over route workspace, reducing
  URL workspace spoofing.

Gaps:

- `REQ-PRODUCTION-ACCOUNT-MANAGEMENT` acceptance also requires account creation or bootstrap clarity,
  display name/profile update, and deactivate/delete policy. These are not implemented.
- Auth copy still says "Local session bootstrap", "Development account sign in", and quick-login
  dev account buttons exist in development.
- Profile menu only includes Settings and Sign out, not the task's `Profile`, `Notifications`, and
  `Keyboard Shortcuts` entries.
- Settings dialog is a placeholder and does not expose Workspace, Project, and User scopes.

### `TASK-086`: `partial`

Evidence:

- The main app has an IDE-like shell with Explorer, center editor, right history panel, document
  tabs, compact toolbar, and history inspector.
- The UI capability gap log records missing product surfaces.

Gaps:

- `TopBar` still renders static `Acme Engineering` and `Core Engine` labels rather than real
  workspace/project context.
- A standalone settings gear remains beside the profile menu, which conflicts with
  `REQ-EDITOR-FIRST-UI-REFRESH` acceptance.
- The profile/settings IA is still placeholder-level.
- `docs/requirements/items/REQ-EDITOR-FIRST-UI-REFRESH.md` remains `status: planned`.

### `TASK-087`: `partial`

Evidence:

- Workspace and document product APIs cover some lifecycle actions: create/update workspace,
  create/update project, create/update/move/delete folder, and create/update/move/delete document.
- Root folder immutability is enforced in the workspace service.

Gaps:

- `TASK-087` was inventory-only and its archive checklist leaves verification and official docs
  unchecked.
- Workspace archive/delete policy is not implemented.
- Project delete/archive is not implemented.
- Member add/invite, role change, removal, removed-member access revocation, self-removal guard, and
  last-owner guard are not implemented.
- `REQ-WORKSPACE-LIFECYCLE-MANAGEMENT` and `REQ-WORKSPACE-MEMBER-MANAGEMENT` remain planned.

### `TASK-088`: `partial`

Evidence:

- Creator-side document create/delete/folder mutations call product APIs and then trigger a local
  reload.
- History checkpoint creation uses the canonical product API and creator-side history reload.

Gaps:

- There is no evidence of active Bob sessions being notified or refetched when Alice creates a
  document or checkpoint.
- The archived task checklist leaves verification, docs, and REQ evidence unchecked.
- No targeted cross-user document/checkpoint visibility e2e was found.
- `REQ-COLLABORATIVE-CREATION-VISIBILITY` remains planned.

### `TASK-089`: `partial`

Evidence:

- `package.json` exposes `db:seed:local`.
- `scripts/seed-local-product.mjs` seeds users, memberships, workspace, project, folders,
  documents, properties, and links with stable IDs and refuses `NODE_ENV=production`.

Gaps:

- The accepted example command is `pnpm db:seed:dev`; current script exposes `db:seed:local`.
- Seed data still uses fixture-like names such as "Review Team Workspace", "Review Plan", and
  "Decision Log", which the requirement explicitly rejects for default developer seed data.
- The local seed script and e2e fixture duplicate seed data rather than sharing a canonical seed spec
  or helper.
- The seed script prints seeded account emails and the password `password`; this is less severe than
  leaking `DATABASE_URL`, but it is still not a production-shaped account bootstrap.
- `REQ-DEV-LOCAL-PRODUCT-SEED-DATA` remains planned.

### `TASK-090`: `complete-with-evidence`

Evidence:

- Product docs require remote caret thickness and member labels.
- `RichEditorPane` maps collaborator identity into TipTap collaboration caret users.
- CSS includes explicit `.collaboration-cursor__caret`, `.collaboration-cursor__label`, and
  `.collaboration-selection__label` styling.
- `e2e/ce-02-presence.spec.ts` asserts Bob's remote cursor, selection, and label are visible and
  checks caret width.

Follow-up:

- If CE-02 remains green, `REQ-PRESENCE-CARET-LABEL-LEGIBILITY` can be closed by a narrow
  requirement-status/docs cleanup task.

### `TASK-091`: `partial`

Evidence:

- CE e2e files exist for CE-01 through CE-05 and exercise product sessions.
- CE specs target user-visible behavior such as convergence, presence, offline merge, checkpoint
  history, and rich editor rendering.

Gaps:

- CE specs still depend on specific `data-testid` names, helper routes, seeded workspace/document
  IDs, and product fixture names.
- The file name referenced in `TASK-091` verification is `e2e/ce-04-revision-history.spec.ts`, but
  the current file is `e2e/ce-04-history.spec.ts`.
- The archived task checklist leaves verification, docs, and REQ evidence unchecked.
- `REQ-CE-ACCEPTANCE-TEST-DECOUPLING` remains planned.

## Requirements State

Truly done based on this audit:

- `REQ-PRESENCE-CARET-LABEL-LEGIBILITY`, pending a narrow fresh verification/status cleanup task.

Still planned and requiring continued work:

- `REQ-PRODUCTION-ACCOUNT-MANAGEMENT`
- `REQ-WORKSPACE-LIFECYCLE-MANAGEMENT`
- `REQ-WORKSPACE-MEMBER-MANAGEMENT`
- `REQ-DOCUMENT-TRASH-RESTORE`
- `REQ-EDITOR-FIRST-UI-REFRESH`
- `REQ-COLLABORATIVE-CREATION-VISIBILITY`
- `REQ-DEV-LOCAL-PRODUCT-SEED-DATA`
- `REQ-CE-ACCEPTANCE-TEST-DECOUPLING`

Stale or weak archived-task evidence:

- `TASK-087`, `TASK-088`, `TASK-089`, `TASK-090`, and `TASK-091` archived checklists have unchecked
  verification, docs, or evidence boxes.
- `TASK-091` records a CE-04 filename that no longer matches the repository.
- `TASK-085` and `TASK-086` archived notes overstate completion relative to current acceptance.

## Next Recommended Action

Priority order from the autonomous goal points to product-foundation work after drift correction.
The next small phase should choose one of:

- Close the narrow drift for `REQ-PRESENCE-CARET-LABEL-LEGIBILITY` with fresh CE-02 verification and
  requirement status cleanup.
- Start `REQ-PRODUCTION-ACCOUNT-MANAGEMENT` with a task focused on production-shaped auth/account UI:
  remove dev/reviewer copy from normal UI, add account/profile scope placeholders or supported
  mutations, and document deactivate/delete policy.
- Split workspace lifecycle/member management into separate API/UI/authorization tasks before
  destructive or member-removal behavior.

## 검증

- 실행 명령: `scripts/with-node.sh pnpm requirements:index`
- 결과: pass. The index still lists `TASK-092` follow-up requirements in
  `docs/requirements/items/`, matching this audit's planned/partial classifications.
- 실행 명령: `scripts/with-node.sh pnpm format:check`
- 결과: pass after installing missing workspace dependencies and formatting only this task file and
  its reconciliation exec plan.
- Product quality gate 확인: audit-only task; no product gate was weakened, and archived status was
  not accepted as completion proof.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 해당 없음.
- Boundary review 필요 여부: 해당 없음.
- Orchestration guardrail 확인: implementation worker를 시작하지 않았고, write set은
  reconciliation artifacts로 제한했다.

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`로 이동했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
- [x] 관련 product quality gate 결과 또는 follow-up을 기록했다.
- [x] follow-up 또는 blocker를 기록했다.
