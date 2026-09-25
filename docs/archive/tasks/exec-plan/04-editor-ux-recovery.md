---
title: tasks/exec-plan/04-editor-ux-recovery.md
status: active
purpose: editor UX recovery and product-grade refactor execution plan
---

# 04 Editor UX Recovery

## Goal

Recover the implemented product from a compliance-oriented skeleton into a credible editor-first
collaborative Markdown workspace. This plan treats the current UI and editor surface as incomplete
even if earlier CE tests passed.

The target is not a marketing redesign. The target is a dense technical writing workspace that uses
Tiptap as the real rich editing surface, shadcn UI for primitive controls, `DESIGN.md` for visual
tokens, and the POC outcome as the implementation reference.

## Why This Plan Exists

The current implementation has several product-grade blockers:

- Rich mode is not an editable Tiptap surface; the product still relies heavily on textarea/source
  editing and a local preview renderer.
- Presence does not look like remote cursor/selection presence. The expected behavior is a colored
  remote caret and compact member label near the cursor/selection.
- shadcn UI is not being used for primitive controls even though the product needs consistent
  button/input/tabs/dialog/menu primitives.
- `DESIGN.md` is not applied rigorously across color, density, borders, typography, and panel
  hierarchy.
- Workspace navigation does not read as a real folder tree and lacks clear create/edit/delete
  entrypoints.
- History, checkpoint creation, and snapshot inspection are visually ambiguous.
- Properties are not a credible editable metadata surface.
- User and membership identity are still seed/mock-heavy. This is acceptable for the reviewer path
  only if the mock boundary is explicit and does not pretend to be production auth.
- The Tiptap + Yjs + Hocuspocus POC feels more coherent than the current product surface, which
  means the POC learnings were not fully carried into implementation.

## Immediate Dirty Worktree Note

Before executing this plan, resolve the partial changes introduced during planning interruption:

- `apps/web/src/features/workspace/WorkspaceNodeView.tsx`
- `apps/web/src/features/workspace/index.tsx`
- `apps/web/src/features/workspace/types.ts`

`TASK-060` owns deciding whether to revert those partial edits or absorb them into the proper
workspace refactor. Do not continue feature implementation until that decision is recorded.

Baseline decision recorded by `TASK-060` on 2026-04-30: no tracked partial diff is present in the
three workspace files, so there is nothing to revert or absorb. `TASK-064` starts from the current
workspace baseline.

## Official Inputs

- `subject.md`
- `docs/compliance/subject-matrix.md`
- `docs/requirements/registry.md`
- `DESIGN.md`
- `ARCHITECTURE.md`
- `docs/product/README.md`
- `docs/product/editor/rich-preview.md`
- `docs/product/editor/presence.md`
- `docs/product/editor/history.md`
- `docs/product/editor/properties.md`
- `docs/product/workspace/workspace-hierarchy.md`
- `docs/product/workspace/user-membership.md`
- `docs/research/poc-001-collaboration-engine/result.md`
- `docs/research/poc-001-collaboration-engine/performance/performance-report.md`
- `docs/research/poc-001-collaboration-engine/prototypes/tiptap-yjs-hocuspocus/src/**`
- `docs/research/poc-001-collaboration-engine/prototypes/tiptap-yjs-hocuspocus/src/App.css`

## Recovery Principles

- Preserve CE-01 through CE-05 as the reviewer path. Product extension work must not hide the CE
  evidence path.
- Tiptap is the real rich editor. A textarea may exist only as Markdown source mode.
- Rich, Markdown, Split, and Preview modes must share one document state and preserve Markdown
  portability.
- Presence must be member-aware and position-aware, not just a detached user list.
- shadcn UI is used for primitive controls. Custom styling is reserved for product layout, editor
  typography, presence overlays, and tree/editor-specific surfaces.
- `DESIGN.md` is the visual source of truth. Avoid decorative gradients, nested cards, oversized
  rounded UI, and mock-slot labels in the product surface.
- Seed/mock data is acceptable for reviewer setup, but mock boundaries must be explicit in code and
  documentation.
- Workspace CRUD and auth are not allowed to block CE recovery, but the UI must have credible
  entrypoints and clear staging for later real persistence.

## Execution Graph

