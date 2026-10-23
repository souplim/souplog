---
name: ui-conventions
description: souplog에서 페이지·컴포넌트·스타일을 만들거나 고칠 때 읽는다. 레이아웃, 간격, 색, 글꼴, 버튼 문구, 수정·삭제 버튼, 폼 하단 버튼, 검색창, loading.tsx 스켈레톤, 이미지, CSP가 대상이다. 핵심 제약은 다음과 같다. 색·간격·타이포는 tokens.css 토큰으로만 쓴다. 글자 굵기는 400·600만 쓴다. 카드 그림자 대신 구분선을 쓴다. 이미 있는 공용 컴포넌트(PageColumn, PageTitle, FormActions, SearchField, FeedLayout, EditIconLink, ConfirmDeleteDialog)를 먼저 쓴다.
---

# UI 규칙

방향은 절제된 에디토리얼이다. 단일 hue(158)의 뉴트럴에 진녹색 accent 하나를 쓴다. 장식보다 글이 먼저 보이게 한다. UI 문구는 모두 한국어다.

## 토큰 (`src/styles/tokens.css`)

- 색·간격·타이포·모서리·그림자 값은 **tokens.css에서만 정의**하고, 컴포넌트에서는 토큰으로 쓴다.
  `px-[var(--space-sm)]`, `text-[length:var(--text-display)]`, `tracking-[var(--tracking-display)]`, `max-w-[var(--content-width)]`.
- 새 값이 필요하면 tokens.css에 토큰을 추가하고, 라이트(`:root`)와 다크(`:root[data-theme='dark']`)를 함께 정의한다.
- 굵기는 `--weight-regular`(400)와 `--weight-strong`(600)만 쓴다. 700(`font-bold`)은 로드하지 않는 합성 볼드라 쓰지 않는다.
- 크기 위계: `--text-display`(공개 페이지 제목) > `--text-title`(관리자 제목) > `--text-lg` > `--text-base` > `--text-sm` > `--text-xs`.
- 큰 제목만 `--tracking-display`로 자간을 좁힌다.
- 색 역할:
  - `primary`는 accent가 아니라 본문 글자색이다. 녹색 accent는 아껴 쓴다(라벨, 링크, 포커스 링).
  - `destructive`는 삭제에만 쓴다.
- 날짜·개수 같은 메타 정보는 `tabular-nums` 작은 글씨로 쓴다.

## 깊이와 구분

- **카드 그림자를 쓰지 않는다.** 항목은 `border`/`border-b` 구분선과 여백으로 나눈다.
- `--shadow-raised`는 떠 있는 레이어(팝오버, 드롭다운, 다이얼로그)에만 쓴다.
- `--shadow-cover`는 책 표지(`BookCover`)에만 쓴다.
- 세그먼트 컨트롤의 선택 항목도 그림자 대신 `ring-1 ring-border`로 띄운다.
- 갤러리 이미지 경계도 그림자 대신 border ring으로 표시한다.
- hover 리프트(`translate-y`)를 쓰지 않는다.

## 폭

- 읽기 폭은 `--content-width`(42rem, 한글 한 줄 약 38자), 페이지 폭은 `--page-width`(64rem)다.
- 폭을 직접 잡지 말고 `PageColumn`(`components/page/PageColumn.tsx`)을 쓴다. 바깥 상자에 거터를, 안쪽 상자에 읽기 폭을 둔다. 한 상자에 둘 다 두면 폼이 글보다 좁아진다.
- 화면 폭 320px에서 가로 스크롤이 생기지 않아야 한다. 한 줄에 버튼이 늘어나는 영역에는 `min-w-0`/`shrink-0`을 두고, 좁은 화면에서는 드롭다운으로 접는다(헤더 `AdminMenu` 참고).

## 공용 컴포넌트를 먼저 쓴다

| 필요한 것                          | 쓰는 것                                                                                   |
| ---------------------------------- | ----------------------------------------------------------------------------------------- |
| 공개 페이지 제목 / 위 라벨         | `PageTitle` / `PageEyebrow` (`components/page/PageHeading.tsx`)                           |
| 관리자 페이지 제목                 | `AdminPageTitle` — 공개 제목보다 한 단계 작다                                             |
| 읽기 폭 컬럼                       | `PageColumn`                                                                              |
| 글 목록 화면 컨테이너·제목·빈 상태 | `FeedContainer`, `FeedTitle` 등 (`components/post/FeedLayout.tsx`)                        |
| 폼 하단 취소·저장                  | `FormActions` — 취소는 ghost 링크, 저장은 오른쪽, 진행 중엔 "저장 중…"                    |
| 검색 입력                          | `SearchField` — Enter로 검색, 오른쪽 끝에 진행 표시·지우기 슬롯(`trailing`)               |
| 소유자용 수정                      | `EditIconLink` — 테두리 없는 연필 아이콘, `aria-label="수정"`                             |
| 소유자용 삭제                      | `ConfirmDeleteDialog` — 휴지통 아이콘과 확인창. 처리 중엔 잠기고 "삭제 중…"을 보인다      |
| 기본 프리미티브                    | `components/ui/*` (shadcn, radix-nova). 새 프리미티브도 shadcn으로 추가하고 토큰에 맞춘다 |

