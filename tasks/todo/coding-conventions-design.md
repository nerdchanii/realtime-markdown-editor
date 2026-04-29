---
title: Coding conventions design
status: todo
scope: repo
approved_at: 2026-04-29
---

# Coding Conventions Design

## 목표

로컬-only 개발 환경에서 코드 품질을 강하게 유지한다. 컨벤션은 취향 문서가 아니라
`pre-commit`, `commit-msg`, `pnpm check`로 강제 가능한 규칙을 우선한다. 최우선 기준은
`subject.md`의 CE-01부터 CE-05까지의 평가 경로와 기존 architecture boundary를 흐리지 않는 것이다.

## 도입 단계

Walking skeleton 단계에서는 A+를 적용한다.

- 로컬 전방위 게이트를 둔다.
- 최소 필수 ESLint plugin을 도입하고 규칙을 강화한다.
- CSS와 순수 시각 변경을 제외한 동작 변경에는 TDD를 적용한다.
- 원격 저장소가 없으므로 CI와 pre-push는 필수 강제 지점에서 제외한다.
- Skeleton 완성 뒤 더 강한 C 단계로 승격할 수 있다.

C 단계 승격 후보는 다음과 같다.

- staged file 중심 검사 최적화.
- 더 세밀한 import boundary plugin 설정.
- visual regression 또는 screenshot 검증 자동화.
- CE e2e 검증 job 분리.

## 자동 검사 책임

각 도구는 하나의 주 책임을 가진다.

- ESLint: 코드 품질, naming, import pattern, React/hooks/a11y 규칙.
- dependency-cruiser: 의존성 그래프, cycle, module boundary, package boundary.
- TypeScript: strict type safety.
- Prettier: 코드, 설정, script, task Markdown formatting.
- Tests: TDD와 동작 보증.
- Husky: 로컬 강제 진입점.
- commitlint: conventional commit message 검사.

Custom architecture script는 이번 컨벤션에서 새 책임을 늘리지 않는다. 이미 있는 저장소 고유
검사는 유지하되, 파일 길이, 함수 길이, docs Markdown 포맷, package 분리 정책 같은 범용 규칙을
새로 맡기지 않는다.

## 로컬 강제 지점

`commit-msg`는 현재처럼 commitlint를 실행한다.

`pre-commit`은 빠른 로컬 게이트다. 기본 목표는 format check, lint, typecheck, architecture
check, 빠른 테스트를 커밋 전에 실행하는 것이다. CE e2e처럼 무거운 검증은 작업 완료 전
`pnpm check` 또는 명시적 CE 검증 명령으로 실행한다.

`pnpm check`는 작업 완료 전 최종 게이트다. 현재 구조의 `typecheck`, `lint`, `format:check`,
`arch:check`, `test`를 모두 통과해야 한다.

## ESLint 규칙 방향

ESLint는 deterministic rule을 최대한 사용한다.

- production `ts`와 `tsx` 파일은 250 lines 이하.
- 일반 함수 body는 30 lines 이하.
- orchestration 또는 use-case 성격의 함수 body는 50 lines 이하.
- production 기본 cyclomatic complexity는 6 이하.
- React component와 adapter는 cyclomatic complexity 8 이하.
- test file은 cyclomatic complexity 10 이하로 완화할 수 있다.
- production `max-depth`는 2 이하.
- `@typescript-eslint/naming-convention`으로 type, interface, class, function, const naming을
  강제한다.
- `no-restricted-imports`와 import/boundary plugin으로 금지 import pattern을 빠르게 잡는다.
- React, React Hooks, a11y plugin을 추가해 frontend 기본 위반을 잡는다.

Cyclomatic complexity는 함수 안의 실행 경로 수를 세는 기준이다. `if`, `else if`, loop, `case`,
`catch`, ternary, 논리 분기가 늘수록 점수가 올라간다. Line 수가 짧아도 분기가 많으면 실패해야
한다.

## 코드 품질 규칙

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

`docs/**/*.md`와 루트 `*.md`는 Prettier 강제 대상에 넣지 않는다. 공식 문서 품질은 자동 포맷보다
요구사항 정합성, CE 기준, ADR/domain/product 문맥 유지로 관리한다.

`tasks/**/*.md`는 현재처럼 Prettier 대상에 둔다.

## 제외 범위

이번 컨벤션에서 다음은 제외한다.

- Package 분리 금지 또는 허용 목록.
- 새 `packages/*` 생성에 대한 문서 규칙, cruiser 규칙, 리뷰 규칙.
- docs Markdown 자동 formatting.
- Custom architecture script의 책임 확대.
- UI 구현 전 ErrorBoundary와 Suspense 경계 규칙.
- 원격 CI와 pre-push 강제.

새 package가 필요한지는 코딩 컨벤션이 아니라 그때의 architecture/design 판단으로 결정한다.

## 검증

설계 문서 작성 후 다음을 확인한다.

- Placeholder, 모순, 애매한 범위가 없는지 self-review한다.
- `pnpm format:check`로 task Markdown 포맷을 확인한다.
- 새 문서만 stage하고 commit한다.
