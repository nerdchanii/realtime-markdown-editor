---
id: ADR-0004
title: "ADR-0004: DocumentState는 workflow 기반으로 분리하고 hook은 보류한다"
status: proposed
date: 2026-04-28
authors:
  - Codex
decision_type: product-architecture
tags:
  - document-lifecycle
  - autosave
  - checkpoint
  - document-state
related_requirements:
  - CE-03-OFFLINE-MERGE
  - CE-04-REVISION-HISTORY
  - REQ-HISTORY-CHECKPOINTS
  - REQ-HISTORY-AUTOSAVE-SEPARATION
  - REQ-DOCUMENT-STATE-FOUNDATION
  - REQ-DEFERRED-WORKFLOW-HOOKS
related_documents:
  - subject.md
  - docs/domain/models/document-state.md
  - docs/domain/rules/document-lifecycle.md
  - docs/product/workflow/document-state.md
supersedes: []
superseded_by: null
---

# ADR-0004: DocumentState는 workflow 기반으로 분리하고 hook은 보류한다

## 맥락

실시간 문서에서는 저장 버튼 중심 모델만으로 현재 상태, offline merge, checkpoint history를 설명하기 어렵다. 동시에 제품은 장기적으로 문서 상태 변경에 workflow hooks를 붙일 수 있어야 한다.

예상되는 후속 확장은 상태 변경 이벤트에 Slack 알림, Agent 실행, logging, mail, notification, 외부 시스템 연동을 연결하는 것이다. 그러나 UI/workflow builder/tldraw/graph 기반 자동화까지 MVP에 넣으면 CE skeleton을 방해한다.

## 결정

`DocumentState`를 도메인 foundation으로 분리한다. 초기 상태는 `draft`, `review`, `saved`로 둔다.

MVP/first skeleton에서는 다음을 구분한다.

- sync/autosave state: 현재 편집 내용의 저장/동기화 상태
- checkpoint/history: 사용자가 읽을 수 있는 과거 문서 상태
- DocumentState: workflow-facing 문서 상태

Workflow hooks, visual builder, external integrations, reverse hooks는 deferred로 둔다.

## 후보안

### 1. DocumentState foundation + hooks deferred

- 장점: future workflow를 위한 경계를 남기면서 CE skeleton을 보호한다.
- 단점: 당장 사용자-facing 기능은 제한적이다.
- 리스크: UI가 상태 의미를 충분히 보여주지 못할 수 있다.

### 2. 즉시 workflow hook 구현

- 장점: 자유영역 차별화가 강하다.
- 단점: UI와 integration scope가 커진다.
- 리스크: CE-01~CE-05 구현을 지연시킨다.

### 3. DocumentState를 완전히 backlog로 이동

- 장점: MVP가 단순해진다.
- 단점: future workflow foundation이 사라진다.
- 리스크: 나중에 상태 모델이 editor/sync/history에 뒤섞인다.

## 선택 근거

DocumentState는 지금 깊게 구현하지 않더라도 도메인 경계로 중요하다. 반면 hooks와 workflow builder는 CE skeleton 이후에 다뤄야 한다.

## 결과

### 긍정적 영향

- draft/review/saved 의미가 sync status와 섞이지 않는다.
- future hooks가 attach될 도메인 지점이 생긴다.
- history/checkpoint와 workflow state를 구분할 수 있다.

### 부정적 영향 또는 트레이드오프

- 첫 구현에서 DocumentState는 얇은 foundation일 수 있다.
- state UI 노출 범위는 후속 제품 판단이 필요하다.

### 후속 작업

- domain docs의 state transition이 구현과 어긋나지 않게 유지한다.
- hooks를 promotion할 때 requirements, product docs, ADR을 함께 업데이트한다.

## 검증 방법

- DocumentState가 sync state와 별도 개념으로 문서화되어 있는지 확인한다.
- checkpoint/history가 autosave와 구분되는지 확인한다.
- deferred hooks가 backlog에 남아 있는지 확인한다.

## 관련 문서

- `docs/domain/models/document-state.md`
- `docs/domain/rules/document-lifecycle.md`
- `docs/product/workflow/document-state.md`
- `docs/backlog/README.md`

## 변경 이력

| 날짜 | 변경 내용 | 작성자 |
| --- | --- | --- |
| 2026-04-28 | 최초 작성 | Codex |
| 2026-04-28 | DocumentState foundation과 deferred hooks 정책으로 재정리 | Codex |
