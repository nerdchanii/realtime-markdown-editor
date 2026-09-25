---
id: REQ-ACCOUNT-WORKSPACE-ONBOARDING
title: 로그인한 사용자는 organization workspace 생성 또는 참가 흐름으로 안내된다.
status: candidate
category: backlog
type: functional
taskability: ambiguous
scope: identity
derived_from:
  - REQ-PRODUCTION-ACCOUNT-MANAGEMENT
  - REQ-WORKSPACE-LIFECYCLE-MANAGEMENT
  - REQ-WORKSPACE-MEMBER-MANAGEMENT
depends_on:
  - REQ-PRODUCTION-ACCOUNT-MANAGEMENT
  - REQ-WORKSPACE-LIFECYCLE-MANAGEMENT
  - REQ-WORKSPACE-MEMBER-MANAGEMENT
blocks: []
next_step: workspace가 organization 역할을 한다는 product language를 정리하고, 신규/기존 user의 post-login routing을 정의한다.
refs:
  - docs/product/workspace/user-membership.md
  - docs/product/workspace/workspace-hierarchy.md
  - docs/domain/models/workspace.md
  - docs/requirements/items/REQ-PRODUCTION-ACCOUNT-MANAGEMENT.md
  - docs/requirements/items/REQ-WORKSPACE-LIFECYCLE-MANAGEMENT.md
  - docs/requirements/items/REQ-WORKSPACE-MEMBER-MANAGEMENT.md
---

# REQ-ACCOUNT-WORKSPACE-ONBOARDING

Workspace는 이 제품에서 organization/team context 역할을 한다. 사용자가 로그인하거나 가입한 뒤
접근 가능한 workspace가 없으면 빈 editor로 떨어뜨리지 말고, workspace를 생성하거나 초대받은
workspace에 참가하는 onboarding flow로 안내해야 한다.

Acceptance candidate:

- 로그인 성공 후 사용자가 접근 가능한 workspace membership을 가지고 있으면 workspace picker 또는
  마지막 workspace로 이동한다.
- 사용자가 접근 가능한 workspace가 없으면 workspace 생성, 초대 참가, demo 시작 같은 다음 행동을
  선택할 수 있는 onboarding surface로 이동한다.
- 사용자의 email과 일치하는 pending workspace invitation이 있으면 workspace 생성보다 invitation
  accept flow를 우선적으로 보여줄 수 있다.
- 초대 링크로 들어온 unauthenticated 사용자는 로그인/가입 후 같은 invitation accept flow로
  돌아온다.
- Workspace 참가 또는 생성 이후 사용자는 normal session + workspace membership authorization
  경로로 workspace에 진입한다.
- Onboarding은 URL member spoofing, frontend-only identity state, authorization bypass에
  의존하지 않는다.

Open decisions:

- workspace가 없는 사용자의 기본 CTA 순서: create workspace, join invitation, try demo 중 무엇을
  먼저 보여줄지 결정해야 한다.
- B2C personal workspace와 B2B organization workspace를 같은 Workspace 모델로 표현할 때 UI copy와
  default naming policy를 정해야 한다.
- 초대가 여러 개 있을 때 자동으로 invitation inbox로 보낼지, onboarding page 안에 pending invites를
  표시할지 결정해야 한다.