| Task       | Mode           | Depends on                                     | Unlocks                            | Notes                                           |
| ---------- | -------------- | ---------------------------------------------- | ---------------------------------- | ----------------------------------------------- |
| `TASK-060` | `blocking`     | Current worktree                               | `TASK-061`, `TASK-062`, `TASK-066` | Recovery audit, partial diff decision, tasking  |
| `TASK-061` | `blocking-ui`  | `TASK-060`                                     | `TASK-064`, `TASK-065`             | shadcn + design token foundation                |
| `TASK-062` | `blocking-ui`  | `TASK-060`                                     | `TASK-063`, `TASK-067`             | Tiptap rich/source/split editor core            |
| `TASK-063` | `blocking-ui`  | `TASK-062`                                     | `TASK-067`                         | Tiptap/Yjs presence and collaboration caret     |
| `TASK-064` | `parallel-ui`  | `TASK-061`                                     | `TASK-067`                         | Workspace tree and document entrypoints         |
| `TASK-065` | `parallel-ui`  | `TASK-061`, `TASK-062`                         | `TASK-067`                         | History/checkpoint and properties UX            |
| `TASK-066` | `parallel-app` | `TASK-060`                                     | `TASK-067`                         | User/membership mock boundary and route clarity |
| `TASK-067` | `integration`  | `TASK-063`, `TASK-064`, `TASK-065`, `TASK-066` | `TASK-068`                         | Reviewer flow integration                       |
| `TASK-068` | `verification` | `TASK-067`                                     | 완료                               | CE, visual, and regression verification         |

## Task Details

### TASK-060: Recovery Audit And Task Materialization

Create the concrete `tasks/todo/TASK-060` through `TASK-068` files and lock the recovery baseline.

Write set:

- `tasks/todo/**`
- `tasks/exec-plan/04-editor-ux-recovery.md`
- The three partial workspace files only if the task explicitly reverts or records them

Acceptance:

- Current implementation gaps are recorded against `subject.md`, `DESIGN.md`, and POC behavior.
- The partial interrupted workspace edits are either reverted or explicitly absorbed into
  `TASK-064`.
- Every follow-up task has a declared write set and verification command.
- No product code feature work starts before the task files exist.

Verification:

- `git status --short`
- `pnpm format:check`

### TASK-061: shadcn And Design Token Foundation

Introduce shadcn UI as the primitive layer and map `DESIGN.md` tokens into the web app styling
system.

Write set:

- `apps/web/package.json`
- `package.json`
- `pnpm-lock.yaml`
- `apps/web/src/styles/**`
- `apps/web/src/components/ui/**`
- `apps/web/src/lib/utils.ts`
- Tailwind/shadcn config files if required

Acceptance:

- shadcn primitives exist for button, input, tabs/toggle group, dialog, dropdown/menu, scroll area,
  badge, separator, and checkbox/switch if needed by properties.
- `DESIGN.md` colors are represented as CSS variables or Tailwind theme tokens.
- Primitive controls no longer rely on ad hoc inline styles.
- Existing CE selectors remain stable.

Verification:

- `pnpm install` if dependencies change
- `pnpm --filter @rme/web typecheck`
- `pnpm lint`
- `pnpm format:check`

### TASK-062: Tiptap Editor Core

Replace the current rich-mode bypass with a real Tiptap editor surface.

Write set:

- `apps/web/src/features/editor/**`
- `apps/web/src/styles/**`
- `apps/web/package.json`
- `package.json`
- `pnpm-lock.yaml`
- `e2e/ce-05-rich-preview.spec.ts`

Acceptance:

- Rich mode is editable through Tiptap `EditorContent`.
- Markdown source mode remains available and edits the same document body.
- Split mode shows editable Tiptap rich surface and/or Markdown source beside rendered preview
  according to the product decision recorded in the task.
- Preview mode remains read-only.
- Mode switching preserves heading, list, link, inline code, fenced code, quote, task marker, and
  table content as well as the chosen Markdown portability boundary allows.
- The implementation reuses POC Tiptap learnings instead of maintaining a separate fake rich
  renderer as the main editor.

Verification:

- `pnpm --filter @rme/web typecheck`
- `pnpm lint`
- `pnpm test:e2e e2e/ce-05-rich-preview.spec.ts`

### TASK-063: Tiptap/Yjs Presence And Collaboration Caret

Connect remote cursor/selection presence to the real Tiptap collaboration surface.

Write set:

- `apps/web/src/features/editor/**`
- `apps/web/src/styles/**`
- `e2e/ce-02-presence.spec.ts`
- `e2e/ce-01-concurrent-editing.spec.ts`

Acceptance:

- Remote cursor and selection are rendered in the editor content with member color.
- A compact member label appears near the remote caret/selection and does not permanently cover
  editable text.
- A separate compact active-members surface may exist, but it is not the only presence evidence.
- Collaboration state still converges for concurrent editing.

Verification:

