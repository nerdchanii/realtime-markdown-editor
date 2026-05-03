---
title: docs/architecture/coding-conventions.md
status: active
scope: repo
approved_at: 2026-04-29
---

# docs/architecture/coding-conventions.md

## 목적

이 문서는 이 저장소의 현재 coding convention이다. 컨벤션은 취향보다 자동 강제 가능한 규칙을
우선하며, `pre-commit`, `commit-msg`, `pnpm check`가 같은 기준을 보게 한다.

제품 기능의 사용자 행동 지도는 `docs/compliance/feature-acceptance-map.md`에서 추적한다. 이 문서는
기능을 재정의하지 않고, 코드 품질 저하와 architecture boundary drift를 막는다.

## 적용 범위

현재 convention은 repo-wide baseline이다. 원격 CI와 pre-push 강제는 아직 baseline에 포함하지
않는다. 로컬에서 다음 기준을 항상 유지한다.

- Commit message는 conventional commit 형식을 따른다.
- Commit 전에는 format, lint, typecheck, architecture check, test를 통과해야 한다.
- 작업 완료 전에는 `pnpm check` 또는 해당 변경 범위의 더 좁은 명시적 검증 명령을 실행한다.
- CSS, spacing, color, typography, layout polish 같은 순수 시각 변경을 제외한 동작 변경은 TDD를
  따른다.
- Product-facing 변경은 `docs/product/product-principles.md`의 기능 설명 원칙과 충돌하지 않는지 확인한다.

## 로컬 게이트

`commit-msg`는 `pnpm exec commitlint --edit "$1"`을 실행한다.

`pre-commit`은 `scripts/with-node.sh pnpm precommit:staged`를 실행한다. 이 staged-file gate는
변경 파일을 기준으로 필요한 검사만 실행한다.

1. 모든 commit에서 `git diff --cached --check`
2. Prettier 대상 staged 파일이 있으면 해당 파일만 `prettier --check`
3. ESLint 대상 staged 파일이 있으면 해당 파일만 `eslint`
4. TypeScript source, package, tsconfig, lockfile 변경이 있으면 관련 typecheck
5. Source 또는 architecture 설정 변경이 있으면 `pnpm arch:check`
6. Source, package, lockfile 변경이 있으면 `pnpm test`

`pnpm check`는 작업 완료 전 최종 게이트다. Root script 기준으로 `typecheck`, `lint`,
`format:check`, `arch:check`, `test`가 모두 통과해야 한다.

## 자동 검사 책임

각 도구는 하나의 주 책임을 가진다.

| Tool               | 책임                                                       |
| ------------------ | ---------------------------------------------------------- |
| ESLint             | 코드 품질, naming, import pattern, React, hooks, a11y 규칙 |
| dependency-cruiser | 의존성 그래프, cycle, module boundary, package boundary    |
| TypeScript         | strict type safety                                         |
| Prettier           | 코드, 설정, script, task Markdown formatting               |
| Tests              | TDD와 동작 보증                                            |
| Husky              | staged-file 기준 로컬 강제 진입점                          |
| commitlint         | conventional commit message 검사                           |

Custom architecture script는 저장소 고유 architecture invariant만 맡는다. 예를 들어 금지된 shared
domain/application package, deferred module, backend domain purity는 저장소 고유 규칙이다. 파일
길이, 함수 길이, 일반 naming, docs Markdown formatting 같은 범용 규칙은 ESLint와 Prettier가
맡는다.

## ESLint 강제 규칙

ESLint는 production source를 기본 대상으로 한다. `docs/research/**`는 POC 산출물과 benchmark
코드를 보존하기 위해 ESLint 대상에서 제외한다. Generated output, build output, coverage,
Playwright output, `pnpm-lock.yaml`도 제외한다.

Production `ts`, `tsx`, `mjs` 파일의 기본 규칙은 다음과 같다.

- File length는 blank line과 comment를 제외하고 250 lines 이하.
- 일반 함수 body는 blank line과 comment를 제외하고 30 lines 이하.
- Cyclomatic complexity는 6 이하.
- `max-depth`는 2 이하. 즉, 2단계 중첩까지 허용하고 3단계 중첩부터 실패한다.
- Type, interface, class는 `PascalCase`.
- Function은 `camelCase` 또는 React component용 `PascalCase`.
- `const`와 variable은 `camelCase`, `PascalCase`, `UPPER_CASE` 중 하나.
- `import/no-cycle`은 external dependency를 제외하고 1단계 순환 import 탐색을 실패로 본다.
- `apps/api/src/**`를 직접 import하는 frontend code는 실패한다.

Use-case 파일은 orchestration 성격을 고려해 함수 body를 50 lines까지 허용한다.

React component와 adapter 파일은 cyclomatic complexity를 8까지 허용한다.

Test file과 `e2e/**/*.ts`는 cyclomatic complexity를 10까지 허용하고, file length, function
length, `max-depth` 제한을 적용하지 않는다.

Backend domain 파일은 provider-neutral이어야 한다. Domain 파일에서 다음 계열 import는 실패한다.

