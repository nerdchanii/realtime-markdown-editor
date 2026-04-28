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

## Feature IDs

`docs/features/**`가 별도로 작성되기 전까지, 요구사항은 다음 feature ID를 참조한다.

| Feature ID | Capability |
| --- | --- |
| `F-WORKSPACE` | B2B workspace, project, folder, document 도메인 |
| `F-IDENTITY` | User와 WorkspaceMembership 기반 사용자 모델 |
| `F-COLLAB` | 실시간 공동 편집 |
| `F-PRESENCE` | 사용자 presence |
| `F-OFFLINE-SYNC` | IndexedDB 기반 오프라인 편집과 재동기화 |
| `F-HISTORY` | autosave/save와 분리된 checkpoint/history |
| `F-RICH-EDITOR` | Rich default, Markdown source, Split view 편집 |
| `F-PROPERTIES` | Markdown body 밖의 문서 metadata/properties |
| `F-LINKS` | 표준 Markdown link, backlink, document connection |
| `F-MARKDOWN-IO` | 표준 Markdown source와 export |
| `F-UI-SHELL` | 3-panel shell, foldable side panels, ToC rail, inspector shell |
| `F-I18N` | ko/en 국제화 |
| `F-STORAGE` | Postgres/RDB, MinIO/object storage, optional Redis support |
| `F-ENGINE-POC` | 협업 엔진 POC와 선택 |
| `F-COMMENTS` | 향후 comment, suggestion, mention, notification, chat 계열 기능 |
| `F-TASK-EXTRACTION` | 향후 task extraction과 task metadata parsing |
| `F-LOCAL-SETUP` | 채점자 로컬 실행과 제출 산출물 |
| `F-BACKLOG` | MVP 제외 또는 후속 검토 기능 |

## Relationship Review

`depends_on`, `blocks`, `conflicts_with`는 현재 알려진 관계만 기록한다. 기능 간 선후관계, blocker, contradiction의 전체 분석은 다음 세션에서 진행하고 이 레지스트리에 반영한다.