- `pnpm --filter @rme/web typecheck`
- `pnpm lint`
- `pnpm test:e2e e2e/ce-01-concurrent-editing.spec.ts e2e/ce-02-presence.spec.ts`

### TASK-064: Workspace Tree And Document Entry Points

Make the left navigation feel like a real workspace/folder/document tree and add credible document
entrypoints.

Write set:

- `apps/web/src/features/workspace/**`
- `apps/web/src/app/**`
- `apps/web/src/lib/api-client/**`
- `packages/contracts/src/http/**` only if contract changes are required
- `e2e/task-045-reviewer-flow.spec.ts` or a new product smoke spec

Acceptance:

- Workspace/project/folder/document hierarchy reads visually as a tree.
- Reviewer can create a new Markdown document from a clear entrypoint.
- The new document becomes selectable and opens in the editor.
- Folder/workspace create/edit/delete controls are staged visibly or documented as deferred if not
  implemented in this plan.
- The tree does not show internal scaffolding text such as replacement-point/provider names.

Verification:

- `pnpm --filter @rme/web typecheck`
- `pnpm lint`
- Product smoke e2e for document creation and selection

### TASK-065: History And Properties UX

Redesign history/checkpoint and properties as understandable product surfaces.

Write set:

- `apps/web/src/features/history/**`
- `apps/web/src/features/document/**`
- `apps/web/src/lib/api-client/**`
- `packages/contracts/src/http/**` only if needed
- `e2e/ce-04-history.spec.ts`
- Product smoke e2e for properties

Acceptance:

- History separates checkpoint creation from revision browsing.
- Checkpoint creation copy explains intent without in-app design commentary.
- Revision list entries show message, author, timestamp, and selected state.
- Snapshot inspection is clearly read-only.
- Properties appear near title/context and support add/edit/delete for the current supported property
  types.
- Property edits do not mutate Markdown body.

Verification:

- `pnpm --filter @rme/web typecheck`
- `pnpm lint`
- `pnpm test:e2e e2e/ce-04-history.spec.ts`
- Product smoke e2e for property add/delete

### TASK-066: User And Membership Boundary

Clarify seeded users, membership identity, and later auth/workspace CRUD staging.

Write set:

- `apps/web/src/app/**`
- `apps/web/src/features/workspace/**`
- `apps/web/src/features/editor/**`
- `README.md`
- `docs/product/workspace/user-membership.md`
- `docs/requirements/backlog/REQ-DEFERRED-RAW-MARKDOWN-SOURCE.md`

Acceptance:

- Reviewer can tell which seeded member they are using.
- Presence and checkpoint authorship use workspace membership identity.
- Mock/seed identity is not presented as production auth.
- Full auth provider, account management, and production workspace CRUD are explicitly staged after
  CE recovery unless promoted by a later plan.

Verification:

- `pnpm --filter @rme/web typecheck`
- `pnpm lint`
- `pnpm format:check`

### TASK-067: Recovery Integration Flow

Integrate editor, presence, workspace tree, properties, and history into one reviewer path.

Write set:

- `apps/web/src/**`
- `packages/contracts/src/**`
- `e2e/**`
- `README.md`

Acceptance:

- Reviewer can open a workspace document, edit Rich mode, switch modes, see remote presence, create
  a document, edit properties, create a checkpoint, inspect a snapshot, and confirm preview.
- CE selectors remain stable or are updated with matching tests.
- Product extension surfaces do not obscure CE-01 through CE-05.
- No `.note/**` source is cited in official documentation.

Verification:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm arch:check`
- `pnpm test:e2e e2e/task-045-reviewer-flow.spec.ts`

### TASK-068: Recovery Verification And Visual QA

Close the recovery plan with full automated and manual visual verification.

Write set:

- `tasks/archive/**`
- `README.md`
- `docs/compliance/subject-matrix.md`
- Screenshot artifacts only if ignored or explicitly allowed by task policy

Acceptance:

- `pnpm check` passes.
- `pnpm test:e2e` passes.
- Manual visual QA confirms `DESIGN.md` alignment for desktop reviewer flow.
- Rich editing and remote presence are verified in at least two browser sessions.
- Remaining deferred items are explicitly listed and do not appear half-implemented in the main UI.

Verification:

- `pnpm check`
- `pnpm test:e2e`
- Manual browser review of seeded Alice/Bob flow

## Deferred Unless Promoted

- Production auth provider.
- Full workspace/project/folder CRUD persistence.
- RBAC/admin controls.
- Workflow hooks and builder.
- Comments/suggestions/mentions/chat.
- Graph view and wikilinks.
- Multi-document pane split.

These can be added after `TASK-068` if the recovered editor path is stable.
