---
id: ADR-0017
title: "ADR-0017: 문서 워크플로우는 주인과 트리거를 선언하고, 상태 전환은 권한으로 제한하며, 별도 실행기가 실행한다"
status: proposed
date: 2026-09-26
gate: G2
decided_by: user
ratified_by: pending
ratified_at: null
ratify_by: null
reversibility: one-way
revisit_if: >-
  연쇄 실행 상한이 정상적인 워크플로우를 자주 끊거나, 상태를 Y.Doc 밖에 두어 오프라인과 local 범위 경험이
  크게 나빠지거나, 워크플로우 주인 모델이 권한 상승 경로로 악용되면 다시 본다.
related_documents:
  - docs/adr/0004-document-lifecycle-policy.md
  - docs/adr/0011-data-authority-by-scope.md
  - docs/adr/0012-authorization-policy-and-principals.md
  - docs/adr/0013-document-type-model.md
  - docs/adr/0016-agent-participation-protocol-and-edit-mode.md
  - docs/domain/models/document-state.md
  - docs/domain/rules/document-lifecycle.md
  - docs/product/workflow/document-state.md
supersedes:
  - ADR-0013 (`meta` 에 DocumentState 를 두는 항목만)
superseded_by: null
---

# ADR-0017: 문서 워크플로우는 주인과 트리거를 선언하고, 상태 전환은 권한으로 제한하며, 별도 실행기가 실행한다

> **proposed (2026-09-26)**
>
> - 방향은 사용자가 2026-09-26 에 정했다. 아래 "사용자 결정" 절의 여섯 항목은 [user] 결정이다.
> - 세부 설계와 추천안은 에이전트가 작성했다([agent]). 결정이 필요한 세부는 "사용자가 답할 질문" 절에 모았다.
> - 세부가 확정될 때까지 ADR 은 proposed 로 둔다. [user] 결정이 아닌 내용은 확정 규칙으로 인용하지 않는다.
> - 추적 Issue: #4 (에이전트 참여 ADR-0016 과 함께 논의)

## 맥락

### 기존 문서가 남긴 자리

워크플로우는 새 개념이 아니다. 기존 문서가 이미 자리를 만들어 두고 보류했다.

- [ADR-0004](0004-document-lifecycle-policy.md) (accepted)
  - `DocumentState`(`draft`, `review`, `saved`)를 워크플로우의 기반으로 분리하고, hook 은 보류했다.
  - 예상 확장으로 상태 변경 이벤트에 Slack 알림, **Agent 실행**, logging, mail, 외부 연동을 붙이는 것을 적었다.
  - "transition policy, 외부 hook 실행, reverse update 가 필요해지면 별도 workflow capability 나 workflow executor 로 승격한다"고 정했다.
- [문서 lifecycle 규칙](../domain/rules/document-lifecycle.md)
  - 워크플로우 hook 은 키 입력이 아니라 **명시적인 `DocumentState` 변경**에 붙는다.
- [DocumentState 제품 문서](../product/workflow/document-state.md)
  - 전환 정책(guard), 워크플로우 실행기, Agent 등 hook 설정, reverse hook 을 보류했다. 승격 조건도 같다.
- 보류된 과거 요구사항 세 개(참고 자료. 요구사항으로 인용하지 않는다)
  - 워크플로우 hook: "상태와 실행 동작의 매핑과 설정 소유를 먼저 정한다."
  - 상태와 실행 동작의 매핑: "상태 전환, 실행 동작의 소유, 설정 저장 위치를 나눠 설계한다."
  - 외부 연동: hook 모델이 정해진 뒤 연동 계약을 설계한다.
