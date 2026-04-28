# Requirements Registry

이 디렉터리는 실시간 마크다운 협업 에디터의 공식 요구사항 레지스트리다. 요구사항은 구현 task가 아니라 검증 가능한 조건으로 관리한다.

## Sources

공식 요구사항의 출처는 다음으로 제한한다.

- `subject.md`: 과제 원문, 필수 CE 요구사항, 산출물 요구사항.
- Interview-derived product decisions: 인터뷰에서 확정 또는 제안된 제품 방향과 설계 판단을 공식 문서로 정제한 내용.

`.note/**`는 로컬 인터뷰 메모로만 사용하며, 이 디렉터리의 공식 출처로 인용하지 않는다.

## ID Conventions

| Prefix | Type | Meaning |
| --- | --- | --- |
| `CE` | functional | 과제 원문이 명시한 필수 공동 편집 요구사항 |
| `FR` | functional | 제품 기능 요구사항 |
| `NFR` | non-functional | 품질 속성, 신뢰성, 성능, 안전성 요구사항 |
| `UX` | ux | 사용자 경험과 화면 동작 요구사항 |
| `ARCH` | architecture | 구조, 경계, 기술 의사결정 요구사항 |
| `OPS` | ops | 실행, 제출, 문서화, 운영성 요구사항 |
| `RES` | research | 구현 전 검증 또는 비교가 필요한 연구 요구사항 |
| `BL` | backlog | MVP 이후로 미루거나 의식적으로 제외하는 요구사항 |

## Requirement Fields

모든 요구사항은 `registry.md`에서 다음 필드를 가진다.

| Field | Meaning |
| --- | --- |
| `id` | 안정적인 요구사항 ID |
| `type` | `functional`, `non-functional`, `ux`, `architecture`, `ops`, `research`, `backlog` 중 하나 |
| `statement` | 원자적이고 검증 가능한 요구사항 문장 |
| `source` | `subject.md` 또는 `interview-derived product decisions` |
| `status` | `confirmed`, `proposed`, `research-needed`, `deferred` |
| `priority` | `P0` 필수, `P1` MVP 핵심, `P2` 차별화, `P3` 후속 |
| `depends_on` | 선행 요구사항 ID 목록 |
| `blocks` | 이 요구사항이 없으면 막히는 요구사항 ID 목록 |
| `conflicts_with` | 알려진 충돌 요구사항 ID 목록 |
| `related_features` | 제품 capability ID 목록 |
| `acceptance` | 요구사항 충족 여부를 확인하는 기준 |

## Relationship To Features

요구사항 레지스트리는 feature를 정의하지 않는다. 요구사항은 검증 가능한 조건이고, feature는 하나 이상의 요구사항을 만족시키는 제품 capability다.

- Feature의 공식 목록과 scope는 `docs/features/README.md`와 각 feature spec을 기준으로 한다.
- `related_features` 필드는 요구사항이 어떤 feature capability와 연결되는지 추적하기 위한 참조다.
- 요구사항을 추가하거나 변경할 때는 `docs/requirements/traceability.md`와 관련 feature spec의 연결 요구사항도 함께 확인한다.

## Relationship Review

`depends_on`, `blocks`, `conflicts_with`는 현재 알려진 관계만 기록한다. 기능 간 선후관계, blocker, contradiction의 전체 분석은 다음 세션에서 진행하고 이 레지스트리에 반영한다.
