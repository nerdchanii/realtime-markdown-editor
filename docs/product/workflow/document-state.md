---
title: docs/product/workflow/document-state.md
surface: workflow
related_requirements:
  - REQ-DOCUMENT-STATE-FOUNDATION
  - REQ-DEFERRED-WORKFLOW-HOOKS
related_adrs:
  - ADR-0004
  - ADR-0005
---

# docs/product/workflow/document-state.md

## 의도

`DocumentState`는 future workflow automation을 위한 foundation이다. 단순 UI badge가 아니며, CE walking skeleton의 critical path도 아니다.

## 기반 범위

- Document state를 editor body content와 분리한다.
- 시작 상태는 `draft`, `review`, `saved`로 둔다.
- Future hooks를 붙일 수 있을 만큼 state model을 안정적으로 유지한다.

## 보류

- User-facing workflow builder는 보류한다.
- Slack, Agent, mail, logging, notification hook 설정.
- External system이 document state를 바꾸는 reverse hook.
- tldraw 또는 graph 기반 workflow editing.

## 검증

Domain docs가 state model을 정의하고, ADR-0004가 workflow hooks를 deferred로 두면서 state boundary를 공식화하는지 확인한다.
