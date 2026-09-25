---
id: REQ-MARKDOWN-EXPORT-FRONTMATTER
title: Markdown export는 properties를 YAML frontmatter representation으로 포함한다.
status: done
category: product-extension
type: functional
taskability: done
scope: editor
derived_from: REQ-PROPERTIES-OUTSIDE-BODY, REQ-MARKDOWN-PORTABILITY
depends_on:
  - REQ-PROPERTIES-OUTSIDE-BODY
  - REQ-MARKDOWN-PORTABILITY
blocks: []
completed_by:
  - tasks/archive/TASK-044-markdown-export.md
  - tasks/archive/TASK-073A-markdown-export-input-boundary.md
refs:
  - docs/product/editor/markdown-export.md
---

# REQ-MARKDOWN-EXPORT-FRONTMATTER

Exported Markdown은 frontmatter metadata와 standard Markdown body를 가진 single file이다.
