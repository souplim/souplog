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
  cover_image_path  text,
  published_at      timestamptz,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists posts_menu_idx on public.posts (menu_id);
create index if not exists posts_is_public_published_idx
  on public.posts (is_public, published_at desc);

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
alter table public.posts    enable row level security;
alter table public.comments enable row level security;

drop policy if exists "anyone_reads_menus" on public.menus;
create policy "anyone_reads_menus" on public.menus
  for select to anon, authenticated using (true);

drop policy if exists "owner_writes_menus" on public.menus;
create policy "owner_writes_menus" on public.menus
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
-- 표지 이미지 스토리지
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
