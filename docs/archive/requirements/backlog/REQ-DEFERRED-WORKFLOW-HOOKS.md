---
id: REQ-DEFERRED-WORKFLOW-HOOKS
title: DocumentState change에 workflow hooks와 visual builder를 연결한다.
status: deferred
category: backlog
type: functional
taskability: blocked
scope: workflow
derived_from: REQ-DOCUMENT-STATE-FOUNDATION
depends_on:
  - REQ-DOCUMENT-STATE-FOUNDATION
  - REQ-DEFERRED-DOCUMENT-STATE-ACTION-MAPPING
blocks:
  - REQ-DEFERRED-EXTERNAL-WORKFLOW-INTEGRATIONS
next_step: state-to-action mapping model과 configuration ownership을 먼저 정한다.
refs:
  - docs/product/workflow/document-state.md
  - docs/domain/rules/document-lifecycle.md
  - docs/requirements/registry.md
---

# REQ-DEFERRED-WORKFLOW-HOOKS

DocumentState foundation은 완료됐지만 workflow execution은 아직 제품 요구사항으로 채택되지 않았다.