- [ADR-0013](0013-document-type-model.md) (accepted): `DocumentState` 를 Yjs `meta` Y.Map 에 두었다.
- [ADR-0011](0011-data-authority-by-scope.md) (accepted) 결정 2: "본문, title, properties, **필요하면** DocumentState 가 모두 Yjs 안의 구분된 field 에 있다."
- [ADR-0012](0012-authorization-policy-and-principals.md) (accepted): 모든 쓰기는 `authorize(actor, action, resource)` 한 곳에서 판정한다(§1 은 G1 추인 대기). actor 는 `{ principal, onBehalfOf? }` 다.
- [ADR-0016](0016-agent-participation-protocol-and-edit-mode.md) (proposed): 에이전트 편집은 모드 단계(수동 / 편집 수락 / 자동 / 자동+크루즈 / 모두 허용)를 가진다. 모드 단계 자체는 [user] 결정이고, 나머지는 제안이다.

### 현재 구현

- 서버(`apps/api`)의 `Document` 가 `DocumentState` 값을 가진다. 사용자는 세 상태 사이를 직접 바꿀 수 있고, 전환 정책은 없다.
- 새 앱(`apps/editor`)의 `meta` 에는 `type`, `schemaVersion`, `title`, `createdAt` 만 있다. `DocumentState` 는 아직 넣지 않았다.
  그래서 아래 결정 4 에 맞춰 바꿀 코드는 지금 없다.
- 워크플로우, hook, 실행기, outbox 가 없다.

### 이 ADR 이 답하는 것

사용자가 "리뷰 요청 상태로 바꾸면 에이전트가 리뷰를 남기고, 게시 상태가 되면 팀에 알린다" 같은 흐름을 만들 때 필요한 것을 정한다.

1. 워크플로우는 무엇을 선언하고, 누구의 권한으로 실행되는가.
2. 누가 상태를 바꿀 수 있고, 그래서 누가 워크플로우를 트리거할 수 있는가.
3. `DocumentState` 는 어디에 있고, 상태 변경 이벤트는 어떻게 유실 없이 전달되는가.
4. 누가 워크플로우를 실행하는가.
5. 워크플로우가 다른 워크플로우를 부를 때 어떻게 멈추는가.

## 사용자 결정 — [user] 2026-09-26

1. **워크플로우는 ADR-0016 과 분리한 이 ADR 에서 다룬다.**
2. **워크플로우 주인과 선언**
   - 워크플로우에는 주인이 있고, 트리거를 선언한다.
   - 워크플로우가 실행하는 에이전트는 **주인의 권한 범위 안에서** 실행된다. 에이전트 편집 모드(ADR-0016)도 워크플로우가 선언한다.
   - 과거 매핑 요구사항의 "실행 동작의 소유"에 대한 답이다.
3. **메타데이터 변경도 권한으로 제한한다.**
   - 상태 전환 같은 메타데이터 변경도 권한으로 제한한다. ADR-0004 가 보류한 "전환 정책"을 승격한다.
   - GitHub 모델과 같다. 머지 권한이 있는 사람이 머지로 Actions 를 실행시키듯, **권한이 있는 사람만 워크플로우를 트리거할 수 있다.**
4. **`DocumentState` 는 Y.Doc 밖(DB)에 둔다.**
   - 상태 변경은 API use case 로만 한다. 권한 판정과 이벤트 기록(outbox)을 그 use case 에서 한다.
   - ADR-0013 의 `meta` 구조를 이에 맞게 고친다.
   - local 범위 문서의 상태 위치는 [open] 이다(Q8).
5. **연쇄 실행을 허용한다.**
   - 워크플로우가 만든 이벤트로 다른 워크플로우가 실행될 수 있다. 연쇄가 워크플로우의 핵심이다.
   - 의도하지 않은 순환(A→B→A)은 실행 깊이나 횟수 상한으로 끊는다.
6. **실행기(workflow executor)는 별도 프로세스다.**
   - api, collab 과 나란히 따로 배포한다.
   - 상태 변경 이벤트는 outbox 로 유실 없이 실행기에 전달한다.

## 설계 — [agent] 추천

### 1. 워크플로우 선언

워크플로우는 다음을 선언한다.

