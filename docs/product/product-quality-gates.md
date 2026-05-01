---
title: docs/product/product-quality-gates.md
status: active
related_documents:
  - subject.md
  - docs/compliance/subject-matrix.md
  - docs/product/README.md
  - docs/adr/0008-product-story-quality-gates.md
---

# docs/product/product-quality-gates.md

## 목적

이 문서는 product story와 세부 요구사항의 완료를 판단하는 공통 품질 gate다. `subject.md`의 CE
요구사항은 사용자 행동 단위의 product stories이며, 이 gate를 우회하거나 약화할 수 없다.

## 기본 원칙

제품은 테스트 통과용 demo가 아니라 사용자가 신뢰할 수 있는 협업 Markdown 도구다. 기능 구현,
문서, task 완료, 동작 증거는 아래 gate를 함께 만족해야 완료로 본다.

## Gate

| Gate                   | 기준                                                                                          | 실패 예                                                                 |
| ---------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Product-shaped flow    | 사용자가 이해할 수 있는 제품 흐름으로 동작한다.                                               | hidden URL parameter나 test helper만으로 가능한 기능을 완료로 주장한다. |
| Trustworthy identity   | 로그인, session, workspace membership, authorship이 신뢰 가능한 source of truth에서 나온다.   | email 또는 public `memberId`만으로 사용자를 가장한다.                   |
| Authorization boundary | product API는 현재 session과 workspace membership으로 접근을 결정한다.                        | document/workspace API가 인증 없이 읽기/쓰기 가능하다.                  |
| Data integrity         | 작성 내용, checkpoint, artifact, export, offline draft가 손실 없이 일관된 저장 경계를 가진다. | CE e2e만 통과하고 refresh, reconnect, tab close 뒤 상태가 불명확하다.   |
| UX coherence           | editor-first 경험 안에서 주요 상태와 action이 사용자가 이해할 수 있게 연결된다.               | 기능은 존재하지만 어디서 실행하는지, 성공/실패가 무엇인지 알 수 없다.   |
| Runtime operability    | local dev와 reviewer 실행이 명확한 preflight, migration, error surface를 가진다.              | DB env나 migration 누락이 요청 중 500으로만 드러난다.                   |
| Contract discipline    | HTTP/realtime contract와 runtime validation이 구현보다 느슨하지 않다.                         | DTO는 required인데 runtime schema는 optional이거나, 반대 drift가 있다.  |

## CE와의 관계

- CE-01부터 CE-05는 `subject.md`에서 온 product stories다.
- 각 CE story는 세부 REQ와 이 gate 위에서 사용 가능한 동작 증거가 확인될 때 완료된다.
- 예를 들어 동시 편집 엔진이 동작해도 사용자가 로그인하거나 workspace member로 접근할 수 없다면
  CE-01 story는 제품으로 완료된 것이 아니다.
- CE를 빨리 통과시키기 위한 shortcut은 제품 품질을 낮출 수 없다.
- auth, membership, persistence, validation, UX clarity는 각 CE story를 제품으로 성립시키는 세부
  요구사항과 품질 기준이다.
- e2e helper는 product contract를 사용해야 하며, product contract를 느슨하게 만들 수 없다.

## Task 완료 기준

작업자는 task를 완료하기 전에 다음을 확인한다.

- 변경이 관련 CE/REQ evidence를 깨지 않는다.
- 변경이 위 gate 중 하나라도 약화하지 않는다.
- gate를 의도적으로 바꾸는 작업이면 ADR 또는 product 문서를 먼저 수정한다.
- 검증 명령과 수동 확인 결과가 task 또는 PR 설명에 남는다.
