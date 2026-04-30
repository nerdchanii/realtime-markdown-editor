---
title: tasks/exec-plan/05-productization-platform.md
status: active
purpose: productization execution plan for durable backend, API, collaboration, and editor platform
---

# 05 Productization Platform

## Goal

Move the app from completed skeleton/recovery work into a real product platform: durable
Postgres-backed workspace/document data, authenticated owner/member collaboration, product API
surface, artifact-backed checkpoints/images, and a Tiptap rich editor that is actually wired to the
collaboration runtime.

This plan starts after ADR-0007 rich authoring surface work is merged. It accepts that raw Markdown
source, split preview, and standalone preview are deferred. The product target is the dense
technical writing workspace described by `DESIGN.md`: left project files, document tabs, center
rich editor, right history inspector, and bottom status bar.

## Official Inputs

- `subject.md`
- `docs/compliance/subject-matrix.md`
- `docs/requirements/registry.md`
- `ARCHITECTURE.md`
- `DESIGN.md`
- `docs/adr/0001-domain-first-collaboration-engine-isolation.md`
- `docs/adr/0002-collaboration-engine-poc-bench.md`
- `docs/adr/0003-storage-strategy.md`
- `docs/adr/0004-document-lifecycle-policy.md`
- `docs/adr/0005-ui-shell-scope-model.md`
- `docs/adr/0006-filesystem-like-workspace-hierarchy.md`
- `docs/adr/0007-rich-markdown-authoring-surface.md`
- `docs/product/README.md`
- `docs/product/editor/history.md`
- `docs/product/editor/rich-preview.md`
- `docs/product/editor/markdown-export.md`
- `docs/product/editor/links-backlinks.md`
- `docs/product/editor/properties.md`
- `docs/product/workspace/workspace-hierarchy.md`
- `docs/product/workspace/user-membership.md`

`.note/**` can be used only as scratch context for the main orchestrator. It must not be cited as
official task evidence.

## Model Policy

Use these defaults for this plan:

| Agent role     | Model     | Reasoning | Use for                                                                         |
| -------------- | --------- | --------- | ------------------------------------------------------------------------------- |
| Phase agent    | `gpt-5.5` | `xhigh`   | phase orchestration, contract decisions, integration review, blocker resolution |
| Explorer agent | `gpt-5.4` | `medium`  | bounded code/docs investigation with no edits                                   |
| Worker agent   | `gpt-5.5` | `medium`  | scoped implementation against an approved task/write set                        |
| Verification   | `gpt-5.5` | `high`    | release gate, regression analysis, ambiguous test failure triage                |

The user-requested defaults are appropriate. The only adjustment is operational: do not spend
`xhigh` on every worker. Keep `xhigh` for phase agents and hard integration decisions; use
`medium` for workers with narrow write sets.

## Delegation Model

Main orchestrator responsibilities:

- Own this execution plan.
- Start one phase agent per phase.
- Give each phase agent the relevant phase section and guardrails.
- Review phase-agent output before downstream phases start.
- Prevent parallel workers from overlapping write sets.

Phase agent responsibilities:

- Use `tasks/_templates/SUBAGENT-PREAMBLE.md` in every delegated prompt.
- Materialize concrete task files under `tasks/todo/` from the task list below.
- When a phase is too large for one safe execution pass, split it into a small
  `tasks/exec-plan/auto-YYYYMMDD-HHMM-<slug>.md` plan with one to three tasks, following
  `tasks/exec-plan/AUTO-PHASE-LOOP.md`.
- Promote tasks through `todo -> active -> archive`.
- Delegate discovery to explorer agents.
- Delegate implementation to worker agents.
- Integrate worker outputs, run phase verification, and record blockers.
- Avoid direct feature implementation unless it is small, phase-local orchestration glue.

Explorer responsibilities:

- No edits.
- Answer specific codebase/documentation questions.
- Return file references and risk notes.

Worker responsibilities:

- Edit only the assigned write set.
- Do not revert other workers' or user changes.
- Run assigned verification.
- Report changed files, verification results, and blockers.

## Productization Principles

