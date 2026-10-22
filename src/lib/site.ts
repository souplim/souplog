import 'server-only';
import { cache } from 'react';
import { DEFAULT_SITE_TITLE, resolveSiteTitle } from '~/lib/site-title';
import { createClient } from '~/lib/supabase/server';

/**
 * The blog's name, shown in the header, the footer, and every browser tab.
 * Cached per request since all three ask for it. Like the header's menus, a
 * failed read must not take the whole site down, so it falls back to the
 * default name instead of throwing.
 */
export const getSiteTitle = cache(async (): Promise<string> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('site_settings').select('title').maybeSingle();
    if (error) return DEFAULT_SITE_TITLE;
    return resolveSiteTitle(data?.title);
  } catch {
    return DEFAULT_SITE_TITLE;
  }
});

/** Creates the row on first save, overwrites it afterwards. A blank title brings back the default. */
export async function saveSiteTitle(title: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('site_settings').upsert({ id: true, title });
  if (error) throw new Error(`블로그 제목을 저장하지 못했습니다: ${error.message}`);
}
