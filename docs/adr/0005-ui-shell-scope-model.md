---
id: ADR-0005
title: UI shell은 Document, Workspace, User, Editor scope를 분리한다
status: proposed
date: 2026-04-28
authors:
  - Codex
decision_type: product-architecture
tags:
  - ui-shell
  - scope-model
  - collaboration-ux
  - information-architecture
related_requirements:
  - CE-01
  - CE-02
  - CE-04
  - CE-05
related_documents:
  - subject.md
supersedes: []
superseded_by: null
---

# ADR-0005: UI shell은 Document, Workspace, User, Editor scope를 분리한다

## 맥락

이 제품은 단순한 텍스트 입력 화면이 아니라 실시간 협업, presence, revision, preview, PM/개발 협업 관점을 한 화면 안에서 다뤄야 한다. 화면 구조가 기능별로만 쌓이면 사용자는 현재 문서 상태, 협업 상태, 개인 설정, workspace 맥락을 구분하기 어렵다.

필수 요구사항은 대부분 현재 편집 중인 문서에 걸려 있지만, 자유 영역에서는 개발 협업과 프로젝트 매니지먼트 관점을 반영해야 한다. 따라서 UI shell은 어떤 정보가 어느 범위에 속하는지 먼저 구분해야 한다.

## 결정

UI shell의 정보와 상태를 다음 scope로 나눈다.

- Document scope: 현재 문서 제목, 본문, properties, link/backlink, checkpoint/history
- Workspace scope: workspace, project, folder, document navigation, workspace-level lifecycle policy
- User scope: 사용자, workspace membership, 계정 전환, 개인 입력 상태, 로컬 설정
- Editor scope: 커서, 선택 영역, Rich/Markdown/Split mode, preview 표시 방식, sync state

기본 화면은 foldable left panel, center editor, foldable right inspector의 3-panel shell을 사용한다. 문서 properties는 제목 근처에 두고, heading 기반 ToC는 center editor 주변 rail로 제공한다. UI 문구는 처음부터 한국어와 영어 i18n resource를 통해 관리한다.

MVP 화면은 이 scope를 모두 완전한 제품 기능으로 구현하지 않아도 된다. 다만 상단 바, 에디터 영역, preview, 협업 패널, revision 영역을 설계할 때 상태의 소유 범위를 혼합하지 않는다.

## 후보안

### 1. Scope 기반 UI shell

- 장점: 복잡한 협업 상태를 어디에 배치하고 어떤 기능이 어떤 데이터를 소유하는지 설명하기 쉽다.
- 단점: 초기 화면 설계에서 용어와 경계를 맞춰야 한다.
- 리스크: MVP 범위를 좁히지 않으면 shell만 커지고 핵심 편집 경험이 약해질 수 있다.

### 2. 단일 에디터 화면 중심 UI

- 장점: 가장 빠르게 편집/preview 경험을 만들 수 있다.
- 단점: revision, presence, workspace 맥락, 사용자 설정이 화면에 뒤섞일 수 있다.
- 리스크: 자유 영역 기능을 추가할 때 정보 구조가 흔들린다.

### 3. 프로젝트 관리 대시보드 중심 UI

- 장점: PM/개발 협업 관점을 강하게 드러낼 수 있다.
- 단점: CE-01~CE-05의 에디터 핵심 경험이 부차적으로 밀릴 수 있다.
- 리스크: 과제의 필수 요구사항 검증 경로가 복잡해진다.

## 선택 근거

이 과제의 뼈대는 마크다운 동시 협업 에디터다. 따라서 UI의 첫 번째 책임은 편집, presence, preview, revision을 명확하게 보여주는 것이다. 동시에 자유 영역 기능을 얹으려면 workspace와 문서, 사용자, 편집 상태를 구분할 수 있어야 한다.

Scope 기반 UI shell은 MVP를 에디터 중심으로 유지하면서도, 향후 문서 목록, 개발 협업 패널, baseline, lifecycle policy 같은 기능을 어디에 붙일지 판단 기준을 제공한다.

## 결과

### 긍정적 영향

- CE-01~CE-05 검증 화면을 명확히 구성할 수 있다.
- 협업 패널이나 프로젝트 관리 기능을 추가해도 현재 문서 편집 경험과 충돌하기 어렵다.
- 상태 소유 범위가 분명해져 구현과 테스트가 쉬워진다.

### 부정적 영향 또는 트레이드오프

- MVP에서 구현하지 않는 scope도 문서상 개념으로는 관리해야 한다.
- 화면이 과도하게 분할되지 않도록 기능 우선순위를 계속 조정해야 한다.

### 후속 작업

- MVP 화면에서 각 scope가 어디에 노출되는지 정리한다.
- presence, revision, preview, sync state의 배치를 feature catalog와 맞춘다.
- workspace-level 기능은 MVP 포함 여부를 요구사항 분석에서 별도로 판단한다.

## 검증 방법

- 두 사용자 협업 시 presence와 sync state가 Editor/User scope로 분명히 표현되는지 확인한다.
- revision 조회가 Document scope 기능으로 자연스럽게 배치되는지 확인한다.
- preview와 협업 패널이 편집 흐름을 방해하지 않는지 사용 시나리오로 점검한다.

## 관련 문서

- 요구사항: `subject.md`
- 관련 ADR: ADR-0001, ADR-0004

## 변경 이력

| 날짜 | 변경 내용 | 작성자 |
| --- | --- | --- |
| 2026-04-28 | 최초 작성 | Codex |
