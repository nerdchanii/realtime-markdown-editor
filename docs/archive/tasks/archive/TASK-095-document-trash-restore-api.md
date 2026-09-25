---
title: TASK-095-document-trash-restore-api
status: archived
phase: auto-20260502-1015-document-trash-restore-api
task_type: implementation
task_mode: blocking
owner: codex
depends_on:
  - TASK-092
write_set:
  - packages/contracts/src/http/index.ts
  - packages/contracts/src/http/routes.ts
  - packages/contracts/src/http/schemas.ts
  - apps/api/src/modules/documents/ports/document-product-repository.ts
  - apps/api/src/modules/documents/use-cases/document-product-service.ts
  - apps/api/src/modules/documents/interfaces/documents-product.controller.ts
  - apps/api/src/modules/documents/interfaces/documents-product.controller.smoke.ts
  - apps/api/src/modules/documents/adapters/prisma-document-product-repository.ts
  - apps/web/src/lib/api-client/index.ts
  - docs/domain/rules/document-lifecycle.md
  - docs/requirements/items/REQ-DOCUMENT-TRASH-RESTORE.md
  - docs/product/ui-capability-gap-log.md
  - tasks/exec-plan/auto-20260502-1015-document-trash-restore-api.md
  - tasks/archive/TASK-095-document-trash-restore-api.md
forbidden_paths:
  - .note/**
  - README.md
related_requirements:
  - REQ-DOCUMENT-TRASH-RESTORE
  - REQ-WORKSPACE-LIFECYCLE-MANAGEMENT
  - REQ-WORKSPACE-DOCUMENT-SCOPE
review_required: true
---

# TASK-095: Document Trash Restore API

## 목표

Add canonical product API support for listing archived documents and restoring a soft-deleted
document.

## 배경

- `REQ-DOCUMENT-TRASH-RESTORE` notes that documents already use `archivedAt` for soft deletion.
- Existing delete behavior hides archived documents from normal navigation, but there was no
  product route to list Trash contents or restore an archived document.
- UI wiring remains separate because the product sidebar Trash entry is not yet connected to a
  workflow.

## 범위

### 포함

- Add `ArchivedDocumentDto` and `ListArchivedDocumentsResponseDto`.
- Add canonical routes:
  - `GET /workspaces/:workspaceId/trash/documents`
  - `POST /documents/:documentId/restore`
- Implement service/repository/controller behavior.
- Preserve session/member authorization through existing product access guards.
- Add API client helpers for the new routes.
- Add smoke coverage for delete, Trash listing, restore, and active list reappearance.
- Record domain restore policy and update requirement/gap tracking.

### 제외

- Product Trash UI.
- Folder restore or restore-to-new-target behavior.
- Hard delete and retention purge behavior.
- New authorization roles beyond existing workspace membership access.

## 계약과 의존성

| Task       | Mode       | Depends on | Unlocks       | Notes                        |
| ---------- | ---------- | ---------- | ------------- | ---------------------------- |
| `TASK-095` | `blocking` | `TASK-092` | Trash UI task | Backend/contract slice only. |

- 안정 contract: Document soft delete remains `archivedAt`.
- mock 허용 여부: smoke test uses in-memory repository only at controller boundary.

## 인수 조건

- Archived documents can be listed through a workspace-scoped product route.
- Active folder document lists continue to exclude archived documents.
- Restore clears archive state and returns the full document response.
- Restore preserves document content and properties.
- Restore fails if the archived document is missing or its original folder path is inactive.
- New routes are represented in the contracts and runtime schema catalog.

## 검증

- 실행 명령: `scripts/with-node.sh pnpm --filter @rme/contracts typecheck`
- 결과: pass.
- 실행 명령: `scripts/with-node.sh pnpm --filter @rme/api typecheck`
- 결과: pass.
- 실행 명령: `scripts/with-node.sh pnpm --filter @rme/api test`
- 결과: pass. Initial sandboxed run failed because `tsx` could not open its IPC pipe; rerun outside
  the sandbox passed 57 tests.
- 실행 명령: `scripts/with-node.sh pnpm requirements:index`
- 결과: pass. `REQ-DOCUMENT-TRASH-RESTORE` remains indexed as an open product-foundation
  requirement with UI wiring recorded as the next step.
- 실행 명령: `scripts/with-node.sh pnpm format:check`
- 결과: pass.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 보통.
- Boundary review 필요 여부: 보통. Contracts, API service, repository, and web API client changed.
- Orchestration guardrail 확인: `.note/**` and pre-existing `README.md` changes are not touched.

## Follow-up

- Wire sidebar Trash to `fetchArchivedDocuments`.
- Add restore action in the product UI using `restoreDocument`.
- Add product e2e evidence for delete, Trash list, restore, and normal navigation reappearance.

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`에 기록했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
- [x] 관련 product quality gate 결과 또는 follow-up을 기록했다.
- [x] follow-up 또는 blocker를 기록했다.
