---
id: REQ-DEV-LOCAL-PRODUCT-SEED-DATA
title: Local development can bootstrap realistic product seed data into the real database.
status: done
category: product-extension
type: ops
priority: medium-high
taskability: done
scope: platform
derived_from:
  - REQ-WORKSPACE-HIERARCHY
  - REQ-IDENTITY-MEMBERSHIP
  - REQ-WORKSPACE-DOCUMENT-SCOPE
depends_on:
  - REQ-WORKSPACE-HIERARCHY
  - REQ-IDENTITY-MEMBERSHIP
  - REQ-PLATFORM-PORTABILITY-GUARDRAIL
blocks: []
refs:
  - docs/product/workspace/workspace-hierarchy.md
  - docs/product/workspace/user-membership.md
  - docs/product/README.md
  - e2e/support/product-fixtures.ts
  - scripts/db-bootstrap.mjs
  - scripts/product-seed-spec.mjs
  - scripts/seed-local-product.mjs
  - tasks/archive/TASK-103-local-product-seed-spec.md
---

# REQ-DEV-LOCAL-PRODUCT-SEED-DATA

Local development should be able to bootstrap realistic product data into the real local Postgres
database. The seed is a developer bootstrap convenience, not a normal runtime dependency and not an
evaluator-only fixture.

The default seed should feel like a real company workspace rather than test data. The workspace name
must be a neutral company/team name, and seeded document titles should be plausible workplace
technical documents. Names such as "Review Team Workspace", "Review Plan", and "Decision Log" are
too fixture-like for the default developer experience.

The default seed source should use a curated subset of real repository Markdown documents, with
`docs/adr`, `docs/architecture`, `docs/product`, and `docs/domain` preferred as the first seed pack.
`docs/requirements` may be supported later as an explicit full-docs option, but should not dominate
the default first-run workspace.

Acceptance:

- A local developer can run an explicit command such as `pnpm db:seed:dev` after migrations to seed
  the configured local Postgres database.
- The seed command is idempotent and uses stable IDs for users, memberships, workspace, project,
  folders, and documents.
- The seeded workspace uses a company-like name and a product-like project structure, not
  test-fixture labels.
- The default seed includes users, workspace membership, project/folder hierarchy, selected
  Markdown documents, document properties, and links/backlinks.
- Seeded documents are based on a curated subset of real repository docs, especially ADR,
  architecture, product, and domain documents.
- Sessions are not seeded. Users still authenticate through the normal `/auth/session` product API.
- Seeded Markdown is a bootstrap/current projection and must not collapse the boundary between live
  Yjs provider state, DB Markdown projection, checkpoint snapshots, and export representation.
- The seed command refuses to run against production-like environments and must not print actual
  `DATABASE_URL` values or generated secrets.
- e2e product fixtures and local dev seed should share a canonical seed spec or helper so that they
  do not drift.
- `/review-context/seed`, URL member spoofing, fabricated document IDs, and local React-only state
  are not normal runtime dependencies for this requirement.

Non-goals:

- This requirement does not implement production account management or workspace administration.
- This requirement does not require seeding checkpoint history or live Yjs state by default.
- This requirement does not require importing every file under `docs/`.

## Current State

`TASK-103` adds the canonical local product seed spec and shares it between `pnpm db:seed:dev` and
the e2e product fixture. The default workspace is `Atlas Knowledge Workspace`, the default project
is `Product Architecture`, and seeded documents load curated repository Markdown from architecture,
product, domain, and ADR docs. Stable IDs remain in place for local runtime and collaboration test
compatibility.

The seed command is idempotent, does not seed sessions, refuses production mode and non-local
database hosts, and uses normal product auth for seeded users.
