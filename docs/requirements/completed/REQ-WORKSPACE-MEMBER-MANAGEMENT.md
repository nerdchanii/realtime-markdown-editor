---
id: REQ-WORKSPACE-MEMBER-MANAGEMENT
title: Workspace member를 추가, 수정, 제거할 수 있어야 한다.
status: done
category: product-foundation
type: functional
priority: high
taskability: done
scope: workspace
derived_from: REQ-IDENTITY-MEMBERSHIP
depends_on:
  - REQ-IDENTITY-MEMBERSHIP
blocks: []
next_step: done
refs:
  - docs/product/workspace/user-membership.md
  - docs/domain/relations/user-workspace.md
  - tasks/archive/TASK-074-auth-session-owner-member-authorization.md
---

# REQ-WORKSPACE-MEMBER-MANAGEMENT

Workspace collaboration은 seeded member만으로는 제품 흐름이 부족하다. Workspace owner는 normal
product UI에서 member를 추가하고, owner/member 역할을 관리하고, 더 이상 접근하면 안 되는 member를
제거할 수 있어야 한다.

이 요구사항은 CE stories가 실제 사용자에게 성립하기 위한 세부 제품 요구사항이다. CE-01부터 CE-04까지의
collaboration, presence, history는 workspace member가 누구인지와 접근 가능한 document가 무엇인지
신뢰할 수 있어야 완료된다.

Acceptance:

- Workspace owner는 user를 workspace member로 추가하거나 초대할 수 있다.
- Workspace owner는 member role을 owner/member 범위 안에서 변경할 수 있다.
- Workspace owner는 member를 제거할 수 있으며 제거된 member는 해당 workspace document,
  checkpoint, collaboration session에 접근할 수 없다.
- 자기 자신을 제거하거나 마지막 owner를 제거하는 등 workspace를 잠그는 action은 방지된다.
- Presence와 checkpoint authorship은 변경된 membership state를 사용한다.

Evidence:

- `POST /workspaces/:workspaceId/members` adds an existing product account as a workspace member.
- `PATCH /workspaces/:workspaceId/members/:memberId` changes role within owner/member scope
  (`editor` wire role maps to product member role).
- `DELETE /workspaces/:workspaceId/members/:memberId` soft-removes membership by setting `removedAt`.
- Auth sessions, workspace APIs, checkpoint APIs, and collaboration session issuance only consider active
  memberships.
- Workspace settings UI lists members, adds existing accounts, changes role, and removes non-self members.
- `e2e/product-workspace-members.spec.ts` covers add, promote, member access, removal, and revoked access.
