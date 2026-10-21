# souplog

개인 블로그 겸 책장. 글쓰기는 관리자 1명(나)만, 나머지는 조회만 할 수 있다.

- **글** — 마크다운 글, 사진 여러 장·파일 첨부, 메뉴(카테고리) 분류, 제목·본문 검색, 비회원 댓글
- **책장** — 읽는 중·읽은 책·읽고 싶은 책 기록. 카카오 책 검색으로 추가, 0.5점 단위 별점, 한 줄 감상, 연도별 요약과 월별 차트
- **About** — 프로필 사진과 소개

## 무엇이 특이한가

Supabase + Vercel 조합을 쓰지만, 접근 제어 방식은 다르다.

1. **실제 인증을 쓴다.** 이 블로그는 **비공개 글**이 있으므로 Supabase Auth(이메일+비밀번호, 관리자 1명)와 RLS로 서버 단에서 권한을 강제한다.
2. **가입 화면이 없다.** 관리자 계정은 Supabase 대시보드에서 한 번만 직접 만든다. 앱 코드 어디에도 회원가입 폼이 없다.
3. **댓글 비밀번호는 DB 함수 안에서만 다룬다.** `create_comment`/`delete_comment` (둘 다 `security definer`) 가 `pgcrypto`로 해시·검증까지 전담한다. 클라이언트는 평문 비밀번호만 보내고, 해시값(`comments.password_hash`)은 애플리케이션 어디에서도 직접 select하지 않는다 — 목록 조회는 그 컬럼이 없는 `comments_public` 뷰로만 한다.
4. **마크다운은 원문 그대로 렌더링하지 않는다.** `react-markdown`은 `rehype-raw`를 넣지 않는 한 소스에 섞인 raw HTML을 절대 실행하지 않는다. 댓글은 마크다운조차 거치지 않고 순수 텍스트로만 렌더링한다.

## 시작하기

### 1. 의존성

```bash
pnpm install
```

### 2. Supabase

새 프로젝트를 만들고 SQL Editor에 [`supabase/schema.sql`](./supabase/schema.sql)을 그대로 붙여 실행한다. 테이블(`menus` · `nav_items` · `posts` · `comments` · `profile` · `books`), 뷰(`comments_public` · `posts_list`), 함수(`create_comment` · `delete_comment` · `search_posts`), RLS 정책과 GRANT, 사진 버킷(`post-images`)과 첨부 파일 버킷(`post-attachments`)이 한 번에 만들어진다. 여러 번 실행해도 안전하다 — 이미 쓰고 있는 DB라면 컬럼 추가·삭제와 데이터 이관까지 같은 스크립트가 처리한다. 스키마가 바뀐 커밋에는 다시 실행해야 한다는 안내와 실행 순서(코드 배포 전/후)가 적혀 있다.

키는 두 곳에 있다.

| 환경변수                        | 대시보드 위치                          |
| ------------------------------- | -------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | **Settings > Data API** 의 Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Settings > API Keys** 의 `anon` 키   |

`service_role` 키는 쓰지 않는다. 어디에도 넣지 않는다.

**관리자 계정 만들기** — 이 앱에는 회원가입 화면이 없다. **Authentication > Users > Add user** 에서 이메일과 비밀번호로 직접 계정을 하나 만든다. 그 계정이 곧 유일한 글쓴이 계정이다.

### 3. 환경변수

```bash
cp .env.example .env.local
```

| 환경변수               | 용도                                                                                      |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | OG 메타태그의 절대 URL. 배포 도메인으로 바꾼다                                            |
| `KAKAO_REST_API_KEY`   | 책장의 책 검색. Kakao Developers의 **REST API 키**(JavaScript 키 아님). 서버에서만 읽는다 |

`NEXT_PUBLIC_` 접두사가 붙은 값은 빌드 결과물에 그대로 포함된다. `NEXT_PUBLIC_SUPABASE_ANON_KEY`는 RLS로 보호되는 것을 전제로 공개되는 게 정상이다(Supabase의 설계 자체가 그렇다) — `service_role` 키만 절대 노출하면 안 된다.

### 4. 실행

```bash
pnpm dev
```

## 관리자 흐름