- NestJS, React, Tiptap, ProseMirror, Yjs, Hocuspocus, Yorkie
- Prisma, AWS SDK, Redis client

Frontend React 파일은 React Hooks와 a11y 규칙을 적용한다. React 19 JSX runtime을 쓰므로
`react/react-in-jsx-scope`와 `react/jsx-uses-react`는 끈다.

## 코드 구조 규칙

한 함수는 같은 추상화 레벨의 문장으로 읽혀야 한다. Domain decision, IO/provider 호출,
formatting, rendering을 한 함수에 섞지 않는다. 상위 함수는 단계만 읽히게 하고, 세부 계산은
이름 있는 helper로 내린다.

Guard clause와 early return을 기본 제어 흐름으로 둔다. 3단계 이상 중첩이 필요해 보이면 조건을
분리하거나 helper, lookup map, strategy 함수로 풀어야 한다.

파일 전역 `const`는 pure constant, enum-like map, static config만 허용한다. request, user,
document, session 같은 runtime state는 파일 전역에 두지 않는다.

공용 타입을 여러 곳에 다시 선언하지 않는다. Wire contract는 `packages/contracts`, backend
domain type은 owning module, frontend view model은 owning feature에 둔다.

같은 의미의 로직이 2회 나오면 추출을 검토하고, 3회 나오면 추출한다. 단, 성급한 shared util
생성은 피하고 feature-local helper를 우선한다.

## TDD와 테스트 구조

CSS, spacing, color, typography, layout polish 같은 순수 시각 변경은 TDD 예외다. 그 외 동작
변경은 TDD 대상이다.

- Domain, value, use-case, contract 변경은 unit test를 먼저 작성한다.
- Repository, adapter, API contract 변경은 unit 또는 integration test를 먼저 작성한다.
- Sync, offline merge, presence, history, rich preview처럼 CE 요구사항에 걸린 변경은
  integration 또는 e2e test로 검증한다.
- React 상태, editor mode, preview rendering, presence 표시 동작은 UI처럼 보여도 제품 동작이므로
  테스트 대상이다.
- 순수 시각 변경은 필요하면 screenshot 또는 manual visual checklist로 검증한다.

AI 작업 루프는 red, green, refactor를 따른다.

1. 실패하는 테스트를 먼저 작성한다.
2. 실패 이유가 의도한 요구사항 때문인지 확인한다.
3. 가장 작은 구현으로 테스트를 통과시킨다.
4. 리팩터링 후 같은 테스트를 다시 통과시킨다.
5. 작업 완료 전 `pnpm check` 또는 해당 범위의 명시적 검증을 실행한다.

## Frontend FSD-lite 규칙

현재 frontend는 FSD-lite로 운영한다.

- `app`은 화면 골격과 feature 연결을 맡는다.
- `features/*`는 자기 기능의 상태, view model, UI, interaction을 소유한다.
- 한 feature는 다른 feature의 내부 파일을 직접 import하지 않는다.
- Feature 간 연결은 `app`에서 props, contracts, 또는 명시적인 public export로 한다.
- `lib/api-client`는 통신만 맡는다. 화면 상태, domain decision, UI formatting을 넣지 않는다.
- 제품 의미가 있는 컴포넌트는 owning feature에 둔다.
- 제품 의미가 없는 공용 부품만 shared 성격으로 승격할 수 있다.

예를 들어 `DocumentStatusBadge`는 document feature 소유가 맞고, 범용 `Button` 또는 날짜 format
helper는 실제 재사용 지점이 충분할 때 shared 성격으로 승격할 수 있다.

## Prettier와 문서

Prettier 설정은 현재 값을 유지한다.

- `printWidth: 100`
- `semi: true`
- `singleQuote: false`
- `trailingComma: "all"`
- `proseWrap: "preserve"`

`docs/**/*.md`와 루트 `*.md`는 Prettier 강제 대상이 아니다. 공식 문서 품질은 자동 포맷보다
요구사항 정합성, CE 기준, ADR/domain/product 문맥 유지로 관리한다.

`tasks/**/*.md`는 Prettier 대상이다.

## 제외 범위와 승격 조건

현재 convention은 다음을 강제하지 않는다.

- 새 `packages/*` 생성에 대한 허용 목록.
- docs Markdown 자동 formatting.
- UI 구현 전 ErrorBoundary와 Suspense 경계 규칙.
- 원격 CI와 pre-push 강제.

새 package가 필요한지는 coding convention이 아니라 그때의 architecture/design 판단으로 결정한다.

Walking skeleton 완성 뒤 다음 항목을 별도 task로 승격할 수 있다.

- 더 세밀한 import boundary plugin 설정.
- Visual regression 또는 screenshot 검증 자동화.
- CE e2e 검증 job 분리.

## 변경 검증

이 문서를 바꿀 때는 최소한 `git diff --check`를 실행한다. 코드, 설정, hook, package 변경이 함께
있으면 `pnpm check`를 실행한다.
