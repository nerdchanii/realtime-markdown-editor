---
id: REQ-PRESENCE-CARET-LABEL-LEGIBILITY
title: Remote caret는 더 두껍게 보이고 member name label을 함께 표시해야 한다.
status: done
category: subject-derived
type: ux
taskability: done
scope: collaboration
derived_from: REQ-PRESENCE-MEMBER-AWARENESS
depends_on:
  - REQ-PRESENCE-MEMBER-AWARENESS
blocks: []
completed_by:
  - tasks/archive/TASK-090-presence-caret-label-legibility.md
  - tasks/archive/TASK-092-requirements-task-state-reconciliation.md
  - tasks/archive/TASK-093-presence-caret-label-legibility-closeout.md
refs:
  - docs/product/editor/presence.md
  - docs/compliance/feature-acceptance-map.md
  - e2e/ce-02-presence.spec.ts
---

# REQ-PRESENCE-CARET-LABEL-LEGIBILITY

Remote presence is legible without relying on color alone. The rich editor collaboration caret
renders a thicker remote caret marker and a member name label near the caret.

Evidence:

- `apps/web/src/features/editor/adapters/tiptap-yjs-runtime.ts` renders the remote collaboration
  caret with a 2px colored border and appends the remote member display-name label.
- `apps/web/src/components/tiptap-node/paragraph-node/paragraph-node.scss` styles the collaboration
  caret label with visible weight, spacing, and shadow.
- `e2e/ce-02-presence.spec.ts` verifies Bob's remote cursor, selection, and display-name label are
  visible from Alice's product session.
