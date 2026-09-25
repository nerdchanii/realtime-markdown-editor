---
id: REQ-HISTORY-CHECKPOINTS
title: User-visible history는 explicit checkpoint로 표현한다.
status: done
category: subject-derived
type: functional
taskability: done
scope: history
derived_from: CE-04-REVISION-HISTORY
depends_on: []
blocks: []
completed_by:
  - tasks/archive/TASK-027-checkpoint-metadata-artifact-adapter.md
  - tasks/archive/TASK-078-checkpoint-metadata-artifact-split.md
refs:
  - docs/product/editor/history.md
  - docs/adr/0004-document-lifecycle-policy.md
---

# REQ-HISTORY-CHECKPOINTS

History entry는 author, time, message, inspectable content state를 보여준다.
