---
id: REQ-WORKSPACE-HIERARCHY
title: 제품은 Workspace를 최상위 team context로 두고 filesystem-like folder tree로 문서를 조직한다.
status: done
category: product-extension
type: functional
taskability: done
scope: workspace
derived_from: subject.md free area
depends_on: []
blocks: []
completed_by:
  - tasks/archive/TASK-064-workspace-tree-and-document-entry-points.md
  - tasks/archive/TASK-075-workspace-folder-document-product-apis.md
refs:
  - docs/product/workspace/workspace-hierarchy.md
  - docs/domain/models/workspace.md
  - docs/domain/models/project.md
  - docs/domain/models/folder.md
---

# REQ-WORKSPACE-HIERARCHY

Workspace는 hidden `workspaceRoot` folder를 가지고 Project는 hidden `projectRoot` folder를 가진다.
