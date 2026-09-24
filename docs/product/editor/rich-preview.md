---
title: docs/product/editor/rich-preview.md
surface: editor
related_requirements:
  - REQ-EDITOR-RICH-AUTHORING-SURFACE
  - REQ-MARKDOWN-PORTABILITY
related_adrs:
  - ADR-0002
  - ADR-0005
  - ADR-0007
---

# docs/product/editor/rich-preview.md

## 의도

Markdown authoring은 TipTap 기반 rich editor surface에서 직접 이루어진다. 사용자는 rendered document에 가까운 편집면에서 작성하고, 제품은 Markdown body portability를 export/history/test boundary에서 증명한다.

## 제품 범위

- TipTap `EditorContent` 기반 Rich Markdown authoring surface를 제공한다.
- The actual `EditorContent` instance is wired to the collaboration extensions when a live
  collaboration session is active.
- Markdown shortcut과 keyboard shortcut이 editable rich surface에서 동작한다.
- 현재 document body는 `@tiptap/markdown` extension path를 통해 Markdown으로 serialize/export될 수 있어야 한다.
- Revision snapshot은 현재 rich editor content를 inspectable Markdown body로 보존한다.

## Source of Truth

Live Yjs/Tiptap provider state is the source of truth while users actively collaborate. The database
Markdown body is a derived portable projection used for export, checkpoint snapshots, and fallback
bootstrap only when live Yjs state is absent or uninitialized. Reconnect merge uses live Yjs state,
not the DB projection.

## 제외 범위

- Core body content를 위한 non-portable custom Markdown syntax.
- Raw Markdown source editor.
- Source + rendered preview Split mode.
- 별도 read-only rendered preview pane.
- Full block database editing은 제외한다.
- 여러 workspace document를 center editor area에서 동시에 여는 IDE-style multi-pane editing은 향후 product-extension으로 보류한다.

## 검증

사용자가 TipTap rich editor에서 Markdown authoring shortcut으로 heading, link, list, code를 작성하고, 같은 content가 Markdown export와 revision snapshot으로 보존되는지 확인한다.
