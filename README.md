# 동시편집 마크다운 에디터

개발팀이 프로젝트 문서를 함께 작성하고 관리하는 워크스페이스형 Markdown 협업 도구입니다.
문서 작성, 실시간 협업, 구성원 presence, 이력 관리, 오프라인 복구를 한 에디터 흐름 안에서 다룹니다.

## 주요 기능

- 계정 기반 로그인과 워크스페이스 멤버십
- 프로젝트, 폴더, 문서로 이어지는 문서 탐색 구조
- TipTap 기반 리치 Markdown 작성 화면
- Yjs/Hocuspocus 기반 실시간 본문 동시 편집
- 구성원 커서, 선택 영역, 동기화 상태 표시
- 체크포인트 기반 문서 이력 조회
- IndexedDB 기반 오프라인 임시 저장본 복구와 재연결 병합
- 문서 속성, 링크, 백링크, Markdown 내보내기

## 제품 방향

이 제품은 팀 문서가 흩어지지 않도록 워크스페이스 안에서 작성 맥락과 변경 이력을 함께 보존합니다.
리치 에디터를 기본 작성 화면으로 두고, Markdown의 이동성과 협업 편집의 수렴성을 함께 유지합니다.
DocumentState와 문서 속성은 앞으로 문서 자동화, 검토 흐름, 외부 시스템 연동의 기반으로 확장됩니다.

## 기술 스택

- 프론트엔드: React 19, Vite, TypeScript, TipTap
- 실시간 협업: Yjs, Hocuspocus
- 백엔드: NestJS, Prisma
- 데이터베이스: PostgreSQL 16
- E2E 테스트: Playwright
- 패키지 매니저: pnpm

## 실행 준비

필요한 도구:

- Node.js 24 이상
- pnpm `10.28.2`
- PostgreSQL 16 이상 (로컬 설치, 기본 `127.0.0.1:5432`)

Node.js 24 이상과 pnpm이 설치되어 있으면 별도 버전 매니저 없이 바로 실행할 수 있습니다.
저장소 설정상 공식 지원 범위는 Node `>=24`입니다.

pnpm이 없다면 Node.js에 포함된 Corepack으로 준비할 수 있습니다.

```bash
corepack enable
corepack prepare pnpm@10.28.2 --activate
```

## 설치

```bash
pnpm install
pnpm db:generate
```

E2E 테스트까지 실행하려면 Chromium 브라우저도 설치합니다.

```bash
pnpm exec playwright install chromium
```

## 빌드

프로덕션 빌드는 아래 명령으로 실행합니다.

```bash
pnpm build
```

이 명령은 `@rme/contracts`를 먼저 `dist`로 빌드한 뒤 API, 협업 서버, 웹 앱을 빌드합니다.
API 빌드는 contracts 패키지의 `src`를 직접 컴파일하지 않고 패키지 산출물을 참조하므로
`rootDir` 밖 소스가 포함되는 TypeScript 빌드 오류를 피합니다.

## 로컬 실행

로컬 PostgreSQL이 실행 중이어야 합니다. 아래 명령은 데이터베이스가 없으면 만들고, 마이그레이션과 로컬 초기
데이터를 적용한 뒤 API, 협업 서버, 웹 앱을 함께 실행합니다. `<your-username>`은 PostgreSQL 역할 이름으로
바꿉니다. `DATABASE_URL`을 생략하면 현재 OS 사용자로 `127.0.0.1:5432`에 접속합니다.

새 로컬 에디터(`apps/editor`, #15)는 서버 없이 실행됩니다. 문서는 이 브라우저의 IndexedDB 에만 저장됩니다.

```bash
pnpm dev:editor   # http://127.0.0.1:5174
```

기존 앱(`apps/web`)은 서버와 DB 가 필요합니다.

```bash
POSTGRES_HOST_PORT=5432 \
DATABASE_URL=postgresql://<your-username>@127.0.0.1:5432/realtime_markdown_editor \
COLLAB_PORT=4001 \
RME_COLLAB_PUBLIC_URL=ws://127.0.0.1:4001 \
pnpm dev
```

브라우저에서 엽니다.

```text
http://127.0.0.1:5173
```

샘플 문서를 바로 열고 싶으면 다음 URL을 사용할 수 있습니다.

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
POSTGRES_HOST_PORT=5432 \
DATABASE_URL=postgresql://<your-username>@127.0.0.1:5432/realtime_markdown_editor \
COLLAB_PORT=4001 \
RME_COLLAB_PUBLIC_URL=ws://127.0.0.1:4001 \
pnpm check
```

```bash
POSTGRES_HOST_PORT=5432 \
DATABASE_URL=postgresql://<your-username>@127.0.0.1:5432/realtime_markdown_editor \
COLLAB_PORT=4001 \
RME_COLLAB_PUBLIC_URL=ws://127.0.0.1:4001 \
pnpm test:e2e
```

## 중요한 결정 문서

- [ADR-0001: 도메인 우선 설계와 협업 엔진 격리](./docs/adr/0001-domain-first-collaboration-engine-isolation.md)
- [ADR-0002: TipTap + Yjs + Hocuspocus 선택](./docs/adr/0002-collaboration-engine-poc-bench.md)
- [ADR-0003: 저장소 역할 분리](./docs/adr/0003-storage-strategy.md)
- [ADR-0005: 에디터 우선 UI 셸](./docs/adr/0005-ui-shell-scope-model.md)
- [ADR-0007: 리치 마크다운 작성 화면](./docs/adr/0007-rich-markdown-authoring-surface.md)

## 문서

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [docs/product/README.md](./docs/product/README.md)
- [docs/domain/README.md](./docs/domain/README.md)
- [DESIGN.md](./DESIGN.md)
