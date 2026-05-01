---
id: REQ-DEFERRED-PRODUCTION-AUTH-ACCOUNT-MANAGEMENT
title: Enterprise auth provider와 advanced account administration을 도입한다.
status: deferred
category: backlog
type: functional
taskability: blocked
scope: ops
derived_from: REQ-IDENTITY-MEMBERSHIP
depends_on:
  - REQ-IDENTITY-MEMBERSHIP
  - REQ-PRODUCTION-ACCOUNT-MANAGEMENT
blocks: []
superseded_by:
  - REQ-PRODUCTION-ACCOUNT-MANAGEMENT
next_step: 기본 product login/account flow가 구현된 뒤 enterprise provider, SSO, SCIM, account administration 범위를 ADR로 승격한다.
refs:
  - docs/product/workspace/user-membership.md
  - README.md
---

# REQ-DEFERRED-PRODUCTION-AUTH-ACCOUNT-MANAGEMENT

기본 product login/account management는 `REQ-PRODUCTION-ACCOUNT-MANAGEMENT`로 승격했다.
이 backlog 항목은 enterprise identity provider, SSO, SCIM, organization-level account administration처럼
기본 로그인 이후의 운영 범위만 추적한다.