- Product APIs replace seed/review APIs for normal runtime.
- Seed endpoints become dev-only, environment-gated bootstrap helpers.
- Current user and workspace membership come from authenticated session state, not query/body trust.
- Owner/member is the first role model. Do not introduce editor/viewer/admin yet.
- Postgres stores product metadata and current Markdown projection.
- Object storage stores immutable artifacts: checkpoint snapshots, exports, images, and future blobs.
- Live Tiptap/Yjs state is realtime provider state. It is separate from checkpoint history.
- Checkpoint creation is owned by the documents API.
- The Tiptap `EditorContent` instance must be the actual collaboration editor instance.
- Undo/redo is collaboration-safe undo/redo, not the default local history extension.
- Image upload is artifact-backed before image insertion is exposed as durable product behavior.

## Execution Graph

| Task       | Mode               | Depends on                                                 | Unlocks                            | Notes                                                                        |
| ---------- | ------------------ | ---------------------------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------- |
| `TASK-070` | `orchestration`    | none                                                       | `TASK-071`                         | Materialize productization tasks and lock post-ADR-0007 baseline             |
| `TASK-071` | `blocking`         | `TASK-070`                                                 | `TASK-072`, `TASK-073`             | Contract/schema/API route inventory and acceptance gates                     |
| `TASK-072` | `blocking`         | `TASK-071`                                                 | `TASK-074`, `TASK-075`, `TASK-078` | Prisma/Postgres foundation                                                   |
| `TASK-073` | `blocking`         | `TASK-071`                                                 | `TASK-074`, `TASK-075`, `TASK-078` | Runtime validation, error envelope, centralized CORS                         |
| `TASK-074` | `parallel-backend` | `TASK-072`, `TASK-073`                                     | `TASK-077`, `TASK-082`             | Auth/session and owner/member authorization                                  |
| `TASK-075` | `parallel-backend` | `TASK-072`, `TASK-073`                                     | `TASK-076`, `TASK-080`, `TASK-082` | Workspace/project/folder/document CRUD APIs                                  |
| `TASK-076` | `blocking`         | `TASK-075`                                                 | `TASK-077`, `TASK-078`, `TASK-081` | Current Markdown projection and Tiptap serialization contract                |
| `TASK-077` | `parallel-backend` | `TASK-074`, `TASK-076`                                     | `TASK-082`                         | DB-backed collaboration session and live Yjs persistence                     |
| `TASK-078` | `parallel-backend` | `TASK-072`, `TASK-076`                                     | `TASK-080`, `TASK-082`             | Checkpoint metadata/artifact split and canonical documents route             |
| `TASK-079` | `parallel-backend` | `TASK-072`, `TASK-073`                                     | `TASK-081`, `TASK-082`             | Artifact-backed image upload API                                             |
| `TASK-080` | `parallel-ui`      | `TASK-075`, `TASK-078`                                     | `TASK-082`                         | Frontend migration from seed/checkpoint local state to product APIs          |
| `TASK-081` | `parallel-ui`      | `TASK-076`, `TASK-079`                                     | `TASK-082`                         | Tiptap template UI absorption, collaboration-safe undo/redo, image insertion |
| `TASK-082` | `integration`      | `TASK-077`, `TASK-078`, `TASK-079`, `TASK-080`, `TASK-081` | `TASK-083`                         | Product runtime integration                                                  |
| `TASK-083` | `verification`     | `TASK-082`                                                 | complete                           | Full regression and reviewer product flow                                    |

## Task Details

### TASK-070: Productization Task Materialization

Type: `docs` / Mode: `orchestration`

Goal:

- Convert this exec plan into concrete `tasks/todo/TASK-070` through `TASK-083` files.

Write set:

- `tasks/todo/**`
- `tasks/exec-plan/05-productization-platform.md`

Acceptance:

- Every task has frontmatter matching `tasks/_templates/TASK-TEMPLATE.md`.
- Every task has a non-overlapping write set or explicit integration mode.
- Every phase-agent prompt includes the model policy and subagent delegation model.
- ADR-0007/editor recovery baseline is recorded before implementation starts.

Verification:

- `git status --short`
- `pnpm format:check`

### TASK-071: Product API Contract And Route Inventory

Type: `contract` / Mode: `blocking`

Goal:

