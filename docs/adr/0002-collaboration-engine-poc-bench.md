---
id: ADR-0002
title: 협업 엔진은 Tiptap+Yjs/Hocuspocus와 Yorkie+ProseMirror를 POC와 벤치로 평가한다
status: proposed
date: 2026-04-28
authors:
  - Codex
decision_type: architecture
tags:
  - collaboration-engine
  - poc
  - benchmark
  - crdt
related_requirements:
  - CE-01
  - CE-02
  - CE-03
  - CE-04
  - CE-05
related_documents:
  - subject.md
supersedes: []
superseded_by: null
---

# ADR-0002: 협업 엔진은 Tiptap+Yjs/Hocuspocus와 Yorkie+ProseMirror를 POC와 벤치로 평가한다

## 맥락

과제는 동기화 방식으로 CRDT, OT, 자체 구현 등 어떤 방식도 허용하지만, 선택 근거를 ADR로 남기도록 요구한다. 필수 요구사항 중 CE-01, CE-02, CE-03은 협업 엔진의 품질에 직접 영향을 받는다. CE-04와 CE-05도 현재 문서 상태 추출, editor state 변환, Markdown 표현과 연결된다.

현재 단계에서는 최종 엔진을 단정하기보다, 후보를 좁히고 검증 기준을 먼저 정하는 것이 적합하다. 특히 마크다운 문서 편집 경험, presence 표현, offline merge, revision snapshot 추출, 운영 복잡도를 함께 비교해야 한다.

## 결정

협업 엔진은 즉시 최종 선택하지 않고, 다음 두 후보를 POC와 벤치로 평가한 뒤 결정한다.

- Tiptap + Yjs + Hocuspocus
- Yorkie + ProseMirror

POC는 동일한 사용자 시나리오를 기준으로 비교한다.

- 두 브라우저에서 같은 문서를 동시에 편집한다.
- 타 사용자의 커서와 선택 영역을 표시한다.
- 한 사용자가 네트워크 단절 상태에서 편집한 뒤 재접속한다.
- 현재 문서 내용을 revision snapshot으로 추출한다.
- Markdown preview에 전달할 canonical Markdown을 얻는다.
- Rich 기본 모드, Markdown source view, Split view를 같은 문서 상태에 바인딩한다.

## 후보안

### 1. Tiptap + Yjs + Hocuspocus

- 장점: ProseMirror 기반 editor UX와 Yjs 생태계를 함께 사용할 수 있고, collaboration/presence 사례가 많다.
- 단점: Markdown을 canonical format으로 유지하려면 editor document와 Markdown serialization 정책이 필요하다.
- 리스크: rich text editor 모델이 순수 Markdown 편집 요구와 어긋나면 구현 복잡도가 커질 수 있다.

### 2. Yorkie + ProseMirror

- 장점: 협업 백엔드와 문서 동기화 모델을 함께 평가할 수 있고, ProseMirror 기반 편집 확장성이 있다.
- 단점: 프로젝트 요구에 맞는 Markdown 편집/preview/revision 흐름의 예제와 운영 자료를 별도로 확인해야 한다.
- 리스크: 팀이 Yorkie 운영 모델에 익숙하지 않으면 초기 디버깅 비용이 커질 수 있다.

### 3. 자체 WebSocket 동기화 또는 OT 구현

- 장점: 요구사항에 맞춘 최소 구현을 직접 통제할 수 있다.
- 단점: 충돌 해결, offline merge, presence edge case를 직접 책임져야 한다.
- 리스크: 과제 기간 안에 안정적인 CE-01~CE-03을 검증하기 어렵다.

## 선택 근거

CRDT 기반 후보를 우선 비교하는 이유는 네트워크 단절 후 재접속 병합이 핵심 요구사항이기 때문이다. 자체 구현이나 단순 WebSocket broadcast는 동시 편집과 offline merge의 실패 모드를 숨기기 쉽다.

다만 Tiptap+Yjs/Hocuspocus와 Yorkie+ProseMirror 중 어느 쪽이 더 적합한지는 문서 모델, Markdown serialization, revision snapshot, 운영 난이도를 직접 확인해야 판단할 수 있다. 따라서 이 ADR은 최종 엔진 선택이 아니라, 최종 결정을 내리기 위한 검증 결정을 기록한다.

## 결과

### 긍정적 영향

- 협업 엔진 선택을 취향이나 인지도보다 검증 결과에 기반해 내릴 수 있다.
- CE-01~CE-03의 핵심 실패 모드를 초기에 확인할 수 있다.
- ADR-0001의 엔진 격리 원칙이 실제로 유효한지 검증할 수 있다.

### 부정적 영향 또는 트레이드오프

- 최종 구현 전에 POC 시간이 필요하다.
- 두 후보를 동일 기준으로 비교하기 위한 최소 데모와 측정 기준을 준비해야 한다.

### 후속 작업

- POC 범위와 성공 기준을 별도 작업으로 정의한다.
- 동일 문서와 동일 사용자 시나리오로 두 후보를 비교한다.
- 결과가 나오면 최종 협업 엔진 선택 ADR을 accepted 상태로 작성하거나 이 ADR을 대체한다.

## 검증 방법

- CE-01~CE-03 수동 시나리오를 두 후보에서 모두 실행한다.
- revision snapshot과 Markdown preview용 문자열 추출 가능 여부를 확인한다.
- 브라우저 2개 이상, 네트워크 단절/재접속, 긴 문서와 이미지 참조가 포함된 문서 편집 상황에서 동작을 비교한다.
- 구현 난이도, 디버깅 가능성, 운영 구성 요소 수를 기록한다.
- `poc/bench`에는 Node 기반 가상 협업 클라이언트와 Playwright 기반 UI 검증을 둘 수 있게 한다.

## 관련 문서

- 요구사항: `subject.md`
- 관련 ADR: ADR-0001

## 변경 이력

| 날짜 | 변경 내용 | 작성자 |
| --- | --- | --- |
| 2026-04-28 | 최초 작성 | Codex |
