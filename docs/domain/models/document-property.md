---
title: docs/domain/models/document-property.md
status: active
---

# docs/domain/models/document-property.md

## 계약

`DocumentProperty`는 Markdown body 밖에 저장되는 `Document` 소유 structured metadata다. 독립 aggregate가 아니며 property database 기능도 아니다.

## 책임

- Document title 근처에서 보여줄 metadata를 표현한다.
- Markdown source body를 오염시키지 않는다.
- Markdown export에서는 YAML frontmatter representation으로 변환될 수 있다.
- Member property가 필요한 경우 `WorkspaceMembership`을 참조한다.

## 경계

- Property template, inheritance, formula, relation, rollup은 현재 제품 범위가 아니다.
- Internal property storage가 frontmatter 안에 있다는 뜻이 아니다. Frontmatter는 export representation이다.
