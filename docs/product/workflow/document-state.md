---
title: docs/product/workflow/document-state.md
surface: workflow
related_requirements:
  - REQ-DOCUMENT-STATE-FOUNDATION
  - REQ-DEFERRED-WORKFLOW-HOOKS
related_adrs:
  - ADR-0004
  - ADR-0017
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
- 워크플로우 hook 이 붙을 수 있을 만큼 state model을 안정적으로 유지한다.

## 워크플로우 (ADR-0017 accepted, 아직 구현 전)

[ADR-0017](../../adr/0017-document-workflow-triggers-and-executor.md) 로 아래를 승격했다. 이 문서의 "기반 범위"는 현재 구현을 설명한다.

- 상태는 `draft`, `review`, `saved` 로 고정한다.
- 상태 전환은 권한으로 제한한다. 기본은 editor 이상이 모든 전환을 할 수 있고, workspace 설정의 전환별 guard 가 일부 전환을 막을 수 있다.
- 워크플로우는 주인과 트리거를 선언한다. 전환 권한이 있는 사람만 워크플로우를 트리거한다. 워크플로우가 실행하는 에이전트는 주인의 권한 안에서 선언한 모드로 동작한다.
- 워크플로우는 api, collab 과 나란히 있는 별도 실행기가 실행한다. 첫 동작은 에이전트 실행과 알림이다.
- 외부 시스템이 상태를 바꾸는 reverse update 도 같은 use case 와 같은 권한 판정을 지난다.
- local 문서(계정 없이 기기에 저장하는 문서)도 상태를 바꾸고 볼 수 있다. 워크플로우는 서버에 올린 문서에서만 실행된다. local 문서를 서버로 올릴 때 상태는 그대로 옮겨지고, 워크플로우가 소급 실행되지 않는다.

## 보류

- Publish/draft visibility, ownership-based visibility.
- User-facing workflow builder, tldraw 또는 graph 기반 workflow editing.
- Slack, mail, logging 같은 외부 연동. 워크플로우 모델 위에 연동 계약을 따로 설계한다.

## 검증

Domain docs(`document-state.md`, `workflow.md`)가 ADR-0017 의 상태 위치, 전환 권한, 워크플로우 계약을 정의하는지 확인한다.
