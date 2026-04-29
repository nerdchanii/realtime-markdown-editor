# tasks

이 디렉터리는 구현 작업을 작게 나누고 현재 상태를 추적한다. 과제 충족 기준은 여전히 `docs/compliance/subject-matrix.md`가 최상위 기준이다.

## 상태

- `tasks/todo/`: 아직 시작하지 않은 작업.
- `tasks/active/`: 현재 진행 중인 작업.
- `tasks/archive/`: 완료되어 보관된 작업.

## 상태 전이

1. 새 작업은 `tasks/todo/`에 만든다.
2. 작업을 시작하면 파일을 `tasks/active/`로 이동하고 frontmatter `status`를 `active`로 바꾼다.
3. 검증과 review가 끝나면 frontmatter `status`를 `archived`로 바꾸고 `tasks/archive/`로 이동한다.
4. 중단된 작업은 `tasks/active/`에 남기고 `## Blocked`에 원인과 필요한 결정을 적는다.

## 작업 단위 규칙

- 한 task는 하나의 실행 가능한 작업 단위여야 한다.
- task가 domain model, architecture boundary, UI surface를 바꾸면 관련 문서를 먼저 업데이트한다.
- CE-01부터 CE-05까지의 검증 경로를 흐리는 제품 확장은 backlog로 둔다.
- POC와 sync engine 결정은 `docs/research/poc-001-collaboration-engine/`와 ADR-0002에서 추적한다.
- 공식 요구사항과 acceptance는 `.note/**`가 아니라 `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`를 기준으로 둔다.
- Checklist는 최대 2단까지만 둔다. 3단 이상의 의존성이나 실행 순서는 checklist가 아니라 dependency table로 표현한다.

## 장기 실행 Task Metadata

장기 실행 또는 subagent 작업을 위한 task는 다음 frontmatter를 가져야 한다.

- `title`: 안정적인 task 제목.
- `status`: `todo`, `active`, `blocked`, `archived` 중 하나.
- `phase`: 장기 실행 phase ID 또는 `none`.
- `task_type`: `contract`, `parallel-ui`, `parallel-backend`, `integration`, `verification`, `docs`, `refactor` 중 하나.
- `task_mode`: `blocking`, `parallel`, `integration`, `verification`, `orchestration` 중 하나.
- `owner`: 담당 agent 또는 사람. 미정이면 `unassigned`.
- `depends_on`: 선행 task ID 목록.
- `write_set`: 수정 가능한 path 목록.
- `forbidden_paths`: 수정하면 안 되는 path 목록.
- `related_requirements`: CE 또는 REQ ID 목록.
- `review_required`: `true` 또는 `false`.

## Execution Graph 표기 규칙

Phase orchestrator는 task를 만들 때 execution graph를 table로 적는다.

| Task       | Mode       | Depends on | Unlocks    | Notes |
| ---------- | ---------- | ---------- | ---------- | ----- |
| `TASK-000` | `blocking` | 없음       | `TASK-001` | 예시  |

- `Depends on`에는 task ID만 쓴다. 설명은 `Notes`에 둔다.
- 병렬로 실행 가능한 작업은 같은 predecessor와 서로 겹치지 않는 `write_set`을 가져야 한다.
- `blocking` task는 downstream 작업의 contract, design, dependency, 환경 preflight를 확정한다.
- `parallel` task는 approved contract 또는 mock contract에만 의존한다.
- `integration` task는 병렬 작업 결과를 한곳에서 연결하고 drift를 조정한다.
- `verification` task는 CE/REQ evidence, root check, reviewer scenario처럼 검증만 소유한다.
- `orchestration` task는 phase/task 분해, subagent prompt, guardrail 승인만 소유하며 직접 implementation을 포함하지 않는다.

## 병렬 실행 규칙

병렬 실행은 contract-first로만 허용한다.

- 병렬 task는 서로 `write_set`이 겹치면 안 된다.
- 병렬 task는 완료된 contract 또는 명시된 mock contract에만 의존해야 한다.
- contract 변경이 필요하면 downstream 병렬 작업을 중단하고 contract task를 먼저 갱신한다.
- 병렬 worker는 서로의 작업을 직접 통합하지 않는다.
- 병렬 작업 뒤에는 별도 `integration` task를 둔다.
- reviewer는 task의 `write_set` 밖 변경이 있는지 확인해야 한다.

## Orchestration Guardrails

- Phase orchestrator는 하위 agent를 호출할 수 있다.
- Phase orchestrator는 approved contract/design 없이 implementation worker를 시작할 수 없다.
- Collaboration topology, storage topology, cross-app runtime boundary는 general worker가 구현 중 임의로 결정하지 않는다.
- Collaboration runtime work는 API가 provider-neutral session contract를 발급하고 collab runtime이 검증한다는 경계를 전제로 task를 나눈다.
- `apps/collab` task는 API domain/usecase 파일을 직접 import하지 않는 acceptance 또는 boundary review를 포함해야 한다.

## 검증 규칙

각 task는 `## 검증`에 실행할 명령과 기대 결과를 적는다.

- boundary-adjacent 작업은 `pnpm arch:check`를 포함한다.
- TypeScript/API/Web contract 변경은 관련 `typecheck`를 포함한다.
- CE 작업은 관련 e2e 또는 수동 검증 증거를 포함한다.
- UI mock 작업은 mock provider가 실제 provider로 교체될 후속 integration task를 명시한다.

## Archive Checklist

완료 전 다음을 확인한다.

- `status`를 `archived`로 바꿨다.
- task 파일을 `tasks/archive/`로 이동했다.
- 검증 명령과 결과를 기록했다.
- 필요한 문서 업데이트를 완료했다.
- 관련 CE/REQ evidence 또는 follow-up을 기록했다.

## Subagent Delegation

Subagent prompts for phase orchestration, implementation, or review must include the preamble in `tasks/_templates/SUBAGENT-PREAMBLE.md`.

The main agent or phase orchestrator must provide the assigned task text directly. A worker subagent should not discover its own scope by scanning unrelated task files.