- Define the stable product API surface before implementation workers start.

Write set:

- `packages/contracts/src/http/**`
- `packages/contracts/src/index.ts`
- `docs/architecture/backend.md`
- API route docs if added
- `tasks/todo/TASK-07*.md`
- `tasks/todo/TASK-08*.md`

Acceptance:

- Canonical routes are defined for auth/session, workspace, project, folder, document, document
  content, properties, links/backlinks, checkpoints, exports, image upload, and collaboration
  sessions.
- `POST /documents/:documentId/checkpoints` is canonical.
- Collaboration routes do not own checkpoint creation.
- Seed/review routes are identified as dev-only.
- DTOs and runtime schema strategy are selected.

Verification:

- `pnpm --filter @rme/contracts typecheck`
- `pnpm format:check`

### TASK-072: Prisma/Postgres Persistence Foundation

Type: `parallel-backend` / Mode: `blocking`

Goal:

- Introduce product metadata persistence.

Write set:

- `apps/api/package.json`
- `package.json`
- `pnpm-lock.yaml`
- `apps/api/prisma/**`
- `apps/api/src/**/database*`
- `apps/api/src/modules/**/adapters/*prisma*`
- `apps/api/src/modules/**/ports/**`

Acceptance:

- Prisma and migrations are configured for Postgres.
- Initial schema covers users, sessions, workspaces, memberships, projects, folders, documents,
  document properties, link edges, artifacts, checkpoints, and live collaboration state metadata.
- Domain code remains Prisma-free.
- Product runtime no longer binds `InMemoryDocumentRepository`.

Verification:

- `pnpm install` if dependencies change
- `pnpm --filter @rme/api typecheck`
- `pnpm arch:check`
- migration apply command documented in the task result

### TASK-073: API Runtime Validation, Error Envelope, And CORS

Type: `parallel-backend` / Mode: `blocking`

Goal:

- Make API boundaries product-safe.

Write set:

- `packages/contracts/src/http/**`
- `apps/api/src/main.ts`
- `apps/api/src/**/*.controller.ts`
- `apps/api/src/**/interfaces/**`
- API test helpers

Acceptance:

- Centralized CORS replaces per-route wildcard headers.
- Request validation exists for params, query, and body.
- Stable JSON error envelope exists: `code`, `message`, optional `details`, optional `requestId`.
- Invalid IDs/body return `400`; unauthenticated `401`; forbidden `403`; missing resources `404`.

Verification:

- `pnpm --filter @rme/api test`
- `pnpm --filter @rme/api typecheck`
- `pnpm lint`

### TASK-074: Auth Session And Owner/Member Authorization

Type: `parallel-backend` / Mode: `parallel`

Goal:

- Add the first product identity boundary.

Write set:

- `apps/api/src/modules/identity/**`
- `apps/api/src/modules/workspace/**`
- `apps/api/src/modules/collaboration/**`
- `packages/contracts/src/http/**`
- Auth/session tests

Acceptance:

- Login/session/me API exists.
- Current user is derived from an httpOnly session cookie.
- Current workspace membership is derived by DB lookup.
- Owner/member authorization guards protect workspace/document/collaboration/checkpoint actions.
- Public API no longer trusts `memberId` or `authorMembershipId` from request data.

Verification:

- `pnpm --filter @rme/api test`
- `pnpm --filter @rme/api typecheck`

### TASK-075: Workspace, Folder, And Document Product APIs

Type: `parallel-backend` / Mode: `parallel`

Goal:

- Add durable workspace and document CRUD.

Write set:

- `apps/api/src/modules/workspace/**`
- `apps/api/src/modules/documents/**`
- `packages/contracts/src/http/**`
- backend tests for workspace/document APIs

Acceptance:

- Workspace/project/folder/document create/list/read/update/move/soft-delete APIs exist.
- Every document has exactly one folder.
- Root folders cannot be moved/deleted.
- Document properties are stored outside Markdown body.
- Link/backlink projection read API exists or is explicitly staged behind `TASK-076`.

Verification:

- `pnpm --filter @rme/api test`
- `pnpm --filter @rme/api typecheck`
- `pnpm arch:check`

### TASK-076: Current Markdown Projection And Serialization Contract