| 항목 | 뜻 | 예 |
| --- | --- | --- |
| 주인 | 이 워크플로우를 책임지는 principal. 실행 권한의 기준이다. | 팀 리드 |
| 적용 범위 | 어느 문서에서 트리거되는가 | workspace 전체, project, folder, 문서 하나 |
| 트리거 | 어떤 이벤트에 실행되는가 | `draft → review` 전환 |
| 동작 | 무엇을 실행하는가 | 리뷰 에이전트 실행, 알림 보내기 |
| 에이전트 모드 | 에이전트 동작이면 ADR-0016 의 모드 | 수동(모두 제안으로 남긴다) |

- **트리거의 첫 범위는 `DocumentState` 전환**이다. 기존 규칙대로 키 입력에는 붙지 않는다.
  문서 생성, checkpoint 생성, 수동 실행, 일정 같은 다른 트리거는 Q1 이다.
- **동작의 첫 범위**는 "에이전트 실행"과 "알림"이다. 외부 시스템 연동은 과거 요구사항대로 이 모델이 정해진 뒤 연동 계약을 따로 설계한다.

### 2. 소유와 실행 권한

- 워크플로우가 실행하는 에이전트의 actor 는 `{ principal: 에이전트, onBehalfOf: 워크플로우 주인 }` 이다.
  - 실효 권한은 (주인의 권한) ∩ (워크플로우가 선언한 적용 범위와 동작) 이다. ADR-0012 의 delegated agent 교집합 규칙과 같다.
  - 에이전트 모드는 워크플로우가 선언한 모드와 문서가 허용하는 최대 모드 가운데 낮은 쪽이다(허용 최대 모드는 ADR-0016 Q7, 제안).
- **실행 기록에는 두 사람을 남긴다.** 트리거한 사람(상태를 바꾼 사람)과 워크플로우 주인이다.
- **트리거한 사람의 권한이 아니라 주인의 권한으로 실행된다.** GitHub 에서 머지한 사람이 아니라 저장소 설정과 secret 으로 Actions 가 도는 것과 같다.
  - 이 때문에 editor 가 상태를 바꿔 admin 이 만든 워크플로우를 실행시킬 수 있다. 의도된 동작이다.
  - 대신 워크플로우가 할 수 있는 일은 선언한 적용 범위와 동작으로 좁혀진다. 주인은 그 선언을 책임진다.
  - 워크플로우를 만들거나 고칠 수 있는 사람은 Q3 이다.

### 3. 상태 전환 권한

- 상태 전환을 별도 action 으로 판정한다. 이름 초안은 `document.state.change` 다.
  - ADR-0012 의 역할표에서 `content.write` 에 섞지 않는다. 본문을 쓸 수 있어도 게시 상태로 바꾸지 못하게 할 수 있어야 하기 때문이다.
  - 추천 기본값: editor 이상이 모든 전환을 할 수 있다. 지금 동작(직접 전환 허용)과 같다.
- 전환별 guard 를 둘 수 있다. 예: `review → saved` 는 admin 만, `saved` 로 가려면 `review` 를 거쳐야 한다.
  guard 를 어디서 설정하고 어떤 모양으로 둘지는 Q2 다.
- 워크플로우를 트리거할 수 있는 사람 = 그 전환을 할 수 있는 사람이다. 트리거 권한을 따로 두지 않는다.
- 에이전트와 외부 시스템도 같은 use case 와 같은 policy 로 상태를 바꾼다. ADR-0004 가 보류한 reverse hook(외부가 상태를 바꾸는 흐름)은 이 경로 위에 올린다.

### 4. `DocumentState` 의 위치와 전달

