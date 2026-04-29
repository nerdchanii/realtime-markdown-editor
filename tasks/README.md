# tasks

이 디렉터리는 구현 작업을 작게 나누고 현재 상태를 추적한다. 과제 충족 기준은 여전히 `docs/compliance/subject-matrix.md`가 최상위 기준이다.

## 상태

- `tasks/todo/`: 아직 시작하지 않은 작업.
- `tasks/active/`: 현재 진행 중인 작업.
- `tasks/archive/`: 완료되어 보관된 작업.

## 규칙

- 한 task는 하나의 실행 가능한 작업 단위여야 한다.
- task가 domain model, architecture boundary, UI surface를 바꾸면 관련 문서를 먼저 업데이트한다.
- CE-01부터 CE-05까지의 검증 경로를 흐리는 제품 확장은 backlog로 둔다.
- POC와 final sync ADR 작업은 `docs/research/poc-001-collaboration-engine/`와 ADR-0002 계열에서 별도로 추적한다.
