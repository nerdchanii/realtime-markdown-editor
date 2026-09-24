---
id: REQ-WORKSPACE-LIFECYCLE-MANAGEMENT
title: Workspace와 하위 project/folder/document lifecycle을 제품 UI에서 추가, 수정, 삭제할 수 있어야 한다.
status: done
category: product-foundation
type: functional
priority: high
taskability: done
scope: workspace
derived_from: REQ-WORKSPACE-HIERARCHY
depends_on:
  - REQ-WORKSPACE-HIERARCHY
blocks: []
next_step: done
refs:
  - docs/product/workspace/workspace-hierarchy.md
  - packages/contracts/src/http/routes.ts
  - tasks/archive/TASK-075-workspace-folder-document-product-apis.md
  - tasks/archive/TASK-098-workspace-project-lifecycle-settings.md
  - tasks/archive/TASK-100-workspace-first-workspace-create.md
---

# REQ-WORKSPACE-LIFECYCLE-MANAGEMENT

Workspace hierarchy는 탐색만 가능하면 부족하다. 사용자는 normal product UI에서 workspace,
project, folder, document를 만들고 이름/metadata를 수정하고 삭제 또는 archive할 수 있어야 한다.

이 요구사항은 협업 문서 product story를 실제 사용자에게 성립시키는 세부 제품 요구사항이다. 사용자가
문서를 만들고, 찾고, 상태를 이해하고, 삭제/보존 정책을 신뢰할 수 있어야 협업 editor path가 제품으로
성립한다.

Acceptance:

- Workspace 생성, 이름/metadata 수정, 삭제 또는 archive 정책이 product UI와 API에서 일관되게 제공된다.
- Project, folder, document의 create/update/move/delete flow가 workspace navigation과 연결된다.
- Root folder처럼 삭제하면 안 되는 structural node는 UI와 API 양쪽에서 보호된다.
- 삭제 또는 archive 같은 destructive action은 사용자가 의도적으로 확인해야 한다.
- 생성, 수정, 삭제 결과는 creator-only local state가 아니라 product state로 반영된다.

## Completion Evidence

`TASK-098` exposes the existing workspace/project product APIs through normal settings flows:
workspace rename, project creation, and active project rename are available from the profile-menu
settings dialog. Explorer now shows project group headers so created or renamed projects are visible
as product state. `TASK-100` makes account-only sessions possible before a user has any workspace
membership and replaces the no-workspace placeholder with a product form that creates the user's
first workspace through the existing API.

Folder create/rename/move/delete, document create/title edit/move/archive/trash restore, workspace
rename, workspace create from the no-workspace state, project create, active project rename, project
archive, and workspace archive have product UI coverage.

The destructive policy is soft archive. Workspace archive clears the workspace root pointer, hides
the workspace from product sessions and workspace lists, archives contained documents, and marks
contained folders inactive. Project archive clears the project root pointer, hides the project from
workspace navigation, archives contained documents, and marks contained folders inactive. Folder
delete keeps the existing folder-tree soft-delete behavior and archives contained documents. Root
folder move/delete remains rejected by the API.

Evidence:

- `DELETE /workspaces/:workspaceId` archives a workspace through owner authorization.
- `DELETE /projects/:projectId` archives a project through workspace owner authorization.
- Explorer row controls move documents and folders through the canonical move APIs.
- Settings destructive actions use explicit browser confirmation before archive requests.
- `e2e/product-workspace-lifecycle.spec.ts` covers workspace/project rename/create, document and
  folder move, folder delete into Trash, project archive, and workspace archive.
- `e2e/product-trash-restore.spec.ts` covers document archive listing and restore.
