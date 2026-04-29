---
title: docs/research/poc-001-collaboration-engine/shared/README.md
status: active
---

# Shared POC Assets

This folder contains provider-neutral assets for collaboration engine prototypes.
Prototype implementations can import these TypeScript files directly, or mirror
their contracts when the local toolchain cannot import from `docs/`.

## Files

- `adapter-contract.ts`: TypeScript contract for a POC adapter boundary. It uses
  Markdown offsets, member identities, presence, revisions, preview snapshots,
  and network availability terms only.
- `member-identities.ts`: Stable seeded workspace members for cursor labels,
  selections, and revision authorship.
- `seeded-markdown-fixture.ts`: Shared Markdown document fixture with anchors and
  expected rendered content.
- `scenarios.ts`: Scoring rubric and scenario definitions mapped to CE-01 through
  CE-05 and adapter-boundary evidence.
- `acceptance-scenarios.md`: Playwright-style scenario notes that each prototype
  can convert into local end-to-end tests.
- `index.ts`: Barrel exports for TypeScript consumers.

## Boundary Rules

- Do not import provider packages from this folder.
- Do not expose provider-specific document, transaction, awareness, selection, or
  transport objects in the shared contract.
- Keep Markdown body offsets zero-based and measured against the portable
  Markdown source string. Prototype adapters are responsible for translating to
  editor or provider coordinates.

