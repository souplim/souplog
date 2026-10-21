import { z } from 'zod';
import { getSupabaseUrl } from '~/lib/supabase/env';

export const POST_IMAGE_BUCKET = 'post-images';

/** Keeps a post's gallery to a length that still reads as one post. */
export const MAX_POST_IMAGES = 10;

/**
 * Storage keys are minted server-side as `<uuid>.<extension>` (never from the
 * uploaded filename), so anything that doesn't match that shape didn't come
 * from this app and is dropped rather than rendered.
 */
const POST_IMAGE_PATH_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(webp|jpg|png|gif)$/;

const postImageSchema = z.object({
  path: z.string().regex(POST_IMAGE_PATH_PATTERN),
  // Absent on images uploaded before sizes were recorded — the renderer falls
  // back to a fixed box for those instead of the image's own aspect ratio.
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export type PostImage = z.infer<typeof postImageSchema>;

export function getPostImageUrl(path: string): string {
  return `${getSupabaseUrl()}/storage/v1/object/public/${POST_IMAGE_BUCKET}/${path}`;
}

/**
 * Width (px) an image actually renders at when `object-cover` fills a `size`×`size`
 * box — the value `next/image`'s `sizes` needs. A landscape photo is scaled until
 * its *height* fills the box, so it renders wider than the box itself; hinting
 * only the box width makes the optimizer serve a copy too short, which then gets
 * upscaled and turns blurry.
 */
export function getCoverRenderWidth(image: PostImage, size: number): number {
  const { width, height } = image;
  // Older uploads have no recorded size; assume a wide 16:9 shot so they stay sharp.
  const aspectRatio = width && height ? width / height : 16 / 9;
  return Math.ceil(size * Math.max(1, aspectRatio));
}

/**
 * Normalizes the `images` jsonb column (or a form's round-tripped copy of it)
 * into a list the UI can render. Malformed entries are skipped, not thrown
 * on: one bad row shouldn't take down a whole post page.
 */
export function parsePostImages(value: unknown): PostImage[] {
  if (!Array.isArray(value)) return [];

  return value
    .map(parsePostImage)
    .filter((image): image is PostImage => image !== null)
    .slice(0, MAX_POST_IMAGES);
}

/** A single stored image (e.g. the About page's profile photo), or `null` if absent or malformed. */
export function parsePostImage(value: unknown): PostImage | null {
  const result = postImageSchema.safeParse(value);
  return result.success ? result.data : null;
}

/** Same as `parsePostImage`, for the JSON string a form posts back. */
export function parsePostImageJson(value: unknown): PostImage | null {
  if (typeof value !== 'string' || value.length === 0) return null;

  try {
    return parsePostImage(JSON.parse(value));
  } catch {
    return null;
  }
}

/** Same normalization for the JSON string the post form posts back. */
export function parsePostImagesJson(value: unknown): PostImage[] {
  if (typeof value !== 'string' || value.length === 0) return [];

  try {
    return parsePostImages(JSON.parse(value));
  } catch {
    return [];
  }
}
