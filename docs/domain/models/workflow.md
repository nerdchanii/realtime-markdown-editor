---
title: docs/domain/models/workflow.md
status: active
---

# docs/domain/models/workflow.md

> **목표 모델 (ADR-0017 accepted, 아직 구현 전)**
>
> 현재 코드에는 워크플로우, 실행 기록, outbox 가 없다. 아래 계약은 앞으로 구현할 기준이다.
> 근거와 선택지는 [ADR-0017](../../adr/0017-document-workflow-triggers-and-executor.md) 에 있다.

## 계약

`Workflow` 는 문서 상태 전환에 반응해 동작을 실행하는 선언이다. `WorkflowRun` 은 한 번의 실행 기록이다.
워크플로우는 server 범위 workspace 에만 있다.

```text
Workflow    = { owner, scope, trigger, actions, agentMode? }
WorkflowRun = { workflow, event, triggeredBy, owner, status, causation }
Causation   = { rootEventId, parentRunId?, depth }
```

| 항목 | 뜻 |
| --- | --- |
| `owner` | 워크플로우를 책임지는 principal. 실행 권한의 기준이다. |
| `scope` | 트리거되는 범위. workspace, project, folder, 문서 하나. |
| `trigger` | 첫 범위는 `DocumentState` 전환(`from → to`)이다. 다른 트리거는 요구가 생길 때 추가한다. |
| `actions` | 첫 범위는 에이전트 실행과 알림이다. |
| `agentMode` | 에이전트 동작의 편집 모드(ADR-0016 모드 단계). |
| `WorkflowRun.status` | 대기, 실행 중, 성공, 실패, 중단 |

설정은 DB 레코드에 둔다.

## 규칙

- **소유와 실행 권한**
  - 워크플로우의 에이전트 actor 는 `{ principal: 에이전트, onBehalfOf: owner }` 다.
  - 실효 권한은 (owner 의 권한) ∩ (선언한 scope 와 actions) 이다.
  - 에이전트 모드는 선언한 모드와 문서의 허용 최대 모드 가운데 낮은 쪽이다.
  - 실행은 트리거한 사람이 아니라 owner 의 권한으로 한다. 실행 기록에는 트리거한 사람과 owner 를 모두 남긴다.
- **만들 수 있는 사람**: `workflow.manage` 로 판정한다. admin 이상은 workspace·project 범위, editor 는 자기에게 권한이 있는 문서·folder 범위를 만든다.
- **트리거**: 전환 권한이 있는 사람만 트리거한다. 트리거 권한을 따로 두지 않는다.
- **owner 가 권한을 잃거나 workspace 를 떠나면**: 실행할 때마다 owner 권한을 다시 판정한다. 권한이 없으면 실행을 거부하고 워크플로우를 일시 정지한 뒤 admin 에게 알린다. admin 이 새 owner 를 지정하면 다시 켠다.
- **연쇄**
  - 워크플로우 실행이 만든 상태 전환도 다른 워크플로우를 트리거한다.
  - 모든 이벤트와 실행은 `Causation` 을 가진다.
  - 상한은 깊이 5, root 이벤트당 실행 20 회의 고정값이다. 상한에 닿으면 실행을 만들지 않고, 실행 기록에 남기고, owner 에게 알린다.
- **전달과 재시도**
  - 이벤트는 outbox 로 전달된다. 전달은 최소 한 번이고, 실행기는 이벤트 id 로 중복 실행을 막는다.
  - 알림처럼 멱등한 동작은 자동 재시도한다.
  - 에이전트 실행은 자동 재시도하지 않는다. 실패로 표시하고 사람이 다시 실행한다.
- local 범위 문서에는 워크플로우가 없다. 승격으로 옮겨진 상태 값은 워크플로우를 트리거하지 않는다.

## 관련 결정

- ADR-0017: 워크플로우, 전환 권한, 실행기
- ADR-0016: 에이전트 편집 모드
- ADR-0012: principal 과 policy
