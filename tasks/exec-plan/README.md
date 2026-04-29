---
title: tasks/exec-plan/README.md
status: active
purpose: long-run execution master plan
---

# Long-Run Execution Master Plan

## Goal

Implement an editor-first collaborative Markdown product skeleton that proves `CE-01` through `CE-05` inside a credible workspace product surface.

This plan is not a replacement for task files. Each execution step still creates concrete `tasks/todo/TASK-...md` files using `tasks/_templates/TASK-TEMPLATE.md`, then moves them through `todo -> active -> archive`.

## Scope Baseline

Minimum product scope for this long-run is wider than CE-only acceptance.

Included:

- Workspace/project/folder/document hierarchy UX sufficient to feel like a workspace product.
- Workspace membership identity for presence, checkpoint authorship, member properties, and reviewer switching.
- Collaborative Markdown editor for `CE-01`.
- Remote cursor and selection presence for `CE-02`.
- Open-page offline local edits and reconnect merge for `CE-03`.
- Explicit checkpoint history with read-only snapshot inspection for `CE-04`.
- Rich, Markdown source, rendered preview, and source/preview split for `CE-05`.
- Document properties outside Markdown body.
- Standard Markdown links and backlinks.
- Markdown export with frontmatter representation if it does not delay CE stabilization; otherwise it is the first polish task after backlinks/properties.

Excluded from this long-run unless explicitly promoted:

- Workflow hooks, workflow builder, external integrations, reverse hooks.
- Publish/draft visibility policy, ownership-based visibility, RBAC/admin.
- Restore, branching, merge requests, graph view, wikilinks.
- Multi-document pane split. CE-05 split means source/preview split for one document.
- PWA/Tauri/Electron, full offline workspace cache, production identity provider.

## Execution Documents

Run these documents in order:

1. `tasks/exec-plan/01-foundation-shell.md`
2. `tasks/exec-plan/02-collaboration-persistence.md`
3. `tasks/exec-plan/03-product-surface-compliance.md`

Do not start a later document until the prior document exit criteria pass, except for explicitly marked documentation-only tasks with disjoint write sets.

## Phase Map

| Phase | Plan document                      | Purpose                                                                                |
| ----- | ---------------------------------- | -------------------------------------------------------------------------------------- |
| P0    | `01-foundation-shell.md`           | Preflight, ADR/storage decision, task graph, layout slots, workspace shell contract    |
| P1    | `01-foundation-shell.md`           | Workspace-scoped editor shell and mock-backed product surface                          |
| P2    | `02-collaboration-persistence.md`  | Collaboration runtime separation, API session contract, Yjs/Hocuspocus integration     |
| P3    | `02-collaboration-persistence.md`  | DB-first metadata, live collaboration persistence boundary, revision artifact boundary |
| P4    | `02-collaboration-persistence.md`  | Autosave, revision, publication term separation, checkpoint service                    |
| P5    | `02-collaboration-persistence.md`  | Membership-based presence                                                              |
| P6    | `03-product-surface-compliance.md` | Markdown source/rich/split/preview                                                     |
| P7    | `03-product-surface-compliance.md` | History UI and read-only snapshot inspection                                           |
| P8    | `03-product-surface-compliance.md` | Properties, backlinks, export, reviewer README, final evidence                         |

## Global Guardrails

- Use `tasks/_templates/SUBAGENT-PREAMBLE.md` in every delegated task.
- Use `git ls-files` and targeted reads for source discovery. Do not inspect ignored `.worktrees/**` or generated outputs.
- Do not cite `.note/**` as official documentation.
- A worker may edit only its declared `write_set`.
- A phase orchestrator may split tasks and call workers, but may not bypass approved contract/design gates.
- Collaboration runtime work must keep `apps/api` and `apps/collab` separated. `apps/collab` validates provider-neutral session contracts and does not import API domain/use-case files.
- Boundary-adjacent tasks include `pnpm arch:check`.
- CE implementation tasks include the relevant `pnpm test:e2e e2e/ce-xx-*.spec.ts` command, even while expected failures are being driven down.

## Node Runtime Rule

This repository requires Node `>=24 <25`; use Node `v24.15.0`.

Before running install, build, test, or dev commands, check:

- `node -v`
- `pnpm -v`

If `node -v` is not `v24.x`, or if `fnm use` / shell integration fails inside Codex, run Node and pnpm commands through:

- `fnm exec --using 24.15.0 -- node -v`
- `fnm exec --using 24.15.0 -- pnpm -v`
- `fnm exec --using 24.15.0 -- pnpm install`
- `fnm exec --using 24.15.0 -- pnpm typecheck`
- `fnm exec --using 24.15.0 -- pnpm lint`
- `fnm exec --using 24.15.0 -- pnpm arch:check`
- `fnm exec --using 24.15.0 -- pnpm check`
- `fnm exec --using 24.15.0 -- pnpm test:e2e`

Do not change the project engine range to fit the current shell. The project stays pinned to Node 24.

## Completion Gates

The long-run is complete when:

- `pnpm check` passes.
- `pnpm test:e2e` passes for `CE-01` through `CE-05`.
- Root `README.md` explains install, run, seeded identities, and reviewer scenario.
- `docs/compliance/subject-matrix.md` evidence statements are true in product code, not only POC code.
- Product extension surfaces included in scope have visible reviewer paths: workspace hierarchy, properties, backlinks, and export if not deferred by explicit task decision.
