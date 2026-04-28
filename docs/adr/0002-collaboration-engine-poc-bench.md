---
id: ADR-0002
title: "ADR-0002: 협업 엔진은 POC로 평가한 뒤 최종 선택한다"
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
  - CE-01-CONCURRENT-EDITING
  - CE-02-PRESENCE
  - CE-03-OFFLINE-MERGE
  - CE-05-RICH-PREVIEW
  - REQ-RESEARCH-COLLAB-ENGINE-POC
  - REQ-OFFLINE-RECONNECT-MERGE
  - REQ-EDITOR-RICH-SOURCE-SPLIT
related_documents:
  - subject.md
  - docs/research/poc-001-collaboration-engine/README.md
  - docs/compliance/subject-matrix.md
supersedes: []
superseded_by: null
---

# ADR-0002: 협업 엔진은 POC로 평가한 뒤 최종 선택한다

## 맥락

과제는 동기화 방식으로 CRDT, OT, 자체 구현 등을 허용한다. CE-01~CE-03은 협업 엔진의 품질에 직접 의존하고, CE-05의 rich/source/split 편집 경험도 editor stack과 강하게 연결된다.

현재 단계에서는 최종 엔진을 단정하지 않는다. POC를 통해 후보의 실패 모드를 확인한 뒤 별도 accepted final sync ADR을 작성한다.

## 결정

다음 후보를 POC로 비교한다.

- Tiptap + Yjs + Hocuspocus
- Yorkie + ProseMirror

POC는 동일한 시나리오로 평가한다.

- 두 브라우저에서 같은 문서 동시 편집
- cursor/selection presence 표시
- open-page offline edit 후 reconnect merge
- checkpoint/history snapshot 추출
- Markdown preview/source/split 바인딩
- adapter boundary 유지 가능성

## 후보안

### 1. Tiptap + Yjs + Hocuspocus

- 장점: ProseMirror 기반 UX와 Yjs 생태계가 강하다.
- 단점: Markdown canonical/export 정책을 별도로 검증해야 한다.
- 리스크: rich editor model과 Markdown portability가 충돌할 수 있다.

### 2. Yorkie + ProseMirror

- 장점: 협업 백엔드와 문서 동기화 모델을 함께 평가할 수 있다.
- 단점: Markdown/source/split 경로의 자료와 운영 모델을 직접 확인해야 한다.
- 리스크: 초기 디버깅 비용이 커질 수 있다.

### 3. 자체 WebSocket/OT 구현

- 장점: 최소 구현을 직접 통제할 수 있다.
- 단점: offline merge와 conflict resolution을 직접 책임져야 한다.
- 리스크: 과제 기간 안에 안정적인 CE-01~CE-03 검증이 어렵다.

## 선택 근거

Offline merge가 핵심 위험이므로 CRDT 계열 후보를 먼저 검증한다. 단, 이 ADR은 최종 선택이 아니라 최종 선택을 위한 평가 결정을 기록한다.

## 결과

### 긍정적 영향

- 엔진 선택이 취향이 아니라 evidence에 기반한다.
- CE-01~CE-03 실패 모드를 조기에 확인한다.
- ADR-0001의 adapter 원칙을 실제 후보에 대입해 볼 수 있다.

### 부정적 영향 또는 트레이드오프

- 최종 구현 전 POC 시간이 필요하다.
- POC 후 별도 final sync ADR을 작성해야 한다.

### 후속 작업

- `docs/research/poc-001-collaboration-engine/result.md`를 채운다.
- POC 결과 후 accepted final sync ADR을 만든다.

## 검증 방법

- 두 후보에서 CE-01~CE-03 수동 시나리오를 실행한다.
- rich/source/split, Markdown preview, snapshot extraction을 확인한다.
- local review setup complexity와 debugging cost를 기록한다.

## 관련 문서

- `docs/research/poc-001-collaboration-engine/README.md`
- `docs/compliance/subject-matrix.md`
- ADR-0001

## 변경 이력

| 날짜 | 변경 내용 | 작성자 |
| --- | --- | --- |
| 2026-04-28 | 최초 작성 | Codex |
| 2026-04-28 | POC ADR와 final sync ADR 분리 정책 명시 | Codex |
