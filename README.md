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
scripts/with-node.sh pnpm install
scripts/with-node.sh pnpm db:generate
```

## Local Product Bootstrap

Start local Postgres and apply migrations before running the product reviewer path. Use an explicit
local database URL when the default `5432` port is already occupied:

```bash
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:55434/realtime_markdown_editor \
POSTGRES_HOST_PORT=55434 \
scripts/with-node.sh pnpm db:migrate
```

The local artifact adapters store checkpoint snapshots and uploaded images on disk. Defaults are
under the API working directory:

- `.data/checkpoint-artifacts`
- `.data/image-artifacts`

Override them with `RME_CHECKPOINT_ARTIFACT_DATA_DIR` and `RME_IMAGE_ARTIFACT_DATA_DIR` when a
review run needs isolated artifact directories.

## Run Locally

```bash
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:55434/realtime_markdown_editor \
POSTGRES_HOST_PORT=55434 \
scripts/with-node.sh pnpm dev
```

Open the product reviewer URL:

```text
http://127.0.0.1:5173/?workspace=workspace_review&document=document_review_plan
```

Local reviewer identities:

- `alice`
- `bob`

These identities are local product memberships for review. They are not a production identity
provider. For manual local review, open `http://127.0.0.1:5173`, create the browser session from
that web origin, then open the reviewer URL:

```js
await fetch("http://127.0.0.1:4000/auth/session", {
  method: "POST",
  credentials: "include",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    email: "alice@example.test",
    password: "password",
    workspaceId: "workspace_review",
  }),
});
```

Use `bob@example.test` in a second browser context to verify collaboration and presence.

The normal reviewer path uses product APIs such as `/auth/session`, workspace navigation,
document content, collaboration sessions, checkpoints, exports, and image upload. Dev-only seed
routes such as `/review-context/seed` are local bootstrap compatibility routes and are not required
for the reviewer product flow.

## Reviewer Scenario

Run this scenario against the local product reviewer URL:

1. Create a local product session as `alice`.
2. Use the Workspace navigation to open **Review Plan** under
   **Review Workspace / Launch Readiness / Notes**.
3. Edit the central rich Markdown editor.
4. In another browser context, create a session as `bob`, open the same document, and verify edits
   converge without refreshing.
5. Select text as `bob` and verify `alice` sees Bob's cursor/selection identity.
6. Simulate offline/reconnect with the CE e2e flow and verify local and remote text both remain.
7. Use toolbar undo/redo and confirm it changes the collaborative editor content.
8. Create a history checkpoint, select it, inspect the read-only Markdown snapshot, refresh, and
   confirm the checkpoint remains listed.
9. Export Markdown and confirm YAML frontmatter plus body content are present.
10. Upload an image through the toolbar and confirm the exported Markdown contains an
    `rme-artifact://documents/` image reference.
11. Inspect document properties near the title and confirm they are outside the Markdown body.
12. Inspect the Decision Log backlink.

Executable evidence:

- `e2e/ce-01-concurrent-editing.spec.ts`
- `e2e/ce-02-presence.spec.ts`
- `e2e/ce-03-offline-merge.spec.ts`
- `e2e/ce-04-history.spec.ts`
- `e2e/ce-05-rich-preview.spec.ts`
- `e2e/task-045-reviewer-flow.spec.ts`

## Checks

```bash
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:55434/realtime_markdown_editor \
POSTGRES_HOST_PORT=55434 \
scripts/with-node.sh pnpm check

DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:55434/realtime_markdown_editor \
POSTGRES_HOST_PORT=55434 \
scripts/with-node.sh pnpm test:e2e
```

`pnpm test:e2e` starts the local API, collaboration server, and web app through the Playwright
web server configuration and seeds product fixtures directly through Prisma for local/test
bootstrap.

## Included Product Surface

- CE-01 through CE-05 collaborative editor path.
- Workspace, project, folder, and document navigation for the local reviewer workspace.
- Workspace membership identity for presence and checkpoint authorship.
- Document properties stored and edited outside the Markdown body.
- Standard Markdown links/backlinks, starting with the reviewer Decision Log backlink.
- Rich, Markdown source, Preview, and Split editor modes.
- User-visible checkpoint history with inspectable Markdown snapshots.
- Markdown export as YAML frontmatter plus the standard Markdown body.

## Intentionally Deferred

The first reviewer build does not include workflow hooks/builders, publish/draft visibility policy,
RBAC/admin, restore/branching, graph view, wikilinks, multi-document pane split, PWA/Tauri/Electron,
or a production identity provider. Workspace/folder CRUD persistence and account management remain
staged after CE recovery; reviewer-local document creation is only a product entrypoint smoke path.

## Official Documentation

- [subject.md](./subject.md)
- [docs/compliance/subject-matrix.md](./docs/compliance/subject-matrix.md)
- [docs/requirements/registry.md](./docs/requirements/registry.md)
- [docs/product/README.md](./docs/product/README.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
