---
title: docs/domain/models/agent-edit.md
status: active
---

# docs/domain/models/agent-edit.md

> **목표 모델 (ADR-0016 accepted, 아직 구현 전)**
>
> 현재 코드에는 에이전트, 제안, 변경 묶음이 없다. 아래 계약은 앞으로 구현할 기준이다.
> 근거와 선택지는 [ADR-0016](../../adr/0016-agent-participation-protocol-and-edit-mode.md) 에 있다.

## 계약

에이전트는 principal([principal.md](principal.md))로서 문서 연산 use case 를 불러 문서를 고친다.
한 번의 요청으로 생긴 편집은 하나의 `ChangeBundle` 이 된다. 편집이 문서에 곧바로 들어갈지, 제안으로 남을지는
권한 상한과 편집 모드로 정한다.

```text
EditMode        = manual | acceptEdits | auto | autoCruise | allowAll
                  (수동 < 편집 수락 < 자동 < 자동+크루즈 < 모두 허용)
ChangeBundle    = { id, actor, document, mode, application, status, diff, explanation }
  actor         = { principal: Agent, onBehalfOf?: User | LocalUser }
  application   = suggestion | applied
  status        = pending | accepted | rejected | applied | reverted
Suggestion      = application 이 suggestion 인 ChangeBundle
```

| 개념 | 뜻 |
| --- | --- |
| `content.suggest` | 문서를 바꾸지 않고 변경안(제안)을 붙이는 action. 처음에는 editor 이상에게 있다. |
| 제안(Suggestion) | 아직 문서에 들어가지 않은 변경 묶음. 사람이 수락하면 반영되고, 거절하면 버려진다. |
| 변경 묶음(ChangeBundle) | 에이전트 요청 한 번으로 생긴 편집 전체. 제안, 직접 편집, 되돌리기, 이력, audit 가 같은 단위를 쓴다. |
| 편집 모드(EditMode) | 요청자가 권한 상한 안에서 고르는 확인 강도. 다섯 단계다. |
| 허용 최대 모드 | 문서나 workspace owner 가 그 문서에서 허용하는 가장 강한 모드. |

## 권한 상한과 모드

- **권한 (상한)**: owner, admin 이 정한다. delegated agent 는 (위임한 사용자의 권한) ∩ (준 scope) 다.
  - `content.suggest`: 제안만 할 수 있다.
  - `content.write` 의 본문 편집: 본문을 바로 고칠 수 있다.
  - 구조 변경(생성, 이동, 이름 변경, 삭제): 본문 편집과 따로 줄 수 있어야 한다.
- **모드 (선택)**: 요청자가 고른다.
  - 문서별 기본값을 두고, 요청할 때는 기본값보다 낮추는 것만 허용한다.
  - 허용 최대 모드보다 강한 모드는 고를 수 없다.
  - 워크플로우가 실행하는 에이전트는 워크플로우가 선언한 모드를 쓴다([workflow.md](workflow.md)).
- **실제 동작 = min(권한, 모드)**. 권한이 `content.suggest` 뿐이면 어떤 모드든 제안으로 남는다.

## 모드별 동작

모든 단계는 아래 단계가 바로 할 수 있는 것을 모두 포함한다(단조). 위험도는 서버 규칙으로 판정한다.

| 모드 | 안전한 본문 편집 | 위험한 본문 편집 | 안전한 구조 변경 | 위험한 구조 변경 | 요청자가 없을 때 |
| --- | --- | --- | --- | --- | --- |
| 수동 | 제안 | 제안 | 제안 | 제안 | 모두 제안으로 남아 있다 |
| 편집 수락 | 바로 반영 | 확인 | 확인 | 확인 | 확인이 필요한 곳에서 멈춘다 |
| 자동 | 바로 반영 | 바로 반영 | 바로 반영 | 확인 | 확인이 필요한 곳에서 멈춘다 |
| 자동+크루즈 | 바로 반영 | 바로 반영 | 바로 반영 | 제안으로 쌓고 계속 | 멈추지 않는다 |
| 모두 허용 | 바로 반영 | 바로 반영 | 바로 반영 | 바로 반영 | 멈추지 않는다 |

- 위험한 본문 편집: 대량 삭제, 다른 사람이 편집 중인 구간.
- 위험한 구조 변경의 초안: 문서 삭제, 다른 사람이 만들었거나 편집 중인 문서의 이동과 이름 변경, 여러 문서에 걸친 변경.
- 크루즈는 종료 조건(시간, 변경량, 범위)을 가진다. 요청자와 그 문서에 `content.write` 가 있는 사람이 언제든 멈출 수 있다. 사람이 같은 구간을 편집하기 시작하면 그 구간은 건너뛰고 제안으로 남긴다.

## 규칙

- 제안의 위치와 diff 는 문서 타입이 안다. `markdown`/`code` type module 이 제공하고, core 는 변경 묶음의 저장, 권한, 상태만 맡는다(ADR-0013).
- 사람의 실행 취소는 자기 편집만 되돌린다. 에이전트 편집은 변경 묶음 단위로 되돌린다.
  - 에이전트 편집 뒤에 사람이 같은 범위를 고쳤으면 자동으로 되돌리지 않고 사람에게 확인한다.
  - 되돌릴 수 있는 사람은 그 문서에 `content.write` 가 있는 사람이다. delegated agent 의 변경은 위임한 사용자도 되돌릴 수 있다.
- 변경 묶음은 checkpoint 와 다른 이력 항목이다. 에이전트 편집 전에 checkpoint 를 자동으로 만들지 않는다.
- `explanation` 에는 에이전트가 무엇을 왜 바꿨는지 남긴다. 사용자의 원래 요청 문장은 기본으로 저장하지 않는다.
- 에이전트의 쓰기는 audit log 에 남기고, audit 기록은 변경 묶음을 가리킨다(ADR-0012 §5).

## 관련 결정

- ADR-0016: 에이전트 참여, 편집 모드, 변경 묶음
- ADR-0012: principal, policy, audit
- ADR-0017: 워크플로우가 선언하는 에이전트 모드
