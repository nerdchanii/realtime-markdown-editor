---
id: ADR-0008
title: "ADR-0008: CE를 product story로 해석하고 세부 REQ로 완성한다"
status: accepted
date: 2026-05-01
authors:
  - nerdchanii
decision_type: product-architecture
tags:
  - product-quality
  - compliance
  - auth
  - workspace
related_requirements:
  - CE-01-CONCURRENT-EDITING
  - CE-02-PRESENCE
  - CE-03-OFFLINE-MERGE
  - CE-04-REVISION-HISTORY
  - CE-05-RICH-PREVIEW
  - REQ-IDENTITY-MEMBERSHIP
  - REQ-PRODUCTION-ACCOUNT-MANAGEMENT
  - REQ-WORKSPACE-MEMBER-MANAGEMENT
related_documents:
  - subject.md
  - docs/compliance/subject-matrix.md
  - docs/product/product-quality-gates.md
  - ARCHITECTURE.md
supersedes: []
superseded_by: null
---

# ADR-0008: CE를 product story로 해석하고 세부 REQ로 완성한다

## 맥락

`subject.md`의 CE-01부터 CE-05는 협업 Markdown editor의 핵심 요구사항이다. 이 요구사항을
빠르게 보이게 하는 과정에서 product auth, workspace membership, account flow, runtime operability
같은 제품 기본 품질이 후순위 작업처럼 밀릴 위험이 생겼다.

이 프로젝트는 필수 요구사항을 통과하는 demo가 아니라, PM적 요구사항 해석을 제품으로 구현하는 것을
목표로 한다. 따라서 CE는 고립된 checklist가 아니라 사용자 행동 단위의 product stories로 다룬다.

## 결정

CE-01부터 CE-05를 과제 요구사항을 사용자 행동 단위로 묶은 product stories로 둔다. 제품 완료 판단은
각 CE story의 사용자 행동이 관련 세부 REQ와 `docs/product/product-quality-gates.md`의 공통 gate
위에서 동작하는지를 함께 본다.

다음 항목은 각 CE story를 실제 제품으로 성립시키는 세부 요구사항과 품질 기준이다.

- 신뢰 가능한 login/session/password credential
- workspace membership 기반 authorization
- checkpoint authorship과 presence identity의 source of truth
- content persistence, artifact, export, offline recovery의 data integrity
- 사용자가 이해할 수 있는 editor-first product flow
- local dev와 reviewer 실행의 명확한 preflight와 error surface

## 후보안

### 1. CE를 고립된 checklist로 유지

- 장점: CE e2e를 빠르게 안정화할 수 있다.
- 단점: 제품 경계가 약해져 auth, membership, persistence를 우회하는 구현이 기준선으로 굳는다.
- 리스크: 필수 요구사항은 보여도 제품으로 신뢰하기 어려운 결과물이 된다.

### 2. Reviewer/dev 경계만 분리

- 장점: dev helper와 product route drift를 줄일 수 있다.
- 단점: 문제를 reviewer 편의 기능으로 축소해 제품 품질 기준 자체를 바로잡지 못한다.
- 리스크: 새로운 shortcut이 다른 이름으로 다시 생긴다.

### 3. CE를 product story로 해석하고 세부 REQ로 완성

- 장점: CE 요구사항과 제품 품질을 동시에 보호한다.
- 단점: 일부 task의 완료 기준이 엄격해지고 문서/테스트 업데이트가 늘어난다.
- 리스크: 초기 구현 속도는 느려질 수 있지만, 품질 debt와 재작업을 줄인다.

## 선택 근거

3안을 선택한다. CE는 제품의 핵심 협업 능력을 사용자 행동으로 표현한다. 예를 들어 편집 엔진이
수렴해도 사용자가 로그인하거나 workspace member로 접근할 수 없다면 CE-01은 완료된 product story가
아니다. 세부 REQ와 품질 gate를 명시하면 task, architecture, requirements 문서가 "테스트 통과"보다
"제품으로서 제대로 동작"을 기준으로 판단하게 된다.

## 결과

### 긍정적 영향

- CE 요구사항이 제품 품질을 낮추는 명분으로 쓰이지 않는다.
- auth, authorization, persistence, UX consistency가 task scope에서 누락되기 어렵다.
- reviewer는 필수 요구 충족뿐 아니라 제품 해석의 완성도를 확인할 수 있다.

### 부정적 영향 또는 트레이드오프

- 일부 CE-focused task는 auth/membership/storage/UX 동작을 함께 준비해야 한다.
- task 분해와 검증 명령이 더 엄격해진다.
- 기존 문서에서 "first skeleton"과 보조 기능 중심 표현을 재검토해야 한다.

### 후속 작업

- `docs/compliance/subject-matrix.md`를 CE story와 product gate 관계로 정리한다.
- `docs/requirements/registry.md`에서 공통 제품 기준이 낮은 우선순위 작업처럼 읽히지 않게 한다.
- `tasks/README.md`와 task template에 product quality gate 확인을 추가한다.
- backend route authorization matrix와 dev runtime preflight는 별도 task로 구체화한다.

## 검증 방법

- 새 task가 CE만 언급하고 product quality gate를 무시하지 않는지 review한다.
- auth/session, workspace membership, persistence boundary를 바꾸는 작업은 ADR 또는 product 문서
  변경을 동반하는지 확인한다.
- CE story 완료는 `docs/product/product-quality-gates.md`의 gate를 통과한 product path에서만
  인정한다.

## 관련 문서

- 요구사항: `docs/requirements/registry.md`
- 제품 문서: `docs/product/product-quality-gates.md`
- 과제 지도: `docs/compliance/subject-matrix.md`
- 관련 ADR: ADR-0001, ADR-0003, ADR-0005

## 변경 이력

| 날짜       | 변경 내용 | 결정자     |
| ---------- | --------- | ---------- |
| 2026-05-01 | 최초 작성 | nerdchanii |
