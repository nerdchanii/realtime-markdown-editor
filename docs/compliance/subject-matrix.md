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
| `CE-01-CONCURRENT-EDITING` | 2명 이상이 동일한 Markdown 문서를 동시에 편집할 수 있어야 한다. | 하나의 workspace document에서 여러 client가 수렴하는지 증명한다. | 두 browser session이 서로 다른 위치를 편집하고 manual refresh 없이 같은 내용으로 수렴한다. | `docs/product/editor/concurrent-editing.md` | `REQ-COLLAB-ENGINE-ADAPTER`, `REQ-WORKSPACE-DOCUMENT-SCOPE` | ADR-0001, ADR-0002, final sync ADR |
| `CE-02-PRESENCE` | 타 사용자의 cursor 위치와 selection range가 realtime으로 보여야 한다. | member identity가 붙은 remote awareness를 증명한다. | cursor 이동과 selected range가 member name/color와 함께 표시된다. | `docs/product/editor/presence.md` | `REQ-PRESENCE-MEMBER-AWARENESS`, `REQ-IDENTITY-MEMBERSHIP` | ADR-0001, ADR-0005 |
| `CE-03-OFFLINE-MERGE` | network 단절 후 reconnect 시 local edits와 server state가 자동 병합되어야 한다. | 열린 editor에서 offline edit 후 reconnect convergence를 증명한다. | 한 client가 offline 상태에서 편집하고, reconnect 후 local/remote 고유 텍스트가 모두 남는다. | `docs/product/editor/offline-merge.md` | `REQ-OFFLINE-LOCAL-PERSISTENCE`, `REQ-OFFLINE-RECONNECT-MERGE` | ADR-0002, ADR-0003, final sync ADR |
| `CE-04-REVISION-HISTORY` | 문서 revision history를 조회할 수 있어야 한다. | autosave와 구분되는 읽을 수 있는 history를 증명한다. | reviewer가 checkpoint/history 목록을 보고 이전 content snapshot을 연다. | `docs/product/editor/history.md` | `REQ-HISTORY-CHECKPOINTS`, `REQ-HISTORY-AUTOSAVE-SEPARATION` | ADR-0003, ADR-0004 |
| `CE-05-RICH-PREVIEW` | Markdown rich preview를 제공해야 한다. | Markdown을 작성하고 제품 안에서 rendering할 수 있음을 증명한다. | Rich 또는 Split view가 heading, code, list, table, link를 포함한 현재 Markdown을 rendering한다. | `docs/product/editor/rich-preview.md` | `REQ-EDITOR-RICH-SOURCE-SPLIT`, `REQ-MARKDOWN-PORTABILITY` | ADR-0002, ADR-0005 |

## 산출물 충족 지도

| 요구 | 충족 의도 | 필요한 증거 |
| --- | --- | --- |
| 소스 제출 | source와 docs를 포함하되 generated dependency/build artifact는 제외한다. | `.gitignore`와 최종 tree에서 `node_modules`와 generated build output이 제외된다. |
| 아키텍처와 결정 기록 | sync choice와 free-area tradeoff를 문서화한다. | ADR에 POC ADR, POC 이후 final sync ADR, storage, lifecycle, UI scope decision이 포함된다. |
| 로컬 실행 안내 | reviewer가 local에서 실행하고 seeded/mock identity를 이해할 수 있다. | root guide 또는 how-to 성격 문서가 install, run, seeded/mock users, review scenario를 설명한다. |

## 스켈레톤 순서

첫 product skeleton은 깊은 제품 확장보다 CE path를 우선한다.

1. POC로 collaboration engine을 선택하거나 검증한다.
2. CE-01부터 CE-05까지 가장 얇은 end-to-end editor path를 만든다.
3. CE 검증을 숨기지 않는 선에서 workspace/product context를 붙인다.
4. Properties, links/backlinks, DocumentState foundation 같은 product extension을 붙인다.
