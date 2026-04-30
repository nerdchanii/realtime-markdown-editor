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

이 문서는 `subject.md` 충족 여부를 추적하는 최상위 평가 지도다. 구현 완료를 주장하는 문서가 아니라, 과제를 충족했다고 말하려면 어떤 증거가 있어야 하는지를 정의한다.

## 과제 요구사항 충족 지도

| 과제 ID | 원문 요구 | 충족 의도 | 필요한 증거 | product surface | 관련 요구사항 | 관련 ADR |
| --- | --- | --- | --- | --- | --- | --- |
| `CE-01-CONCURRENT-EDITING` | 2명 이상이 동일한 Markdown 문서를 동시에 편집할 수 있어야 한다. | 하나의 workspace document에서 여러 client가 수렴하는지 증명한다. | `e2e/ce-01-concurrent-editing.spec.ts`가 `alice`와 `bob`을 같은 seeded workspace document에 열고 manual refresh 없이 양쪽 고유 텍스트 수렴을 확인한다. | `docs/product/editor/concurrent-editing.md` | `REQ-COLLAB-ENGINE-ADAPTER`, `REQ-WORKSPACE-DOCUMENT-SCOPE` | ADR-0001, ADR-0002 |
| `CE-02-PRESENCE` | 타 사용자의 cursor 위치와 selection range가 realtime으로 보여야 한다. | member identity가 붙은 remote awareness를 증명한다. | `e2e/ce-02-presence.spec.ts`가 Bob의 cursor/selection을 Alice 화면의 workspace member label과 함께 확인한다. | `docs/product/editor/presence.md` | `REQ-PRESENCE-MEMBER-AWARENESS`, `REQ-IDENTITY-MEMBERSHIP` | ADR-0001, ADR-0005 |
| `CE-03-OFFLINE-MERGE` | network 단절 후 reconnect 시 local edits와 server state가 자동 병합되어야 한다. | 열린 editor에서 offline edit 후 reconnect convergence를 증명한다. | `e2e/ce-03-offline-merge.spec.ts`가 한 client의 offline edit와 다른 client의 online edit가 reconnect 후 모두 남는지 확인한다. | `docs/product/editor/offline-merge.md` | `REQ-OFFLINE-LOCAL-PERSISTENCE`, `REQ-OFFLINE-RECONNECT-MERGE` | ADR-0002, ADR-0003 |
| `CE-04-REVISION-HISTORY` | 문서 revision history를 조회할 수 있어야 한다. | autosave와 구분되는 읽을 수 있는 history를 증명한다. | `e2e/ce-04-history.spec.ts`가 checkpoint를 만들고 history 목록에서 선택한 뒤 read-only Markdown snapshot을 확인한다. | `docs/product/editor/history.md` | `REQ-HISTORY-CHECKPOINTS`, `REQ-HISTORY-AUTOSAVE-SEPARATION` | ADR-0003, ADR-0004 |
| `CE-05-RICH-PREVIEW` | Markdown rich preview를 제공해야 한다. | Markdown 문서를 rich-rendered editor surface에서 직접 작성할 수 있음을 증명한다. | `e2e/ce-05-rich-preview.spec.ts`가 TipTap rich editor에서 heading, list, inline code를 rendering하고 Markdown export path가 같은 body를 보존하는지 확인한다. | `docs/product/editor/rich-preview.md` | `REQ-EDITOR-RICH-AUTHORING-SURFACE`, `REQ-MARKDOWN-PORTABILITY` | ADR-0002, ADR-0005, ADR-0007 |

## 산출물 충족 지도

| 요구 | 충족 의도 | 필요한 증거 |
| --- | --- | --- |
| 소스 제출 | source와 docs를 포함하되 generated dependency/build artifact는 제외한다. | `.gitignore`와 최종 tree에서 `node_modules`와 generated build output이 제외된다. |
| 아키텍처와 결정 기록 | sync choice와 free-area tradeoff를 문서화한다. | ADR에 POC 결과 기반 sync choice, storage, lifecycle, UI scope decision이 포함된다. |
| 로컬 실행 안내 | reviewer가 local에서 실행하고 seeded/mock identity를 이해할 수 있다. | `README.md`가 install, run, reviewer URL, seeded `alice`/`bob`, CE scenario order, included/deferred product surface를 설명한다. |

## 통합 reviewer flow 증거

`e2e/task-045-reviewer-flow.spec.ts`는 workspace navigation에서 seeded document를 열고,
properties/backlinks, TipTap rich editor, checkpoint snapshot, Markdown export를 한 reviewer path에서
확인한다. 이 통합 spec은 CE-01부터 CE-05의 개별 acceptance를 대체하지 않고, 제품 확장 surface가 CE
검증 경로를 숨기지 않는다는 보조 증거다.

## 스켈레톤 순서

첫 product skeleton은 깊은 제품 확장보다 CE path를 우선한다.

1. POC로 collaboration engine을 선택하거나 검증한다.
2. CE-01부터 CE-05까지 가장 얇은 end-to-end editor path를 만든다.
3. CE 검증을 숨기지 않는 선에서 workspace/product context를 붙인다.
4. Properties, links/backlinks, DocumentState foundation 같은 product extension을 붙인다.
