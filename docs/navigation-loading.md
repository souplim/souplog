# 페이지 이동 지연과 로딩 UI

## 증상

링크를 눌러도 수백 ms 동안 아무 일도 일어나지 않는다. URL도 그대로, 화면도 그대로, 스피너도 없다. 그러다 다음 페이지가 통째로 나타난다. 누른 게 먹혔는지 알 수 없는 구간이 생긴다.

## 원인

### 1. 모든 라우트가 dynamic이다

- `src/app/layout.tsx` — CSP nonce를 받으려고 `headers()`를 읽는다
- 모든 페이지 — `getCurrentUser()`가 쿠키를 읽는다

`pnpm build` 결과에서 `/`, `/menu/[slug]`, `/posts/[slug]`가 전부 `ƒ (Dynamic)`으로 찍히는 이유다. 둘 다 설계상 필요한 것이라 없앨 수 없다.

### 2. 즉시 보여줄 폴백이 없었다

dynamic 라우트는 클릭 시점에 서버 렌더가 끝나야 전환할 수 있다. `loading.tsx`가 없으면 Next는 **보여줄 게 없어서** 응답이 도착할 때까지 이전 페이지를 그대로 둔다. 체감상 "눌렀는데 반응이 없는" 구간이 정확히 이 시간이다.

> Next 문서(`linking-and-navigating.md`)는 "dynamic 라우트는 `loading.js`가 없으면 prefetch를 건너뛴다"고 설명한다. 다만 16.3.5에서 실측하면 prefetch 요청 자체는 양쪽 다 똑같이 발생한다(홈 기준 7건). 실제로 달라지는 건 요청 횟수가 아니라 **즉시 커밋할 폴백의 존재 여부**다.

### 3. 그 서버 왕복이 필요 이상으로 길었다

`/menu/[slug]`가 가장 나빴다. 추가 쿼리 4개가 거의 전부 직렬이었다.

```
generateMetadata: getMenuBySlug      → 쿼리 1
page:             getMenuBySlug      → 쿼리 2   (캐시 밖이라 또 나간다)
                  getPublicPosts(slug)
                    └ menus를 slug로 재조회  → 쿼리 3
                    └ posts                  → 쿼리 4
```

## 조치 1 — `loading.tsx`

| 파일 | 내용 |
| --- | --- |
| `src/components/ui/skeleton.tsx` | 프리미티브. `bg-border` + `motion-safe:animate-pulse` |
| `src/components/post/PostListSkeleton.tsx` | `PostListItem`의 구분선·여백 리듬을 그대로 따라간다 |
| `src/components/post/PostDetailSkeleton.tsx` | 글 상세의 헤더 + 본문 컬럼 |
| `src/app/loading.tsx` | 홈 피드 |
| `src/app/menu/[slug]/loading.tsx` | 메뉴 목록 |
| `src/app/posts/[slug]/loading.tsx` | 글 상세 |
| `src/app/login/loading.tsx` · `src/app/admin/loading.tsx` | 아래 참고 |

스켈레톤 색은 `bg-muted`가 아니라 `bg-border`다. 99.2% 밝기 배경 위에서 97.3%인 muted 표면은 플레이스홀더로 읽히지 않을 만큼 흐리다.

### `/login`과 `/admin`에도 둔 이유

루트 `src/app/loading.tsx`는 자기 세그먼트만이 아니라 **자체 `loading.tsx`가 없는 모든 하위 라우트의 폴백**이 된다. 이 두 개가 없으면 `/login`이나 `/admin/*`으로 이동할 때 글 목록 스켈레톤이 뜬다.

## 조치 2 — 쿼리 워터폴 정리

핵심은 `getMenus`와 `getCurrentUser`가 React `cache`로 감싸져 있고, Header가 매 요청 이미 호출한다는 점이다. 페이지에서 다시 불러도 추가 왕복이 없다. 반면 `getMenuBySlug`는 캐시 밖이라 부를 때마다 새 쿼리였다.

그래서 slug → menu 해석을 `getMenus()` 쪽으로 옮기고, `getPublicPosts`가 slug 대신 `menuId`를 받도록 바꿨다. 호출부가 menu를 이미 들고 있으니 내부에서 menus를 다시 조회할 이유가 없다. 쓰이지 않게 된 `getMenuBySlug`는 지웠다.

