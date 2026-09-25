---
id: ADR-0012
title: "ADR-0012: 권한은 하나의 policy 로 판정하고 사람과 에이전트를 principal 로 구분한다"
status: accepted
date: 2026-09-25
gate: G2
decided_by: user
ratified_by: user
ratified_at: 2026-09-25
reversibility: one-way
revisit_if: 조직 고객이 역할 세분화(admin, 감사자)나 외부 IdP 를 요구하면, 또는 문서 단위 공유 수요가 workspace 역할만으로 감당되지 않으면 다시 본다.
related_documents:
  - docs/direction/2026-09-24-product-direction-interview.md
  - docs/adr/0011-data-authority-by-scope.md
  - docs/domain/relations/user-workspace.md
supersedes: []
superseded_by: null
---

# ADR-0012: 권한은 하나의 policy 로 판정하고 사람과 에이전트를 principal 로 구분한다

> **accepted (2026-09-25)**
>
> - 비교안과 추천안은 에이전트가 작성했다.
> - 사용자가 두 가지를 선택했다.
>   - 역할 3개(owner/editor/viewer)에 자원 grant 를 더한다. grant 는 다음 단계에 구현한다.
>   - 에이전트 principal 을 두 유형(delegated, member)으로 둔다.
> - 아래 `[open]` 항목은 아직 결정되지 않았다.
> - 추적 Issue: #3

## 맥락

### 사용자 의도 (인터뷰 §4)

- [user] 보안 문제는 권한 모델이 지켜지지 않는 데서 출발한다. 권한 모델을 먼저 명확히 한다. 그다음 policy 에 따라 코드를 바꾼다.
- [user] 협업 규모는 소규모 팀(2~20명)과 조직 단위를 둘 다 본다.
- [user] 에이전트의 신원은 두 가지 모두 가능하다. 사용자의 대리인(delegated)일 수도, 독립 참여자(member)일 수도 있다.
- [user] 에이전트는 로컬과 서버 어디서든 실행될 수 있다. 중요한 것은 프로토콜이다.

### 현재 구현 (코드 확인, HEAD 8bcd979)

- **역할**
  - DB 역할은 `owner | member` 두 가지다.
  - owner 만 할 수 있는 일: workspace 삭제, 멤버 추가·변경·제거, project 삭제.
  - member 는 그 밖의 모든 일을 할 수 있다. 문서 삭제와 복원도 포함된다.
  - domain type 에는 `viewer` 가 있지만 요청에서 쓰면 거부된다.
- **HTTP 인증**
  - `rme_session` cookie 로 인증한다. 서버는 cookie 값의 sha256 hash 를 저장하고, TTL 은 7일이다.
  - `currentMembership` 이 정해지지 않으면 `memberships[0]` 을 쓴다.
  - access service 가 workspace 멤버십을 확인하고, project, folder, document, checkpoint 는 소속 workspace 를 따라가 확인한다.
- **정책 위반 (policy 가 없거나 모든 경로에 적용되지 않아서 생긴 것)**
  - **collab WebSocket 인증이 없다.** `onAuthenticate` 가 없다. collaboration session 응답에는 token 없이 전역 `realtimeUrl` 과 추측 가능한 `documentKey` 만 들어 있다. URL 과 key 를 알면 누구나 읽고 쓸 수 있다.
  - **internal API 인증이 없다.** `collaboration/internal/*` 에 guard 도 secret 도 없고, public API 와 같은 port 에 노출된다.
  - **archived 문서를 막지 않는다.** document access 와 projection 쓰기가 `archivedAt` 을 확인하지 않는다.
  - **workspace 간 이동을 검증하지 않는다.** 폴더를 다른 workspace 로 옮기는 것을 막지 않는다.
  - **presence 와 caret 신원을 client 가 정한다.** 서버가 검증하지 않는다. collab 쪽 현재 멤버도 `memberships[0]` 이다.
  - **HTTP 설정이 약하다.**
    - cookie 에 `Secure` 가 없다.
    - CORS 기본값이 모든 origin 을 반사하면서 credentials 를 허용한다.
    - 비밀번호 backfill migration 이 기존 계정을 `"password"` 로 설정한다.
