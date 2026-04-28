---
id: ADR-0004
title: 문서 lifecycle은 즉시 저장을 기본으로 하고 baseline과 정책 상속을 확장점으로 둔다
status: proposed
date: 2026-04-28
authors:
  - Codex
decision_type: product-architecture
tags:
  - document-lifecycle
  - autosave
  - revision
  - baseline
related_requirements:
  - CE-01
  - CE-03
  - CE-04
  - CE-05
related_documents:
  - subject.md
supersedes: []
superseded_by: null
---

# ADR-0004: 문서 lifecycle은 즉시 저장을 기본으로 하고 baseline과 정책 상속을 확장점으로 둔다

## 맥락

실시간 협업 문서는 여러 사용자가 동시에 편집하므로 전통적인 수동 저장 모델만으로는 현재 상태, revision, preview, offline merge를 설명하기 어렵다. 사용자는 문서를 함께 작성하는 동안 저장 버튼을 의식하기보다, 연결 상태와 변경 이력을 신뢰할 수 있어야 한다.

동시에 CE-04는 변경 이력 조회를 요구하므로 모든 입력을 동일한 revision으로 취급하면 이력이 너무 잘게 쪼개질 수 있다. 프로젝트 문서나 개발 협업 문서에서는 특정 시점을 baseline으로 남기거나, 문서 종류별 lifecycle 정책을 조정할 가능성도 있다.

## 결정

문서 lifecycle은 즉시 저장을 기본 정책으로 둔다. 사용자의 편집은 협업 엔진과 persistence 계층을 통해 가능한 한 자동으로 반영되며, UI는 저장 버튼보다 동기화 상태와 revision 생성 상태를 명확히 보여준다.

history는 즉시 저장 상태와 별개로 조회 가능한 이력 단위다. MVP에서는 autosave/save와 명시적 checkpoint를 구분하고, 사용자가 이해하는 history 항목에는 작성자, 시각, 사용자 메시지, snapshot 또는 equivalent artifact를 남긴다. lifecycle 모델에는 다음 확장점을 둔다.

- baseline: 특정 revision을 팀이 합의한 기준 상태로 표시할 수 있는 개념
- lifecycle policy: 문서 또는 workspace 단위로 revision 생성 방식과 보존 정책을 상속할 수 있는 개념
- sync state: 저장됨, 동기화 중, 오프라인, 재연결 중 같은 사용자-facing 상태

## 후보안

### 1. 즉시 저장 기본 + revision/checkpoint 분리

- 장점: 실시간 협업 경험과 잘 맞고, CE-03의 재접속 병합을 자연스럽게 설명할 수 있다.
- 단점: revision 생성 기준을 별도로 정의해야 한다.
- 리스크: 저장과 revision의 차이를 UI가 설명하지 못하면 사용자가 혼동할 수 있다.

### 2. 수동 저장 중심 lifecycle

- 장점: 사용자가 저장 시점을 명확히 통제한다.
- 단점: 실시간 공동 편집과 offline merge에서 현재 상태의 의미가 모호해진다.
- 리스크: 여러 사용자가 동시에 저장할 때 충돌과 책임 경계가 복잡해진다.

### 3. 모든 변경을 revision으로 저장

- 장점: 완전한 추적이 가능해 보인다.
- 단점: revision 조회가 노이즈로 가득 차고 저장 비용이 커질 수 있다.
- 리스크: CE-04의 사용자-facing 이력 조회가 실질적으로 어려워진다.

## 선택 근거

실시간 협업 문서에서 저장은 사용자의 명령이라기보다 시스템의 지속적인 책임에 가깝다. 따라서 즉시 저장을 기본으로 두고, revision은 사용자가 이해할 수 있는 이력 단위로 분리하는 편이 제품 경험에 적합하다.

baseline과 lifecycle policy는 MVP에서 완전 구현하지 않더라도, 개발 협업 문서의 상태 관리와 변경 추적을 설명하는 중요한 확장점이다. 이 개념을 초기에 열어두면 향후 문서 종류별 정책이나 프로젝트 관리 기능으로 확장하기 쉽다.

## 결과

### 긍정적 영향

- 사용자는 저장 버튼보다 동기화 상태와 이력을 중심으로 문서를 이해할 수 있다.
- CE-03과 CE-04를 하나의 lifecycle 안에서 설명할 수 있다.
- baseline 개념을 통해 중요한 의사결정 시점을 표시할 수 있다.

### 부정적 영향 또는 트레이드오프

- 저장 상태와 revision 상태를 UI와 문서에서 구분해야 한다.
- revision 생성 정책은 추후 별도 요구사항 분석이 필요하다.

### 후속 작업

- MVP revision 생성 기준을 확정한다.
- sync state의 사용자-facing 표현을 UI shell 기능과 연결한다.
- baseline과 lifecycle policy를 MVP 포함, 후속, 연구 항목 중 어디에 둘지 요구사항 레지스트리에서 정리한다.

## 검증 방법

- 두 사용자가 동시에 편집해도 별도 저장 조작 없이 같은 최신 상태를 확인할 수 있는지 검증한다.
- 오프라인 편집 후 재접속 시 sync state가 일관되게 표현되는지 확인한다.
- revision 목록이 사용자가 읽을 수 있는 단위로 표시되는지 확인한다.

## 관련 문서

- 요구사항: `subject.md`
- 관련 ADR: ADR-0003, ADR-0005

## 변경 이력

| 날짜 | 변경 내용 | 작성자 |
| --- | --- | --- |
| 2026-04-28 | 최초 작성 | Codex |
