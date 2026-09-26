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

`DocumentState`는 future workflow automation을 위한 foundation이다. 단순 UI badge가 아니며, 현재 CE
acceptance path만을 위해 축소해서 정의하지 않는다.

## 기반 범위

- Document state를 editor body content와 분리한다.
- 시작 상태는 `draft`, `review`, `saved`로 둔다.
- 현재 제품 범위에서는 `draft`, `review`, `saved` 사이의 direct change를 허용한다.
- `review`는 현재 제품 범위에서 저장 전 필수 gate가 아니다.
- Future hooks를 붙일 수 있을 만큼 state model을 안정적으로 유지한다.

## 보류

- State transition policy와 guard.
- Publish/draft visibility, ownership-based visibility.
- Workflow executor capability.
- User-facing workflow builder는 보류한다.
- Slack, Agent, mail, logging, notification hook 설정.
- External system이 document state를 바꾸는 reverse hook.
- tldraw 또는 graph 기반 workflow editing.

## 승격 조건

> 승격 (2026-09-26): 전환 정책, workflow executor, Agent 실행 hook 은 [ADR-0017](../../adr/0017-document-workflow-triggers-and-executor.md)(accepted)로 승격했다. 아직 구현 전이며, 이 문서의 "기반 범위"는 현재 구현을 설명한다. 구현하면 전환은 권한으로 제한되고, 상태 모델은 `draft`, `review`, `saved` 로 고정된다. local 문서(계정 없이 기기에 저장하는 문서)도 상태를 바꾸고 볼 수 있지만, 워크플로우는 서버에 올린 문서에서만 실행된다. local 문서를 서버로 올릴 때 상태는 그대로 옮겨지고, 이때 워크플로우가 소급 실행되지 않는다.

`DocumentState`는 현재 제품 범위에서 `Document`가 가진 value/state다. Workflow가 transition policy,
ownership/visibility, external hook execution, reverse update를 요구할 때 별도 workflow capability나
workflow executor로 승격한다.

## 검증

Domain docs가 state model을 정의하고, ADR-0004가 workflow hooks를 deferred로 두면서 state boundary를 공식화하는지 확인한다.
