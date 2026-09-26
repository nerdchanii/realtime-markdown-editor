---
title: docs/domain/models/user.md
status: active
---

# docs/domain/models/user.md

## 계약

`User`는 계정을 가진 사람을 나타낸다. `WorkspaceMembership`은 해당 user가 한 workspace 안에서 갖는 identity다.

- (목표, ADR-0012) 계정 없이 local 범위를 쓰는 사람은 `User` 가 아니라 `LocalUser` principal 이다. 로그인하거나 승격할 때 `User` 에 연결된다. 자세한 내용은 `docs/domain/models/principal.md` 에 있다.

## 책임

- Account/auth 작업을 위한 stable identity를 제공한다.
- 한 user가 나중에 여러 workspace에 참여할 수 있게 한다.
- Workspace-specific display detail은 membership에 둔다.
- Product session, authorship, presence identity, workspace authorization이 참조할 수 있는 신뢰
  가능한 account boundary를 제공한다.
- Workspace membership removal 이후에도 authorship/audit identity를 보존할 수 있게 한다.

## 책임이 아닌 것

- Presence color 자체. Presence color는 membership의 책임이다.
- Enterprise SSO, SCIM, organization administration 같은 advanced identity provider 운영.
- Workspace membership을 hard delete해서 과거 checkpoint/revision authorship을 지우는 것.
