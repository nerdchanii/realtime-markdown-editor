---
id: REQ-DOCUMENT-TRASH-RESTORE
title: Archived documents must be listable from Trash and restorable through product APIs.
status: planned
category: product-foundation
type: functional
priority: high
taskability: taskable
scope: documents
derived_from: REQ-WORKSPACE-LIFECYCLE-MANAGEMENT
depends_on:
  - REQ-WORKSPACE-LIFECYCLE-MANAGEMENT
  - REQ-WORKSPACE-DOCUMENT-SCOPE
blocks:
  - UI-GAP-008
next_step: Wire the canonical Trash list/restore API into the product UI and add product e2e evidence for delete, Trash listing, and restore.
refs:
  - docs/product/ui-capability-gap-log.md
  - docs/domain/rules/document-lifecycle.md
  - packages/contracts/src/http/routes.ts
  - apps/api/prisma/schema.prisma
  - tasks/archive/TASK-095-document-trash-restore-api.md
---

# REQ-DOCUMENT-TRASH-RESTORE

Documents already support soft deletion through `archivedAt`, but product users need a complete
Trash workflow. A deleted document must not disappear into an unrecoverable hidden state; workspace
members with the right authorization must be able to list archived documents and restore them into
the active workspace tree.

Acceptance:

- Product HTTP contracts include a canonical API to list archived documents for a workspace or
  folder scope without mixing them into normal navigation.
- Product HTTP contracts include a canonical restore API that clears archive state and returns the
  restored document.
- Normal workspace navigation and folder children APIs continue to exclude archived documents.
- Restore behavior preserves document content, properties, revisions, checkpoints, artifacts, and
  link metadata unless a later retention requirement explicitly says otherwise.
- Trash and restore operations are authorized through the current session and workspace membership,
  not by trusting client-supplied membership or workspace identity.
- Restore failure states are explicit: missing document, unauthorized access, deleted parent folder,
  or unsupported restore target must not silently succeed.

## Current State

`TASK-095` added canonical product HTTP contracts and API behavior for workspace Trash document
listing and document restore. Archived documents remain excluded from normal navigation and folder
children APIs. Restore clears only `archivedAt` and fails when the original folder path is no longer
active.

This requirement remains open until the product UI exposes the Trash list/restore workflow and
product e2e evidence covers the user-facing path.
