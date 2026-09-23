import { getSupabaseUrl } from '~/lib/supabase/env';

export function getPostImageUrl(path: string): string {
  return `${getSupabaseUrl()}/storage/v1/object/public/post-images/${path}`;
}
