---
title: AGENTS.md
purpose: AI agent용 저장소 지도
---

# AGENTS.md

## 제품

동시편집 에디터다. "동시편집"과 "에디터" 두 축이 모두 본질이다. 지금 구현은 협업 Markdown
에디터이고, 제품은 사람과 AI 에이전트가 여러 종류의 대상을 함께 편집하는 Realtime editor(ADE 표면)로
진화하는 중이다.

- 의도와 결정의 원본: `docs/direction/2026-09-24-product-direction-interview.md`
- 진행 단계: `docs/direction/roadmap.md`
- 과제(`subject.md`)와 CE framing 은 더 이상 제품 기준이 아니다.
- `README.md`, `docs/product/` 는 **현재 구현**을 설명한다. 방향 기록과 충돌하면 방향 기록을 따른다.

## 먼저 읽을 것

1. `docs/direction/` 의 인터뷰 기록과 로드맵
2. 결정 규칙: `docs/adr/0010-decision-gates-and-provenance.md`
3. 작업 영역에 맞는 문서
   - 아키텍처: `ARCHITECTURE.md`, `docs/architecture/`
   - 도메인 개념: `docs/domain/README.md`
   - UI: `DESIGN.md`
   - 과거 결정: `docs/adr/`

`docs/archive/` 는 과거 요구사항, CE 스토리, task 이력이다. 사용자가 요청하거나 과거 맥락 확인이 꼭
필요할 때만 읽는다. 여기 있는 내용은 현재 규칙의 근거로 인용하지 않는다. `docs/research/` 는 POC 원본이다.

## 결정 규칙 (ADR-0010)

- **G0** 구현 세부 사항: 에이전트가 결정하고 PR 설명에 적는다.
- **G1** 되돌릴 수 있는 설계나 구조 선택: 에이전트가 결정하고 바로 진행한다.
  ADR 이나 `docs/direction/decision-log.md` 에 `decided_by: agent:<도구>`, `ratify_by: +7일` 로 기록한다.
- **G2** 제품 정의, 데이터 권위, 권한과 에이전트 신원, 외부 프로토콜, 비가역 migration, UI 방향:
  - 에이전트는 선택지와 추천안을 담은 `proposed` ADR 을 만들고 사용자 결정을 기다린다.
  - 기다리는 동안에는 그 결정에 의존하지 않는 작업만 한다.
- 애매하면 한 단계 위 게이트로 올린다.
- 에이전트의 추론을 사용자 결정처럼 쓰지 않는다. 의도를 기록할 때는 `[user]`, `[agent]`, `[open]` 라벨을 붙인다.
- `proposed` ADR 과 `[open]` 항목은 확정 사실로 인용하지 않는다.
- PR 설명에는 "Decisions" 섹션을 두고 이번 PR 이 만든 G1/G2 결정을 나열한다.
  지속되는 결정은 decision log 나 ADR 로 승격한다.

## 작업 규칙

과거에 실제로 반복된 실패에서 나온 규칙이다.

- **mock, seed, fallback 데이터를 제품 경로에 두지 않는다.** 기능이 없으면 명시적인 빈 상태나 오류를
  보여준다. 동작하는 척하는 placeholder 를 만들지 않는다.
- **요청하지 않은 기능, 섹션, 장식을 추가하지 않는다.** 필요해 보이면 제안만 한다.
- **UI**
  - `DESIGN.md` 와 ADR-0014 를 따른다. Linear 의 밀도, Zed 의 에디터 중심, Figma 의 멀티플레이어, 다크 우선이다.
  - 요소를 card 나 border 로 감싸지 않는다. 색은 theme token 으로만 쓴다.
  - 스타일은 plain CSS 와 token 으로 쓴다(ADR-0015). SCSS, Tailwind utility, `@apply` 를 새로 쓰지 않는다.
  - border 는 레이아웃 CSS 와 에디터 본문 CSS 에서만 쓴다. 예외는 lint 설정 override 로만 만든다. disable 주석으로 UI 규칙을 끄지 않는다.
  - UI 를 바꾼 PR 에는 변경 전후 스크린샷(다크, 라이트)을 첨부한다. 한 PR 에서 한 화면을 다룬다.
- **완료에는 증거를 붙인다.** 실행한 검증 명령과 결과, UI 는 스크린샷을 남긴다. 테스트 통과만으로
  제품 완료라고 하지 않는다.
- **도메인과 경계**
  - storage, sync, auth, domain 경계를 바꾸기 전에는 관련 ADR 과 `docs/domain/` 을 확인한다.
  - domain model 을 바꾸면 domain 문서도 함께 갱신한다.
- **검증 우회 금지.** 검증을 편하게 하려고 auth, authorization, persistence, domain invariant 를 약화하지 않는다.
- **작업 기록**은 GitHub Issue 와 PR 에 둔다. 저장소에 task 나 exec-plan 파일을 새로 만들지 않는다.
- **문서 언어**: 문서는 한국어로 쓰고, 도메인 용어와 코드 식별자는 영어로 쓴다.
- `.note/**` 는 출처로 인용하지 않는다.

## 검증

```bash
pnpm install
pnpm db:generate   # 새 clone 에서는 typecheck, test, build 전에 필요 (Prisma client)
pnpm check         # typecheck, lint, lint:css, format:check, docs:check, arch:check, test
pnpm lint:css      # Stylelint(UI-001~004). 기존 위반은 stylelint-suppressions.json, 정리 후 --prune
pnpm docs:check    # 깨진 링크, ADR 형식, proposed ADR 인용, 스타일 규칙 id 대조
pnpm test:e2e      # Docker(Postgres) 필요
```

pre-commit hook(`scripts/pre-commit-staged.mjs`)은 staged 파일에 해당하는 검사만 실행한다.
CI(`.github/workflows/ci.yml`)는 `pnpm check` 를 실행한다.

## 로컬 실행 도구

- Node 명령은 `scripts/with-node.sh <command>` 로 실행한다. `fnm` 이 있으면 `.nvmrc` 버전을 쓰고,
  없으면 PATH 의 Node 를 쓴다.
- 병렬 worktree 는 `pnpm worktree:create <task-name>` 로 만든다.
  - `.worktrees/<task-name>/` 을 만들고 root `.env` 를 `.env.local` 로 복사한다.
  - 포트와 DB 이름은 worktree 마다 분리된다.
- `.env`, `.env.local` 은 커밋하지 않는다. 스크립트와 로그는 env 값을 출력하지 않는다.
- 포트나 DB 가 충돌하면 공유 `.env.local` 을 고치지 말고 worktree-local env 나 명령 단위 override 를 쓴다.

## 문서 지도

| 경로 | 역할 |
| --- | --- |
| `docs/direction/` | 제품 방향, 인터뷰 기록, 로드맵, decision log |
| `docs/adr/` | 중요한 결정과 tradeoff (게이트와 출처 포함) |
| `docs/domain/` | 도메인 언어, 모델, 관계, 비즈니스 규칙 |
| `docs/architecture/` | 백엔드와 프론트엔드 구조 규칙 |
| `docs/product/` | 현재 구현된 product surface |
| `docs/research/` | POC, benchmark 원본 |
| `docs/archive/` | 과거 요구사항, CE, task 이력 (기본으로 읽지 않음) |
