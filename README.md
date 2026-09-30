# souplog

개인 블로그. 글쓰기는 관리자 1명(나)만, 나머지는 조회만 할 수 있다.

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

새 프로젝트를 만들고 SQL Editor에 [`supabase/schema.sql`](./supabase/schema.sql)을 그대로 붙여 실행한다. 테이블 셋(`menus` · `posts` · `comments`), `comments_public` 뷰, `create_comment`/`delete_comment` 함수, RLS 정책, 표지 이미지 버킷(`post-images`)이 한 번에 만들어진다. 여러 번 실행해도 안전하다.

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

`NEXT_PUBLIC_` 접두사가 붙은 값은 빌드 결과물에 그대로 포함된다. `NEXT_PUBLIC_SUPABASE_ANON_KEY`는 RLS로 보호되는 것을 전제로 공개되는 게 정상이다(Supabase의 설계 자체가 그렇다) — `service_role` 키만 절대 노출하면 안 된다.

### 4. 실행

```bash
pnpm dev
```

## 관리자 흐름

1. `/login` 에서 로그인
2. 로그인 상태에서는 헤더에 **새 글 작성** · **메뉴 관리** 버튼이 바로 뜬다 — 관리자 대시보드를 거치지 않고 바로 글을 쓸 수 있다.
3. 홈/메뉴 글 목록에서도 각 글마다 **수정**·**삭제** 버튼이 인라인으로 붙는다(비공개 글도 소유자에게는 목록에 함께 보이고 `비공개` 배지가 붙는다).
4. `/admin/posts/new` — 마크다운 에디터(좌: 입력, 우: 실시간 미리보기)로 글 작성. 표지 이미지 업로드 가능. 공개 체크박스를 켜지 않으면 비공개로 저장된다.
5. `/admin` — 내가 쓴 모든 글(공개+비공개) 목록을 한 번에 보고 싶을 때 쓰는 보조 대시보드. `/admin/menus` — 내비게이션 겸 카테고리 메뉴 CRUD, 위/아래 버튼으로 순서 변경

비공개 글은 `is_public = false`인 동안 RLS가 아예 응답에 포함시키지 않는다 — 로그인하지 않은 방문자에게는 존재 자체가 보이지 않는다(404).

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

- [ ] 홈 화면에 최신 공개 글이 히어로로 뜨는지
- [ ] 비공개 글이 로그아웃 상태에서 404로 처리되는지
- [ ] 댓글 작성/삭제(비밀번호 확인 포함)가 동작하는지
- [ ] 관리자로 글을 쓰고 공개 전환하면 홈에 반영되는지
- [ ] 메뉴 순서를 바꾸면 헤더 내비게이션에 즉시 반영되는지
- [ ] 라이트/다크 전환이 실제 콘텐츠 페이지에서도 자연스러운지

시각 회귀 스냅샷을 갱신해야 하면:

```bash
pnpm exec playwright test --update-snapshots
```

## 보안

- **RLS가 유일한 신뢰 경계다.** 서버 컴포넌트/액션의 `requireUser()` 체크는 방어적 이중 장치일 뿐, 실제 권한 강제는 전부 `supabase/schema.sql`의 정책에 있다.
- **CSP는 요청마다 nonce를 발급한다** (`src/proxy.ts` → `src/lib/csp.ts`). 인라인 스크립트(테마 깜빡임 방지용)는 그 nonce로만 실행된다. `style-src`는 `next/font`·`next/image`가 넣는 인라인 style 속성 때문에 `unsafe-inline`을 유지한다 — 알려진 트레이드오프다.
- **댓글 XSS 방어**: 댓글은 마크다운을 거치지 않고 React가 텍스트로 이스케이프한다. 글 본문은 마크다운을 거치지만 `rehype-raw`를 쓰지 않으므로 소스에 섞인 raw HTML이 실행되지 않는다.
- **댓글 비밀번호는 무차별 대입에 rate limit이 없다.** 알려진 채로 남겨둔 트레이드오프다 — 뚫려도 새어나가는 건 공개 댓글 하나를 지우는 권한뿐이라, 개인 블로그 규모에서 Supabase Edge Function 기반 rate limiting을 따로 두는 비용이 더 크다고 판단했다. 트래픽이 늘면 재고할 것.

## 구조

```
src/
├── app/            라우트 — page.tsx, posts/[slug], menu/[slug], login, admin/*, api/ping
├── components/
│   ├── header/     Header · Footer · 내비게이션
│   ├── theme/      next-themes 프로바이더, 라이트/다크 토글
│   ├── post/       글 카드·본문 렌더링·댓글 목록/폼
│   └── admin/      글 작성 폼, 마크다운 에디터, 메뉴 관리 UI
├── lib/
│   ├── supabase/   서버 클라이언트, 환경변수 검증, DB 타입
│   ├── actions/    Server Actions — 로그인, 글·메뉴·댓글 CRUD
│   ├── posts.ts / menus.ts / comments.ts / auth.ts   데이터 접근 계층
│   └── slugify.ts / sortOrder.ts / date.ts / csp.ts  순수 함수 (단위 테스트 대상)
└── styles/tokens.css   라이트/다크 디자인 토큰 — 색·간격·타이포를 컴포넌트에 직접 박지 않는다

proxy.ts (src/)  Next.js 16의 미들웨어 — Supabase 세션 갱신 + CSP nonce 발급
supabase/schema.sql   대시보드에 붙여 실행하는 스키마
e2e/                  Playwright
```

## 배포

Vercel에 연결하고 `.env.example`의 환경변수 셋을 그대로 등록한다. [`vercel.json`](./vercel.json)의 `crons`가 매일 한 번 [`/api/ping`](./src/app/api/ping/route.ts)을 호출해 Supabase 무료 티어의 7일 자동 일시정지를 막는다.
