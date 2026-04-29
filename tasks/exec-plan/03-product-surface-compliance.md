---
title: tasks/exec-plan/03-product-surface-compliance.md
status: active
purpose: product surface and final compliance execution plan
---

# 03 Product Surface And Final Compliance

## Goal

Finish the editor-facing product surface beyond CE-only behavior: Markdown modes, properties, backlinks, export, reviewer documentation, and final compliance evidence.

## Official Inputs

- `docs/product/editor/rich-preview.md`
- `docs/product/editor/properties.md`
- `docs/product/editor/links-backlinks.md`
- `docs/product/editor/markdown-export.md`
- `docs/product/workspace/workspace-hierarchy.md`
- `docs/compliance/subject-matrix.md`
- `docs/requirements/registry.md`
- `DESIGN.md`
- `README.md`

## Execution Graph

| Task       | Mode               | Depends on                                     | Unlocks                            | Notes                                            |
| ---------- | ------------------ | ---------------------------------------------- | ---------------------------------- | ------------------------------------------------ |
| `TASK-040` | `blocking`         | Plan 02                                        | `TASK-041`, `TASK-042`, `TASK-043` | Product surface integration contract             |
| `TASK-041` | `parallel-ui`      | `TASK-040`                                     | `TASK-045`                         | Markdown modes and rich preview                  |
| `TASK-042` | `parallel-ui`      | `TASK-040`                                     | `TASK-045`                         | Properties UI and persistence integration        |
| `TASK-043` | `parallel-ui`      | `TASK-040`                                     | `TASK-045`                         | Links/backlinks UI and projection integration    |
| `TASK-044` | `parallel-backend` | `TASK-040`                                     | `TASK-045`                         | Markdown export endpoint and frontmatter mapping |
| `TASK-045` | `integration`      | `TASK-041`, `TASK-042`, `TASK-043`, `TASK-044` | `TASK-046`, `TASK-047`             | Product surface integration                      |
| `TASK-046` | `docs`             | `TASK-045`                                     | `TASK-048`                         | Reviewer README and scenario                     |
| `TASK-047` | `verification`     | `TASK-045`                                     | `TASK-048`                         | CE e2e and product smoke verification            |
| `TASK-048` | `verification`     | `TASK-046`, `TASK-047`                         | 완료                               | Final compliance review                          |

## Task Details

### TASK-040: Product Surface Integration Contract

Lock the surface contract before parallel UI/backend polish.

Write set:

- `packages/contracts/src/http/**`
- `apps/api/src/modules/documents/**`
- `apps/web/src/features/document/**`
- `apps/web/src/features/editor/**`
- `apps/web/src/features/workspace/**`
- `docs/product/editor/properties.md`
- `docs/product/editor/links-backlinks.md`
- `docs/product/editor/markdown-export.md`

Acceptance:

- Document detail DTO includes properties and link/backlink projection data or explicit endpoints for them.
- Export representation is defined as YAML frontmatter plus standard Markdown body.
- Product surface contract does not redefine CE requirements.
- Mock provider fields and real API fields are aligned.

Verification:

- `pnpm --filter @rme/contracts typecheck`
- `pnpm typecheck`
- `pnpm arch:check`
- `pnpm format:check`

### TASK-041: Markdown Modes And Rich Preview

Implement source, rich, rendered preview, and split mode.

Write set:

- `apps/web/src/features/editor/**`
- `apps/web/src/styles/**`
- `apps/web/package.json`
- `package.json`
- `pnpm-lock.yaml`

Acceptance:

- Reviewer can switch Rich, Markdown source, Preview, and Split modes.
- Split mode renders current Markdown beside source for one document.
- Heading, list, table, link, inline code, fenced code, task marker, and quote render without content loss.
- CE-05 e2e passes.

Verification:

- `pnpm --filter @rme/web typecheck`
- `pnpm lint`
- `pnpm test:e2e e2e/ce-05-rich-preview.spec.ts`

### TASK-042: Properties Surface

Implement document properties outside Markdown body.

Write set:

- `apps/api/src/modules/documents/**`
- `apps/web/src/features/document/**`
- `apps/web/src/lib/api-client/**`
- `packages/contracts/src/http/**`

Acceptance:

- Properties appear near document title, not inside editor body.
- Supported v1 property types are text, status/select, date, member, and checkbox if already represented in the contract.
- Editing a property does not mutate Markdown body.
- Member property uses workspace membership identity.

Verification:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm arch:check`

### TASK-043: Links And Backlinks Surface

Implement standard Markdown links and backlinks.

Write set:

- `apps/api/src/modules/documents/**`
- `apps/web/src/features/document/**`
- `apps/web/src/features/editor/**`
- `apps/web/src/lib/api-client/**`
- `packages/contracts/src/http/**`

Acceptance:

- Standard Markdown links to internal documents are recognized.
- Target document shows incoming backlink or connection.
- Wikilinks, graph view, alias resolution, and ranking suggestions remain excluded.
- Link behavior remains compatible with source mode and export.

Verification:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm arch:check`

### TASK-044: Markdown Export

Implement Markdown export with frontmatter.

Write set:

- `apps/api/src/modules/documents/**`
- `apps/web/src/features/document/**`
- `apps/web/src/lib/api-client/**`
- `packages/contracts/src/http/**`
- `docs/product/editor/markdown-export.md`

Acceptance:

- Export output contains YAML frontmatter for properties followed by standard Markdown body.
- Internal storage still keeps properties outside body.
- Export does not introduce product-only Markdown syntax.

Verification:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm arch:check`

### TASK-045: Product Surface Integration

Connect modes, properties, backlinks, export, and workspace navigation into one reviewer flow.

Write set:

- `apps/api/src/modules/**`
- `apps/web/src/**`
- `packages/contracts/src/**`
- `e2e/**`

Acceptance:

- Reviewer can start at workspace navigation, open seeded document, edit collaboratively, inspect properties/backlinks, switch preview modes, create history checkpoint, inspect snapshot, and export Markdown.
- CE selectors remain stable.
- No product extension hides the CE-01 through CE-05 path.

Verification:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm arch:check`
- `pnpm test:e2e`

### TASK-046: Reviewer README And Scenario

Expand root README for final local review.

Write set:

- `README.md`
- `docs/compliance/subject-matrix.md`

Acceptance:

- README explains install, run, seeded identities, reviewer URL, and CE scenario order.
- README identifies which product extensions are included and which are intentionally deferred.
- Subject matrix evidence statements reference product behavior that exists.
- README does not cite `.note/**`.

Verification:

- `pnpm format:check`

### TASK-047: Full Verification Pass

Run and record final verification.

Write set:

- `tasks/active/**`
- `tasks/archive/**`
- `test-results/**` only if the task explicitly records generated evidence and keeps ignored artifacts out of git

Acceptance:

- `pnpm check` passes.
- `pnpm test:e2e` passes.
- Any residual manual verification steps are documented with exact actions and outcomes.

Verification:

- `pnpm check`
- `pnpm test:e2e`

### TASK-048: Final Compliance Review

Close the long-run with a spec compliance review and code quality review.

Write set:

- `tasks/archive/**`
- `docs/compliance/subject-matrix.md`
- `README.md`

Acceptance:

- Every CE row in `docs/compliance/subject-matrix.md` has product-code evidence.
- Archived task files contain verification results.
- Product extensions included in this long-run have visible reviewer paths.
- Deferred items are documented and do not appear half-implemented in the main reviewer path.

Verification:

- `pnpm check`
- `pnpm test:e2e`
- Manual code review against `subject.md` and `docs/compliance/subject-matrix.md`
