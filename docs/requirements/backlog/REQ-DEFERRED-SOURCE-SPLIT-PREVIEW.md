---
id: REQ-DEFERRED-SOURCE-SPLIT-PREVIEW
title: Raw source와 rendered preview를 나란히 보는 split mode를 제공한다.
status: ambiguous
category: backlog
type: functional
taskability: ambiguous
scope: frontend
derived_from: CE-05-RICH-PREVIEW
depends_on:
  - REQ-DEFERRED-RAW-MARKDOWN-SOURCE
blocks: []
next_step: 현재 rich authoring policy와 editor flow에서 split이 실제 필요한지 다시 판정한다.
refs:
  - README.md
  - docs/product/editor/rich-preview.md
  - docs/adr/0007-rich-markdown-authoring-surface.md
---

# REQ-DEFERRED-SOURCE-SPLIT-PREVIEW

Rich editor 자체가 rendered authoring surface 역할을 하므로 현재는 중복 UI일 수 있다.
