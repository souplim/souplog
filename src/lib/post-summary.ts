import { parsePostImages } from '~/lib/images';
import { toPlainPreview } from '~/lib/markdown-preview';
import type { PostListRow, PostSummary } from '~/lib/supabase/types';

/**
 * Shapes a `posts_list` row for a list card. The author's excerpt wins when
 * there is one — it was written to be the summary — and only an empty excerpt
 * falls back to the start of the body.
 */
export function toPostSummary(row: PostListRow): PostSummary {
  const { content_preview, cover_image, ...rest } = row;
  const excerpt = row.excerpt.trim();

  return {
    ...rest,
    preview: excerpt || toPlainPreview(content_preview),
    coverImage: parsePostImages([cover_image])[0] ?? null,
  };
}
