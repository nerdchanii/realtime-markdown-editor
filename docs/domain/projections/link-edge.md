---
title: docs/domain/projections/link-edge.md
status: active
---

# docs/domain/projections/link-edge.md

## 계약

`LinkEdge`는 `Document` Markdown body의 standard Markdown link에서 파생되는 document connection projection이다.

## 책임

- Source document와 target document 사이의 incoming backlink 조회를 돕는다.
- Wikilink 없이 standard Markdown link를 첫 connection format으로 유지한다.
- Source view, preview, export의 Markdown portability를 방해하지 않는다.

## 경계

- 사용자가 직접 생성하는 primary domain entity가 아니다.
- Link source of truth는 Markdown body다.
- Graph view, alias resolution, ranking 기반 suggestion은 deferred다.
