import 'server-only';
import { cache } from 'react';
import { createClient } from '~/lib/supabase/server';
import type { Menu } from '~/lib/supabase/types';

export interface MenuInput {
  name: string;
  slug: string;
}

// Cached per request: Header, Footer, and page bodies all ask for the menu
// list independently within the same render pass.
//
// This is also how a page resolves a single menu by slug — the nav list is a
// handful of rows the Header has already fetched on every request, so finding
// it in there costs nothing, where a dedicated `where slug = ?` query would be
// one more round trip on the critical path.
export const getMenus = cache(async (): Promise<Menu[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('menus').select('*').order('sort_order', { ascending: true });
  if (error) throw new Error(`메뉴 목록을 불러오지 못했습니다: ${error.message}`);
  return data;
});

export async function menuSlugExists(slug: string, excludeId?: string): Promise<boolean> {
  const supabase = await createClient();
  let query = supabase.from('menus').select('id').eq('slug', slug).limit(1);
  if (excludeId !== undefined) {
    query = query.neq('id', excludeId);
  }
  const { data, error } = await query;
  if (error) throw new Error(`슬러그 중복 확인에 실패했습니다: ${error.message}`);
  return data.length > 0;
}

export async function createMenu(input: MenuInput, sortOrder: number): Promise<Menu> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('menus')
    .insert({ name: input.name, slug: input.slug, sort_order: sortOrder })
    .select('*')
    .single();
  if (error) throw new Error(`메뉴를 만들지 못했습니다: ${error.message}`);
  return data;
}

export async function updateMenu(id: string, input: MenuInput): Promise<Menu> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('menus')
    .update({ name: input.name, slug: input.slug })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(`메뉴를 수정하지 못했습니다: ${error.message}`);
  return data;
}

export async function deleteMenu(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('menus').delete().eq('id', id);
  if (error) throw new Error(`메뉴를 삭제하지 못했습니다: ${error.message}`);
}

/** Persists a full reorder: every menu's sort_order is rewritten to match `orderedIds`. */
export async function reorderMenus(orderedIds: string[]): Promise<void> {
  const supabase = await createClient();
  const updates = orderedIds.map((id, index) => supabase.from('menus').update({ sort_order: index }).eq('id', id));
  const results = await Promise.all(updates);
  const failed = results.find((result) => result.error);
  if (failed?.error) throw new Error(`메뉴 순서를 저장하지 못했습니다: ${failed.error.message}`);
}
