---
title: docs/product/editor/markdown-export.md
surface: editor
related_requirements:
  - REQ-MARKDOWN-PORTABILITY
  - REQ-MARKDOWN-EXPORT-FRONTMATTER
related_adrs:
  - ADR-0005
---

# docs/product/editor/markdown-export.md

## 의도

Markdown export는 document content를 portable하게 유지하면서 structured properties를 일반적인 single-file representation으로 제공한다.

## 제품 범위

- Standard Markdown body를 export한다.
- Standard Markdown links가 external tool에서도 읽히게 유지한다.
- Export 시 document properties를 YAML frontmatter로 포함한다.

## 경계

Frontmatter export는 properties가 internal Markdown body 안에 저장된다는 뜻이 아니다. Internal product model은 body와 properties를 분리한다.

## 검증

Exported file은 YAML frontmatter 다음에 standard Markdown body content를 포함한다.
