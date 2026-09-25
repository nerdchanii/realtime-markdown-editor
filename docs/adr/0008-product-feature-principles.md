---
id: ADR-0008
title: "ADR-0008: 제품 기능을 사용자 흐름 중심으로 설명한다"
status: accepted
date: 2026-04-30
deciders:
  - nerdchanii
related_documents:
  - docs/product/README.md
  - docs/product/product-principles.md
  - docs/archive/compliance/feature-acceptance-map.md
---

# ADR-0008: 제품 기능을 사용자 흐름 중심으로 설명한다

## Context

이 제품은 개발팀이 프로젝트 문서를 함께 작성하고 관리하는 협업 Markdown 에디터다. 문서와 작업
기록은 내부 요구사항 ID보다 사용자가 실제로 수행하는 행동을 중심으로 읽혀야 한다.

초기 문서에는 요구사항 번호, 테스트 경로, 완료 기준 중심의 표현이 많았다. 이 표현은 기능을 설명하는
문서에서도 제품을 평가용 산출물처럼 보이게 만들 수 있었다.

## Decision

제품 문서와 현재 실행 문서는 기능과 사용자 흐름을 중심으로 작성한다.

- `docs/product/**`는 사용자가 무엇을 할 수 있는지와 기능 간 연결을 설명한다.
- `docs/product/product-principles.md`는 완료 gate가 아니라 제품 설명 원칙을 담는다.
- `docs/archive/compliance/feature-acceptance-map.md`는 요구사항 번호가 아니라 기능별 사용자 행동 확인 지도를
  제공한다.
- 요구사항 ID와 테스트 ID는 추적과 자동화에만 사용하고, 제품 설명의 주어로 쓰지 않는다.
- 보류된 기능은 미달 항목이 아니라 향후 확장 방향으로 설명한다.

## Consequences

- README와 제품 문서는 협업 Markdown 도구 자체를 소개한다.
- account, workspace, presence, history, offline recovery는 평가 보조 기능이 아니라 제품의 구성 요소로
  설명된다.
- 과거 의사결정 기록은 유지하되, 활성 문서의 첫인상은 feature/story 중심으로 맞춘다.
- 새 기능 문서를 추가할 때는 내부 요구사항 번호보다 사용자 행동, 상태, 연결 흐름을 먼저 쓴다.
