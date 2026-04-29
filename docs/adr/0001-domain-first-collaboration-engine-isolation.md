---
id: ADR-0001
title: "ADR-0001: 도메인 우선 설계와 협업 엔진 격리 원칙"
status: proposed
date: 2026-04-28
authors:
  - nerdchanii
decision_type: architecture
tags:
  - domain-model
  - collaboration
  - architecture-boundary
related_requirements:
  - CE-01-CONCURRENT-EDITING
  - CE-02-PRESENCE
  - CE-03-OFFLINE-MERGE
  - REQ-COLLAB-ENGINE-ADAPTER
  - REQ-WORKSPACE-DOCUMENT-SCOPE
  - REQ-IDENTITY-MEMBERSHIP
  - REQ-WORKSPACE-HIERARCHY
  - REQ-PLATFORM-PORTABILITY-GUARDRAIL
related_documents:
  - subject.md
  - ARCHITECTURE.md
  - docs/domain/README.md
  - docs/product/README.md
supersedes: []
superseded_by: null
---

# ADR-0001: 도메인 우선 설계와 협업 엔진 격리 원칙

## 맥락

필수 요구사항은 실시간 공동 편집, presence, offline merge, revision history, rich preview를 요구한다. 이 기능들은 협업 엔진의 도움을 받지만, 제품 언어는 엔진이 아니라 `Workspace`, `Document`, `WorkspaceMembership`, `Checkpoint`, `DocumentState` 같은 도메인 개념을 기준으로 유지되어야 한다.

협업 엔진은 아직 POC 전이며, 최종 선택이 바뀔 수 있다. 엔진 API가 UI와 도메인 전반에 퍼지면 POC 결과 반영과 향후 platform portability가 어려워진다.

다만 domain-first는 `packages` 아래에 공유 domain package를 먼저 만든다는 뜻이 아니다. First skeleton에서는 domain model을 `apps/api` 내부의 plain TypeScript로 유지하고, frontend와 외부 interface는 `packages/contracts`의 provider-neutral DTO와 wire contract만 공유한다.

## 결정

도메인 모델과 제품 기능을 협업 엔진보다 상위에 둔다. Yjs, Hocuspocus, Yorkie, ProseMirror, Tiptap 같은 구현 후보는 collaboration adapter 뒤에 둔다.

API는 NestJS를 사용하되 Nest module은 DI/composition boundary로만 사용한다. `apps/api/src/modules/*/domain`의 entity/value object는 Nest decorator와 provider SDK import가 없는 plain TypeScript로 둔다. HTTP, realtime, future MCP server interface는 application use case를 호출하며 domain object를 protocol shape로 직접 노출하지 않는다.

First skeleton의 domain 분류는 다음처럼 둔다.

- Entity/Aggregate: `Workspace`, `Project`, `Folder`, `Document`, `User`, `WorkspaceMembership`, `Checkpoint`
- Document-owned child/value: `DocumentProperty`
- Value/state: `DocumentState`
- Derived projection/read model: `LinkEdge`
- Domain object 아님: `Presence`, `RemoteCursor`, `RemoteSelection`, `AwarenessState`, `SyncStatus`, `CollaborationArtifact`

어댑터는 최소한 다음 책임을 가진다.

- 문서 편집 상태 동기화
- cursor/selection presence 전달. 단 presence 자체는 domain entity가 아니라 application/provider awareness state다.
- reconnect merge 연결
- checkpoint/history 생성을 위한 현재 문서 상태 추출
- sync state 제공

## 후보안

### 1. 도메인 우선 설계와 협업 엔진 격리

- 장점: POC 결과 반영과 엔진 교체가 쉽다.
- 단점: 초기 adapter 경계 설계가 필요하다.
- 리스크: 지나친 추상화가 엔진 장점을 가릴 수 있다.

### 2. 공유 domain package를 먼저 만든다

- 장점: web과 api가 같은 type을 바로 재사용할 수 있다.
- 단점: domain entity, DTO, provider state, UI view model이 한 package에 섞일 수 있다.
- 리스크: frontend가 backend domain internals에 결합되어 Clean Architecture 경계가 흐려진다.

### 3. 선택 엔진을 앱 전역에 직접 사용

- 장점: 초기 구현 속도가 빠르다.
- 단점: 엔진 교체 비용이 커진다.
- 리스크: domain과 provider 경계가 무너진다.

### 4. 기능별 독립 구현

- 장점: 개별 화면은 빠르게 만들 수 있다.
- 단점: editing, presence, history, offline merge의 상태 모델이 분리된다.
- 리스크: CE 요구사항 간 정합성 결함이 숨는다.

## 선택 근거

평가 대상은 엔진 데모가 아니라 협업 제품이다. 도메인 우선 경계는 CE-01~CE-05를 하나의 제품 경험으로 묶고, 자유영역 제품 확장을 엔진 내부 표현에 종속시키지 않는다.

## 결과

### 긍정적 영향

- 요구사항과 제품 문서가 provider-independent 언어를 유지한다.
- POC 이후 최종 엔진 선택을 반영하기 쉽다.
- DocumentState, history, properties, links 같은 도메인 개념이 editor internals에 잠기지 않는다.
- NestJS, HTTP, realtime, future MCP server adapter가 같은 application use case를 재사용할 수 있다.

### 부정적 영향 또는 트레이드오프

- adapter 경계가 필요한 만큼 초기 코드가 늘어날 수 있다.
- POC 중 실제 provider 기능과 domain API 균형을 계속 조정해야 한다.
- shared domain package를 만들지 않기 때문에 frontend는 contracts와 view model mapping을 별도로 유지해야 한다.

### 후속 작업

- POC 결과 후 final sync ADR을 작성한다.
- domain docs와 adapter interface가 충돌하지 않는지 점검한다.
- dependency-cruiser로 domain/use-case/adapter dependency direction을 검증한다.

## 검증 방법

- UI/domain code가 provider-specific 타입을 직접 노출하지 않는지 확인한다.
- CE-01~CE-03 시나리오가 adapter를 통해 설명되는지 확인한다.
- checkpoint/history와 rich preview가 engine internals에 직접 묶이지 않는지 확인한다.
- `apps/api/src/modules/*/domain`이 Nest decorator, CRDT/editor provider, storage SDK, browser API를 import하지 않는지 확인한다.
- 공유 domain/application/shared/utils package를 만들지 않는지 확인한다.

## 관련 문서

- `docs/domain/rules/collaboration-boundaries.md`
- `docs/research/poc-001-collaboration-engine/README.md`
- ADR-0002

## 변경 이력

| 날짜 | 변경 내용 | 결정자 |
| --- | --- | --- |
| 2026-04-28 | 최초 작성 | nerdchanii |
| 2026-04-28 | 새 요구사항 ID와 도메인 경계 문서 구조에 맞게 정리 | nerdchanii |
| 2026-04-29 | app-private domain, Nest composition boundary, MCP interface boundary, domain model classification 명시 | nerdchanii |
