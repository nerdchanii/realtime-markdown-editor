---
title: TASK-087-workspace-member-lifecycle-gap-inventory
status: archived
phase: P11
task_type: contract
task_mode: blocking
owner: unassigned
depends_on:
  - TASK-083
write_set:
  - tasks/todo/TASK-087-workspace-member-lifecycle-gap-inventory.md
  - tasks/active/TASK-087-workspace-member-lifecycle-gap-inventory.md
  - tasks/archive/TASK-087-workspace-member-lifecycle-gap-inventory.md
forbidden_paths:
  - .note/**
  - apps/**
  - packages/**
  - docs/requirements/items/**
  - docs/product/**
related_requirements:
  - REQ-WORKSPACE-LIFECYCLE-MANAGEMENT
  - REQ-WORKSPACE-MEMBER-MANAGEMENT
review_required: true
---

# TASK-087: Workspace and Member Lifecycle Gap Inventory

## 목표

Workspace/project/folder/document lifecycle과 workspace member management를 바로 구현하지 않고, 현재 API/UI/domain coverage와 gap을 먼저 inventory로 정리해 후속 task로 안전하게 쪼갠다.

## 배경

- 두 요구사항 모두 `priority: high`이고 product credibility에 중요하다.
- 하지만 workspace CRUD, member invite, role change, removal은 authorization/destructive action/domain policy가 얽혀 있어 UI 대개편과 동시에 무계획 구현하면 위험하다.
- P11에서는 구현 전 gap inventory와 task split을 만든다.

## 범위

### 포함

- Existing route/contract coverage 확인.
- Workspace, project, folder, document create/update/delete/archive coverage matrix 작성.
- Member add/invite, role change, remove, last-owner protection gap 정리.
- 후속 implementation task 후보와 write set 제안.
- 이 task 자체는 inventory-only이며 requirement item/product docs 수정은 후속 task에서 한다.

### 제외

- Production implementation.
- Invitation token/email policy implementation.
- Enterprise role model expansion.
- Owner/member 외 role expansion.
- `docs/requirements/items/**` 직접 수정.
- `docs/product/**` 직접 수정.

## 인수 조건

- Inventory 결과가 후속 task 후보와 write set을 포함한다.
- 후속 task는 destructive action, authorization, UI surface, e2e verification 단위로 쪼개진다.
- Requirement item/product docs에 반영해야 할 변경 목록이 명확히 기록된다.

## 검증

- 실행 명령: `node scripts/requirements-index.mjs --status planned`
- 기대 결과: lifecycle/member requirements remain indexed and taskable or explicitly blocked with concrete next step.
- 실행 명령: documentation review
- 기대 결과: no `.note/**` citation and no hidden implementation gap.

## Review

- Spec compliance review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`로 이동했다.
- [ ] 검증 결과를 이 문서에 기록했다.
- [ ] 필요한 공식 문서 업데이트를 완료했다.
- [ ] 관련 CE/REQ evidence 또는 follow-up을 기록했다.
