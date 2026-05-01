---
id: REQ-MARKDOWN-PORTABILITY
title: Markdown body는 editor, link, export, history 전반에서 portable해야 한다.
status: done
category: subject-derived
type: non-functional
taskability: done
scope: editor
derived_from: CE-05-RICH-PREVIEW
depends_on: []
blocks: []
completed_by:
  - tasks/archive/TASK-044-markdown-export.md
  - tasks/archive/TASK-076-current-markdown-projection-serialization-contract.md
refs:
  - docs/product/editor/markdown-export.md
  - docs/adr/0005-ui-shell-scope-model.md
---

# REQ-MARKDOWN-PORTABILITY

Core body content는 product-only syntax에 의존하지 않고 standard Markdown으로 round-trip된다.
