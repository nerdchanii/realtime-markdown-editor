---
title: docs/requirements/README.md
status: active
---

# docs/requirements/README.md

## 목적

이 디렉터리는 정규화된 요구사항을 관리한다. 기능 카탈로그도 아니고 구현 계획도 아니다.
`tasks/exec-plan/**`와 `tasks/**`가 실행 계획과 작업 단위를 소유하고, 이 디렉터리는
요구사항의 현재 상태와 다음 행동을 얇은 단위로 추적한다.

## 문서 역할

- `registry.md`: 사람이 읽는 얇은 지도다. 상세 요구사항 내용은 ID별 파일에 둔다.
- `items/*.md`: 채택되었지만 아직 완료로 닫지 않은 요구사항이다.
- `completed/*.md`: 완료된 요구사항이다. 완료 증거와 관련 archived task를 함께 둔다.
- `backlog/*.md`: 아직 계획되거나 구체화되지 않은 candidate, deferred, ambiguous 요구사항이다.
- 새로운 요구사항은 먼저 `backlog/*.md`에 기록한다.
- 요구사항이 채택되면 `backlog/*.md`에서 `items/*.md`로 이동한다.
- 요구사항이 완료되면 `items/*.md`에서 `completed/*.md`로 이동한다.
- 실행 계획은 `tasks/exec-plan/**`에서 만들고, 실행 단위는 `tasks/**`에서 관리한다.
- task는 새로운 제품 요구사항의 정본이 될 수 없다.

## 요구사항 계층

- Core feature requirement: 제품의 핵심 사용자 행동을 표현하는 요구사항.
- Supporting requirement: core feature가 계정, 워크스페이스, 데이터 보존, UI 흐름과 연결되기 위해
  필요한 세부 요구사항.
- Product extension requirement: 문서 자동화, workflow, 외부 연동처럼 제품 방향을 확장하는
  요구사항.
- Research requirement: 결정 전 POC 또는 benchmark가 필요한 요구사항.
- Backlog requirement: 아직 계획되거나 구체화되지 않은 candidate, deferred, ambiguous 요구사항.

## 공통 스키마

각 ID별 요구사항 파일은 frontmatter에 같은 핵심 필드를 둔다.

- `id`
- `title`
- `status`
- `category`
- `type`
- `taskability`
- `scope`
- `derived_from`
- `depends_on`
- `blocks`
- `next_step`
- `refs`

필드 의미는 다음과 같다.

| Field | 의미 |
| --- | --- |
| `id` | 안정적인 요구사항 ID |
| `title` | 한 줄 핵심 설명 |
| `status` | 현재 상태. 예: `active`, `planned`, `done`, `candidate`, `deferred`, `ambiguous` |
| `category` | `core-feature`, `supporting`, `product-extension`, `research`, `backlog` |
| `type` | `functional`, `non-functional`, `ux`, `architecture`, `ops`, `research` |
| `taskability` | 현재 task로 바로 깔 수 있는지. 예: `taskable`, `blocked`, `ambiguous`, `done` |
| `scope` | 주된 영향 영역. 예: `frontend`, `backend`, `workflow`, `platform`, `ops`, `automation` |
| `derived_from` | 출처가 되는 subject 또는 requirement ID |
| `depends_on` | 선행 requirement 또는 task IDs |
| `blocks` | 이 항목이 풀려야 움직이는 requirement 또는 task IDs |
| `next_step` | 지금 바로 필요한 다음 행동 |
| `refs` | 관련 공식 문서, ADR, task, spec |

추가 field는 둘 수 있지만, 위 8개는 기본값으로 유지한다.

## 상태 vocabulary

- `items/*.md`는 보통 `active`, `planned`, `parked`를 사용한다.
- `completed/*.md`는 `done`을 사용한다.
- `backlog/*.md`는 보통 `candidate`, `deferred`, `ambiguous`, `revisit-later`를 사용한다.
- `taskability`는 `taskable`, `blocked`, `ambiguous`, `done`을 기본으로 쓴다.
- 완료 여부는 요구사항 파일의 `status: done`과 `completed_by` field로 판단한다.

## ID 정책

- 기존 core feature ID는 안정성을 위해 유지한다. 예: `CE-03-OFFLINE-MERGE`
- 새 정규화 요구사항은 의미 기반 ID를 사용한다. 예: `REQ-OFFLINE-LOCAL-PERSISTENCE`
- `functional`, `non-functional`, `ux`, `architecture`, `ops`는 ID prefix가 아니라 문서와
  scope/보조 metadata가 설명한다.
- 상태와 단계는 metadata이며 file path에 넣지 않는다.

## 조회 방법

요구사항 전체를 직접 열지 말고 필요하면 인덱스 스크립트를 사용한다.

```sh
node scripts/requirements-index.mjs
node scripts/requirements-index.mjs --status done
node scripts/requirements-index.mjs --category backlog
node scripts/requirements-index.mjs --scope frontend --taskability ambiguous
node scripts/requirements-index.mjs --id CE-05-RICH-PREVIEW
```

`package.json` script도 제공한다.

```sh
pnpm requirements:index -- --category backlog
```

## 다른 문서와의 관계

- `docs/compliance/feature-acceptance-map.md`는 기능별 사용자 행동 확인 지도를 설명한다.
- `docs/product/README.md`는 product surface를 mapping한다.
- `docs/domain/README.md`는 domain language와 contract를 소유한다.
- `docs/adr/`는 decision과 tradeoff를 소유한다.
- `tasks/exec-plan/**`는 실행 계획을 소유한다.
- `tasks/**`는 실제 작업 단위를 소유한다.