1. `/login` 에서 로그인한다. 관리자 대시보드는 따로 없다 — 공개 페이지가 곧 관리 화면이다.
2. 헤더 오른쪽 끝 프로필 아이콘 드롭다운에 **새 글 작성** · **책 추가** · **메뉴 관리** · **About 수정** · 로그아웃이 모여 있다.
3. 글 목록·글 상세·책 상세에는 소유자에게만 수정(연필)·삭제(휴지통) 아이콘이 붙는다. 비공개 글·책도 소유자에게는 함께 보이고, 글에는 `비공개` 배지가 붙는다.
4. `/admin/posts/new` — 마크다운 에디터(좌: 입력, 우: 실시간 미리보기, 모바일은 탭 전환). 사진은 한 글에 최대 10장, 첫 장이 목록·공유 미리보기의 대표 이미지다. PDF·오피스 문서·한글·압축 파일 등은 파일당 10MB, 최대 10개까지 첨부해 본문 아래 다운로드 목록으로 보인다. 공개를 켜지 않으면 비공개로 저장된다.
5. `/admin/books/new` — 카카오 책 검색에서 고른 책으로 폼을 채운다(없으면 직접 입력). 표지는 카카오 CDN에서 받아 스토리지에 저장한다. 책 상세의 **읽기 시작** · **다 읽음** 버튼으로 상태와 날짜를 한 번에 바꾼다.
6. `/admin/menus` — 헤더 상단 메뉴(About · 게시글 · 책장)의 이름·순서·표시 여부와, 게시글 드롭다운에 들어가는 게시글 메뉴의 추가·이름·순서·표시 여부를 관리한다. 상단 메뉴는 연결된 페이지가 고정이라 추가·삭제는 없다.
7. `/admin/about` — 이름·짤막한 소개·하고 싶은 말·프로필 사진.

비공개 글·책은 `is_public = false`인 동안 RLS가 아예 응답에 포함시키지 않는다 — 로그인하지 않은 방문자에게는 존재 자체가 보이지 않는다(404).

## 댓글

로그인 없이 닉네임 + 비밀번호로 남긴다. 본인 댓글은 그 비밀번호로만 삭제할 수 있고, 관리자는 비밀번호 없이 모든 댓글을 지울 수 있다(모더레이션). 공개 글에만 댓글을 달 수 있다 — `create_comment` 함수가 대상 글의 `is_public`을 직접 확인한다.

## 스크립트

