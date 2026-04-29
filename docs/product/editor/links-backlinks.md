---
title: docs/product/editor/links-backlinks.md
surface: editor
related_requirements:
  - REQ-LINKS-BACKLINKS-STANDARD-MARKDOWN
  - REQ-DEFERRED-WIKILINKS
related_adrs:
  - ADR-0005
---

# docs/product/editor/links-backlinks.md

## 의도

Document connection은 product-specific link syntax를 도입하기 전에 standard Markdown links에서 시작해야 한다.

## 제품 범위

- Internal document를 향한 standard Markdown link를 인식한다.
- Incoming backlink 또는 document connection을 표시한다.
- Link behavior가 source view와 export와 호환되게 한다.

## Contract

- `DocumentConnectionsDto` is the explicit projection contract for document links and backlinks.
- `DocumentConnectionsDto.links` contains outgoing standard Markdown links from the current document to internal documents.
- `DocumentConnectionsDto.backlinks` contains incoming standard Markdown connections to the current document.
- The projection is separate from Markdown body storage: source mode keeps the original standard Markdown link text.

## 보류

- Wikilink는 보류한다.
- Graph view는 보류한다.
- Alias resolution은 보류한다.
- Search-ranking 기반 link suggestions.

## 검증

한 document에서 다른 document로 standard Markdown link를 만들면, wikilink syntax 없이 target document에 incoming connection이 생긴다.
