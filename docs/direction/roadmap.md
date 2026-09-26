---
title: 방향 전환 로드맵
status: living
decided_by: agent (구성 제안) / user (원칙: 점진적 해결, 컨텍스트 우선, ADR 후 코드 결정)
source: docs/direction/2026-09-24-product-direction-interview.md
---

# 방향 전환 로드맵

Realtime markdown editor 에서 Realtime editor(ADE 표면)로 가는 전환 계획이다. 한 번에 모두 해결하지
않는다. 각 단계는 하나 이상의 작은 PR 로 끝나며, 앞 단계의 결과가 다음 단계의 입력이 된다.

> 참고 [agent]: 진단과 인터뷰가 끝난 뒤 `main` 에 다음 변경이 들어왔다.
> - seed runtime 제거
> - exec-plan archive
> - editor-first shell refresh
> - CE acceptance spec 분리
> - `docs/product/product-principles.md` 추가
>
> 그래서 단계 1 과 "저위험 정비"의 개별 항목은 착수 전에 현재 `main` 기준으로 다시 확인한다.
> `product-principles.md` 도 인터뷰 기록과 충돌하는지 확인한다.

게이트 표기(업계 조사 기반 제안, 채택 여부는 [open]):

- **G0**: 에이전트 자율
- **G1**: 에이전트 결정 + 사용자 비동기 추인
- **G2**: 사용자 선결정

## 단계 0. 의도 보존 (이번 세션)

- [x] 진단 결과와 인터뷰 기록: `docs/direction/2026-09-24-product-direction-interview.md`
- [x] 이 로드맵
- [x] AGENTS.md 에 "제품 정의 재정립 중" 안내와 기록 링크 추가. 전면 재작성은 단계 1 에서 한다.

## 단계 1. 에이전트 컨텍스트 정리 (최우선)

목표: 에이전트가 읽는 문서가 **짧고, 오해가 없고, 현재 사실과 일치**하게 한다.

진행 상황 (2026-09-25):

1. [x] **결정 체계 확정** (G2): 사용자가 G0/G1/G2 를 채택했다(2026-09-25).
   `docs/adr/0010-decision-gates-and-provenance.md`, `docs/direction/decision-log.md`, ADR 템플릿에 반영했다.
2. [x] **AGENTS.md 재작성** (G1): 제품 정의, 결정 규칙, 과거 실패에서 나온 작업 규칙, 검증 명령,
   문서 지도로 구성했다.
3. [x] **레거시 격리** (G1, 사용자가 슬림 재구성을 지시)
   - `tasks/`, `docs/requirements/`, `docs/compliance/` 를 `docs/archive/` 로 옮겼다.
   - active 문서의 경로 참조를 갱신했다. `ARCHITECTURE.md` 에서 subject framing 을 걷어냈다.
   - 과거 ADR 본문은 당시 기록이므로 고치지 않았다.