| 명령              | 하는 일                                     |
| ----------------- | ------------------------------------------- |
| `pnpm dev`        | 개발 서버 (http://localhost:3000)           |
| `pnpm build`      | 프로덕션 빌드                               |
| `pnpm start`      | 빌드 결과물 로컬 서빙                       |
| `pnpm test`       | 단위 테스트 (vitest) — 순수 함수 위주       |
| `pnpm test:watch` | 단위 테스트 워치 모드                       |
| `pnpm typecheck`  | 타입 검사만                                 |
| `pnpm lint`       | ESLint                                      |
| `pnpm e2e`        | Playwright — 로그인 페이지 스모크·시각 회귀 |

### e2e 범위와 한계

`/login`은 Supabase 연결 여부와 무관하게 항상 같은 화면을 그리므로(헤더가 메뉴 조회 실패를 빈 배열로 흡수한다) 시각 회귀·키보드 접근성·테마 토글 테스트를 여기에 두었다. 홈/글 상세/관리자 화면은 실제 데이터가 있어야 의미 있는 테스트가 되므로, Supabase 프로젝트를 연결한 뒤 직접 눈으로 한 번 확인하는 것을 권장한다 — 체크리스트:

- [ ] 홈 화면에 최신 공개 글이 카드 그리드로 뜨는지, 검색(`?q=`)이 동작하는지
- [ ] 비공개 글·책이 로그아웃 상태에서 404로 처리되는지
- [ ] 댓글 작성/삭제(비밀번호 확인 포함)가 동작하는지
- [ ] 관리자로 글을 쓰고 공개 전환하면 홈에 반영되는지
- [ ] 메뉴 이름·순서·표시 여부를 바꾸면 헤더에 즉시 반영되는지
- [ ] 책 검색 → 추가 → 읽기 시작 → 다 읽음 흐름과 연도별 요약·월별 차트
- [ ] 라이트/다크 전환이 실제 콘텐츠 페이지에서도 자연스러운지

시각 회귀 스냅샷을 갱신해야 하면:

```bash
pnpm exec playwright test --update-snapshots
```

## 보안

- **RLS가 유일한 신뢰 경계다.** 서버 컴포넌트/액션의 `requireUser()` 체크는 방어적 이중 장치일 뿐, 실제 권한 강제는 전부 `supabase/schema.sql`의 정책에 있다.
- **인증 확인은 `getClaims`로 한다.** 토큰 서명을 로컬에서 검증해 auth 서버 왕복이 없다. 다른 곳에서 끊은 세션은 액세스 토큰이 만료될 때까지 유효하지만, DB는 같은 JWT를 RLS로 다시 확인한다.
- **CSP는 요청마다 nonce를 발급한다** (`src/proxy.ts` → `src/lib/csp.ts`). 인라인 스크립트(테마 깜빡임 방지용)는 그 nonce로만 실행된다. `style-src`는 `next/font`·`next/image`가 넣는 인라인 style 속성 때문에 `unsafe-inline`을 유지한다 — 알려진 트레이드오프다.
- **댓글 XSS 방어**: 댓글은 마크다운을 거치지 않고 React가 텍스트로 이스케이프한다. 글 본문은 마크다운을 거치지만 `rehype-raw`를 쓰지 않으므로 소스에 섞인 raw HTML이 실행되지 않는다.
- **댓글 비밀번호는 무차별 대입에 rate limit이 없다.** 알려진 채로 남겨둔 트레이드오프다 — 뚫려도 새어나가는 건 공개 댓글 하나를 지우는 권한뿐이라, 개인 블로그 규모에서 Supabase Edge Function 기반 rate limiting을 따로 두는 비용이 더 크다고 판단했다. 트래픽이 늘면 재고할 것.

## 구조

```
src/
├── app/            라우트 — /, posts/[slug], menu/[slug], about, books, books/[id], login,
│                   admin/{posts,books,menus,about}, api/ping. 주요 라우트에 loading.tsx
├── components/
│   ├── ui/         shadcn/ui 프리미티브 (토큰에 맞춰 조정)
│   ├── page/       PageColumn(읽기 폭) · PageTitle · PageEyebrow · AdminPageTitle
│   ├── header/     Header · Footer · 메뉴 내비 · 프로필(관리) 드롭다운
│   ├── post/       글 카드·목록 레이아웃·본문·갤러리·첨부·댓글
│   ├── books/      책장 선반·요약·월별 차트·책 폼·검색·별점
│   ├── admin/      글 편집기, 사진·첨부 업로더, 메뉴 관리
│   ├── about/      프로필 폼·아바타
│   ├── owner/      소유자용 수정·삭제 아이콘, 공용 삭제 확인창
│   ├── form/ search/ theme/   폼 하단 버튼, 공용 검색창, 테마 토글
├── lib/
│   ├── supabase/   서버 클라이언트, 환경변수 검증, DB 타입
│   ├── actions/    Server Actions — 로그인, 글·책·메뉴·댓글·프로필
│   ├── posts.ts / books.ts / menus.ts / comments.ts / profile.ts / auth.ts   데이터 접근 계층
│   └── slugify.ts / book-shelf.ts / search.ts / images.ts / csp.ts …      순수 함수 (옆의 *.test.ts가 단위 테스트)
└── styles/tokens.css   라이트/다크 디자인 토큰 — 색·간격·타이포를 컴포넌트에 직접 박지 않는다

proxy.ts (src/)  Next.js 16의 미들웨어 — Supabase 세션 갱신 + CSP nonce 발급
supabase/schema.sql   대시보드에 붙여 실행하는 스키마
e2e/                  Playwright
docs/                 조사 기록 — 왜 그렇게 고쳤는지가 남아 있는 곳
.claude/skills/       작업별 규칙 — supabase-schema · data-and-actions · ui-conventions
```

- [페이지 이동 지연과 로딩 UI](./docs/navigation-loading.md) — 링크를 눌러도 반응이 없던 구간의 원인, `loading.tsx` 도입, 쿼리 워터폴 정리와 전후 측정

## 배포

Vercel에 연결하고 `.env.example`의 환경변수를 그대로 등록한다. 함수 리전은 Supabase DB와 같은 싱가포르(`sin1`)로 [`vercel.json`](./vercel.json)에 고정해 두었다. `crons`가 매일 한 번 [`/api/ping`](./src/app/api/ping/route.ts)을 호출해 Supabase 무료 티어의 7일 자동 일시정지를 막는다.
