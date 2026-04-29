---
title: docs/domain/models/document.md
status: active
---

# docs/domain/models/document.md

## 계약

`Document`는 workspace hierarchy 안에 있는 collaborative Markdown-backed content unit이다.

## 책임

- Markdown body identity를 소유한다.
- Body 밖에 저장되는 `DocumentProperty`를 소유한다.
- User-visible history를 위한 `Checkpoint`와 연결된다.
- `DocumentState` value를 가진다.
- Standard Markdown link/backlink projection의 source가 된다.

## 경계

- Markdown body와 document properties는 같은 것이 아니다.
- Collaboration engine internal document state는 domain document가 아니다.
- Export representation이 frontmatter를 포함할 수 있지만 internal body storage를 바꾸지는 않는다.
- `LinkEdge`는 `Document`에서 직접 mutation하는 entity가 아니라 Markdown body에서 파생되는 read model이다.
- `SyncStatus`는 application/UI state이며 `DocumentState`가 아니다.

## 관계 스케치

```mermaid
classDiagram
  Document "1" --> "1" DocumentState : value
  Document "1" --> "*" DocumentProperty : owns
  Document "1" --> "*" Checkpoint
  Document ..> "*" LinkEdge : derives
```
