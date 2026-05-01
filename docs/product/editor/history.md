---
title: docs/product/editor/history.md
surface: editor
related_requirements:
  - CE-04-REVISION-HISTORY
  - REQ-HISTORY-CHECKPOINTS
  - REQ-HISTORY-AUTOSAVE-SEPARATION
  - REQ-COLLABORATIVE-CREATION-VISIBILITY
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
- Read-only snapshot inspection은 checkpoint metadata에서 artifact reference를 찾고, artifact boundary에서 Markdown snapshot을 읽어 보여준다.
- Checkpoint 생성은 server-resolved author membership, timestamp, reviewer message, snapshot artifact reference를 metadata로 저장한다.
- Checkpoint Markdown snapshot은 client가 보낸 full-body snapshot이 아니라 server-resolved current Markdown projection에서 만들어진다.
- 현재 제품 범위의 local-compatible artifact adapter는 inspectable Markdown snapshot을 저장하며, autosave/sync event를 user-authored checkpoint로 승격하지 않는다.
- Checkpoint 생성 결과는 생성자 view에만 머물지 않고 같은 workspace document를 보는 다른 member의 history list에도 표시되어야 한다.

## 보류

- Restore와 branching은 현재 제품 범위가 아니며 `HistoryModule` 승격 trigger다.
- CRDT update replay, rendered HTML snapshot 저장, combined artifact format은 현재 제품 범위가 아니다. ADR-0003 V1은 CE-04 checkpoint artifact를 inspectable Markdown snapshot과 artifact metadata로 둔다.
- Live Yjs binary persistence는 active collaborative editing source of truth이지만 history UI에 user-authored checkpoint처럼 노출하지 않는다.
- Restore와 branching endpoint/UI는 구현하지 않는다.

## 검증

Reviewer가 checkpoint를 만들거나 선택하고, metadata를 본 뒤 read-only snapshot viewer에서 저장된 Markdown content를 확인한다. 다른 member session도 생성된 checkpoint를 normal product path에서 볼 수 있어야 한다.
