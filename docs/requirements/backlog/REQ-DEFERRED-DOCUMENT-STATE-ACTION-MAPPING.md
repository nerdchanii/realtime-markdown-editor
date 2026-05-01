---
id: REQ-DEFERRED-DOCUMENT-STATE-ACTION-MAPPING
title: DocumentState 변화와 실행 action의 mapping model을 정의한다.
status: candidate
category: backlog
type: architecture
taskability: ambiguous
scope: workflow
derived_from: REQ-DOCUMENT-STATE-FOUNDATION
depends_on:
  - REQ-DOCUMENT-STATE-FOUNDATION
blocks:
  - REQ-DEFERRED-WORKFLOW-HOOKS
next_step: state transition, action ownership, configuration 저장 위치를 분리해 설계한다.
refs:
  - docs/product/workflow/document-state.md
  - docs/domain/rules/document-lifecycle.md
---

# REQ-DEFERRED-DOCUMENT-STATE-ACTION-MAPPING

Workflow hooks를 구현하기 전 state-to-action contract를 먼저 정해야 한다.
