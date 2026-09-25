---
id: REQ-COLLAB-ENGINE-ADAPTER
title: Collaboration engine 내부 구현은 adapter boundary 뒤에 있어야 한다.
status: done
category: subject-derived
type: architecture
taskability: done
scope: architecture
derived_from: CE-01-CONCURRENT-EDITING, CE-03-OFFLINE-MERGE
depends_on: []
blocks: []
completed_by:
  - tasks/archive/TASK-020-collaboration-runtime-topology.md
  - tasks/archive/TASK-023-web-collaboration-adapter-port.md
refs:
  - docs/domain/rules/collaboration-boundaries.md
  - docs/adr/0001-architecture-boundary.md
  - docs/adr/0002-collaboration-engine-choice.md
---

# REQ-COLLAB-ENGINE-ADAPTER

Product/domain API는 provider-specific CRDT 또는 editor internals를 노출하지 않는다.
