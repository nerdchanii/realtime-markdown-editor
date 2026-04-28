---
title: docs/product/editor/rich-preview.md
surface: editor
related_requirements:
  - CE-05-RICH-PREVIEW
  - REQ-EDITOR-RICH-SOURCE-SPLIT
  - REQ-MARKDOWN-PORTABILITY
related_adrs:
  - ADR-0002
  - ADR-0005
---

# docs/product/editor/rich-preview.md

## 의도

Markdown authoring은 source-level control과 portability를 잃지 않으면서 rich preview를 지원해야 한다.

## 제품 범위

- Rich editing mode를 제공한다.
- Markdown source mode를 제공한다.
- Rendered preview를 포함한 Split mode를 제공한다.
- Mode 전환 중 content 보존.

## 제외 범위

- Core body content를 위한 non-portable custom Markdown syntax.
- Full block database editing은 제외한다.
- Split preview를 넘어서는 multi-pane editing.

## 검증

Reviewer가 Markdown을 편집하고 mode를 전환하며, heading, link, list, code, table, task marker가 content loss 없이 rendering되는지 확인한다.
