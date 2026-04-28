---
id: ADR-0003
title: RDB, Object Storage, optional Redis의 역할을 분리한 저장소 전략
status: proposed
date: 2026-04-28
authors:
  - Codex
decision_type: architecture
tags:
  - storage
  - revision
  - persistence
  - cache
related_requirements:
  - CE-01
  - CE-03
  - CE-04
related_documents:
  - subject.md
supersedes: []
superseded_by: null
---

# ADR-0003: RDB, Object Storage, optional Redis의 역할을 분리한 저장소 전략

## 맥락

실시간 협업 에디터는 현재 편집 상태, 문서 메타데이터, revision 이력, presence, 연결 상태를 다룬다. 이 데이터들은 수명, 조회 방식, 정합성 요구가 서로 다르다. CE-04는 변경 이력 조회를 요구하고, CE-03은 네트워크 단절 후 재접속 병합을 요구한다.

하나의 저장소에 모든 데이터를 넣으면 초기 구조는 단순하지만, revision artifact, 실시간 상태, 영속 메타데이터가 섞이기 쉽다. 반대로 저장소를 너무 세분화하면 과제 범위에 비해 운영 복잡도가 커진다.

## 결정

저장소 역할을 다음처럼 분리하는 전략을 제안한다.

- RDB/Postgres: workspace, project, folder, document, membership, properties, link edge, checkpoint metadata 같은 질의 가능한 영속 데이터를 저장한다.
- Object Storage/MinIO: checkpoint snapshot, export artifact, 이미지 같은 binary asset, 큰 문서 상태 덤프처럼 크기가 커질 수 있는 artifact를 저장한다.
- Redis: presence, ephemeral session state, pub/sub, cache, rate limit, job queue 같은 보조 역할 후보로만 검토한다.

MVP의 durable baseline은 RDB/Postgres와 object storage/MinIO를 기준으로 한다. Redis는 primary durable store가 아니며, POC/bench 결과가 필요성을 보여줄 때 보조 인프라로 도입한다.

## 후보안

### 1. RDB, Object Storage, optional Redis 역할 분리

- 장점: 영속 데이터, 큰 artifact, 임시 상태의 수명과 접근 패턴을 분리할 수 있다.
- 단점: 실제 인프라가 늘어나면 로컬 실행과 배포 설명이 복잡해진다.
- 리스크: MVP에서 과도하게 구현하면 핵심 편집 기능보다 인프라 작업이 커질 수 있다.

### 2. RDB 단일 저장소

- 장점: 로컬 실행과 구현이 단순하다.
- 단점: 큰 revision snapshot이나 export artifact를 RDB에 직접 넣으면 백업, 조회, 비용 정책이 불명확해질 수 있다.
- 리스크: 실시간 ephemeral state와 영속 이력이 같은 모델에 섞인다.

### 3. 협업 엔진 저장소에 모두 위임

- 장점: 엔진 예제와 운영 모델을 빠르게 따를 수 있다.
- 단점: revision 조회, lifecycle, PM/개발 협업 기능의 제품 데이터가 엔진 내부 표현에 묶인다.
- 리스크: 엔진 교체나 artifact 정책 변경이 어려워진다.

## 선택 근거

과제의 핵심은 협업 편집이지만, 변경 이력 조회와 개발 협업 관점까지 포함하려면 데이터 수명과 책임을 분리해야 한다. RDB는 질의 가능한 메타데이터에 적합하고, Object Storage는 불변 snapshot, export artifact, 이미지 asset에 적합하다. Redis는 presence 같은 임시 협업 상태와 pub/sub에는 적합하지만, 내구성이 필요한 문서 상태의 primary store로 두면 안 된다.

따라서 현재 단계에서는 RDB와 object storage를 durable baseline으로 두고, Redis는 성능과 운영 복잡도를 비교하는 연구 항목으로 남긴다.

## 결과

### 긍정적 영향

- revision metadata와 snapshot artifact의 책임이 분명해진다.
- presence 같은 임시 상태를 영속 데이터와 분리할 수 있다.
- 추후 운영 규모가 커져도 저장소 역할을 자연스럽게 확장할 수 있다.
- Redis 도입 여부를 기능 구현과 분리해 벤치 결과로 판단할 수 있다.

### 부정적 영향 또는 트레이드오프

- 문서와 구현에서 저장소 역할을 명확히 설명해야 한다.
- Redis를 늦게 도입할 경우, scale-out presence나 pub/sub 요구가 생길 때 별도 설계가 필요하다.

### 후속 작업

- MVP에서 실제로 사용할 저장소 구성을 확정한다.
- revision snapshot 저장 형식과 조회 흐름을 기능 문서와 맞춘다.
- Redis가 필요한 기능과 협업 엔진 내장 awareness 또는 단일 서버 메모리 상태로 충분한 기능을 구분한다.

## 검증 방법

- CE-04 revision 목록 조회가 metadata와 artifact를 분리해 설명되는지 확인한다.
- presence 데이터가 영속 revision으로 잘못 저장되지 않는지 확인한다.
- 로컬 실행 문서에서 MVP 저장소 구성이 과도하지 않은지 확인한다.
- Redis를 사용하더라도 문서 durable state가 Redis에만 존재하지 않는지 확인한다.

## 관련 문서

- 요구사항: `subject.md`
- 관련 ADR: ADR-0001, ADR-0002

## 변경 이력

| 날짜 | 변경 내용 | 작성자 |
| --- | --- | --- |
| 2026-04-28 | 최초 작성 | Codex |
