---
title: docs/domain/rules/document-lifecycle.md
status: active
---

# docs/domain/rules/document-lifecycle.md

## 규칙

- Editing sync와 user-visible checkpoint history는 분리한다.
- Autosave/sync state는 product behavior가 명시적으로 요구하지 않는 한 checkpoint를 만들지 않는다.
- `DocumentState`는 sync status와 checkpoint history와 분리한다.
- `saved`는 document workflow state이며 모든 client에 pending local edits가 없다는 증거가 아니다.
- `review`는 현재 제품 범위에서 저장 전 필수 gate가 아니다.
- 현재 제품 범위에서는 `draft`, `review`, `saved` 사이의 direct state change를 허용한다.
- Document delete는 현재 제품 범위에서 hard delete가 아니라 `archivedAt`을 설정하는 soft delete다.
- Archived document는 normal workspace navigation과 folder children 결과에서 제외한다.
- Workspace Trash는 archived documents를 별도 API에서 조회한다.
- Restore는 원래 folder path가 active일 때만 `archivedAt`을 지운다. Parent folder가 삭제된 document
  restore는 folder restore/target selection requirement가 생기기 전까지 실패해야 한다.
- Restore는 Markdown body, properties, revisions, checkpoints, artifacts, links/backlinks metadata를
  변경하지 않는다.
- Future workflow hooks는 raw editor keystrokes가 아니라 명시적인 `DocumentState` change에 붙는다.
  - (목표, [ADR-0017](../../adr/0017-document-workflow-triggers-and-executor.md) accepted, 아직 구현 전) 워크플로우 hook, 전환 권한, 실행기로 승격했다. 전환은 `document.state.change` 권한으로 제한하고, `DocumentState` 는 Y.Doc 밖(DB)에 두며, 변경은 API use case 로만 한다.
- 현재 제품 범위에서 `DocumentState`는 `Document`가 가진 value/state로 구현하고 별도 aggregate로 키우지 않는다.

## MVP 경계

현재 제품 범위에는 checkpoint/history와 sync state가 필요하다. Workflow hook, transition guard,
publish/draft visibility, ownership-based visibility, workflow executor, visual state-machine editor는
별도 product requirement로 승격될 때 결정한다.
