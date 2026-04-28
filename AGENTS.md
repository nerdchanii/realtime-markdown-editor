---
title: AGENTS.md
purpose: AI agent용 저장소 안내
---

# AGENTS.md

이 저장소는 실시간 협업 Markdown 에디터 프로젝트다. 최우선 기준은 `subject.md` 충족이며, 제품 확장 기능이 `CE-01`부터 `CE-05`까지의 평가 경로를 흐리면 안 된다.

## 먼저 읽을 문서

1. 과제 원문: `subject.md`
2. 과제 충족 지도: `docs/compliance/subject-matrix.md`
3. 정규화 요구사항: `docs/requirements/registry.md`
4. product surface: `docs/product/README.md`
5. 아키텍처 경계와 결정: `ARCHITECTURE.md`, `docs/adr/`
6. 도메인 개념 변경 전: `docs/domain/README.md`
7. UI 변경 전: `DESIGN.md`

## 작업 규칙

- 공식 문서에서 `.note/**`를 출처로 인용하지 않는다.
- `docs/compliance/subject-matrix.md`를 최상위 평가 지도로 본다.
- CE 요구사항은 과제 원문 기준으로 유지한다. IndexedDB, Workspace, object storage 같은 구현/제품 선택은 CE를 재정의하지 않고 CE를 만족시키는 파생 요구로 둔다.
- storage, sync, auth, domain 경계를 새로 만들거나 바꾸기 전에는 ADR과 domain 문서를 확인한다.
- UI 작업은 editor-first 경험을 유지해야 한다.
- domain model 변경은 plan과 관련 domain 문서 업데이트를 동반해야 한다.

## 문서 역할

- `docs/product/`: 사용자에게 보이는 product surface와 capability.
- `docs/domain/`: 도메인 언어, 모델 계약, 관계, 비즈니스 규칙.
- `docs/adr/`: 중요한 결정과 tradeoff.
- `docs/research/`: POC와 benchmark 자료.
- `docs/backlog/`: 보류된 요청, 아이디어, 재검토 조건.
