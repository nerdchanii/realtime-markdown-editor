---
id: CE-03-OFFLINE-MERGE
title: network 단절 후 reconnect 시 local edits와 server state가 자동 병합되어야 한다.
status: done
category: subject
type: functional
taskability: done
scope: collaboration
derived_from: subject.md
depends_on: []
blocks: []
completed_by:
  - tasks/archive/TASK-026-open-page-offline-merge.md
  - tasks/archive/TASK-077-db-backed-collaboration-session-live-yjs-persistence.md
refs:
  - docs/compliance/subject-matrix.md
  - docs/product/editor/offline-merge.md
  - docs/requirements/completed/REQ-OFFLINE-INDEXEDDB-DRAFT-RECOVERY.md
---

# CE-03-OFFLINE-MERGE

Subject baseline으로는 이미 열린 editor가 offline edit를 보존하고 reconnect 후 local/remote 고유 텍스트를
병합해야 한다. Product bar는 이보다 높게 잡는다. Offline 상태에서 tab/browser가 종료되어도 같은 browser
profile에서 local draft가 복구되고, reconnect 후 remote/server changes와 병합되어야 한다.
