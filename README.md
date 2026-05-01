# 동시편집 마크다운 에디터

여러 명이 같은 마크다운 문서를 동시에 편집하는 협업 에디터입니다.

자유 주제는 가장먼저 누구에게 팔아야할까고민했습니다.
**개발팀이 프로젝트 문서를 함께 관리하는 워크스페이스형 문서 도구**로 잡았습니다. 
단순한 CRDT 데모보다, 실제 팀이 문서를 찾고 작성하고 이력을 남기는 흐름이 더 중요하다고 보았습니다.

현재 구현한 범위는 다음과 같습니다.

- 로그인 
- 폴더/문서형태의 문서트리구조 
- TipTap 기반 리치 마크다운 편집
- Yjs/Hocuspocus 기반 실시간 본문 동시 편집
- IndexedDB 기반 오프라인 임시 저장본 복구와 재연결 병합
- 문서 제목과 속성 편집
- 수동 체크포인트 생성과 이력 패널의 읽기 전용 스냅샷 확인

고민했지만 이번 범위에서 제외한 것은 원본 마크다운 편집기, 분할 프리뷰같은 에디터 본연에부분이었습니다.
사용자가 raw markdown을 보는게 그렇게 중요하지 않다고 생각했습니다.
시간관계상 로그인과, 워크스페이스 생성, 권한 관리 UI, 복원/브랜치,
위키링크, 데스크톱 앱등은 계획하고, 진행하지는 못했습니다. 

사실 frontmatter와 DocumentState, Document Property를 이용해 훅시스템을 구축하려했습니다.
문서를 편집하고, 프로젝트별로 설정된 특정조건이나 문서의 업데이트 주기에 맞추어 훅을 제공하려했습니다. 
훅시스템을 이용하면 문서를 자동화하거나, 외부시스템을 자동화할 수 있다고 생각했고, 현재 AX를 계획하는 많은 기업들의 관심사라고 생각했기때문입니다.
다만, 시간관계상 뒤로 미루어 마치지 못한점이 아쉬웠습니다. 


## 과제 요구사항

| ID | 요구사항 | 현재 구현 |
| --- | --- | --- |
| CE-01 | 2명 이상이 같은 마크다운 문서를 동시에 편집 | Yjs/Hocuspocus 협업 세션 |
| CE-02 | 다른 사용자의 커서/선택 영역 표시 | TipTap 협업 커서와 구성원 식별 정보 |
| CE-03 | 네트워크 단절 후 재접속 시 자동 병합 | Yjs 병합과 IndexedDB 오프라인 임시 저장본 복구 |
| CE-04 | 문서 변경 이력 조회 | 수동 체크포인트와 이력 패널 |
| CE-05 | 마크다운 리치 프리뷰 | TipTap 리치 마크다운 작성 화면 |

상세 충족 지도는 [docs/compliance/subject-matrix.md](./docs/compliance/subject-matrix.md)에 있습니다.

## 기술 스택

- 프론트엔드: React 19, Vite, TypeScript, TipTap
- 실시간 협업: Yjs, Hocuspocus
- 백엔드: NestJS, Prisma
- 데이터베이스: PostgreSQL 16
- E2E 테스트: Playwright
- 패키지 매니저: pnpm

## 실행 준비

필요한 도구:

- `fnm`
- Node.js 24.x 권장
- pnpm `10.28.2`
- Docker / Docker Compose

`scripts/with-node.sh`가 `fnm`으로 저장소의 Node 버전을 맞춰 실행합니다. 저장소 설정상 공식
지원 범위는 Node `>=24 <25`입니다. 별도 worktree에서 Node `25.9.0`으로 설치, Prisma 생성,
`pnpm check` 통과는 확인했지만, 아직 package engine 범위와 전체 build gate를 Node 25 기준으로
갱신하지는 않았습니다.

## 설치

```bash
scripts/with-node.sh pnpm install
scripts/with-node.sh pnpm db:generate
```

E2E 테스트까지 실행하려면 Chromium 브라우저도 설치합니다.

```bash
scripts/with-node.sh pnpm exec playwright install chromium
```

## 빌드

프로덕션 빌드는 아래 명령으로 실행합니다.

```bash
scripts/with-node.sh pnpm build
```

이 명령은 `@rme/contracts`를 먼저 `dist`로 빌드한 뒤 API, 협업 서버, 웹 앱을 빌드합니다.
API 빌드는 contracts 패키지의 `src`를 직접 컴파일하지 않고 패키지 산출물을 참조하므로
`rootDir` 밖 소스가 포함되는 TypeScript 빌드 오류를 피합니다.

## 로컬 실행

아래 명령은 PostgreSQL 컨테이너를 띄우고, 마이그레이션과 로컬 초기 데이터를 적용한 뒤 API,
협업 서버, 웹 앱을 함께 실행합니다.

```bash
POSTGRES_HOST_PORT=55432 \
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:55432/realtime_markdown_editor \
COLLAB_PORT=4001 \
RME_COLLAB_PUBLIC_URL=ws://127.0.0.1:4001 \
scripts/with-node.sh pnpm dev
```

브라우저에서 엽니다.

```text
http://127.0.0.1:5173
```

검토용 문서를 바로 열고 싶으면 다음 URL을 사용할 수 있습니다.

```text
http://127.0.0.1:5173/?workspace=workspace_review&document=document_review_plan
```

## 로컬 계정

비밀번호는 모두 `password`입니다.

| 이메일 | 역할 |
| --- | --- |
| `alice@example.test` | 소유자 |
| `bob@example.test` | 구성원 |
| `carol@example.test` | 구성원 |
| `dana@example.test` | 구성원 |

UI의 빠른 로그인은 Alice/Bob만 보여주지만, Carol/Dana도 이메일과 비밀번호로 로그인할 수 있습니다.

## 검증

```bash
POSTGRES_HOST_PORT=55432 \
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:55432/realtime_markdown_editor \
COLLAB_PORT=4001 \
RME_COLLAB_PUBLIC_URL=ws://127.0.0.1:4001 \
scripts/with-node.sh pnpm check
```

```bash
POSTGRES_HOST_PORT=55432 \
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:55432/realtime_markdown_editor \
COLLAB_PORT=4001 \
RME_COLLAB_PUBLIC_URL=ws://127.0.0.1:4001 \
scripts/with-node.sh pnpm test:e2e
```

## 중요한 결정 문서

- [ADR-0001: 도메인 우선 설계와 협업 엔진 격리](./docs/adr/0001-domain-first-collaboration-engine-isolation.md)
- [ADR-0002: TipTap + Yjs + Hocuspocus 선택](./docs/adr/0002-collaboration-engine-poc-bench.md)
- [ADR-0003: 저장소 역할 분리](./docs/adr/0003-storage-strategy.md)
- [ADR-0005: 에디터 우선 UI 셸](./docs/adr/0005-ui-shell-scope-model.md)
- [ADR-0007: 리치 마크다운 작성 화면](./docs/adr/0007-rich-markdown-authoring-surface.md)

## 문서

- [subject.md](./subject.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [docs/product/README.md](./docs/product/README.md)
- [docs/domain/README.md](./docs/domain/README.md)
- [DESIGN.md](./DESIGN.md)
