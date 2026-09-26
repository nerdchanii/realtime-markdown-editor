---
title: docs/domain/models/principal.md
status: active
---

# docs/domain/models/principal.md

> **목표 모델 (ADR-0012 accepted, 일부 구현)**
>
> 현재 코드에는 `User` 와 `WorkspaceMembership` 만 있다. 아래 계약은 앞으로 구현할 기준이다.
>
> - 구현됨: 협업 연결 token 과 그 발급 policy 는 `User` principal 과 문서 workspace 의 멤버십으로 판정한다.
>   `authorize` 는 지금 `content.read`, `content.write` 만 다룬다(`apps/api/src/modules/identity/domain/authorization-policy.ts`).
> - 아직 없음: presence(awareness)와 작성자 신원을 서버가 principal 로 강제하는 것(협업 연결 token 은 principal 을 싣지만 client 가 awareness 신원을 직접 싣는다), `LocalUser`, `Agent`, `admin` 역할(DB 는 `owner`, `member` 두 값이다), 나머지 action 과 HTTP 경로의 policy 적용.

## 계약

`Principal` 은 읽기와 쓰기를 하는 주체다. 모든 권한 판정(`authorize(actor, action, resource)`)과 작성자 기록은
principal 을 기준으로 한다.

```text
Principal = User | LocalUser | Agent
Actor     = { principal, onBehalfOf?: User | LocalUser }
```

| Principal | 의미 | 권한 |
| --- | --- | --- |
| `User` | 계정을 가진 사람 | server 범위 workspace 에서 `WorkspaceMembership` 의 역할(owner, admin, editor, viewer)과 grant 로 판정한다. |
| `LocalUser` | 계정 없이 local 범위를 쓰는 기기 사용자. 기기마다 id 가 있다. | local 범위 workspace 의 owner 다. 로그인하거나 sync·승격할 때 `User` 에 연결되고, 작성 기록도 그 `User` 로 옮겨진다. |
| `Agent` (delegated) | 특정 사용자의 대리인으로 행동하는 AI 에이전트 | 실효 권한은 (그 사용자의 권한) ∩ (사용자가 준 scope) 다. |
| `Agent` (member) | workspace 에 등록된 독립 참여자 AI 에이전트 | `WorkspaceMembership` 으로 자기 역할을 가진다. owner 나 admin 이 등록하고 관리한다. |

## 규칙

- 모든 쓰기는 actor 를 남긴다. presence, history, audit 에서 사람과 에이전트를 구분해 보여준다.
- presence 신원은 서버가 인증된 principal 로 정한다. client 가 주장한 값은 쓰지 않는다.
- delegated agent 의 권한은 위임한 사용자의 권한을 넘을 수 없다. 사용자 권한이 줄어들면 함께 줄어든다.
- LocalUser 를 계정에 연결할 때 충돌이 있으면 자동으로 병합하지 않고 사용자에게 확인한다(G1).
- 에이전트의 편집 기본 동작(제안 모드인지 직접 편집인지)은 에이전트 참여 결정(#4)이 정한다. principal 모델은 신원과 권한만 다룬다.

## 관련 결정

- ADR-0012: 권한 policy 와 principal
- ADR-0011: local 범위와 승격
