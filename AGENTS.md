---
title: AGENTS.md
purpose: AI agent용 저장소 안내
---

# AGENTS.md

이 저장소는 개발팀이 프로젝트 문서를 함께 작성하고 관리하는 실시간 협업 Markdown 에디터 제품을
만든다. 제품 문서는 기능과 사용자 흐름을 중심으로 유지하며, 내부 추적 표현을 제품 설명의 주어로
삼지 않는다.

## 먼저 읽을 문서

1. 제품 개요와 기능 지도: `README.md`, `docs/product/README.md`, `docs/product/product-principles.md`
2. 정규화 요구사항: `docs/requirements/registry.md`
3. 아키텍처 경계와 결정: `ARCHITECTURE.md`, `docs/architecture/README.md`, `docs/adr/`
4. 도메인 개념 변경 전: `docs/domain/README.md`
5. UI 변경 전: `DESIGN.md`

## 작업 규칙

- 공식 문서에서 `.note/**`를 출처로 인용하지 않는다.
- 제품 설명은 기능과 story 중심으로 작성한다. 내부 요구사항 ID나 테스트 ID는 추적 목적에만 사용한다.
- IndexedDB, Workspace, object storage 같은 구현/제품 선택은 사용자가 보는 기능 흐름과 데이터 보존
  책임을 설명하는 방식으로 문서화한다.
- 검증 편의를 위해 product auth, authorization, persistence, domain invariant, UX consistency를
  약화하지 않는다.
- storage, sync, auth, domain 경계를 새로 만들거나 바꾸기 전에는 ADR과 domain 문서를 확인한다.
- UI 작업은 editor-first 경험을 유지해야 한다.
- domain model 변경은 plan과 관련 domain 문서 업데이트를 동반해야 한다.
- `tasks/todo/` 문서를 기준으로 작업했다면 완료 시 해당 문서의 `status`를 `archived`로 변경하고 `tasks/archive/`로 이동한다.

## 로컬 실행 도구

- Node/pnpm 검증 명령은 `scripts/with-node.sh <command>`로 실행한다. 예:
  `scripts/with-node.sh pnpm --filter @rme/api typecheck`. 이 스크립트는 `fnm`을 조용히 초기화해 반복적인 `eval "$(fnm env)" && fnm use` 접두어와 sandbox state 충돌을 줄인다.
- 병렬 worktree 작업은 `pnpm worktree:create <task-name>` 또는
  `node scripts/worktree-create.mjs <task-name>`로 생성한다. 스크립트는 `.worktrees/<task-name>/`을 만들고 root `.env`를 worktree-local `.env.local`로 복사하되, 포트와 DB 이름을 worktree별로 분리한다.
- `.env`, `.env.local`, worktree별 `.env.local`은 커밋하지 않는다. 스크립트나 작업 로그는 실제 env 값을 출력하지 않아야 한다.
- 병렬 작업에서 포트나 DB가 충돌하면 `.env.local`을 직접 공유 수정하지 말고 worktree-local env 또는 명령 실행 시 env override를 사용한다.

## 문서 역할

- `docs/product/`: 사용자에게 보이는 product surface와 capability.
- `docs/domain/`: 도메인 언어, 모델 계약, 관계, 비즈니스 규칙.
- `docs/adr/`: 중요한 결정과 tradeoff.
- `docs/research/`: POC와 benchmark 자료.
- `docs/backlog/`: 보류된 요청, 아이디어, 재검토 조건.
