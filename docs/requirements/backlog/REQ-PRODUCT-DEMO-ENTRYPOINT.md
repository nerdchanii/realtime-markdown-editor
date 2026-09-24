---
id: REQ-PRODUCT-DEMO-ENTRYPOINT
title: 로그인 없이 제품을 체험할 수 있는 demo entrypoint를 제공한다.
status: candidate
category: backlog
type: functional
taskability: ambiguous
scope: identity
derived_from:
  - REQ-PRODUCTION-ACCOUNT-MANAGEMENT
  - REQ-DEV-LOCAL-PRODUCT-SEED-DATA
depends_on:
  - REQ-PRODUCTION-ACCOUNT-MANAGEMENT
  - REQ-DEV-LOCAL-PRODUCT-SEED-DATA
blocks: []
next_step: demo session의 workspace 공유/격리, 쓰기 권한, 만료 정책, production 노출 여부를 결정한다.
refs:
  - docs/product/workspace/user-membership.md
  - docs/requirements/items/REQ-PRODUCTION-ACCOUNT-MANAGEMENT.md
  - docs/requirements/items/REQ-DEV-LOCAL-PRODUCT-SEED-DATA.md
---

# REQ-PRODUCT-DEMO-ENTRYPOINT

사용자는 계정을 만들기 전에 제품을 체험할 수 있어야 한다. Demo entrypoint는 UX상
"로그인 없이 써보기"이지만, 시스템 내부에서는 인증과 권한 경계를 우회하지 않아야 한다.

Acceptance candidate:

- 제품 소개 또는 unauthenticated landing surface는 `Try demo` 진입점을 제공할 수 있다.
- Demo entrypoint는 frontend-only identity, URL member spoofing, local React state로 사용자를
  가장하지 않는다.
- Demo access는 auth API가 발급한 temporary user, workspace membership, normal session cookie를
  통해 이뤄진다.
- Demo session 이후 모든 workspace/document/collaboration API는 기존 session + membership
  authorization 경로를 사용한다.
- Demo workspace는 seeded product data 또는 별도 provisioned demo workspace를 사용하되, normal
  runtime과 동일한 product API 경로를 사용한다.
- Demo user/session 만료와 cleanup 정책은 production 노출 전에 정의되어야 한다.

Open decisions:

- 여러 demo user가 같은 workspace를 공유할지, user별 workspace를 provision할지 결정해야 한다.
- Demo session이 쓰기 가능한지, 읽기 전용인지, user별 sandbox document만 쓸 수 있는지 결정해야
  한다.
- Development-only demo와 production public demo를 같은 endpoint로 둘지 feature flag로 나눌지
  결정해야 한다.
