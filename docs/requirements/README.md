---
title: docs/requirements/README.md
status: active
---

# docs/requirements/README.md

## 목적

이 디렉터리는 정규화된 요구사항을 관리한다. 기능 카탈로그도 아니고 구현 계획도 아니다.

## 요구사항 계층

- Subject requirement: `subject.md`에서 온 과제 요구사항. CE source identity를 유지하고 source-neutral하게 둔다.
- Derived requirement: subject requirement를 이 제품에서 만족시키기 위해 필요한 세부 요구사항.
- Product extension requirement: PM/개발 협업 관점을 반영하기 위해 자유영역에서 선택한 제품 요구사항.
- Research requirement: 결정 전 POC 또는 benchmark가 필요한 요구사항.
- 보류 요구사항: 첫 skeleton 또는 MVP 범위에서 의식적으로 제외한 아이디어와 요청.

## ID 정책

- Subject requirement는 `CE-번호-행위` 형식을 사용한다. 예: `CE-03-OFFLINE-MERGE`
- 정규화 요구사항은 의미 기반 ID를 사용한다. 예: `REQ-OFFLINE-LOCAL-PERSISTENCE`
- `functional`, `non-functional`, `ux`, `architecture`, `ops`는 ID prefix가 아니라 `type` 값이다.
- 상태와 delivery phase는 metadata이며 file path에 넣지 않는다.

## 필수 Metadata

`registry.md`의 각 row는 다음 field를 포함해야 한다.

- `id`
- `origin`
- `type`
- `decision_status`
- `delivery_phase`
- `derived_from`
- `statement`
- `acceptance`
- `related_product_docs`
- `related_adrs`

## 다른 문서와의 관계

- `docs/compliance/subject-matrix.md`는 subject compliance를 설명한다.
- `docs/product/README.md`는 product surface를 mapping한다.
- `docs/domain/README.md`는 domain language와 contract를 소유한다.
- `docs/adr/`는 decision과 tradeoff를 소유한다.
