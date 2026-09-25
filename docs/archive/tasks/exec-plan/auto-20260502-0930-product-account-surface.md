---
title: auto-20260502-0930-product-account-surface
status: active
purpose: improve production account surface without inventing unsupported account mutations
---

# Product Account Surface ExecPlan

## Goal

Reduce `REQ-PRODUCTION-ACCOUNT-MANAGEMENT` drift after `TASK-092` by making the existing session
flow look and behave like a product account path, while recording the account mutation and
deactivation policy work that still blocks requirement completion.

## Official Inputs

- `docs/requirements/items/REQ-PRODUCTION-ACCOUNT-MANAGEMENT.md`
- `docs/product/workspace/user-membership.md`
- `docs/product/ui-capability-gap-log.md`
- `docs/domain/relations/user-workspace.md`
- `docs/adr/0008-product-story-quality-gates.md`
- `tasks/archive/TASK-085-product-entry-and-account-ui.md`
- `tasks/archive/TASK-092-requirements-task-state-reconciliation.md`
- `apps/web/src/app/AuthScreen.tsx`
- `apps/web/src/app/TopBar.tsx`

## Execution Graph

| Task       | Mode     | Depends on | Unlocks      | Notes                                                                 |
| ---------- | -------- | ---------- | ------------ | --------------------------------------------------------------------- |
| `TASK-094` | blocking | `TASK-092` | next account | Product-shaped auth/settings surface and explicit remaining blockers. |

## Write Sets

Allowed:

- `apps/web/src/app/App.tsx`
- `apps/web/src/app/AuthScreen.tsx`
- `apps/web/src/app/TopBar.tsx`
- `apps/web/src/app/product-workspace-providers.ts`
- `apps/web/src/app/product-workspace-types.ts`
- `apps/web/src/styles/global.css`
- `docs/requirements/items/REQ-PRODUCTION-ACCOUNT-MANAGEMENT.md`
- `docs/product/workspace/user-membership.md`
- `docs/product/ui-capability-gap-log.md`
- `tasks/exec-plan/auto-20260502-0930-product-account-surface.md`
- `tasks/archive/TASK-094-product-account-surface-and-policy.md`

Forbidden:

- `.note/**`
- `README.md`
- `apps/api/**`
- `apps/collab/**`
- `packages/**`

## Acceptance

- Normal auth copy no longer describes the primary sign-in path as reviewer/dev bootstrap.
- Sign-in failures have a visible user-facing error.
- Dev seed account shortcuts remain clearly labeled as local seed accounts.
- Settings entry is under the profile menu and exposes User, Workspace, and Project scopes.
- Top bar workspace/project labels come from product session/navigation state instead of static
  placeholder names.
- Account deactivation/delete policy is documented in the product workspace membership surface.
- `REQ-PRODUCTION-ACCOUNT-MANAGEMENT` stays open with explicit remaining blockers for
  account creation/bootstrap, profile update, and deactivation mutations.

## Verification

- `scripts/with-node.sh pnpm --filter @rme/web typecheck`
- `scripts/with-node.sh pnpm --filter @rme/web test`
- `scripts/with-node.sh pnpm requirements:index`
- `scripts/with-node.sh pnpm format:check`
