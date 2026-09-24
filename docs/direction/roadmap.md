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

1. **결정 체계 확정** (G2, 사용자)
   - G0/G1/G2 등급, 결정 frontmatter(`status`, `decided_by`, `gate`, `revisit_if`, `evidence`),
     추인 기한과 방식을 확정한다.
   - 확정 결과를 첫 ADR 로 남긴다.
2. **AGENTS.md 재작성** (G1)
   - 약 100줄 이내의 "지도"로 만든다.
   - subject/CE 대신 제품 정의와 인터뷰 기록을 가리킨다.
   - 반드시 지킬 규칙은 문서가 아니라 hook 과 CI 로 옮긴다.
3. **레거시 격리** (G1)
   - 다음을 `docs/archive/` 로 옮긴다: `subject.md` 참조, `docs/compliance/`, CE 요구사항,
     `tasks/archive`, `tasks/exec-plan`, `docs/requirements/**`.
   - 에이전트가 기본으로 읽는 경로에서 제외한다. 이력은 git 에 남는다.
4. **작업 기록 이전** (G0)
   - 진행 중이거나 보류 중인 요구(backlog, items)를 GitHub Issue 로 옮긴다.
   - `tasks/` 를 제거한다.
   - PR 을 마무리할 때 지속되는 결정을 decision log 로 승격하는 규칙을 둔다.
5. **사실 불일치 정리** (G0)
   - ADR-0009 가 `proposed` 인데 domain 문서가 확정 사실로 인용하는 문제를 고친다.
   - 존재하지 않는 경로 참조(`tasks/todo/`, `docs/backlog/`, `subject.md`)를 고친다.
6. **기계 검증** (G0)
   - `proposed` 인용 금지와 깨진 링크를 검사하는 docs lint 를 추가한다.
   - 제품 경로의 mock/seed import 를 금지하는 lint 를 추가한다.
   - CI(GitHub Actions)에서 `pnpm check` 를 돌린다. `prisma generate` 자동화도 포함한다.

## 단계 2. 제품 정의 문서

1. **Vision / Principles** (G2)
   - "동시편집"과 "에디터" 두 축
   - 사람과 에이전트가 함께 쓰는 ADE 표면
   - 문서 타입 모델의 방향
   - Non-goals
2. **UI 원칙** (G2 방향, G1 세부)
   - Linear, Figma, Zed 레퍼런스 보드(이미지)를 기준으로 삼는다.
   - 금지 규칙(card 와 border wrapping, 요청 없는 표면, 동작하지 않는 placeholder)은 lint 와 스크린샷
     검증으로 강제한다.
   - 기존 `DESIGN.md` 를 이 원칙에 맞춰 줄인다.

## 단계 3. 핵심 ADR (코드를 바꾸기 전에)

| ADR 후보 | 핵심 질문 | 게이트 |
| --- | --- | --- |
| 데이터 권위 모델 | 서버 권위 + 로컬 캐시, local-first, 범위별 혼합 중 무엇인가. 개인 범위와 조직 범위의 경계는 어디인가 | G2 |
| 문서 타입 모델 | 공통 core 와 타입별 editor 의 경계, 첫 타입(rich text 또는 markdown) | G2 |
| 권한 모델 | 개인 workspace 와 조직 workspace, 역할, 문서 단위 공유, 에이전트 신원(대리인과 독립 참여자) | G2 |
| 에이전트 참여 프로토콜 | 로컬과 서버 에이전트가 붙는 프로토콜(MCP, sync API), 에이전트 편집 기본 동작(제안 또는 직접 편집) | G2 |
| Workspace 계층 | Folder 로 파일시스템을 흉내 낼지, 나중의 실제 파일시스템 연동과 어떻게 이어질지. ADR-0006 재검토 | G2 |

ADR 은 에이전트가 비교안과 추천안을 `proposed` 로 작성하고, 사용자가 accepted 로 바꾼다.

## 단계 4. 코드 방향 결정과 policy 기반 수정

- 단계 3 이 끝난 뒤, 기존 코드를 점진적으로 진화시킬지 core 만 남기고 교체할지 결정한다(G2).
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