- **정본은 DB 의 문서 행**이다. Y.Doc 에 두지 않는다.
- **변경 경로는 API use case 하나**다(`ChangeDocumentState`).
  1. `authorize(actor, "document.state.change", document)` 와 전환 guard 를 판정한다.
  2. 같은 DB 트랜잭션에서 상태를 바꾸고 outbox 에 이벤트를 쓴다. 이벤트에는 문서, 이전 상태, 다음 상태, actor, 인과 정보(아래 6)가 들어간다.
  3. 커밋 뒤 outbox relay 가 실행기와 협업 서버에 이벤트를 전달한다.
- **협업 클라이언트에 보여주는 방식**
  - 문서를 열 때 API 로 상태를 조회한다.
  - 상태가 바뀌면 협업 서버가 그 문서에 연결된 클라이언트에게 stateless 알림(Hocuspocus stateless message)을 보낸다.
    알림에는 새 상태를 담을 수 있지만 정본은 아니다. 클라이언트는 필요하면 API 로 다시 조회한다.
  - 알림을 놓친 클라이언트도 재연결하거나 문서를 다시 열 때 API 조회로 맞춰진다.
- **왜 Y.Doc 밖인가**
  - Y.Doc 안의 값은 연결된 어느 클라이언트든 map 을 set 해서 바꿀 수 있다. 서버가 update 를 받기 전에 전환 guard 를 판정할 수 없다.
  - 트리거 이벤트를 CRDT update 에서 추출해야 하고, 오프라인 병합 결과로 전환이 뒤늦게 생기면 "누가 언제 바꿨나"가 흐려진다.
  - 권한 판정, 상태 변경, 이벤트 기록을 한 트랜잭션으로 묶어야 이벤트가 유실되지 않는다.
- **대가**
  - 상태 변경은 서버에 연결되어 있어야 한다. 오프라인에서는 상태를 바꿀 수 없다. 본문 편집은 그대로 오프라인에서 된다.
  - 문서 정보가 두 경로(Y.Doc 과 API)로 나뉜다. title 과 properties 는 Y.Doc, 상태는 API 다.

### 5. 실행기

- 실행기는 api, collab 과 나란히 **별도 프로세스**로 배포한다(앱 이름 초안: `apps/workflow`).
- outbox 이벤트를 받아 적용 범위와 트리거가 맞는 워크플로우를 찾고, 실행(run)을 만든다.
- 전달은 **최소 한 번(at-least-once)** 이다. 실행기는 이벤트 id 로 중복 실행을 막는다.
- 에이전트 동작은 ADR-0016 이 제안한 문서 연산 API(제안)를 통해 문서를 고친다. 그래서 워크플로우의 편집도 같은 policy, 같은 모드, 같은 변경 묶음 기록을 지난다.
- 실행기 자신은 서비스 자격증명으로 인증하고, 동작마다 위 2 의 actor 로 권한을 판정받는다. 실행기에게 별도의 넓은 권한을 주지 않는다.
- 실행 기록(run)은 워크플로우, 트리거 이벤트, 트리거한 사람, 주인, 상태(대기, 실행 중, 성공, 실패, 중단), 인과 정보를 남긴다.

### 6. 연쇄 실행과 상한

- 워크플로우 실행 안에서 일어난 상태 변경도 outbox 이벤트가 되고, 다른 워크플로우를 트리거할 수 있다.
- 모든 이벤트는 **인과 정보**를 가진다: 처음 사람이 만든 이벤트(root), 부모 실행, 연쇄 깊이.
- 상한(값은 Q5)
  - 연쇄 깊이 상한: 예를 들어 5 단계.
  - root 이벤트 하나에서 파생된 실행 수 상한: 예를 들어 20 회.
  - 같은 문서에서 같은 워크플로우가 짧은 시간에 반복 실행되는 횟수 상한.
