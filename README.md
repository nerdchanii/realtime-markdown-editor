# Real-time Markdown Editor

Real-time Markdown Editor is a local reviewer build of a workspace-scoped,
realtime collaborative Markdown editor. The primary acceptance path is
`CE-01` through `CE-05` from [subject.md](./subject.md).

## Prerequisites

- Node.js `v24.15.0`
- pnpm `10.28.2`

This repository is pinned to Node `>=24 <25`.

## Install

```bash
pnpm install
```

## Run Locally

```bash
pnpm dev
```

Open the seeded reviewer URL:

```text
http://127.0.0.1:5173/?member=alice&document=seed-review-plan
```

Seeded workspace identities:

- `alice`
- `bob`

Seeded reviewer document:

- `seed-review-plan`, mapped to the workspace document `document_review_plan`

## Reviewer Scenario

Run this scenario against the local reviewer URL:

1. Open the seeded reviewer URL as `alice`.
2. Use the Workspace navigation to open **Review Plan** under
   **Review Workspace / Launch Readiness / Notes**.
3. Edit the central Markdown editor and keep the source text visible.
4. In another browser context, open the same document as `bob` and verify edits converge without
   refreshing.
5. Select text as `bob` and verify `alice` sees Bob's cursor/selection identity.
6. Simulate offline/reconnect with the CE e2e flow and verify local and remote text both remain.
7. Create a history checkpoint, select it, and inspect the read-only Markdown snapshot.
8. Switch Rich, Markdown, Preview, and Split modes; Split keeps source and preview visible.
9. Inspect document properties near the title and confirm they are outside the Markdown body.
10. Inspect the Decision Log backlink and export Markdown with YAML frontmatter.

Executable evidence:

- `e2e/ce-01-concurrent-editing.spec.ts`
- `e2e/ce-02-presence.spec.ts`
- `e2e/ce-03-offline-merge.spec.ts`
- `e2e/ce-04-history.spec.ts`
- `e2e/ce-05-rich-preview.spec.ts`
- `e2e/task-045-reviewer-flow.spec.ts`

## Checks

```bash
pnpm check
pnpm test:e2e
```

`pnpm test:e2e` starts the local API, collaboration server, and web app through the Playwright
web server configuration.

## Included Product Surface

- CE-01 through CE-05 collaborative editor path.
- Workspace, project, folder, and document navigation for the seeded reviewer workspace.
- Workspace membership identity for presence and checkpoint authorship.
- Document properties stored and edited outside the Markdown body.
- Standard Markdown links/backlinks, starting with the seeded Decision Log backlink.
- Rich, Markdown source, Preview, and Split editor modes.
- User-visible checkpoint history with inspectable Markdown snapshots.
- Markdown export as YAML frontmatter plus the standard Markdown body.

## Intentionally Deferred

The first reviewer build does not include workflow hooks/builders, publish/draft visibility policy,
RBAC/admin, restore/branching, graph view, wikilinks, multi-document pane split, PWA/Tauri/Electron,
or a production identity provider.

## Official Documentation

- [subject.md](./subject.md)
- [docs/compliance/subject-matrix.md](./docs/compliance/subject-matrix.md)
- [docs/requirements/registry.md](./docs/requirements/registry.md)
- [docs/product/README.md](./docs/product/README.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