Type: `contract` / Mode: `blocking`

Goal:

- Define how rich Tiptap state becomes durable Markdown for product APIs.

Write set:

- `apps/web/src/features/editor/**`
- `apps/collab/src/**`
- `apps/api/src/modules/documents/**`
- `packages/contracts/src/http/**`
- `docs/product/editor/rich-preview.md`
- `docs/product/editor/history.md`

Acceptance:

- The actual `EditorContent` instance is wired to collaboration extensions.
- Markdown serialization uses the Tiptap Markdown extension path.
- DB stores a latest Markdown projection.
- Opening a document can bootstrap from DB Markdown when live Yjs state is absent.
- Export and checkpoint creation use server-resolved current content, not an untrusted full-body
  client snapshot.

Verification:

- `pnpm --filter @rme/web typecheck`
- `pnpm --filter @rme/api typecheck`
- `pnpm test:e2e e2e/ce-01-concurrent-editing.spec.ts e2e/ce-05-rich-preview.spec.ts`

### TASK-077: DB-Backed Collaboration Session And Live Yjs Persistence

Type: `parallel-backend` / Mode: `parallel`

Goal:

- Replace seed-backed collaboration runtime with DB-backed product collaboration.

Write set:

- `apps/api/src/modules/collaboration/**`
- `apps/collab/src/**`
- `packages/contracts/src/realtime/**`
- collaboration tests

Acceptance:

- Collaboration session issuance checks authenticated membership.
- Hocuspocus session loading uses provider-neutral contract data from product APIs or DB-backed
  session client.
- Live Yjs state persists to Postgres and reloads after collab service restart.
- `apps/collab` does not import API domain/use-case files.

Verification:

- `pnpm --filter @rme/collab typecheck`
- `pnpm --filter @rme/api typecheck`
- `pnpm arch:check`
- `pnpm test:e2e e2e/ce-01-concurrent-editing.spec.ts e2e/ce-03-offline-merge.spec.ts`

### TASK-078: Checkpoint Metadata And Artifact Split

Type: `parallel-backend` / Mode: `parallel`

Goal:

- Turn checkpoint history into product persistence.

Write set:

- `apps/api/src/modules/documents/**`
- artifact storage ports/adapters
- `packages/contracts/src/http/**`
- checkpoint tests

Acceptance:

- Checkpoint metadata is stored in Postgres.
- Snapshot Markdown payload is stored through artifact storage port.
- Artifact metadata is stored in Postgres.
- `POST /documents/:documentId/checkpoints` is canonical.
- Collaboration checkpoint route is removed or explicitly transitional.
- List and inspect work after refresh and API restart.

Verification:

- `pnpm --filter @rme/api test`
- `pnpm test:e2e e2e/ce-04-history.spec.ts`

### TASK-079: Artifact-Backed Image Upload API

Type: `parallel-backend` / Mode: `parallel`

Goal:

- Add durable image upload infrastructure before editor image insertion.

Write set:

- `apps/api/src/modules/documents/**`
- artifact storage ports/adapters
- `packages/contracts/src/http/**`
- upload tests

Acceptance:

- Image upload writes payload through artifact storage port.
- Metadata records content type, checksum, size, owner document/workspace context, and storage key.
- Returned URL/reference can be inserted into the editor without exposing provider internals.
- Unsupported content types and oversized uploads fail with stable validation errors.

Verification:

- `pnpm --filter @rme/api test`
- `pnpm --filter @rme/api typecheck`

### TASK-080: Frontend Product API Migration

Type: `parallel-ui` / Mode: `parallel`

Goal:

- Move the UI off seed/local-only state where product APIs now exist.

Write set:

- `apps/web/src/lib/api-client/**`
- `apps/web/src/app/**`
- `apps/web/src/features/workspace/**`
- `apps/web/src/features/history/**`
- `apps/web/src/features/document/**`
- related e2e files

Acceptance:

- Workspace/document data loads from product APIs.
- Checkpoint list loads from API on mount/refresh.
- Creating a checkpoint refetches or updates from the canonical documents route.
- Other users can see checkpoint updates after refresh; polling/realtime event can be staged.
- Dev seed route dependency is isolated to local bootstrap.