- 상한에 닿으면 그 실행을 만들지 않고, 실행 기록에 "연쇄 상한으로 중단"을 남기고, 워크플로우 주인에게 알린다.
- **GitHub 과 반대로 가는 이유**
  - GitHub Actions 는 워크플로우가 기본 token(`GITHUB_TOKEN`)으로 만든 이벤트로 새 워크플로우를 실행하지 않는다(`workflow_dispatch`, `repository_dispatch` 는 예외). 실수로 생기는 재귀를 원천 차단하려는 설계다.
  - 이 제품에서는 문서 상태의 연쇄 자체가 사용자가 만들 흐름이다. 예: `draft → review` 에서 리뷰 에이전트가 돌고, 리뷰가 통과하면 에이전트가 `saved` 로 바꾸고, `saved` 에서 게시 알림이 나간다. 연쇄를 막으면 이 흐름을 만들 수 없다.
  - 그래서 차단 대신 **인과 사슬을 추적하고 상한으로 끊는다.** 사람이 실행 기록에서 사슬 전체를 볼 수 있게 한다.

## 사용자가 답할 질문

1. **[open] 트리거 종류**: 첫 범위는 `DocumentState` 전환이다(추천). 문서 생성, checkpoint 생성, 수동 실행, 일정 트리거를 언제 추가할까요?
2. **[open] 전환 guard**: 기본은 editor 이상이 모든 전환을 할 수 있게 둔다(추천). 전환별 guard(특정 역할만, 거쳐야 하는 상태)를 workspace 설정으로 둘까요, 워크플로우 선언의 일부로 둘까요?
3. **[open] 워크플로우를 만들 수 있는 사람**: 추천은 admin 이상이 workspace·project 범위 워크플로우를, editor 는 자기에게 권한이 있는 문서·folder 범위 워크플로우만 만드는 것이다. 새 action(`workflow.manage`)을 둘까요?
4. **[open] 워크플로우 설정 저장 위치**
   - (a) DB 레코드(추천): 권한 판정과 버전 기록이 쉽다. 편집 UI 가 필요하다.
   - (b) workspace 안의 설정 문서(GitHub 의 `.github/workflows` 처럼): 문서처럼 편집하고 이력을 남길 수 있다. 문서를 고칠 수 있는 사람이 워크플로우를 바꿀 수 있어 권한 모델이 복잡해진다.
5. **[open] 연쇄 상한 값**: 깊이 5, root 당 실행 20 회를 초안으로 둘까요? workspace 별로 바꿀 수 있게 할까요?
6. **[open] 실패와 재시도**: 알림처럼 멱등한 동작은 간격을 늘려 가며 몇 번 자동 재시도하고, 에이전트 실행은 부분 편집이 남을 수 있으니 자동 재시도하지 않고 실패로 표시한 뒤 사람이 다시 실행하게 할까요(추천)?
7. **[open] 주인이 권한을 잃었을 때**: 추천은 실행할 때마다 주인의 권한을 다시 판정하는 것이다. 권한이 없으면 실행을 거부하고, 워크플로우를 일시 정지하고, workspace admin 에게 알린다. admin 이 새 주인을 지정하면 다시 켠다. 주인이 workspace 를 떠난 경우도 같게 다룰까요?
8. **[open] local 범위 문서의 상태 위치**: 서버가 없는 local 문서의 `DocumentState` 는 어디에 둘까요?
   - (a) 기기의 local 저장소(문서 목록 index 같은 곳)에 두고, 승격하거나 sync 할 때 DB 로 옮긴다.
   - (b) local 문서는 상태와 워크플로우를 지원하지 않는다. 승격한 뒤에만 쓴다.
9. **[open] 상태 모델**: `draft`, `review`, `saved` 세 상태를 고정으로 둘까요, workspace 가 상태를 정의할 수 있게 할까요?

## 결과

### ADR-0013 개정

- [user] `meta` Y.Map 에서 `DocumentState` 를 뺀다. `meta` 에는 title, properties 와 core 식별 정보(type, schemaVersion 등)만 둔다.
- ADR-0013 본문의 표에 개정 표시를 달고 이 ADR 로 링크했다.
- ADR-0011 결정 2 는 DocumentState 를 "필요하면" Yjs 에 둔다고 했으므로 이 결정과 충돌하지 않는다.

