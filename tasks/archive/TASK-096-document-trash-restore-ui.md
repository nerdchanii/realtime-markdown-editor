---
title: TASK-096-document-trash-restore-ui
status: archived
phase: auto-20260502-1040-document-trash-restore-ui
task_type: implementation
task_mode: blocking
owner: codex
depends_on:
  - TASK-095
write_set:
  - apps/web/src/features/workspace/index.tsx
  - apps/web/src/features/workspace/types.ts
  - apps/web/src/app/product-workspace-navigation.ts
  - apps/web/src/app/product-workspace-view-model.ts
  - apps/web/src/app/product-workspace-providers.ts
  - apps/web/src/styles/global.css
  - e2e/product-trash-restore.spec.ts
  - docs/requirements/registry.md
  - docs/requirements/items/REQ-DOCUMENT-TRASH-RESTORE.md
  - docs/requirements/completed/REQ-DOCUMENT-TRASH-RESTORE.md
  - docs/product/ui-capability-gap-log.md
  - tasks/exec-plan/auto-20260502-1040-document-trash-restore-ui.md
  - tasks/archive/TASK-096-document-trash-restore-ui.md
forbidden_paths:
  - .note/**
  - README.md
related_requirements:
  - REQ-DOCUMENT-TRASH-RESTORE
  - REQ-WORKSPACE-LIFECYCLE-MANAGEMENT
review_required: true
---

# TASK-096: Document Trash Restore UI

## 목표

Close `REQ-DOCUMENT-TRASH-RESTORE` by exposing document Trash and restore in the product workspace
navigation UI.

## 배경

- `TASK-095` added product HTTP contracts and API behavior for workspace Trash list and document
  restore.
- `REQ-DOCUMENT-TRASH-RESTORE` still required product UI wiring and e2e evidence before it could be
  completed.
- `UI-GAP-008` tracked the inactive Trash surface.

## 범위

### 포함

- Add workspace navigation view-model callbacks for listing archived documents and restoring a
  document.
- Wire product providers to `fetchArchivedDocuments` and `restoreDocument`.
- Add a left navigation Trash panel with loading, empty, error, refresh, and restore states.
- Add product e2e coverage for delete, Trash listing, restore, and active navigation reappearance.
- Move `REQ-DOCUMENT-TRASH-RESTORE` to completed requirements.
- Close `UI-GAP-008`.

### 제외

- Folder Trash/restore.
- Hard delete or purge retention controls.
- Restore-to-different-folder behavior.
- Workspace/member lifecycle changes.

## 계약과 의존성

| Task       | Mode       | Depends on | Unlocks | Notes                                    |
| ---------- | ---------- | ---------- | ------- | ---------------------------------------- |
| `TASK-096` | `blocking` | `TASK-095` | done    | Frontend/product e2e closeout for Trash. |

- 안정 contract: `TASK-095` Trash APIs.
- mock 허용 여부: e2e uses product DB seed helpers and product session auth.

## 인수 조건

- Product UI can open Trash from workspace navigation.
- Archived documents are listed in the Trash panel.
- Restore removes the document from Trash, reopens it in the editor, and returns it to active
  navigation.
- Requirement metadata is `status: done` and `taskability: done`.
- Registry lists the requirement under completed requirements.

## 검증

- 실행 명령: `scripts/with-node.sh pnpm --filter @rme/web typecheck`
- 결과: pass.
- 실행 명령: `scripts/with-node.sh pnpm --filter @rme/web test`
- 결과: pass.
- 실행 명령:
  `DATABASE_URL=<local test db> COLLAB_PORT=4001 RME_COLLAB_PORT=4001 scripts/with-node.sh pnpm test:e2e -- e2e/product-trash-restore.spec.ts`
- 결과: pass. Initial e2e attempts caught assertion issues in the test itself; final run passed and
  verifies delete, hidden active navigation, Trash listing, restore, active navigation reappearance,
  and editor content.
- 실행 명령: `scripts/with-node.sh pnpm requirements:index`
- 결과: pass. `REQ-DOCUMENT-TRASH-RESTORE` is indexed from
  `docs/requirements/completed/REQ-DOCUMENT-TRASH-RESTORE.md` as `done`.
- 실행 명령: `scripts/with-node.sh pnpm format:check`
- 결과: pass.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 보통.
- Boundary review 필요 여부: 낮음. Backend contract/API changes were already isolated in
  `TASK-095`.
- Orchestration guardrail 확인: `.note/**` and pre-existing `README.md` changes are not touched.

## Follow-up

- `REQ-WORKSPACE-LIFECYCLE-MANAGEMENT` still needs broader workspace/project lifecycle parity.
- Folder Trash/restore remains outside this requirement.

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`에 기록했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
- [x] 관련 product quality gate 결과 또는 follow-up을 기록했다.
- [x] follow-up 또는 blocker를 기록했다.
