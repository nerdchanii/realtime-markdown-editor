---
id: REQ-HISTORY-AUTOSAVE-SEPARATION
title: Autosave/sync state와 intentional checkpoint history는 별도 개념이어야 한다.
status: done
category: subject-derived
type: ux
taskability: done
scope: history
derived_from: CE-04-REVISION-HISTORY
depends_on: []
blocks: []
completed_by:
  - tasks/archive/TASK-065-history-and-properties-ux.md
  - tasks/archive/TASK-078-checkpoint-metadata-artifact-split.md
refs:
  - docs/product/editor/history.md
  - docs/domain/rules/document-lifecycle.md
---

# REQ-HISTORY-AUTOSAVE-SEPARATION

Ordinary sync가 명시적 생성 없이 user-authored checkpoint처럼 보이지 않는다.
