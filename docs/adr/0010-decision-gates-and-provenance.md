---
id: ADR-0010
title: "ADR-0010: 결정은 G0/G1/G2 게이트로 나누고 출처를 기록한다"
status: accepted
date: 2026-09-25
gate: G2
decided_by: user
ratified_by: user
ratified_at: 2026-09-25
reversibility: two-way
revisit_if: G1 결정이 뒤집히는 비율이 높거나, 사용자 검토가 병목이 되면 기한과 등급 기준을 조정한다.
related_documents:
  - docs/direction/2026-09-24-product-direction-interview.md
  - docs/direction/decision-log.md
  - docs/adr/0000-template.md
supersedes: []
superseded_by: null
---

# ADR-0010: 결정은 G0/G1/G2 게이트로 나누고 출처를 기록한다

## 맥락

과거 에이전트 작업에서 반복된 실패는 크게 두 가지였다.

- **결정이 사용자 의도처럼 기록되었다.** 에이전트가 추론하거나 제안한 내용이 사용자가 결정한 것처럼
  남았다. 예를 들어 `proposed` 상태인 ADR-0009 가 domain 문서에서 확정 규칙처럼 인용되었다.
- **"사람이 모든 결정을 승인"하는 방식은 결정 피로와 병목을 만든다.** 에이전트가 사람보다 넓은 시야를
  가질 때도 많다.

2026-09-24 인터뷰에서 사용자는 출처 표기와 비동기 추인 모델을 선호했다. 이후 업계 조사 결과를 보고
G0/G1/G2 등급 채택을 결정했다(2026-09-25).

## 결정

### 게이트

| 게이트 | 누가 결정하나 | 대상 | 기록 위치 |
| --- | --- | --- | --- |
| **G0** 에이전트 자율 | 에이전트 | 기존 ADR 과 domain 경계 안의 구현 선택, 리팩터링, 테스트, 문서 사실 정정 | PR 설명 |
| **G1** 에이전트 결정 + 비동기 추인 | 에이전트가 결정하고 즉시 효력. 사용자는 기한 안에 뒤집을 수 있다 | 되돌릴 수 있는 아키텍처나 라이브러리 선택, 명시되지 않은 UX 세부 사항, 문서 구조 | ADR 또는 `docs/direction/decision-log.md` |
| **G2** 사용자 선결정 | 사용자 | 되돌리기 어려운 결정, 제품 정체성에 관한 결정 | ADR (`ratified_by: user` 필수) |

G2 대상은 다음과 같다.

- 제품 정의, vision, non-goals
- 데이터 권위 모델(서버 권위 또는 local-first)
- 인증, 권한, workspace membership 모델, 에이전트 신원
- 외부 프로토콜과 공개 계약(에이전트 참여 프로토콜 등)
- 데이터 삭제와 되돌릴 수 없는 migration
- UI 방향(레퍼런스, 금지 규칙)
- 결정 체계 자체

분류가 애매하면 한 단계 위 게이트로 올린다.

### 흐름

- **G1**
  1. 에이전트는 결정을 기록하고 바로 진행한다.
  2. 기록에는 `status: accepted`, `decided_by: agent:<도구>`, `ratified_by: pending`,
     `ratify_by: <결정일 + 7일>` 을 적는다.
  3. 기한까지 사용자 이의가 없으면 다음 에이전트가 `ratified_by: lazy-consensus` 로 바꾼다.
  4. 사용자가 뒤집으면 `status: rejected` 나 `superseded` 로 바꾸고 이유를 남긴다.
- **G2**
  1. 에이전트는 선택지와 추천안을 담은 ADR 을 `status: proposed` 로 만들고 멈춘다.
  2. 그동안에는 그 결정에 의존하지 않는 작업만 진행한다.
  3. 사용자가 확정하면 `status: accepted`, `ratified_by: user`, `ratified_at` 을 기록한다.
- **추인 요청 모으기**: 에이전트는 PR 설명의 "Decisions" 섹션에 이번 PR 이 만든 G1/G2 결정을 나열한다.
  사용자는 이것을 모아서 검토한다.

### 출처 표기

- 인터뷰나 요구 기록처럼 사람의 의도를 담는 문서는 항목마다 `[user]`, `[agent]`, `[open]` 라벨을 붙인다.
- 에이전트의 추론이나 제안을 사용자의 결정처럼 쓰지 않는다.
- `proposed` 상태인 ADR 은 확정 규칙으로 인용하지 않는다. 인용할 때는 같은 줄에 proposed 또는 제안이라고
  표시한다.

### 기계 검증

`pnpm docs:check`(`scripts/check-docs.mjs`)가 pre-commit 과 CI 에서 다음을 검사한다.

- active 문서의 깨진 상대 링크. `docs/archive/`, `docs/research/` 는 검사하지 않는다.
- ADR `status` 값이 허용된 값인지.
- `gate` 를 가진 ADR 에 `decided_by` 가 있는지.
- accepted 상태인 G2 ADR 에 `ratified_by: user` 가 있는지.
- `docs/adr/`, `docs/direction/` 밖의 문서가 proposed ADR 을 proposed 표시 없이 인용하는지.

## 결과

- 이전 ADR 템플릿의 "AI assistant는 결정자로 기록하지 않는다" 규칙은 이 ADR 로 대체한다.
  에이전트도 결정자가 될 수 있다. 다만 출처를 반드시 기록한다.
- 0009 이하의 기존 ADR 에는 `gate` 필드가 없다. 새 형식 검사는 `gate` 가 있는 ADR 에만 적용한다.
- 작업 기록(task, exec-plan)은 저장소에 두지 않는다. GitHub Issue 와 PR 에 둔다.
  PR 을 마무리할 때 지속되는 결정은 ADR 이나 decision log 로 승격한다.

## 변경 이력

| 날짜 | 변경 | 결정자 |
| --- | --- | --- |
| 2026-09-25 | 최초 결정. 게이트 구조는 사용자 결정, G1 기한 7일은 에이전트 제안을 사용자가 수락 | user |