- **없는 것**
  - 문서 단위 공유와 ACL
  - 초대
  - 에이전트, API token, service account 같은 사람이 아닌 actor

### 핵심 관찰

지금 문제는 "권한 모델이 약하다"기보다 **판정이 한 곳에 모여 있지 않다**는 데 있다. HTTP 경로는 access service
를 거치지만 WebSocket 과 internal API 는 거치지 않는다. 그래서 역할을 아무리 잘 설계해도 우회로가 남는다.
진입점(HTTP, collab WebSocket, internal, 앞으로의 에이전트 프로토콜)이 **모두 같은 policy 를 부르게 하는 것**이
모델 선택보다 먼저다.

## 후보안: 권한 단위

### A. Workspace 역할만

모든 권한을 workspace 역할(owner, editor, viewer)로 판정한다.

- **장점**: 단순하다. 검증과 감사가 쉽다.
- **단점**: "이 문서만 외부 사람과" 같은 공유를 할 수 없다. 조직에서는 workspace 가 많이 쪼개진다.

### B. Workspace 역할 + 자원 단위 grant (추천)

기본은 workspace 역할이다. 여기에 folder 나 document 단위 grant 로 권한을 **추가**할 수 있다. Notion, Google Drive 방식이다.

- **장점**
  - 소규모 팀은 A 처럼 단순하게 쓸 수 있다.
  - 조직은 공유 단위를 세분화할 수 있다.
  - 에이전트에게 특정 문서만 허용하는 데에도 같은 grant 를 쓸 수 있다.
- **단점**: 판정할 때 상속과 grant 를 계산해야 한다. 권한이 "왜 있는지" 보여주는 UX 가 필요하다.

### C. 문서 ACL 중심

모든 권한을 문서마다 정한다. workspace 는 정리용 컨테이너일 뿐이다.

- **장점**: 가장 유연하다.
- **단점**: 조직 통제와 감사가 어렵다. 소규모 팀에게는 과하다.

## 결정

### 1. 단일 policy 함수와 모든 진입점

- 권한 판정은 application 계층의 하나의 policy 로만 한다: `authorize(actor, action, resource)`.
- HTTP, collab WebSocket, internal API, 앞으로의 에이전트 프로토콜(MCP 등)이 모두 이 policy 를 부른다.
- 진입점마다 권한 로직을 복제하지 않는다.

**Collab 연결**

- API 가 collaboration session 을 발급할 때 짧은 TTL 의 **서명된 collab token** 을 준다.
  - token 은 문서, principal, 허용 action(read 또는 write)에 묶인다.
- Collab 서버는 `onAuthenticate` 에서 token 을 검증한다.
  - read 만 허용된 연결은 read-only 로 연다.
  - presence 신원은 token 의 principal 로 서버가 정한다. client 가 정하지 않는다.
- 연결이 살아 있는 동안 권한이 회수되면 연결을 끊는다. token 을 갱신할 때 policy 를 다시 판정한다.

**Internal API**

- Collab 서버와 API 사이는 서비스 자격증명(공유 secret 이나 서명된 서비스 token)으로 인증한다.
- 가능하면 public listener 와 분리한다.
- internal 호출도 대상 문서의 상태(archived 등)를 policy 로 확인한다.

### 2. 권한 단위는 B 안 (workspace 역할 + 자원 grant)

도입은 두 단계로 나눈다.

- **이번 모델에서 확정**
  - workspace 역할은 `owner`, `editor`, `viewer` 다.
  - grant 데이터 모델 모양은 `(resource, principal, role)` 이다.
- **다음 단계에 구현**
  - 문서와 folder 단위 grant(공유)
  - 초대

역할별 action 은 다음과 같다(초안).

| action | owner | editor | viewer |
| --- | --- | --- | --- |
| `content.read` (문서 열람, export, history 조회) | ✓ | ✓ | ✓ |
| `content.write` (편집, title/properties, 생성, 이동) | ✓ | ✓ | |
| `content.delete` (archive, 삭제, 복원) | ✓ | ✓ | |
| `history.checkpoint` | ✓ | ✓ | |
| `member.manage` (멤버, 역할, grant) | ✓ | | |
| `workspace.manage` (이름, 삭제) | ✓ | | |
| `agent.manage` (에이전트 등록과 권한 부여) | ✓ | | |

