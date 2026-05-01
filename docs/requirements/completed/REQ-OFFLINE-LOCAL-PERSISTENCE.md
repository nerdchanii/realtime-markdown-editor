---
id: REQ-OFFLINE-LOCAL-PERSISTENCE
title: Open-page offline editing은 reconnect 전까지 local document state를 보존해야 한다.
status: done
category: subject-derived
type: architecture
taskability: done
scope: collaboration
derived_from: CE-03-OFFLINE-MERGE
depends_on: []
blocks: []
completed_by:
  - tasks/archive/TASK-026-open-page-offline-merge.md
refs:
  - docs/product/editor/offline-merge.md
  - docs/adr/0003-storage-and-history-policy.md
---

# REQ-OFFLINE-LOCAL-PERSISTENCE

이미 열린 editor가 disconnected 상태가 되어도 local edits가 사라지지 않는다.
