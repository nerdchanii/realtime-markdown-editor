---
id: REQ-DEFERRED-EXTERNAL-WORKFLOW-INTEGRATIONS
title: Slack, Agent, mail, logging 같은 외부 workflow integration을 붙인다.
status: deferred
category: backlog
type: functional
taskability: blocked
scope: automation
derived_from: REQ-DEFERRED-WORKFLOW-HOOKS
depends_on:
  - REQ-DEFERRED-WORKFLOW-HOOKS
blocks: []
next_step: workflow hook model이 정해진 뒤 integration contract를 설계한다.
refs:
  - docs/product/workflow/document-state.md
  - docs/requirements/registry.md
---

# REQ-DEFERRED-EXTERNAL-WORKFLOW-INTEGRATIONS

외부 integration은 hook model이 확정된 뒤에만 구현 요구사항으로 승격한다.
