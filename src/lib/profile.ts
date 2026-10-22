import 'server-only';
import { cache } from 'react';
import { parsePostImage, type PostImage } from '~/lib/images';
import { parseProfileFacts, parseProfileLinks, type ProfileFact, type ProfileLink } from '~/lib/profile-fields';
import { createClient } from '~/lib/supabase/server';
import type { Profile } from '~/lib/supabase/types';

export interface ProfileInput {
  name: string;
  tagline: string;
  content: string;
  avatar: PostImage | null;
  facts: ProfileFact[];
  links: ProfileLink[];
}

/**
 * The About page's single row, or `null` before the owner has written it.
 * Cached per request: the page body and its metadata both ask for it.
 */
export const getProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profile')
    .select('name, tagline, content, avatar, facts, links, updated_at')
    .maybeSingle();
  if (error) throw new Error(`소개를 불러오지 못했습니다: ${error.message}`);
  if (!data) return null;
  return {
    ...data,
    avatar: parsePostImage(data.avatar),
    facts: parseProfileFacts(data.facts),
    links: parseProfileLinks(data.links),
  };
});

/** Creates the row on first save, overwrites it afterwards. */
export async function saveProfile(input: ProfileInput): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('profile').upsert({ id: true, ...input });
  if (error) throw new Error(`소개를 저장하지 못했습니다: ${error.message}`);
}
