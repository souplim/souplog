---
name: supabase-schema
description: souplog의 supabase/schema.sql을 고칠 때 읽는다 — 테이블·컬럼·인덱스·제약 추가/삭제, RLS 정책, GRANT, 뷰, security definer 함수, 스토리지 버킷, 데이터 이관. 핵심 제약은 다음과 같다. 스크립트는 여러 번 실행해도 안전해야 한다. 새 테이블에는 GRANT를 직접 적는다. 권한을 강제하는 곳은 RLS뿐이다. 컬럼을 지우는 변경은 코드를 먼저 배포한다.
---

# Supabase 스키마 변경 규칙

`supabase/schema.sql` 한 파일이 스키마 전체다. 마이그레이션 도구 없이 대시보드 **SQL Editor**에 통째로 붙여 실행한다. 그래서 새 DB와 이미 쓰고 있는 DB 양쪽에서 같은 스크립트가 돌아야 한다.

## 1. 다시 실행해도 안전하게 (idempotent)

| 바꾸는 것               | 쓰는 형태                                             |
| ----------------------- | ----------------------------------------------------- |
| 테이블·인덱스·확장      | `create ... if not exists`                            |
| 기존 테이블에 컬럼 추가 | `alter table ... add column if not exists`            |
| 컬럼·제약 삭제          | `drop column if exists` / `drop constraint if exists` |
| 제약 변경               | `drop constraint if exists` 후 `add constraint`       |
| 정책                    | `drop policy if exists "이름"` 후 `create policy`     |
| 뷰·함수                 | `create or replace`                                   |
| 버킷                    | `insert into storage.buckets ... on conflict`         |

데이터를 옮겨야 하는 변경(예: `cover_image_path` → `images`)은 `do $$ ... $$` 블록 안에서 옛 컬럼이 있을 때만 이관한 뒤 옛 컬럼을 지운다. 따로 마이그레이션 파일을 만들지 않는다.

## 2. 권한

- **새 테이블·뷰는 GRANT를 직접 적는다.** 2026-10-30부터 Supabase가 `public` 스키마의 새 테이블에 Data API 권한을 자동으로 주지 않는다. RLS 정책 범위에 맞춰 `anon` / `authenticated` / `service_role`에 필요한 만큼만 준다. 기존 GRANT 블록(`grant select on public.books to anon;` 근처)에 나란히 둔다.
- **RLS가 유일한 신뢰 경계다.** 새 테이블은 `enable row level security`를 켜고 정책을 둔다. 앱의 `requireUser()`는 이중 장치일 뿐이다. 정책 이름은 기존 패턴을 따른다. 모두 읽는 테이블은 `anyone_reads_<table>`, 공개 여부로 거르는 테이블은 `public_<table>_are_readable`, 관리자 쓰기는 `owner_writes_<table>`.
- **글쓴이 판별은 `public.is_owner()`로 한다.** `authenticated` 역할이나 `auth.role()`만으로 쓰기·비공개 읽기를 허용하지 않는다. 정책에서는 `using ((select public.is_owner()))`처럼 괄호를 두 겹 둔다.
- 스토리지 버킷은 비공개(`public = false`)로 두고 `allowed_mime_types`와 `file_size_limit`를 건다. `storage.objects` 정책은 버킷 단위로 둔다. 읽기는 `is_owner()` 또는 `is_public_media(bucket_id, name)`이다. 공개 글·책·프로필이 실제로 쓰는 파일만 방문자에게 열린다. 파일을 참조하는 새 컬럼이 생기면 `is_public_media`에도 넣는다. html·svg처럼 브라우저가 문서로 렌더링하는 형식은 허용하지 않는다. 첨부 허용 형식은 `src/lib/attachments.ts`의 `ATTACHMENT_CONTENT_TYPES`와 맞춘다.
- **`service_role` 키는 앱에서 쓰지 않는다.** RLS를 우회하는 경로를 만들지 않는다.
- `security definer` 함수는 `revoke all on function ... from public` 후 필요한 역할에만 `grant execute` 한다. 함수 안에서 `search_path`를 고정한다.

## 3. 뷰

- 기본은 `with (security_invoker = true)` — 원본 테이블의 RLS가 그대로 적용된다(`posts_list`).
- 예외는 `comments_public` 하나다. `comments`에 anon 직접 권한이 없어서 invoker가 아닌 정의자 권한으로 읽고, 대신 뷰 안에서 `posts.is_public`을 조인해 걸러낸다. 이런 예외를 만들면 왜 그런지 주석으로 남긴다.
- 목록용 뷰는 목록이 쓰는 컬럼만 내려보낸다(본문 앞부분, 개수, 대표 사진 하나). 목록에 본문 전체나 파일 배열을 보내지 않는다.

## 4. 민감한 값

- 댓글 비밀번호는 `create_comment` / `delete_comment` 함수 안에서만 `pgcrypto`로 해시·검증한다. `comments.password_hash`는 앱 어디서도 select 하지 않는다. 목록은 그 컬럼이 없는 `comments_public`으로만 읽는다.
- 공개 여부(`is_public`)로 가리는 데이터는 RLS가 응답에서 아예 빼야 한다. 방문자에게는 404가 된다.

## 5. 타입·검증 맞추기

스키마를 바꾸면 같은 변경에서 함께 고친다.

- `src/lib/supabase/types.ts` — Row 타입
- `src/lib/validation.ts` — zod 스키마(값 범위 제약은 DB `check`와 같은 규칙으로)
- `src/lib/<도메인>.ts` — select·insert 하는 컬럼

## 6. 배포 순서와 커밋

- **컬럼·인덱스를 지우는 변경은 새 코드를 먼저 배포하고, 그 뒤에 schema.sql을 실행한다.** 반대로 하면 배포 전 코드가 없는 컬럼을 읽다가 깨진다.
- **컬럼을 추가하는 변경은 schema.sql을 먼저 실행하고, 그 뒤에 코드를 배포한다.**
- 커밋 본문에 손으로 할 일을 반드시 적는다. 예: "schema.sql을 SQL Editor에서 다시 실행해야 적용된다 (새 코드 배포 후 실행)."
