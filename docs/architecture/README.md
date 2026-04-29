---
title: docs/architecture/README.md
status: active
---

# docs/architecture/README.md

## 목적

이 디렉터리는 `ARCHITECTURE.md`가 담기에는 세부적인 backend/frontend 구현 규칙을 둔다. 최상위 평가 기준은 여전히 `subject.md`와 `docs/compliance/subject-matrix.md`이며, 중요한 결정의 근거는 `docs/adr/*`를 따른다.

## 읽는 순서

1. `ARCHITECTURE.md`
2. `docs/architecture/backend.md`
3. `docs/architecture/frontend.md`
4. `docs/domain/README.md`
5. `docs/product/README.md`
6. `docs/adr/*`

## 운영 규칙

- 이 디렉터리는 architecture rule과 ownership rule을 설명한다.
- Domain meaning 자체는 `docs/domain/**`에서 관리한다.
- Product surface와 reviewer path는 `docs/product/**`와 `docs/compliance/subject-matrix.md`에서 관리한다.
- ADR별 상태와 tradeoff는 `docs/adr/*`에서 관리하고, `ARCHITECTURE.md`에 ADR 파일 목록을 중복 인덱싱하지 않는다.
