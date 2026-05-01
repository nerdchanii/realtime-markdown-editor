---
title: docs/compliance/subject-matrix.md
status: active
source: subject.md
canonical_subject_ids:
  - CE-01-CONCURRENT-EDITING
  - CE-02-PRESENCE
  - CE-03-OFFLINE-MERGE
  - CE-04-REVISION-HISTORY
  - CE-05-RICH-PREVIEW
---

# docs/compliance/subject-matrix.md

## 목적

이 문서는 `subject.md`의 CE story 충족 여부를 추적하는 acceptance 지도다. 구현 완료를 주장하는
문서가 아니라, 각 story가 어떤 사용자 행동과 품질 기준으로 완료되는지를 정의한다.

CE-01부터 CE-05는 과제 요구사항을 사용자 행동 단위로 묶은 product stories다. 제품 완료를
주장하려면 각 story의 동작 증거가 관련 세부 REQ와
`docs/product/product-quality-gates.md`의 product-shaped flow, identity, authorization, data
integrity, UX coherence, runtime operability gate 위에서 성립해야 한다.

## 공통 완료 조건

모든 CE story는 다음 조건을 함께 만족해야 한다.

- 사용자가 이해할 수 있는 product flow에서 실행된다.
- current user, workspace membership, authorship, presence identity가 신뢰 가능한 product state에서
  나온다.
- 기능 내부 동작만 증명하지 않고, 사용자가 그 기능에 접근하고 사용할 수 있는 선행 조건까지 충족한다.
- product API contract와 runtime validation이 구현보다 느슨하지 않다.
- 작성 content, checkpoint, artifact, export, offline draft가 손실 없이 보존된다.
- reviewer/test helper 편의를 위해 제품 경계나 UX 품질을 낮추지 않는다.

## 과제 요구사항 충족 지도

| 과제 ID                    | 원문 요구                                                                       | 충족 의도                                                                                                                                                            | 필요한 증거                                                                                                                                                                                                                                                                                | product surface                             | 관련 요구사항                                                                                          | 관련 ADR                     |
| -------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------- |
| `CE-01-CONCURRENT-EDITING` | 2명 이상이 동일한 Markdown 문서를 동시에 편집할 수 있어야 한다.                 | 하나의 workspace document에서 여러 client가 수렴하는지 증명한다.                                                                                                     | `e2e/ce-01-concurrent-editing.spec.ts`가 product session을 가진 `alice`와 `bob`을 같은 workspace document에 열고 manual refresh 없이 양쪽 고유 텍스트 수렴을 확인한다.                                                                                                                     | `docs/product/editor/concurrent-editing.md` | `REQ-COLLAB-ENGINE-ADAPTER`, `REQ-WORKSPACE-DOCUMENT-SCOPE`                                            | ADR-0001, ADR-0002           |
| `CE-02-PRESENCE`           | 타 사용자의 cursor 위치와 selection range가 realtime으로 보여야 한다.           | member identity가 붙은 remote awareness를 증명한다.                                                                                                                  | `e2e/ce-02-presence.spec.ts`가 product session에서 발급된 Bob의 cursor/selection을 Alice 화면의 workspace member label과 함께 확인한다.                                                                                                                                                    | `docs/product/editor/presence.md`           | `REQ-PRESENCE-MEMBER-AWARENESS`, `REQ-IDENTITY-MEMBERSHIP`                                             | ADR-0001, ADR-0005           |
| `CE-03-OFFLINE-MERGE`      | network 단절 후 reconnect 시 local edits와 server state가 자동 병합되어야 한다. | 열린 product editor의 reconnect convergence를 baseline으로 증명하고, product bar는 tab/browser 종료 후 draft recovery까지 포함해 data-loss 없이 병합되는지 증명한다. | `e2e/ce-03-offline-merge.spec.ts`가 product workspace document에서 한 client의 offline edit와 다른 client의 online edit가 reconnect 후 모두 남는지 확인한다. 추가 product evidence는 same browser profile에서 offline edit가 IndexedDB에서 복구되고 reconnect 후 병합되는지 확인해야 한다. | `docs/product/editor/offline-merge.md`      | `REQ-OFFLINE-LOCAL-PERSISTENCE`, `REQ-OFFLINE-RECONNECT-MERGE`, `REQ-OFFLINE-INDEXEDDB-DRAFT-RECOVERY` | ADR-0002, ADR-0003           |
| `CE-04-REVISION-HISTORY`   | 문서 revision history를 조회할 수 있어야 한다.                                  | autosave와 구분되는 읽을 수 있는 history를 증명한다.                                                                                                                 | `e2e/ce-04-history.spec.ts`가 product auth/session과 storage-backed document를 사용해 checkpoint를 만들고, history 목록에서 선택한 뒤 read-only Markdown snapshot과 refresh 후 persistence를 확인한다.                                                                                     | `docs/product/editor/history.md`            | `REQ-HISTORY-CHECKPOINTS`, `REQ-HISTORY-AUTOSAVE-SEPARATION`                                           | ADR-0003, ADR-0004           |
| `CE-05-RICH-PREVIEW`       | Markdown rich preview를 제공해야 한다.                                          | Markdown 문서를 rich-rendered editor surface에서 직접 작성할 수 있음을 증명한다.                                                                                     | `e2e/ce-05-rich-preview.spec.ts`가 TipTap rich editor에서 heading, list, inline code, collaboration-safe undo/redo, artifact-backed image insertion, and Markdown export preservation을 확인한다.                                                                                          | `docs/product/editor/rich-preview.md`       | `REQ-EDITOR-RICH-AUTHORING-SURFACE`, `REQ-MARKDOWN-PORTABILITY`                                        | ADR-0002, ADR-0005, ADR-0007 |

