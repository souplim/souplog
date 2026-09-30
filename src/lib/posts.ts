import 'server-only';
import { cache } from 'react';
import { parsePostImages, type PostImage } from '~/lib/images';
import { createClient } from '~/lib/supabase/server';
import type { Post, PostRow } from '~/lib/supabase/types';

export interface PostInput {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  menuId: string | null;
  images: PostImage[];
}

/** Single place the `images` jsonb column is validated on its way in. */
function toPost(row: PostRow): Post {
  return { ...row, images: parsePostImages(row.images) };
}

/**
 * Posts for the home feed or a menu listing, newest first. Pass
 * `includeDrafts` when the viewer is the signed-in owner, so private/draft
 * posts appear inline instead of only being reachable from the admin
 * dashboard — RLS still limits which private rows come back to the owner's
 * own posts.
 */
export async function getPublicPosts(menuSlug?: string, options?: { includeDrafts?: boolean }): Promise<Post[]> {
  const supabase = await createClient();
  // `nullsFirst: false` matters once drafts are in the list: Postgres sorts
  // NULLs first on `desc`, which would park every unpublished draft above the
  // whole feed. Drafts fall to the end and order among themselves by when they
  // were written, which is the date the list shows for them.
  let query = supabase
    .from('posts')
    .select('*')
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (!options?.includeDrafts) {
    query = query.eq('is_public', true);
  }

  if (menuSlug !== undefined) {
    const { data: menu } = await supabase.from('menus').select('id').eq('slug', menuSlug).maybeSingle();
    if (!menu) return [];
    query = query.eq('menu_id', menu.id);
  }

  const { data, error } = await query;
  if (error) throw new Error(`글 목록을 불러오지 못했습니다: ${error.message}`);
  return data.map(toPost);
}

/**
 * A single post by slug. RLS decides visibility: public posts are visible to
 * everyone, private posts only to the signed-in owner. A `null` result means
 * either the post doesn't exist or the viewer isn't allowed to see it — the
 * caller should render a 404 either way, never distinguish the two.
 */
export const getPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('posts').select('*').eq('slug', slug).maybeSingle();
  if (error) throw new Error(`글을 불러오지 못했습니다: ${error.message}`);
  return data ? toPost(data) : null;
});

export async function getPostById(id: string): Promise<Post | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('posts').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(`글을 불러오지 못했습니다: ${error.message}`);
  return data ? toPost(data) : null;
}

export async function postSlugExists(slug: string, excludeId?: string): Promise<boolean> {
  const supabase = await createClient();
  let query = supabase.from('posts').select('id').eq('slug', slug).limit(1);
  if (excludeId !== undefined) {
    query = query.neq('id', excludeId);
  }
  const { data, error } = await query;
  if (error) throw new Error(`슬러그 중복 확인에 실패했습니다: ${error.message}`);
  return data.length > 0;
}

export async function createPost(input: PostInput, isPublic: boolean): Promise<Post> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('posts')
    .insert({
      title: input.title,
      slug: input.slug,
      content: input.content,
      excerpt: input.excerpt,
      menu_id: input.menuId,
      images: input.images,
      is_public: isPublic,
      published_at: isPublic ? new Date().toISOString() : null,
    })
    .select('*')
    .single();

  if (error) throw new Error(`글을 저장하지 못했습니다: ${error.message}`);
  return toPost(data);
}

export async function updatePost(id: string, input: PostInput, isPublic: boolean): Promise<Post> {
  const supabase = await createClient();
  const current = await getPostById(id);
  const becomingPublic = isPublic && current?.published_at == null;

  const { data, error } = await supabase
    .from('posts')
    .update({
      title: input.title,
      slug: input.slug,
      content: input.content,
      excerpt: input.excerpt,
      menu_id: input.menuId,
      images: input.images,
      is_public: isPublic,
      ...(becomingPublic ? { published_at: new Date().toISOString() } : {}),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(`글을 수정하지 못했습니다: ${error.message}`);
  return toPost(data);
}

export async function deletePost(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) throw new Error(`글을 삭제하지 못했습니다: ${error.message}`);
}
