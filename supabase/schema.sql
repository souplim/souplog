-- souplog — 스키마
--
-- Supabase 대시보드의 SQL Editor 에 그대로 붙여 실행한다. 여러 번 실행해도
-- 안전하도록 모든 생성문이 idempotent 하게 작성되어 있다.
--
-- 이 앱은 lba와 달리 "실제 인증"을 쓴다 — 비공개 글이 존재하기 때문에
-- RLS가 anon과 authenticated(글쓴이 본인)를 명확히 구분한다.
-- 글쓴이 계정은 이 SQL로 만들지 않는다. Supabase 대시보드의
-- Authentication > Users 에서 한 번만 직접 만든다.

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- 메뉴 (사이트 내비게이션 겸 카테고리)
-- ---------------------------------------------------------------------------

create table if not exists public.menus (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists menus_sort_order_idx on public.menus (sort_order);
-- 헤더의 게시글 드롭다운에서 빼 둘 메뉴. 숨겨도 /menu/<slug> 페이지와 글은 그대로다.
alter table public.menus add column if not exists is_visible boolean not null default true;

-- ---------------------------------------------------------------------------
-- 상단 메뉴 (About · 게시글 · 책장 · Dashboard)
-- ---------------------------------------------------------------------------
-- 각 항목이 가리키는 페이지는 고정이라 key 집합도 닫혀 있다 — 이름·순서·표시
-- 여부만 바꾼다. 허용 key 는 src/lib/nav-items.ts 의 NAV_ITEM_KEYS 와 맞춘다.
-- 행이 없으면 앱이 기본값으로 채워 보여 주므로 아래 기본 행은 출발점일 뿐이다.

create table if not exists public.nav_items (
  key        text primary key check (key in ('about', 'posts', 'books', 'stats', 'papers')),
  label      text not null,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  updated_at timestamptz not null default now()
);

-- 이미 만들어진 DB 는 위 create 가 건너뛰므로 허용 key 목록을 여기서 다시 건다.
alter table public.nav_items drop constraint if exists nav_items_key_check;
alter table public.nav_items add constraint nav_items_key_check
  check (key in ('about', 'posts', 'books', 'stats', 'papers'));

insert into public.nav_items (key, label, sort_order)
values ('about', 'About', 0), ('posts', '게시글', 1), ('books', '책장', 2), ('stats', 'Dashboard', 3), ('papers', '연구동향', 4)
on conflict (key) do nothing;

-- 책장·Dashboard·논문 페이지 맨 위의 큰 제목과 그 아래 설명. 빈 문자열이면 앱의 기본 문구를 쓴다.
-- About·게시글 화면은 자기 제목이 따로 없어 이 칸을 쓰지 않는다.
alter table public.nav_items add column if not exists title       text not null default '';
alter table public.nav_items add column if not exists description text not null default '';

-- ---------------------------------------------------------------------------
-- 사이트 설정 (행이 하나뿐인 테이블)
-- ---------------------------------------------------------------------------
-- 헤더·푸터·브라우저 탭에 보이는 블로그 이름. 빈 문자열이면 앱이 'souplog'를 쓴다.
-- profile 과 같은 방식으로 id 를 true 로 고정해 행을 하나만 둔다.

create table if not exists public.site_settings (
  id         boolean primary key default true check (id),
  title      text not null default '',
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 글
-- ---------------------------------------------------------------------------

create table if not exists public.posts (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  slug              text not null unique,
  content           text not null default '',

  -- 목록·OG 설명에 쓰는 짧은 요약. 글쓴이가 직접 쓴다 — 마크다운에서 자동
  -- 추출하지 않는다. 자동 추출은 코드블록이나 이미지가 먼저 오는 글에서
  -- 엉뚱한 문장을 뽑아내기 쉽다.
  excerpt           text not null default '',

  is_public         boolean not null default false,
  menu_id           uuid references public.menus (id) on delete set null,

  -- 글에 붙는 사진들. [{"path": "<uuid>.webp", "width": 1200, "height": 800}, ...]
  -- 순서가 곧 화면에 보이는 순서이고, 첫 장이 목록·공유 미리보기의 대표 이미지다.
  -- width/height 는 업로드할 때 파일 헤더에서 읽어 저장한다 — 렌더링할 때
  -- 원본 비율 그대로 자리를 잡기 위한 값이라, 없으면 사진이 잘리거나 레이아웃이 밀린다.
  images            jsonb not null default '[]'::jsonb,

  -- 글에 붙는 첨부 파일들. [{"path": "<uuid>.pdf", "name": "발표자료.pdf", "size": 20480}, ...]
  -- path 는 서버가 만든 저장 키이고, name 은 원래 파일 이름 — 화면 표시와
  -- 다운로드 파일명으로만 쓴다.
  attachments       jsonb not null default '[]'::jsonb,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists posts_menu_idx on public.posts (menu_id);
-- 첨부 파일 컬럼이 생기기 전에 만든 DB 용.
alter table public.posts add column if not exists attachments jsonb not null default '[]'::jsonb;
-- 글 날짜는 created_at 하나만 쓴다 — 예전 published_at 컬럼과 인덱스를 걷어낸다.
drop index if exists public.posts_is_public_published_idx;
alter table public.posts drop column if exists published_at;
create index if not exists posts_is_public_created_idx
  on public.posts (is_public, created_at desc);

-- 표지 이미지 1장(cover_image_path) → 사진 여러 장(images) 이관.
-- 이미 이관이 끝난 DB(및 새로 만든 DB)에서는 컬럼이 없으므로 통째로 건너뛴다.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'posts' and column_name = 'cover_image_path'
  ) then
    alter table public.posts add column if not exists images jsonb not null default '[]'::jsonb;

    update public.posts
       set images = jsonb_build_array(jsonb_build_object('path', cover_image_path))
     where cover_image_path is not null
       and images = '[]'::jsonb;

    alter table public.posts drop column cover_image_path;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 댓글 (비회원 — 닉네임 + 삭제용 비밀번호)
-- ---------------------------------------------------------------------------
-- password_hash 는 create_comment/delete_comment 함수 안에서만 다뤄진다.
-- anon 은 이 테이블을 직접 select 하지 않는다 — comments_public 뷰를 통해서만
-- 읽는다. 관리자 화면도 마찬가지로 이 뷰만 쓴다.

create table if not exists public.comments (
  id            uuid primary key default gen_random_uuid(),
  post_id       uuid not null references public.posts (id) on delete cascade,
  author_name   text not null,
  password_hash text not null,
  content       text not null,
  created_at    timestamptz not null default now()
);

create index if not exists comments_post_idx on public.comments (post_id);

-- security_invoker is deliberately left off (default: off). This view is how
-- anon reads comments at all — comments itself has no anon select policy, so
-- an invoker-rights view would just apply that same RLS and return nothing.
-- With definer rights the view always sees every row, and safety comes from
-- what the view selects, not from RLS: it drops password_hash, and it joins
-- posts so a post that's later made private takes its comments down with it
-- (the app only ever shows the comment UI on public posts, but PostgREST
-- exposes this view as its own endpoint — someone who already knows a post's
-- id shouldn't be able to read its comments straight from the REST API just
-- because the app-level page happens to 404 it).
create or replace view public.comments_public as
select c.id, c.post_id, c.author_name, c.content, c.created_at
from public.comments c
join public.posts p on p.id = c.post_id
where p.is_public = true;

-- 글 목록 전용 뷰. 목록은 본문 전체와 사진·첨부 배열이 필요 없으므로
-- 본문은 앞부분만, 사진·첨부는 개수와 대표 사진(첫 장)만 내려보낸다.
-- comments_public 과 달리 security_invoker 를 켠다 — posts 의 RLS 가 그대로
-- 적용되어야 비공개 글이 주인에게만 보인다.
-- content_preview 는 마크다운 원문이다. 기호를 걷어내는 건 앱(lib/markdown-preview.ts)
-- 몫이라, 걷어낸 뒤에도 카드 몇 줄을 채울 만큼 넉넉히 자른다.
create or replace view public.posts_list
with (security_invoker = true) as
select
  p.id,
  p.title,
  p.slug,
  p.excerpt,
  p.is_public,
  p.menu_id,
  p.created_at,
  p.updated_at,
  left(p.content, 400) as content_preview,
  case when jsonb_typeof(p.images) = 'array' then jsonb_array_length(p.images) else 0 end as image_count,
  case when jsonb_typeof(p.attachments) = 'array' then jsonb_array_length(p.attachments) else 0 end as attachment_count,
  p.images -> 0 as cover_image
from public.posts p;

-- 글 검색. 제목과 본문 전체를 대소문자 구분 없이 부분 일치로 찾는다.
-- posts_list 행을 그대로 돌려주므로 목록 카드를 그대로 재사용한다.
-- 본문(content)은 뷰에 없어서 posts 와 조인해 조건만 건다.
-- security definer 를 쓰지 않는다 — 호출자 권한으로 돌아야 posts 의 RLS 가
-- 그대로 적용되어 비공개 글이 주인에게만 검색된다.
-- 검색어의 %, _, \ 는 와일드카드가 아니라 글자 그대로 찾도록 이스케이프한다.
create or replace function public.search_posts(p_query text)
returns setof public.posts_list
language sql
stable
set search_path = public
as $$
  with pattern as (
    select '%' || replace(replace(replace(trim(p_query), '\', '\\'), '%', '\%'), '_', '\_') || '%' as value
  )
  select l.*
  from public.posts_list l
  join public.posts p on p.id = l.id
  cross join pattern
  where length(trim(p_query)) > 0
    and (p.title ilike pattern.value escape '\' or p.content ilike pattern.value escape '\')
  order by l.created_at desc;
$$;

revoke all on function public.search_posts(text) from public;
grant execute on function public.search_posts(text) to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- About (글쓴이 소개 — 행이 하나뿐인 테이블)
-- ---------------------------------------------------------------------------
-- id 를 true 로 고정해 두 번째 행이 생길 수 없게 한다. 저장은 항상 upsert 다.

create table if not exists public.profile (
  id         boolean primary key default true check (id),
  name       text not null default '',
  -- 이름 아래 한 줄 소개.
  tagline    text not null default '',
  -- 하고 싶은 말. 글 본문처럼 마크다운이다.
  content    text not null default '',
  -- 프로필 사진. posts.images 의 한 항목과 같은 모양 — {"path": "<uuid>.webp", "width": 400, "height": 400}
  -- 파일은 post-images 버킷에 함께 둔다.
  avatar     jsonb,
  updated_at timestamptz not null default now()
);

-- About 을 랜딩 페이지처럼 꾸미며 늘린 칸들. 이미 만들어진 테이블에도 붙인다.
-- "이런 사람입니다" 목록 — [{"label": "하는 일", "value": "..."}]
alter table public.profile add column if not exists facts jsonb not null default '[]'::jsonb;
-- 연락처 링크 — [{"label": "이메일", "url": "mailto:..."}]. 주소 형식은 앱이 읽을 때 다시 거른다.
alter table public.profile add column if not exists links jsonb not null default '[]'::jsonb;
-- 첫 화면 큰 사진(hero_image)은 잠깐 두었다가 프로필 사진 하나로 되돌렸다. 이미 만든 DB에서도 걷어낸다.
alter table public.profile drop column if exists hero_image;
alter table public.profile drop constraint if exists profile_facts_is_array;
alter table public.profile add constraint profile_facts_is_array check (jsonb_typeof(facts) = 'array');
alter table public.profile drop constraint if exists profile_links_is_array;
alter table public.profile add constraint profile_links_is_array check (jsonb_typeof(links) = 'array');

-- ---------------------------------------------------------------------------
-- 책장 (읽고 싶은 책 / 읽는 중 / 읽은 책)
-- ---------------------------------------------------------------------------
-- 상태가 바뀔 때 날짜를 채우고 비우는 규칙은 앱(lib/book-shelf.ts)이 정한다.
-- 여기서는 어떤 경로로 저장되든 깨지면 안 되는 관계만 check 로 막는다.

create table if not exists public.books (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  author       text not null default '',
  publisher    text not null default '',
  -- 책 검색으로 추가할 때 같은 책이 두 번 꽂히지 않게 한다. 직접 입력한 책은 비워 둔다.
  isbn         text unique,
  -- 표지. posts.images 의 한 항목과 같은 모양이고 파일도 post-images 버킷에 둔다.
  cover        jsonb,
  status       text not null default 'want' check (status in ('want', 'reading', 'done')),
  total_pages  integer check (total_pages > 0),
  started_at   date,
  finished_at  date,
  -- 0.5점 단위 별점. 제약은 아래 alter 에서 건다.
  rating       numeric(2, 1),
  -- 한 줄 감상.
  note         text not null default '',
  is_public    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint books_finished_after_started check (finished_at is null or started_at is null or finished_at >= started_at)
);

create index if not exists books_status_finished_idx on public.books (status, finished_at);

-- 별점을 1점 단위(smallint)에서 0.5점 단위로 바꿨다. 이미 만들어진 테이블도 옮긴다.
alter table public.books drop constraint if exists books_rating_check;
alter table public.books alter column rating type numeric(2, 1);
alter table public.books add constraint books_rating_check
  check (rating between 0.5 and 5 and rating * 2 = trunc(rating * 2));

-- 읽은 쪽수(책갈피)는 쓰지 않게 되어 뺐다. 이미 만들어진 테이블에서도 걷어낸다.
alter table public.books drop constraint if exists books_current_page_within_total;
alter table public.books drop column if exists current_page;

-- ---------------------------------------------------------------------------
-- updated_at 자동 갱신
-- ---------------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists menus_touch_updated_at on public.menus;
create trigger menus_touch_updated_at
  before update on public.menus
  for each row execute function public.touch_updated_at();

drop trigger if exists nav_items_touch_updated_at on public.nav_items;
create trigger nav_items_touch_updated_at
  before update on public.nav_items
  for each row execute function public.touch_updated_at();

drop trigger if exists site_settings_touch_updated_at on public.site_settings;
create trigger site_settings_touch_updated_at
  before update on public.site_settings
  for each row execute function public.touch_updated_at();

drop trigger if exists profile_touch_updated_at on public.profile;
create trigger profile_touch_updated_at
  before update on public.profile
  for each row execute function public.touch_updated_at();

drop trigger if exists books_touch_updated_at on public.books;
create trigger books_touch_updated_at
  before update on public.books
  for each row execute function public.touch_updated_at();

drop trigger if exists posts_touch_updated_at on public.posts;
create trigger posts_touch_updated_at
  before update on public.posts
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 댓글 작성 / 삭제 (비밀번호는 여기서만 해시·검증된다)
-- ---------------------------------------------------------------------------

create or replace function public.create_comment(
  p_post_id uuid,
  p_author_name text,
  p_password text,
  p_content text
)
returns table (id uuid, post_id uuid, author_name text, content text, created_at timestamptz)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_is_public boolean;
  v_new_id uuid;
begin
  if length(trim(p_author_name)) = 0 or length(trim(p_author_name)) > 40 then
    raise exception '닉네임은 1~40자여야 합니다.';
  end if;

  if length(p_password) < 6 or length(p_password) > 72 then
    raise exception '비밀번호는 6~72자여야 합니다.';
  end if;

  if length(trim(p_content)) = 0 or length(p_content) > 2000 then
    raise exception '댓글은 1~2000자여야 합니다.';
  end if;

  select posts.is_public into v_is_public
  from public.posts
  where posts.id = p_post_id;

  if v_is_public is null then
    raise exception '글을 찾을 수 없습니다.';
  end if;

  if v_is_public is not true then
    raise exception '비공개 글에는 댓글을 달 수 없습니다.';
  end if;

  insert into public.comments (post_id, author_name, password_hash, content)
  values (p_post_id, trim(p_author_name), crypt(p_password, gen_salt('bf')), trim(p_content))
  returning comments.id into v_new_id;

  return query
  select comments.id, comments.post_id, comments.author_name, comments.content, comments.created_at
  from public.comments
  where comments.id = v_new_id;
end;
$$;

create or replace function public.delete_comment(
  p_comment_id uuid,
  p_password text
)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_hash text;
begin
  select password_hash into v_hash
  from public.comments
  where id = p_comment_id;

  if v_hash is null then
    return false;
  end if;

  if crypt(p_password, v_hash) <> v_hash then
    return false;
  end if;

  delete from public.comments where id = p_comment_id;
  return true;
end;
$$;

revoke all on function public.create_comment(uuid, text, text, text) from public;
grant execute on function public.create_comment(uuid, text, text, text) to anon, authenticated;

revoke all on function public.delete_comment(uuid, text) from public;
grant execute on function public.delete_comment(uuid, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 접근 정책
-- ---------------------------------------------------------------------------

alter table public.menus    enable row level security;
alter table public.nav_items enable row level security;
alter table public.posts    enable row level security;
alter table public.comments enable row level security;
alter table public.profile  enable row level security;
alter table public.site_settings enable row level security;
alter table public.books    enable row level security;

-- 2026-10-30 부터 Supabase 는 public 에 새로 만든 테이블에 Data API 권한을
-- 자동으로 주지 않는다. 새 프로젝트에 이 스크립트를 처음 실행해도 동작하도록
-- 권한을 명시한다. 범위는 아래 RLS 정책이 실제로 허용하는 만큼으로 맞춘다.
grant select on public.menus, public.posts to anon;
grant select, insert, update, delete on public.menus, public.posts to authenticated;

-- comments 는 anon 이 뷰(comments_public)와 RPC 로만 접근하므로 테이블 권한을 주지 않는다.
-- 예전 자동 부여로 남아 있을 수 있는 권한도 함께 걷어낸다.
revoke all on public.comments from anon;
grant select, delete on public.comments to authenticated;

grant select on public.nav_items to anon;
grant select, insert, update on public.nav_items to authenticated;

grant select on public.profile to anon;
grant select, insert, update on public.profile to authenticated;

grant select on public.site_settings to anon;
grant select, insert, update on public.site_settings to authenticated;

grant select on public.books to anon;
grant select, insert, update, delete on public.books to authenticated;

grant select on public.comments_public to anon, authenticated;
-- posts_list 는 security_invoker 뷰라 실제로 보이는 행은 posts 의 RLS 가 정한다.
grant select on public.posts_list to anon, authenticated;

grant select, insert, update, delete
  on public.menus, public.nav_items, public.posts, public.comments, public.profile, public.books,
     public.site_settings to service_role;
grant select on public.comments_public, public.posts_list to service_role;

drop policy if exists "anyone_reads_menus" on public.menus;
create policy "anyone_reads_menus" on public.menus
  for select to anon, authenticated using (true);

drop policy if exists "owner_writes_menus" on public.menus;
create policy "owner_writes_menus" on public.menus
  for all to authenticated using (true) with check (true);

drop policy if exists "anyone_reads_nav_items" on public.nav_items;
create policy "anyone_reads_nav_items" on public.nav_items
  for select to anon, authenticated using (true);

drop policy if exists "owner_writes_nav_items" on public.nav_items;
create policy "owner_writes_nav_items" on public.nav_items
  for all to authenticated using (true) with check (true);

drop policy if exists "anyone_reads_profile" on public.profile;
create policy "anyone_reads_profile" on public.profile
  for select to anon, authenticated using (true);

drop policy if exists "owner_writes_profile" on public.profile;
create policy "owner_writes_profile" on public.profile
  for all to authenticated using (true) with check (true);

drop policy if exists "anyone_reads_site_settings" on public.site_settings;
create policy "anyone_reads_site_settings" on public.site_settings
  for select to anon, authenticated using (true);

drop policy if exists "owner_writes_site_settings" on public.site_settings;
create policy "owner_writes_site_settings" on public.site_settings
  for all to authenticated using (true) with check (true);

-- 글과 같은 규칙: 방문자는 공개한 책만, 글쓴이는 숨긴 책까지 본다.
drop policy if exists "public_books_are_readable" on public.books;
create policy "public_books_are_readable" on public.books
  for select to anon, authenticated
  using (is_public = true or auth.role() = 'authenticated');

drop policy if exists "owner_writes_books" on public.books;
create policy "owner_writes_books" on public.books
  for all to authenticated using (true) with check (true);

drop policy if exists "public_posts_are_readable" on public.posts;
create policy "public_posts_are_readable" on public.posts
  for select to anon, authenticated
  using (is_public = true or auth.role() = 'authenticated');

drop policy if exists "owner_writes_posts" on public.posts;
create policy "owner_writes_posts" on public.posts
  for all to authenticated using (true) with check (true);

-- comments 기본 테이블: anon 에게는 select 정책을 두지 않는다(뷰로만 읽는다).
-- 삭제는 RPC(delete_comment)를 통해서만 이루어지므로 anon delete 정책도 없다.
-- 관리자(글쓴이)는 모든 댓글을 직접 조회·삭제할 수 있다(비밀번호 없이 모더레이션).
drop policy if exists "owner_reads_comments" on public.comments;
create policy "owner_reads_comments" on public.comments
  for select to authenticated using (true);

drop policy if exists "owner_deletes_comments" on public.comments;
create policy "owner_deletes_comments" on public.comments
  for delete to authenticated using (true);

-- ---------------------------------------------------------------------------
-- 글 사진 스토리지
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'post-images',
  'post-images',
  true,
  5242880,
  array['image/webp', 'image/jpeg', 'image/png', 'image/gif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "anyone_reads_post_images" on storage.objects;
create policy "anyone_reads_post_images" on storage.objects
  for select to anon, authenticated using (bucket_id = 'post-images');

drop policy if exists "owner_writes_post_images" on storage.objects;
create policy "owner_writes_post_images" on storage.objects
  for insert to authenticated with check (bucket_id = 'post-images');

drop policy if exists "owner_updates_post_images" on storage.objects;
create policy "owner_updates_post_images" on storage.objects
  for update to authenticated using (bucket_id = 'post-images');

drop policy if exists "owner_deletes_post_images" on storage.objects;
create policy "owner_deletes_post_images" on storage.objects
  for delete to authenticated using (bucket_id = 'post-images');

-- ---------------------------------------------------------------------------
-- 글 첨부 파일 스토리지
-- ---------------------------------------------------------------------------
-- 허용 형식은 src/lib/attachments.ts 의 ATTACHMENT_CONTENT_TYPES 와 맞춘다.
-- html·svg 처럼 브라우저가 문서로 렌더링하는 형식은 넣지 않는다.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'post-attachments',
  'post-attachments',
  true,
  10485760,
  array[
    'application/pdf',
    'text/plain',
    'text/markdown',
    'text/csv',
    'application/json',
    'application/zip',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/x-hwp',
    'application/hwp+zip'
  ]
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "anyone_reads_post_attachments" on storage.objects;
create policy "anyone_reads_post_attachments" on storage.objects
  for select to anon, authenticated using (bucket_id = 'post-attachments');

drop policy if exists "owner_writes_post_attachments" on storage.objects;
create policy "owner_writes_post_attachments" on storage.objects
  for insert to authenticated with check (bucket_id = 'post-attachments');

drop policy if exists "owner_deletes_post_attachments" on storage.objects;
create policy "owner_deletes_post_attachments" on storage.objects
  for delete to authenticated using (bucket_id = 'post-attachments');
