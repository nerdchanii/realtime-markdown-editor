---
title: docs/domain/rules/document-lifecycle.md
status: active
---

# docs/domain/rules/document-lifecycle.md

## 규칙

- Editing sync와 user-visible checkpoint history는 분리한다.
- Autosave/sync state는 product behavior가 명시적으로 요구하지 않는 한 checkpoint를 만들지 않는다.
- `DocumentState`는 sync status와 checkpoint history와 분리한다.
- `saved`는 document workflow state이며 모든 client에 pending local edits가 없다는 증거가 아니다.
- Future workflow hooks는 raw editor keystrokes가 아니라 `DocumentState` transition에 붙는다.

## MVP 경계

First subject skeleton에는 checkpoint/history와 sync state가 필요하다. Workflow hook이나 visual state-machine editor는 필요하지 않다.
