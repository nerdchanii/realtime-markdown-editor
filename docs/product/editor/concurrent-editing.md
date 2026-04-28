---
title: docs/product/editor/concurrent-editing.md
surface: editor
related_requirements:
  - CE-01-CONCURRENT-EDITING
  - REQ-COLLAB-ENGINE-ADAPTER
  - REQ-WORKSPACE-DOCUMENT-SCOPE
related_adrs:
  - ADR-0001
  - ADR-0002
  - final sync ADR
---

# docs/product/editor/concurrent-editing.md

## 의도

여러 member가 같은 Markdown document를 동시에 편집할 수 있어야 한다. 이는 optional collaboration enhancement가 아니라 제품의 기본 경로다.

## 제품 범위

- 하나의 workspace document를 두 개 이상의 browser session에서 연다.
- Manual refresh 없이 edits를 전파한다.
- 동시 편집 중 각 사용자의 고유 텍스트를 보존한다.
- Provider internals는 collaboration adapter 뒤에 둔다.

## 제외 범위

- Branching, pull request, document merge request는 제외한다.
- 전체 permission model.
- Cross-document transaction은 제외한다.

## 검증

Reviewer가 같은 workspace document를 두 member로 열고 서로 다른 위치를 편집한 뒤, 양쪽 client가 같은 content로 수렴하는지 확인한다.