Verification:

- `pnpm --filter @rme/web typecheck`
- `pnpm test:e2e e2e/ce-04-history.spec.ts e2e/task-045-reviewer-flow.spec.ts`

### TASK-081: Template UI Absorption, Undo/Redo, And Image Insert

Type: `parallel-ui` / Mode: `parallel`

Goal:

- Absorb useful Tiptap template UI without giving it product state ownership.

Write set:

- `apps/web/src/features/editor/**`
- `apps/web/src/components/ui/**`
- `apps/web/src/styles/**`
- `apps/web/src/lib/api-client/**`
- editor e2e files

Acceptance:

- Toolbar follows the dense workspace design in `DESIGN.md`.
- Undo/redo controls use collaboration-safe undo/redo, not default local history.
- Link, heading, list, task, code, and image controls are available where supported.
- Image insertion uses artifact upload API from `TASK-079`.
- The editor instance remains the real collaboration editor instance.

Verification:

- `pnpm --filter @rme/web typecheck`
- `pnpm test:e2e e2e/ce-01-concurrent-editing.spec.ts e2e/ce-02-presence.spec.ts e2e/ce-05-rich-preview.spec.ts`

### TASK-082: Product Runtime Integration

Type: `integration` / Mode: `integration`

Goal:

- Connect backend, collab runtime, and frontend into one product path.

Write set:

- integration glue across `apps/api/**`, `apps/collab/**`, `apps/web/**`
- e2e support files
- docs touched by integration drift

Acceptance:

- A logged-in member opens a workspace document.
- The rich editor is collaborative.
- Presence appears inside the rich editor surface.
- Checkpoints persist, reload, and inspect.
- Markdown export uses server/current content.
- Image upload and insertion work through artifact references.
- Seed APIs are dev-only.

Verification:

- `pnpm check`
- `pnpm test:e2e e2e/ce-01-concurrent-editing.spec.ts e2e/ce-02-presence.spec.ts e2e/ce-03-offline-merge.spec.ts e2e/ce-04-history.spec.ts e2e/ce-05-rich-preview.spec.ts`

### TASK-083: Productization Verification Gate

Type: `verification` / Mode: `verification`

Goal:

- Verify productization did not only pass tests but also meets the product/runtime expectations.

Write set:

- `README.md`
- `docs/compliance/subject-matrix.md`
- `docs/requirements/registry.md`
- verification notes in task files
- e2e files only for test robustness fixes

Acceptance:

- `pnpm check` passes.
- Full `pnpm test:e2e` passes.
- Manual reviewer path is documented.
- README explains product login/bootstrap, local Postgres/object storage setup, and reviewer flow.
- Compliance matrix evidence statements are true for product code.
- Known deferred items are in backlog, not hidden in implementation gaps.

Verification:

- `pnpm check`
- `pnpm test:e2e`
- Manual smoke: login, open document, collaborate, undo/redo, checkpoint, refresh, export, upload image.

## Phase Agent Prompts

Use this prompt shape when starting a phase agent:

```text
You are the phase agent for TASK-07X/TASK group in
/Users/gim-yechan/project/realtime-markdown-editor.

Use model policy:
- phase agent: gpt-5.5 xhigh
- explorers: gpt-5.4 medium
- workers: gpt-5.5 medium

Read:
- tasks/_templates/SUBAGENT-PREAMBLE.md
- tasks/README.md
- tasks/exec-plan/05-productization-platform.md
- assigned task file(s)

Do not cite .note/** as official documentation.
Materialize or execute only the assigned task scope.
Delegate bounded exploration to explorer agents.
Delegate implementation to worker agents with explicit write sets.
Review worker output, run verification, and report blockers.
```

## Exit Gate

This plan is complete when:

- Product runtime no longer depends on seed/review endpoints except local/dev bootstrap.
- Workspace/document/checkpoint data is durable through Postgres plus artifact storage.
- Auth/session derives current user and owner/member membership.
- Tiptap rich editor is the real collaborative editor surface.
- Undo/redo and image insertion are product-safe.
- Checkpoint history survives refresh and is visible across users after reload.
- `pnpm check` and full `pnpm test:e2e` pass.
