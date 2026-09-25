---
title: docs/compliance/feature-acceptance-map.md
status: active
---

# docs/compliance/feature-acceptance-map.md

## 목적

이 문서는 제품 기능이 어떤 사용자 행동으로 확인되는지 정리한다. 제품 설명의 중심은 요구사항 번호가
아니라, 워크스페이스 안에서 문서를 만들고 함께 편집하는 흐름이다.

## 기능별 확인 지도

| 기능 | 사용자 행동 | 확인 방법 | product surface |
| --- | --- | --- | --- |
| 동시 문서 편집 | 여러 구성원이 같은 Markdown 문서를 열고 각자의 내용을 작성한다. | 서로 다른 세션의 입력이 수동 새로고침 없이 같은 문서에 수렴한다. | `docs/product/editor/concurrent-editing.md` |
| 구성원 presence | 작성 중인 구성원의 커서와 선택 영역을 문서 위에서 확인한다. | 원격 구성원의 이름, 색상, 선택 영역이 현재 문서 맥락에 표시된다. | `docs/product/editor/presence.md` |
| 오프라인 복구와 재연결 병합 | 연결이 끊긴 동안 작성한 내용을 다시 연결했을 때 잃지 않는다. | 오프라인 입력과 온라인 입력이 재연결 후 함께 남고, 브라우저 종료 뒤에도 임시 저장본을 복구한다. | `docs/product/editor/offline-merge.md` |
| 문서 이력 | 중요한 변경 시점의 체크포인트를 만들고 이전 내용을 읽는다. | 이력 패널에서 체크포인트를 선택해 읽기 전용 snapshot을 확인한다. | `docs/product/editor/history.md` |
| 리치 Markdown 작성 | Markdown 문서를 리치 에디터에서 직접 작성하고 내보낸다. | heading, list, inline code, image, undo/redo, Markdown export가 같은 작성 흐름에서 동작한다. | `docs/product/editor/rich-preview.md` |
| 워크스페이스 탐색 | 프로젝트, 폴더, 문서 구조 안에서 작업 대상을 선택한다. | navigation tree와 editor context가 같은 workspace/document를 가리킨다. | `docs/product/workspace/workspace-hierarchy.md` |
| 계정과 멤버십 | 계정으로 로그인하고 workspace member로 문서에 접근한다. | session, current member, workspace membership이 계정 UI와 문서 작업에 연결된다. | `docs/product/workspace/user-membership.md` |

## 제품 흐름

1. 사용자는 계정으로 로그인한다.
2. 워크스페이스와 프로젝트 안에서 문서를 선택하거나 만든다.
3. 에디터에서 문서를 작성하고, 다른 구성원의 presence를 확인한다.
4. 연결 상태가 바뀌어도 작성 중인 내용을 보존한다.
5. 필요한 시점에 체크포인트를 만들고 이전 내용을 확인한다.
6. 문서 속성, 링크, 백링크, Markdown export로 문서의 사용 맥락을 확장한다.
