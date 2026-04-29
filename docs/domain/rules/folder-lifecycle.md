---
title: docs/domain/rules/folder-lifecycle.md
status: active
---

# docs/domain/rules/folder-lifecycle.md

## 목적

Folder lifecycle 규칙은 ADR-0006의 filesystem-like workspace hierarchy를 구현할 때 root folder, regular/inbox folder, contained document가 같은 delete/restore 언어를 사용하도록 정리한다.

## Soft Delete

- `workspaceRoot`와 `projectRoot` folder는 soft delete 대상이 아니다.
- `regular`와 `inbox` folder는 soft delete할 수 있다.
- Soft-deleted folder는 contained descendant folder와 document를 navigation과 lifecycle view에서 함께 숨긴다.
- Soft delete는 contained document identity와 checkpoint metadata identity를 즉시 제거하지 않는다.
- Soft delete된 document는 일반 navigation에서 보이지 않는다.

## Restore

- Folder restore는 같은 subtree를 복구한다.
- Restore 대상 folder의 원래 parent가 hard delete되었거나 접근 불가능하면 restore use case가 target parent를 명시해야 한다.
- 같은 parent scope 안에 같은 이름/path conflict가 있으면 restore use case가 conflict를 먼저 해결해야 한다.
- Restore는 folder identity와 contained document identity를 유지한다.

## Hard Delete

- Hard delete는 soft delete 이후 30일 retention window가 지난 뒤 가능하다.
- `workspaceRoot`와 `projectRoot` folder는 hard delete 대상이 아니다.
- `regular`와 `inbox` folder hard delete는 해당 folder subtree의 regular/inbox descendant와 contained document에 cascade된다.
- Document hard delete는 product에서 document metadata, properties, checkpoint metadata, derived link projection을 더 이상 조회할 수 없게 제거한다.
- 관련 object artifact 삭제는 storage adapter cleanup job으로 예약한다. Domain rule은 artifact provider나 object storage provider를 알지 않는다.

## 검증 규칙

- Root folder move/delete 요청은 거부되어야 한다.
- Folder를 자기 자신이나 descendant 아래로 이동하는 요청은 거부되어야 한다.
- Soft-deleted folder subtree는 default navigation query에 나타나면 안 된다.
- Restore conflict는 암묵적으로 덮어쓰지 않고 use case result로 드러나야 한다.
- 30일 retention이 지나기 전 hard delete 요청은 거부되어야 한다.
