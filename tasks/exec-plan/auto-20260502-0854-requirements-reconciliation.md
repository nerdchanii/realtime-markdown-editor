---
title: auto-20260502-0854-requirements-reconciliation
status: active
purpose: reconcile archived TASK-085 through TASK-091 against current requirements evidence
---

# Requirements Reconciliation ExecPlan

## Goal

Reconcile historical archived tasks `TASK-085` through `TASK-091` against the current repository
state, then use the result to choose the next requirements work without treating archived status as
completion proof.

## Official Inputs

- `AGENTS.md`
- `subject.md`
- `docs/compliance/subject-matrix.md`
- `docs/requirements/registry.md`
- `docs/product/product-quality-gates.md`
- `tasks/exec-plan/AUTONOMOUS-REQUIREMENTS-GOAL.md`
- `tasks/exec-plan/AUTO-PHASE-LOOP.md`
- `tasks/README.md`
- `tasks/archive/TASK-085-product-entry-and-account-ui.md`
- `tasks/archive/TASK-086-design-md-ui-refresh-handoff.md`
- `tasks/archive/TASK-087-workspace-member-lifecycle-gap-inventory.md`
- `tasks/archive/TASK-088-collaborative-creation-visibility.md`
- `tasks/archive/TASK-089-local-product-seed-data.md`
- `tasks/archive/TASK-090-presence-caret-label-legibility.md`
- `tasks/archive/TASK-091-ce-acceptance-test-decoupling.md`

`.note/**` is not official evidence for this plan.

## Execution Graph

| Task       | Mode           | Depends on | Unlocks                | Notes                                                                                         |
| ---------- | -------------- | ---------- | ---------------------- | --------------------------------------------------------------------------------------------- |
| `TASK-092` | `verification` | 없음       | next requirement phase | Audit current state, classify `TASK-085` through `TASK-091`, and record follow-up priorities. |

## Write Sets

Allowed:

- `tasks/exec-plan/auto-20260502-0854-requirements-reconciliation.md`
- `tasks/todo/TASK-092-requirements-task-state-reconciliation.md`
- `tasks/active/TASK-092-requirements-task-state-reconciliation.md`
- `tasks/archive/TASK-092-requirements-task-state-reconciliation.md`

Forbidden:

- `.note/**`
- `README.md`
- `apps/**`
- `packages/**`
- `docs/requirements/items/**`
- `docs/product/**`

## Acceptance

- A `TASK-092-requirements-task-state-reconciliation` task exists and is archived with audit
  evidence.
- `TASK-085` through `TASK-091` are classified as `complete-with-evidence`, `partial`, `skipped`,
  or `stale-or-invalid`.
- The audit records which requirements are truly done, which need reopening or continued work,
  which archived task claims are stale, and which verification commands were run.
- No implementation work is performed under this reconciliation phase.
- Product quality gates are not weakened; archived task status alone is not used as completion
  evidence.

## Verification

- `scripts/with-node.sh pnpm requirements:index`
- `scripts/with-node.sh pnpm format:check`

## Reconciliation Result

`TASK-092` completed the first audit pass. Classification summary:

| Task       | Classification           | Follow-up                                                                                                                                               |
| ---------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TASK-085` | `partial`                | Continue `REQ-PRODUCTION-ACCOUNT-MANAGEMENT`; login/logout exist, but account create/update/deactivate and production-shaped auth UX remain incomplete. |
| `TASK-086` | `partial`                | Continue `REQ-EDITOR-FIRST-UI-REFRESH`; pane shell exists, but top bar still uses static workspace/project labels and standalone settings gear.         |
| `TASK-087` | `partial`                | It was inventory-only and archived with unchecked evidence; lifecycle/member requirements remain planned and taskable.                                  |
| `TASK-088` | `partial`                | Creator-triggered reload exists, but no cross-session document/checkpoint propagation evidence exists.                                                  |
| `TASK-089` | `partial`                | Local seed command exists, but fixture-like labels remain and e2e fixture drift is still visible.                                                       |
| `TASK-090` | `complete-with-evidence` | Requirement can be closed in a follow-up docs/status cleanup if CE-02 verification remains green.                                                       |
| `TASK-091` | `partial`                | CE tests still use specific test IDs/helper paths; the acceptance-test decoupling requirement remains planned.                                          |

## Checkpoint Criteria

- Commit only the reconciliation plan and `TASK-092` archive file.
- Do not stage unrelated `README.md` edits or the untracked autonomous goal file unless explicitly
  requested.
- Next phase should prioritize `REQ-PRODUCTION-ACCOUNT-MANAGEMENT` or a smaller state-drift cleanup
  task that closes `REQ-PRESENCE-CARET-LABEL-LEGIBILITY` with fresh verification.