4. [x] **작업 기록 이전** (G0)
   - [x] `tasks/` 를 저장소 작업 경로에서 뺐다.
   - [x] PR 의 "Decisions" 섹션과 decision log 승격 규칙을 두었다.
   - [x] 미결 요구 21건(archive 된 items 2건, backlog 19건)은 결정 단위 추적 Issue 7개로 묶었다(A안, 사용자 선택 2026-09-25).
     - 과거 REQ 는 각 Issue 본문에 요구사항이 아닌 "참고 자료"로만 링크했다.
     - Markdown 타입 세부 기능 4건(metadata parsing, task extraction, property templates, wikilinks)은 옮기지 않았다. 문서 타입 ADR([#5](https://github.com/nerdchanii/realtime-markdown-editor/issues/5)) 뒤에 다시 본다.
5. [x] **사실 불일치 정리** (G0)
   - `docs/domain/models/document.md` 의 ADR-0009(proposed) 확정 인용을 현재 구현 기준으로 고쳤다.
   - 존재하지 않는 경로 참조를 정리했다.
6. [x] **기계 검증** (G0)
   - `pnpm docs:check`: 깨진 링크, ADR 형식과 게이트, proposed 인용을 검사한다. pre-commit 과 `pnpm check` 에 포함된다.
   - ESLint mock/seed/fixture/fake import 금지(ratchet):
     - 현재 위반 4개 파일만 허용 목록에 있다(UI-GAP-013).
     - 새 위반은 막힌다. 제거는 후속 작업이다.
   - GitHub Actions CI: `pnpm install`, `pnpm db:generate`, `pnpm check`
   - `scripts/with-node.sh` 는 `fnm` 이 없어도 동작한다.

## 단계 2. 제품 정의 문서

1. **Vision / Principles** (G2)
   - "동시편집"과 "에디터" 두 축
   - 사람과 에이전트가 함께 쓰는 ADE 표면
   - 문서 타입 모델의 방향
   - Non-goals
2. [x] **UI 원칙** (G2 방향, G1 세부): [#7](https://github.com/nerdchanii/realtime-markdown-editor/issues/7)
   - [ADR-0014](../adr/0014-ui-principles.md) 를 accepted 로 결정했다(2026-09-26).
   - `DESIGN.md` 를 v0.4.0 으로 다시 썼다.
   - 현재 화면 기준 스크린샷을 `docs/design/current-ui/` 에 두었다.
   - 레퍼런스(Linear, Figma, Zed)는 이미지 보드 없이 텍스트 특징으로 정의한다([user] 2026-09-26).
   - 금지 규칙은 스크린샷 before/after 로 확인한다. 정규식 lint 는 효과가 없어 제거했다([user]).
   - [x] 스타일 방식과 AST lint: [ADR-0015](../adr/0015-plain-css-and-style-lint.md) accepted (2026-09-26, [#13](https://github.com/nerdchanii/realtime-markdown-editor/issues/13)).
     - plain CSS + token, border 는 두 레이어, 예외는 lint 설정으로만
     - Stylelint, ESLint, bulk suppression ratchet

## 단계 3. 핵심 ADR (코드를 바꾸기 전에)

| ADR 후보 | 핵심 질문 | 게이트 | 추적 |
| --- | --- | --- | --- |
| 데이터 권위 모델 | 서버 권위 + 로컬 캐시, local-first, 범위별 혼합 중 무엇인가. 개인 범위와 조직 범위의 경계는 어디인가 | G2 | [#2](https://github.com/nerdchanii/realtime-markdown-editor/issues/2) |
| 문서 타입 모델 | 공통 core 와 타입별 editor 의 경계, 첫 타입(rich text 또는 markdown) | G2 | [#5](https://github.com/nerdchanii/realtime-markdown-editor/issues/5) |
| 권한 모델 | 개인 workspace 와 조직 workspace, 역할, 문서 단위 공유, 에이전트 신원(대리인과 독립 참여자) | G2 | [#3](https://github.com/nerdchanii/realtime-markdown-editor/issues/3) |
| 에이전트 참여 프로토콜 | 로컬과 서버 에이전트가 붙는 프로토콜(MCP, sync API), 에이전트 편집 기본 동작(제안 또는 직접 편집) | G2 | [#4](https://github.com/nerdchanii/realtime-markdown-editor/issues/4) |
| Workspace 계층 | Folder 로 파일시스템을 흉내 낼지, 나중의 실제 파일시스템 연동과 어떻게 이어질지. ADR-0006 재검토 | G2 | [#6](https://github.com/nerdchanii/realtime-markdown-editor/issues/6) |

ADR 은 에이전트가 비교안과 추천안을 `proposed` 로 작성하고, 사용자가 accepted 로 바꾼다.

작성 현황:

- 데이터 권위: [ADR-0011](../adr/0011-data-authority-by-scope.md) **accepted** (2026-09-25).
  - 범위별 권위를 택했다. local 범위도 바로 도입한다.
  - 세부 결정: 서버가 읽을 수 있는 sync, 계정 없는 local 사용 허용, 권한 회수 시 sync 차단과 사본 삭제 시도.
- 권한: [ADR-0012](../adr/0012-authorization-policy-and-principals.md) **accepted** (2026-09-25).
  - 단일 policy, `owner/admin/editor/viewer` + 자원 grant(다음 단계), 사람과 에이전트 principal 구분.
  - SSO 는 나중에 한다.
- 문서 타입: [ADR-0013](../adr/0013-document-type-model.md) **accepted** (2026-09-25).
  - 첫 타입은 `markdown` 이다. Markdown 텍스트(`Y.Text`)가 정본이고, CodeMirror 라이브 프리뷰로 편집한다.
  - 두 번째 타입은 `code` 다. rich-text 는 보류한다.
  - ADR-0007 을 대체한다.
- 에이전트 참여: [ADR-0016](../adr/0016-agent-participation-protocol-and-edit-mode.md) **accepted** (2026-09-26).
  - 문서 연산 API + MCP 로 참여한다. 편집은 권한 상한 안에서 고른 모드 단계(수동 / 편집 수락 / 자동 / 자동+크루즈 / 모두 허용)로 반영된다.
- 문서 워크플로우: [ADR-0017](../adr/0017-document-workflow-triggers-and-executor.md) **accepted** (2026-09-26).
  - 워크플로우는 주인과 트리거를 선언한다. 상태 전환은 권한으로 제한하고 `DocumentState` 는 DB 에 둔다. 연쇄를 허용하되 상한으로 끊고, 별도 실행기가 실행한다.

## 단계 4. 코드 방향 결정과 policy 기반 수정

- [x] 코드 방향(G2, [user] 2026-09-26)
  - 기존 web UI 는 새로 짠다.
  - 협업 엔진은 Yjs 를 유지한다.
  - 진행 순서는 **로컬 편집 → 동시편집** 이다(decision log).
- 슬라이스
  1. 로컬 markdown 에디터: CodeMirror 라이브 프리뷰 + Yjs + 브라우저 저장, 새 shell ([#15](https://github.com/nerdchanii/realtime-markdown-editor/issues/15))
  2. 동시편집: 같은 문서 구조에 Hocuspocus provider 를 붙이고 협업 연결 인증(ADR-0012 §1)을 넣는다.
- 권한 모델을 확정한 뒤, policy 에 따라 다음을 고친다(진단에서 발견된 항목):
  - collab 연결 인증
  - internal API 인증
  - 비밀번호 backfill migration
  - CORS 와 cookie
  - archived 문서 편집 차단
  - workspace 간 이동 검증
- 데이터 유실 위험(Yjs fallback 덮어쓰기, REST 와 Yjs 이중 쓰기, draft flush)은 데이터 권위 ADR 에
  맞춰 처리한다.

## 언제든 끼워 넣을 수 있는 저위험 정비 (G0)

- collab 의 `*.spec.ts`, API 의 `http-boundary.spec.ts` 가 test glob 에 포함되지 않아 실행되지 않는 문제
- listener capture 해제 불일치(`use-element-rect.ts`, `use-scrolling.ts`)
- Playwright 포트를 env 에서 읽도록 변경
