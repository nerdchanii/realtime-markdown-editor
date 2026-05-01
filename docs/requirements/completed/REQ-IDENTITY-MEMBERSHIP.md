---
id: REQ-IDENTITY-MEMBERSHIP
title: User와 WorkspaceMembership은 분리된 domain concept이어야 한다.
status: done
category: subject-derived
type: architecture
taskability: done
scope: identity
derived_from: CE-02-PRESENCE, CE-04-REVISION-HISTORY
depends_on: []
blocks: []
completed_by:
  - tasks/archive/TASK-066-user-and-membership-boundary.md
  - tasks/archive/TASK-074-auth-session-owner-member-authorization.md
refs:
  - docs/product/workspace/user-membership.md
  - docs/domain/models/user.md
---

# REQ-IDENTITY-MEMBERSHIP

Presence와 checkpoint authorship은 temporary local label이 아니라 workspace member를 참조할 수 있다.
