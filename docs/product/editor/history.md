---
title: docs/product/editor/history.md
surface: editor
related_requirements:
  - CE-04-REVISION-HISTORY
  - REQ-HISTORY-CHECKPOINTS
  - REQ-HISTORY-AUTOSAVE-SEPARATION
related_adrs:
  - ADR-0003
  - ADR-0004
---

# docs/product/editor/history.md

## 의도

History는 ordinary autosave/sync와 intentional checkpoint를 구분하면서 review 가능한 document state를 제공한다.

## 제품 범위

- Explicit checkpoint를 만들거나 노출한다.
- Author, timestamp, message, content state를 표시한다.
- Reviewer가 previous document content를 inspect할 수 있게 한다.
- 모든 autosave를 user-facing revision처럼 취급하지 않는다.
- CE-04의 minimum path는 checkpoint 생성, 목록, metadata, read-only snapshot inspection이다.

## 보류

- Restore와 branching은 first skeleton 범위가 아니며 `HistoryModule` 승격 trigger다.
- Checkpoint artifact가 Markdown, CRDT update, rendered HTML, 또는 combined artifact인지 여부는 ADR-0003의 구현 세부 결정으로 남긴다.

## 검증

Reviewer가 checkpoint를 만들거나 선택하고, metadata를 본 뒤 저장된 document content를 확인한다.