공용 컴포넌트로 안 되는 경우에 새로 만들고, 같은 모양이 두 번째로 나오면 공용으로 뺀다.

## 버튼과 문구

- 새 항목을 만드는 버튼은 앞에 `+`(lucide `Plus`) 아이콘을 붙이고, 라벨은 "명사 + 동사"로 쓴다(예: "책 추가", "메뉴 추가").
- 소유자용 수정·삭제는 아이콘 버튼으로 통일한다. 아이콘만 있는 버튼에는 `aria-label`과 `title`을 둔다.
- 삭제 버튼은 쉴 때는 muted, hover일 때만 빨갛게 한다.
- 비동기 버튼은 `useTransition`으로 진행 상태를 보이고, 처리 중에는 비활성화한다.
- 버튼·인풋 높이는 프리미티브 기본값(h-9/h-11)을 쓴다. 터치 타깃을 줄이지 않는다.

## 로딩 (`loading.tsx`)

모든 라우트가 dynamic이라(`headers()`, 쿠키 기반 `getCurrentUser`) `loading.tsx`가 없으면 클릭 후 화면이 멈춘 것처럼 보인다. 새 라우트에는 `loading.tsx`를 둔다.

- `components/ui/skeleton.tsx`의 `Skeleton`을 쓴다. 색은 `bg-border`다. `bg-muted`는 배경과 너무 비슷해서 자리표시로 읽히지 않는다. 펄스는 `motion-safe:animate-pulse`로 건다.
- 스켈레톤은 실제 화면의 여백·비율을 그대로 따라 그려, 진짜 내용으로 바뀔 때 레이아웃이 밀리지 않게 한다. 막대 폭은 일부러 다르게 둔다.
- 제목처럼 나중에 들어오는 글자 자리도 막대로 미리 채운다.
- `role="status"`와 `sr-only` 안내 문구를 둔다.
- Tailwind는 소스의 리터럴 문자열만 보므로 클래스명을 보간해서 만들지 않는다.

## 이미지

- 저장해 둔 원본 픽셀 크기로 `width`/`height`를 준다. 자리가 미리 잡혀야 레이아웃이 밀리지 않는다.
- `object-cover` 원형·박스 이미지의 `sizes`는 `getCoverRenderWidth`(`lib/images.ts`)로 계산한다. 지름만 넘기면 가로 사진이 흐려진다.
- `priority` prop은 Next 16에서 deprecated다. 첫 화면 이미지만 `loading="eager"` + `fetchPriority="high"`를 쓴다.
- 본문 사진은 잘라내지 않는다. 가로는 본문 폭, 세로는 뷰포트 70%까지만 차지한다.

## 글꼴

- Pretendard dynamic-subset 하나만 쓴다(`app/layout.tsx`). 전체 폰트를 미리 받지 않는다. 새 글꼴을 추가하지 않는다.

## CSP·보안

- CSP는 요청마다 nonce를 발급한다(`src/proxy.ts` → `src/lib/csp.ts`). 인라인 `<script>`는 nonce 없이 실행되지 않는다. 새 외부 출처가 필요하면 `csp.ts`에서 해당 지시어만 연다(현재 `img-src`는 같은 출처, 카카오 CDN, 업로드 전 미리보기용 `blob:`). 저장된 사진은 앱의 `/media` 라우트로 같은 출처에서 나가므로 Supabase 주소를 열지 않는다.
- 저장된 사진은 `getPostImageUrl`(→ `/media/...`)로만 가리킨다. 비공개 글·책의 사진은 `next/image`에 `unoptimized`를 준다. 최적화기는 쿠키 없이 방문자 권한으로 원본을 받으므로 비공개 파일을 읽지 못한다(`PostGallery`·`PostCard`·`BookCover`의 `isPublic`).
- 글 본문 마크다운에 `rehype-raw`를 넣지 않는다. 댓글은 마크다운 없이 텍스트로만 렌더링한다. `dangerouslySetInnerHTML`을 쓰지 않는다.
- 파비콘(`app/icon.svg`)은 페이지 밖에서 그려지므로 토큰을 못 읽는다. 색을 직접 쓰고 SVG 안의 `prefers-color-scheme`으로 다크를 처리한다.

## 확인

- 라이트·다크 둘 다, 320px부터 넓은 화면까지 확인한다.
- 로그인 페이지 시각 회귀는 `pnpm e2e`로 확인한다. 의도한 변경이면 `pnpm exec playwright test --update-snapshots`로 갱신한다.