- archived 문서에는 `content.write` 가 거부된다. 복원은 `content.delete` 로 한다.
- 문서를 옮길 때는 원본과 대상 workspace 양쪽에서 `content.write` 가 있어야 한다. workspace 간 이동은 별도 action 으로 뺄지 열어 둔다.

### 3. Principal 은 사람과 에이전트를 구분한다

- `Principal = User | Agent`
- **delegated agent**: 특정 사용자의 대리인이다.
  - 실효 권한은 두 권한의 **교집합**이다: 사용자의 권한 ∩ 사용자가 그 에이전트에게 준 scope.
  - 사용자 권한이 줄어들면 에이전트 권한도 함께 줄어든다.
- **member agent**: workspace 에 등록된 독립 참여자다.
  - 자기 역할을 가진다. owner 가 등록하고 관리한다.
- **모든 쓰기에는 actor 가 남는다.**
  - actor 형태: `{ principal, onBehalfOf? }`
  - presence, history, audit 에서 사람과 에이전트를 구분해 보여준다.
  - 에이전트가 무엇을 기본 동작으로 하는지(제안 모드 등)는 에이전트 참여 ADR(#4)이 정한다. 이 ADR 은 신원과 권한만 정한다.

### 4. 범위별 권위와의 관계 (ADR-0011)

- **server 범위 workspace**: 서버 policy 가 유일한 판정자다. 권한 회수, 감사, 조직 통제가 여기서 성립한다.
- **local 범위 workspace**: 기기 소유자가 권위를 가진다. 공유하려면 server 범위로 승격해야 한다.
  - 그러면 local 범위의 권한 모델은 "기기 소유자 1명"으로 단순해진다.

### 5. 감사 기록

- 조직 단위를 위해 다음 행위를 append-only audit log 에 남긴다.
  - 권한 변경(역할, grant, 에이전트 등록)
  - 에이전트의 쓰기
- 조회 UI 는 나중에 만든다.

## 결정된 질문과 남은 질문

- [user] 권한 단위:
  - workspace 역할 `owner / editor / viewer` 에 자원 grant 를 더한다.
  - 문서와 folder 단위 공유(grant)는 단일 policy 와 3역할 다음 단계에 구현한다.
- [user] 에이전트 principal:
  - delegated 와 member 두 유형을 둔다.
  - delegated 의 실효 권한은 교집합 규칙을 따른다.
- [open] 문서 삭제와 복원(`content.delete`)을 editor 에게도 줄 것인가? 위 표는 현재 동작을 유지한 초안(editor 허용)이다.
- [open] admin 이나 감사자 역할을 추가할 시점. 조직 요구가 생길 때 다시 본다.
- [open] SSO 나 외부 IdP 연동 범위.

## 결과

- policy 기준으로 고칠 코드. accepted 뒤 별도 Issue 와 PR 로 진행한다.
  1. **진입점 정리**
     - collab `onAuthenticate` 와 서명된 collab token 을 도입한다.
     - internal API 에 서비스 인증을 붙이고 public listener 와 분리한다.
     - presence 신원은 서버가 정한다.
  2. **policy 적용**
     - archived 문서의 쓰기를 차단한다.
     - workspace 간 이동을 검증한다.
     - `memberships[0]` 을 암묵적으로 고르는 코드를 없앤다.
     - `viewer` 역할을 실제로 지원한다.
  3. **HTTP 설정**
     - production 에서 cookie `Secure` 를 켠다.
     - CORS 는 기본 거부로 바꾸고 명시한 origin 만 허용한다.
     - 비밀번호 backfill migration 을 안전하게 바꾼다. 강제 재설정이나 무효화 방식이다.
     - `scryptSync` 를 비동기로 바꾼다.
  4. **에이전트 principal 모델**: 에이전트 참여 ADR(#4)과 함께 구현한다.
- `docs/domain/` 에 principal, role, action, grant 모델을 반영한다.

## 변경 이력

| 날짜 | 변경 | 결정자 |
| --- | --- | --- |
| 2026-09-25 | 최초 제안 (proposed) | agent:claude-code |
| 2026-09-25 | 역할 3개 + grant, 에이전트 두 유형으로 accepted. 세부 질문 3개는 open | user |
