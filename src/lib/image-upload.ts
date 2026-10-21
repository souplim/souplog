import 'server-only';
import { randomUUID } from 'node:crypto';
import { IMAGE_HEADER_BYTES, readImageDimensions } from '~/lib/image-dimensions';
import { POST_IMAGE_BUCKET, type PostImage } from '~/lib/images';
import { createClient } from '~/lib/supabase/server';

const EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
};

/**
 * Uploads one photo to the image bucket. Shared by post galleries and the
 * About page's profile photo — kept out of the `'use server'` action files so
 * it can't be invoked directly as a Server Action.
 */
export async function uploadPostImage(file: File): Promise<PostImage> {
  const supabase = await createClient();
  // Derived from the MIME type rather than the user-supplied filename, so the
  // storage key is never built from arbitrary client-controlled text.
  const extension = EXTENSION_BY_MIME_TYPE[file.type];
  if (!extension) throw new Error('지원하지 않는 이미지 형식입니다 (webp, jpeg, png, gif만 가능).');

  // Recorded now so the post page can reserve each photo's real aspect ratio
  // instead of forcing every shot into one box and cropping it.
  const header = new Uint8Array(await file.slice(0, IMAGE_HEADER_BYTES).arrayBuffer());
  const dimensions = readImageDimensions(header);

  const path = `${randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(POST_IMAGE_BUCKET).upload(path, file, {
    contentType: file.type,
  });

  if (error) throw new Error(`사진을 업로드하지 못했습니다: ${error.message}`);
  return { path, ...dimensions };
}