### 후속 작업 (코드)

- 서버: `ChangeDocumentState` use case, `document.state.change` action, outbox 테이블과 relay.
- 협업 서버: 상태 변경 stateless 알림.
- 실행기 앱과 실행 기록 저장.
- `apps/editor`: 상태를 `meta` 에 넣지 않는다. 슬라이스 2 이후 상태 표시가 필요할 때 API 조회와 알림으로 붙인다. 지금 바꿀 코드는 없다.
- ADR-0016 의 문서 연산 API(제안)가 정해진 뒤 에이전트 동작을 붙인다.

### 후속 작업 (문서)

- `docs/domain/models/document-state.md`: 정본 위치, 전환 권한, 이벤트 규칙을 반영한다.
- `docs/domain/`: Workflow, WorkflowRun, outbox 이벤트 모델을 추가한다. domain model 변경이므로 plan 과 함께 진행한다.
- `docs/architecture/`: 실행기 프로세스와 outbox 흐름을 추가한다.

### 트레이드오프

- 상태 변경에 서버 연결이 필요하다. 오프라인에서 상태를 바꾸는 경험을 포기한다.
- 주인 권한으로 실행되므로, 트리거한 사람보다 넓은 권한으로 동작이 실행될 수 있다. 선언한 범위, 실행 기록, 주인 권한 재판정으로 관리한다.
- 연쇄를 허용하므로 상한 값이 너무 낮으면 정상 흐름이 끊기고, 너무 높으면 폭주를 늦게 막는다.
- 별도 프로세스가 하나 늘어난다. 로컬 개발과 배포 구성이 커진다.

## 검증 방법 (구현 뒤)

- 전환 권한이 없는 사람이 상태를 바꾸면 거부되고, 워크플로우도 실행되지 않는다.
- 상태 변경과 outbox 기록은 함께 커밋되거나 함께 실패한다. 실행기를 멈췄다 켜도 이벤트가 유실되지 않고, 같은 이벤트로 두 번 실행되지 않는다.
- 워크플로우 에이전트의 편집은 주인의 권한과 선언한 모드를 넘지 않는다. 실행 기록에 트리거한 사람과 주인이 모두 보인다.
- A→B→A 순환을 만들면 상한에서 멈추고 주인에게 알림이 간다.
- 다른 클라이언트에서 상태를 바꾸면 열려 있는 편집 화면의 상태 표시가 새로고침 없이 바뀐다.

## 관련 문서

- 기존 결정: [ADR-0004](0004-document-lifecycle-policy.md), [ADR-0011](0011-data-authority-by-scope.md), [ADR-0012](0012-authorization-policy-and-principals.md), [ADR-0013](0013-document-type-model.md), [ADR-0016](0016-agent-participation-protocol-and-edit-mode.md) (proposed)
- 도메인: [DocumentState](../domain/models/document-state.md), [문서 lifecycle 규칙](../domain/rules/document-lifecycle.md)
- 제품: [DocumentState](../product/workflow/document-state.md)
- 참고 자료(요구사항 아님): [워크플로우 hook](../archive/requirements/backlog/REQ-DEFERRED-WORKFLOW-HOOKS.md), [상태와 실행 동작 매핑](../archive/requirements/backlog/REQ-DEFERRED-DOCUMENT-STATE-ACTION-MAPPING.md), [외부 연동](../archive/requirements/backlog/REQ-DEFERRED-EXTERNAL-WORKFLOW-INTEGRATIONS.md)

## 변경 이력

| 날짜 | 변경 | 결정자 |
| --- | --- | --- |
| 2026-09-26 | 최초 작성 (proposed). 워크플로우 분리, 주인과 트리거 선언, 전환 권한, DocumentState 를 DB 로, 연쇄 허용, 별도 실행기 | user (방향 6 항목) / agent:claude-code (세부 설계와 추천) |
