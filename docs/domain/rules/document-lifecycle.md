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
- `review`는 first skeleton에서 저장 전 필수 gate가 아니다.
- First skeleton에서는 `draft`, `review`, `saved` 사이의 direct state change를 허용한다.
- Future workflow hooks는 raw editor keystrokes가 아니라 명시적인 `DocumentState` change에 붙는다.
- First skeleton에서 `DocumentState`는 `Document`가 가진 value/state로 구현하고 별도 aggregate로 키우지 않는다.

## MVP 경계

First subject skeleton에는 checkpoint/history와 sync state가 필요하다. Workflow hook, transition guard, publish/draft visibility, ownership-based visibility, workflow executor, visual state-machine editor는 필요하지 않다.