| 라우트 | 전 | 후 |
| --- | --- | --- |
| `/menu/[slug]` | 추가 쿼리 4개, 대부분 직렬 | **1개** (글 목록만) |
| `/posts/[slug]` | `Promise.all(post, user)` → `getMenus` 직렬 2단계 | `getMenus`를 같은 배치에 편입, **1단계** |
| `/` | `getCurrentUser` → `Promise.all(posts, menus)` | 메뉴 목록이 auth 체크 뒤에 줄 서지 않는다 |

`/`는 글 쿼리가 "누가 보는가"에 의존하므로(`includeDrafts`) auth 체크를 앞세우는 직렬 2단계가 남는다. 이건 구조상 어쩔 수 없다.

## 측정

프로덕션 빌드(`pnpm build && pnpm start`)에 Playwright로 홈 → 글 상세 이동을 3회씩. `loading.tsx` 5개를 뺀 빌드와 넣은 빌드를 같은 조건에서 비교했다.

| | 첫 피드백 (URL 커밋 + 화면 변화) | 본문(`<h1>`) 도착 |
| --- | --- | --- |
| 적용 전 | 288 / 327 / 530 ms — 그때까지 화면 변화 **없음** | 292 / 332 / 535 ms |
| 적용 후 | **85 / 99 / 114 ms** — 스켈레톤 표시 | 382 / 382 / 402 ms |

트레이드오프가 있다. 첫 피드백은 3배 가까이 빨라지지만 본문이 완성되기까지는 60ms쯤 늘어난다. 폴백을 한 번 그리고 스트리밍 결과로 교체하는 비용이다. 아무것도 없는 300ms보다 스켈레톤이 있는 390ms가 낫다고 판단했다.

함께 확인한 것:

- 스켈레톤과 실제 콘텐츠의 컨테이너 좌표가 동일하다(y/x/width 65/208/1024) — 레이아웃 시프트 없음
- `prefers-reduced-motion: reduce`에서 스켈레톤의 `animation-name`이 `none`

## 알아둘 것

**prefetch와 즉시 전환은 프로덕션에서만 동작한다.** `next dev`는 자동 prefetch가 꺼져 있어 개선이 체감되지 않는다. 확인하려면 `pnpm build && pnpm start`를 쓸 것. (조사 중 dev 서버를 상대로 측정하다 한 번 헛짚었다.)

**클라이언트 캐시는 없다.** `loading.js`가 있는 dynamic 라우트는 prefetch 결과의 클라이언트 캐시 TTL이 기본 0이다(`staleTimes.dynamic`). 스켈레톤은 즉시 뜨지만 본문은 이동할 때마다 서버에서 다시 가져온다.

## 남은 것

- **`auth.getUser()`가 요청당 2번** — `src/proxy.ts`가 세션 갱신용으로 한 번, 페이지가 또 한 번. Supabase auth 서버로 가는 네트워크 왕복이 2회다. supabase-js 2.116의 `getClaims()`로 로컬 JWT 검증이 가능하지만 프로젝트에 ECC 서명 키가 설정돼 있어야 하므로 확인 없이는 건드리지 않았다. 위 측정의 380ms 중 상당 부분이 여기 있다.
- **`useLinkStatus`** — 느린 네트워크에서 prefetch가 끝나지 못한 경우의 보조 인디케이터. Next 문서도 `loading.js`를 먼저 권하므로 지금은 넣지 않았다. 넣는다면 헤더 메뉴 링크에 고정 크기 힌트를 두고 100ms 애니메이션 지연으로 디바운스할 것.
- **e2e 시각 회귀 베이스라인이 낡았다** — 이 이슈와 무관한 별건. `e2e/login.spec.ts-snapshots/`는 최초 커밋 `b6acb8c` 시점(크림색 팔레트·세리프 제목·메뉴 nav 없음)이라 hue 158 리디자인(`ee92e3d`) 이후로는 전부 불일치한다.

## 바뀐 파일

```
추가  src/components/ui/skeleton.tsx
추가  src/components/post/PostListSkeleton.tsx
추가  src/components/post/PostDetailSkeleton.tsx
추가  src/app/loading.tsx
추가  src/app/menu/[slug]/loading.tsx
추가  src/app/posts/[slug]/loading.tsx
추가  src/app/login/loading.tsx
추가  src/app/admin/loading.tsx
수정  src/lib/posts.ts        getPublicPosts(menuSlug, options) → getPublicPosts({ menuId, includeDrafts })
수정  src/lib/menus.ts        getMenuBySlug 제거
수정  src/app/page.tsx
수정  src/app/menu/[slug]/page.tsx
수정  src/app/posts/[slug]/page.tsx
```
