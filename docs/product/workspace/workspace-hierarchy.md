---
title: docs/product/workspace/workspace-hierarchy.md
surface: workspace
related_requirements:
  - REQ-WORKSPACE-HIERARCHY
  - REQ-WORKSPACE-DOCUMENT-SCOPE
related_adrs:
  - ADR-0001
  - ADR-0005
---

# docs/product/workspace/workspace-hierarchy.md

## 의도

제품은 single temporary editor page가 아니라 team workspace처럼 느껴져야 한다.

## 제품 범위

- `Workspace > Project > Folder > Document`를 model로 삼는다.
- Navigation과 document context에서 workspace language를 사용한다.
- Local review를 위해 충분한 hierarchy를 seed한다.
- 더 많은 projects, folders, documents로 확장 가능한 model을 유지한다.

## 보류

- Billing, provisioning, invitation, organization administration은 보류한다.
- 복잡한 folder permission.
- Multi-workspace administration은 보류한다.
