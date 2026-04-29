---
title: docs/product/editor/properties.md
surface: editor
related_requirements:
  - REQ-PROPERTIES-OUTSIDE-BODY
  - REQ-MARKDOWN-EXPORT-FRONTMATTER
related_adrs:
  - ADR-0005
---

# docs/product/editor/properties.md

## 의도

Document properties는 Markdown body storage를 오염시키지 않고 structured metadata를 제공한다.

## 제품 범위

- Properties를 Markdown body 밖에 저장한다.
- Document title 근처에서 property editing을 제공한다.
- 구현 범위가 허용하면 text, status/select, date, member, checkbox 같은 기본 type을 지원한다.
- Member property는 workspace membership을 참조한다.

## Contract

- `DocumentDetailDto.properties` is the canonical API field for document properties.
- Each property uses `{ key, value }`, where `value.type` is one of `text`, `status`, `date`, `member`, or `checkbox`.
- Web document surface view models may format property values for display, but must preserve the DTO key/type distinction when adding editing behavior.

## 내보내기 정책

Internal storage는 properties를 body 밖에 둔다. Markdown export는 YAML frontmatter로 properties를 포함할 수 있다. Frontmatter는 export representation이지 internal body storage가 아니다.

## 보류

- Property template은 보류한다.
- Property inheritance는 보류한다.
- Formula, relation, rollup, database-style property는 보류한다.
