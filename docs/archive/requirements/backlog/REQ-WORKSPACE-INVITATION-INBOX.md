---
id: REQ-WORKSPACE-INVITATION-INBOX
title: 사용자는 account-level surface에서 pending workspace invitations를 확인하고 수락할 수 있다.
status: candidate
category: backlog
type: functional
taskability: ambiguous
scope: workspace
derived_from:
  - REQ-WORKSPACE-MEMBER-MANAGEMENT
  - REQ-PRODUCTION-ACCOUNT-MANAGEMENT
depends_on:
  - REQ-WORKSPACE-MEMBER-MANAGEMENT
  - REQ-PRODUCTION-ACCOUNT-MANAGEMENT
blocks: []
next_step: invitation domain model, token policy, email-based pending invite matching, accept/decline API를 정의한다.
refs:
  - docs/product/workspace/user-membership.md
  - docs/domain/relations/user-workspace.md
  - docs/requirements/items/REQ-WORKSPACE-MEMBER-MANAGEMENT.md
  - docs/requirements/items/REQ-PRODUCTION-ACCOUNT-MANAGEMENT.md
---

# REQ-WORKSPACE-INVITATION-INBOX

이미 가입된 사용자는 가입 후 onboarding flow를 다시 타지 않는다. 따라서 다른 organization
workspace에서 초대를 받았을 때, 현재 workspace 안의 화면에 갇히지 않고 pending invitations를
확인하고 수락할 수 있는 account-level surface가 필요하다.

Acceptance candidate:

- 로그인한 사용자는 account-level invitation inbox 또는 workspace switcher에서 pending workspace
  invitations를 볼 수 있다.
- Pending invitation은 workspace name, inviter 또는 organization context, 제안된 role을 보여준다.
- 사용자는 invitation을 accept 또는 decline할 수 있다.
- Accept는 서버가 invitation token/email/user policy를 검증한 뒤 workspace membership을 생성한다.
- Decline한 invitation은 같은 사용자에게 pending 상태로 계속 노출되지 않는다.
- Direct invite link와 invitation inbox accept는 같은 backend acceptance path를 사용한다.
- 사용자가 현재 어떤 workspace membership도 가지고 있지 않아도 invitation inbox 또는 invite accept
  page에 접근할 수 있다.
- Invitation token이나 frontend state는 workspace authorization을 우회하지 않는다.

Open decisions:

- Invitation을 email 기준으로 묶을지, user id 기준으로 묶을지, 가입 전 invitation을 어떻게 claim할지
  결정해야 한다.
- Invitation token 만료, 재전송, revoke 정책을 정의해야 한다.
- 여러 workspace invitation을 동시에 받은 사용자의 default landing과 notification surface를 정해야
  한다.
