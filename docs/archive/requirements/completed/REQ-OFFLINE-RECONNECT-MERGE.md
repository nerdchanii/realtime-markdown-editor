---
id: REQ-OFFLINE-RECONNECT-MERGE
title: Reconnect 시 local/remote edits가 병합되어야 한다.
status: done
category: subject-derived
type: functional
taskability: done
scope: collaboration
derived_from: CE-03-OFFLINE-MERGE, REQ-COLLAB-ENGINE-ADAPTER
depends_on:
  - REQ-COLLAB-ENGINE-ADAPTER
blocks: []
completed_by:
  - tasks/archive/TASK-026-open-page-offline-merge.md
  - tasks/archive/TASK-077-db-backed-collaboration-session-live-yjs-persistence.md
refs:
  - docs/product/editor/offline-merge.md
  - docs/research/poc-001-collaboration-engine/README.md
---

# REQ-OFFLINE-RECONNECT-MERGE

Tiptap + Yjs + Hocuspocus adapter는 reconnect 후 local/remote 고유 텍스트 보존을 증명한다.