## 산출물 충족 지도

| 요구                 | 충족 의도                                                                                           | 필요한 증거                                                                                                                                                                              |
| -------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 소스 제출            | source와 docs를 포함하되 generated dependency/build artifact는 제외한다.                            | `.gitignore`와 최종 tree에서 `node_modules`와 generated build output이 제외된다.                                                                                                         |
| 아키텍처와 결정 기록 | sync choice와 free-area tradeoff를 문서화한다.                                                      | ADR에 POC 결과 기반 sync choice, storage, lifecycle, UI scope decision이 포함된다.                                                                                                       |
| 로컬 실행 안내       | reviewer가 local에서 실행하고 product session bootstrap과 local reviewer identity를 이해할 수 있다. | `README.md`가 install, Postgres migration, local artifact storage, reviewer URL, local `alice`/`bob` session bootstrap, CE scenario order, included/deferred product surface를 설명한다. |

## 통합 product flow 증거

`e2e/task-045-reviewer-flow.spec.ts`는 product workspace navigation에서 reviewer document를 열고,
properties/backlinks, TipTap rich editor, checkpoint snapshot, Markdown export를 한 product path에서
확인한다. 이 통합 spec은 CE-01부터 CE-05의 개별 acceptance를 대체하지 않고, product surface가 CE
story 경로와 함께 제품 품질 gate를 통과한다는 보조 증거다.

## 제품 완성 우선순위

CE path는 제품의 핵심 협업 story다. 구현 순서는 CE를 빠르게 보이게 하는 것보다 제품 경계와 품질을
유지하는 쪽을 우선한다.

1. POC로 collaboration engine을 선택하거나 검증한다.
2. Auth, workspace membership, document scope, persistence boundary를 공통 제품 기준으로 세운다.
3. CE-01부터 CE-05까지 end-to-end editor story path를 제품 흐름 안에서 검증한다.
4. Properties, links/backlinks, DocumentState, lifecycle 같은 PM적 product interpretation을 품질
   gate에 맞춰 확장한다.
