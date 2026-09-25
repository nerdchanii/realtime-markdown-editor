---
title: auto-20260502-0901-presence-legibility-closeout
status: active
purpose: close completed presence caret label legibility requirement after fresh CE-02 verification
---

# Presence Legibility Closeout ExecPlan

## Goal

Close `REQ-PRESENCE-CARET-LABEL-LEGIBILITY` after the reconciliation audit found the implementation
complete, repairing only stale CE-02 verification coupling needed to prove the current behavior.

## Official Inputs

- `docs/requirements/items/REQ-PRESENCE-CARET-LABEL-LEGIBILITY.md`
- `docs/requirements/completed/REQ-PRESENCE-MEMBER-AWARENESS.md`
- `docs/product/editor/presence.md`
- `docs/compliance/subject-matrix.md`
- `tasks/archive/TASK-090-presence-caret-label-legibility.md`
- `tasks/archive/TASK-092-requirements-task-state-reconciliation.md`
- `e2e/ce-02-presence.spec.ts`

## Execution Graph

| Task       | Mode           | Depends on | Unlocks | Notes                                                                                        |
| ---------- | -------------- | ---------- | ------- | -------------------------------------------------------------------------------------------- |
| `TASK-093` | `verification` | `TASK-092` | 완료    | Refresh CE-02 wait, verify presence label/caret evidence, and move requirement to completed. |

## Write Sets

Allowed:

- `e2e/ce-02-presence.spec.ts`
- `e2e/support/product-fixtures.ts`
- `docs/requirements/registry.md`
- `docs/requirements/items/REQ-PRESENCE-CARET-LABEL-LEGIBILITY.md`
- `docs/requirements/completed/REQ-PRESENCE-CARET-LABEL-LEGIBILITY.md`
- `tasks/exec-plan/auto-20260502-0901-presence-legibility-closeout.md`
- `tasks/archive/TASK-093-presence-caret-label-legibility-closeout.md`

Forbidden:

- `.note/**`
- `README.md`
- `apps/api/**`
- `apps/collab/**`
- `apps/web/src/**`
- `packages/**`

## Acceptance

- CE-02 still asserts Bob's remote cursor, selection, and visible display-name label.
- The stale removed `sync-status` test id is no longer required for CE-02 setup.
- Product e2e session bootstrap tolerates normal API startup timing.
- `REQ-PRESENCE-CARET-LABEL-LEGIBILITY` is moved from `items/` to `completed/`.
- `docs/requirements/registry.md` reflects the completed requirement state.
- Verification results are recorded in `TASK-093`.

## Verification

- `DATABASE_URL=<local test db> scripts/with-node.sh pnpm test:e2e -- e2e/ce-02-presence.spec.ts`
- `scripts/with-node.sh pnpm requirements:index`
- `scripts/with-node.sh pnpm format:check`
