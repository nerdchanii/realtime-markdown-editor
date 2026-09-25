---
id: REQ-DOCUMENT-STATE-FOUNDATION
title: DocumentState는 future workflow hooks를 위한 분리된 domain foundation이다.
status: done
category: product-extension
type: architecture
taskability: done
scope: workflow
derived_from: subject.md free area
depends_on: []
blocks:
  - REQ-DEFERRED-WORKFLOW-HOOKS
completed_by:
  - tasks/archive/TASK-065-history-and-properties-ux.md
refs:
  - docs/product/workflow/document-state.md
  - docs/domain/models/document-state.md
  - docs/adr/0004-document-lifecycle-policy.md
---

# REQ-DOCUMENT-STATE-FOUNDATION

Domain docs는 draft/review/saved를 정의하고 hooks/workflow builder를 backlog로 유지한다.
