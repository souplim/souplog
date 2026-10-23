---
name: data-and-actions
description: souplog에서 Supabase 데이터를 읽는 함수(src/lib/<도메인>.ts)나 Server Action(src/lib/actions/*.ts), 폼 제출, 파일 업로드, 페이지의 데이터 조회 흐름을 만들거나 고칠 때 읽는다. 핵심 제약은 다음과 같다. 조회 함수는 server-only와 cache()를 쓴다. Action은 requireUser → zod → { error } 순서를 지키고 redirect는 try 바깥에 둔다. 한글 슬러그 redirect는 인코딩한다. 인증 확인은 getClaims로 한다. 독립 조회는 병렬로 돌린다.
---

# 데이터 계층과 Server Action 규칙

계층은 셋이다.

```
app/**/page.tsx          조회 함수를 부르고 화면을 그린다
lib/actions/<도메인>.ts   'use server' — 권한 확인, 입력 검증, 쓰기, revalidate/redirect
lib/<도메인>.ts           'server-only' — Supabase 쿼리, Row → 도메인 타입 변환
lib/<순수 함수>.ts        DB 없이 테스트 가능한 로직 (book-shelf, slugify, sortOrder …)
lib/external/<서비스>.ts  'server-only' — 외부 API 호출과 캐시 (kakao-books, kci, kosis, remote-cover)
```

외부 응답을 해석하는 순수 파서(`kci-keywords`, `kosis-series`, `book-search`)는 테스트하기 쉽도록 `lib/`에 둔다. 새 외부 서비스를 붙일 때도 호출은 `lib/external/`에, 파싱은 `lib/`에 나눠 둔다.

## 조회 함수 (`lib/<도메인>.ts`)

- 파일 맨 위에 `import 'server-only';`를 둔다.
- 한 요청 안에서 여러 곳(Header, `generateMetadata`, 페이지 본문)이 부르는 조회는 `cache()`로 감싼다. 캐시 밖 조회를 두 번 부르면 왕복이 두 번 나간다.
- 에러는 삼키지 않고 한국어 메시지로 던진다. 형식: ``throw new Error(`책을 불러오지 못했습니다: ${error.message}`)``.
- 단, 페이지 전체를 막으면 안 되는 보조 조회(헤더 메뉴 등)는 실패 시 기본값으로 그린다. 그렇게 할 때는 이유를 주석으로 남긴다.
- id가 uuid 형식이 아니면 쿼리 전에 `null`을 돌려준다. Postgres의 uuid 캐스트 에러를 500으로 만들지 않기 위해서다(`UUID_PATTERN`).
- unique 위반(`23505`) 같은 알려진 DB 에러 코드는 사용자 문구로 바꾼다.
- Row를 그대로 넘기지 말고 `toBook(row)`처럼 jsonb 필드를 파싱한 도메인 타입으로 넘긴다.

## Server Action (`lib/actions/<도메인>.ts`)

순서를 지킨다.

```ts
export async function createBookAction(_prev: BookFormState | undefined, formData: FormData): Promise<BookFormState> {
  await requireUser(); // 1. 권한 (RLS가 진짜 경계, 이건 이중 장치)

  const result = await parseBookForm(formData); // 2. zod safeParse → 첫 이슈 메시지
  if ('error' in result) return result; //    실패는 throw가 아니라 { error } 반환

  let id: string;
  try {
    id = (await createBook(result.input)).id; // 3. 쓰기만 try 안에
  } catch (error: unknown) {
    return { error: getErrorMessage(error, '책을 추가하지 못했습니다.') };
  }

  revalidatePath(SHELF_PATH); // 4. 영향받는 경로 모두
  redirect(bookPath(id)); // 5. redirect는 try 바깥 (내부적으로 throw한다)
}
```

- FormData에서 값을 꺼낼 때는 `typeof value === 'string'`으로 좁힌다. 체크박스는 `=== 'on'`으로 읽는다.
- 외부 입력(검색어 등)은 길이 상한을 상수로 둔다(`MAX_SEARCH_QUERY_LENGTH`).
- 저장 후에는 목록이 아니라 방금 다룬 항목의 상세 페이지로 보낸다.

## 함정 (커밋 기록에서 확인된 것)

- **한글 슬러그 redirect**: Server Action의 redirect 경로는 `x-action-redirect` 헤더로 나가므로 `encodeURIComponent`로 인코딩해야 한다. Next는 일반 내비게이션에서만 동적 세그먼트를 디코딩하므로, `[slug]` 페이지는 조회 전에 `decodeSlugParam(slug)`(`lib/slugify.ts`)을 거친다.
- **인증 확인은 `getClaims`**: `getCurrentUser`(`lib/auth.ts`)는 `getClaims`로 토큰을 로컬에서 검증한다. `getUser`는 auth 서버 왕복을 추가하므로 새로 쓰지 않는다.
- **`NEXT_PUBLIC_*`는 정적 접근으로 읽는다**: `process.env[name]`처럼 계산해서 읽으면 클라이언트 번들에서 `undefined`가 된다. 새 공개 변수는 `lib/supabase/env.ts`의 `PUBLIC_ENV`처럼 리터럴로 읽는다. 서버 전용 키(`KAKAO_REST_API_KEY`)에는 `NEXT_PUBLIC_`을 붙이지 않는다.
- **폼 제출은 `onSubmit` + `startTransition`**: `<form action={formAction}>`을 쓰면 React가 액션 뒤 폼을 리셋한다. 그러면 실패 후 다시 저장할 때 고른 파일이 빠진다. `PostForm`·`BookForm`·`AboutForm`처럼 `onSubmit`에서 `preventDefault` 후 `startTransition(() => formAction(formData))`로 제출한다.
- **파일 업로드는 바이트로 올린다**: storage-js가 `File`을 올릴 때 `contentType`을 무시한다. 그래서 `.hwp`·`.md`처럼 브라우저가 타입을 비워 두는 파일이 버킷에서 거절된다. `await file.arrayBuffer()`로 올리고, 콘텐츠 타입은 브라우저 값 대신 확장자로 서버에서 정한다(`lib/attachments.ts`).
- **이미지는 업로드할 때 픽셀 크기를 저장한다**(`lib/image-dimensions.ts`). 화면이 사진 자리를 미리 잡는 데 쓰인다. 형식도 `File.type`이 아니라 파일 앞부분 바이트(`detectImageType`)로 정한다.
- **외부 이미지는 허용된 호스트에서만 내려받는다**(`lib/external/remote-cover.ts`). 새 호스트는 `lib/book-search.ts`의 `COVER_HOSTS`에 넣고, 검색 결과 썸네일을 보여 줘야 하면 `csp.ts`의 `img-src`도 연다.
- **저장된 파일은 `/media/<버킷>/<키>`로 읽는다**(`app/media/[bucket]/[file]/route.ts`). 버킷은 비공개이고, 라우트가 보는 사람의 세션으로 내려받아 스토리지 RLS가 볼 수 있는지를 정한다. Supabase 공개 URL(`/object/public/...`)을 새로 만들지 않는다.
- Server Action 요청 크기 한도는 `next.config.ts`의 `bodySizeLimit: '20mb'`다. 첨부 한도를 늘리면 같이 본다. 로그인하지 않은 요청은 `proxy.ts`가 본문 1MB까지만 받는다(`lib/request-body-limit.ts`). 방문자용 폼에 파일을 붙이려면 이 한도부터 본다.

## 성능

- 서로 기다릴 필요 없는 조회는 `Promise.all`로 묶는다. 사용자에 따라 달라지는 조회만 그 뒤에 직렬로 둔다.
- 호출부가 이미 가진 값(menu 객체 등)을 아래 함수가 다시 조회하게 하지 않는다. id를 넘긴다.
- 본문을 막지 않아도 되는 영역(댓글 등)은 `Suspense`로 나중에 채운다.
- Vercel 함수 리전은 DB와 같은 `sin1`이다(`vercel.json`). 리전을 바꾸지 않는다.

## 테스트

DB를 거치지 않는 로직은 `lib/`의 순수 함수로 빼고, 옆에 `*.test.ts`(vitest)를 둔다. Action과 조회 함수 안에는 분기 로직을 쌓지 않는다.
