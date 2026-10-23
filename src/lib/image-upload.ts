import 'server-only';
import { randomUUID } from 'node:crypto';
import { detectImageType, IMAGE_HEADER_BYTES, readImageDimensions, type ImageMimeType } from '~/lib/image-dimensions';
import { POST_IMAGE_BUCKET, type PostImage } from '~/lib/images';
import { createClient } from '~/lib/supabase/server';

const EXTENSION_BY_MIME_TYPE: Record<ImageMimeType, string> = {
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
  const header = new Uint8Array(await file.slice(0, IMAGE_HEADER_BYTES).arrayBuffer());

  // The type comes from the file's own signature, not `file.type` or the
  // filename — both are whatever the uploader says — so the storage key and
  // the Content-Type it's served with always match what the bytes really are.
  const contentType = detectImageType(header);
  if (!contentType) throw new Error('지원하지 않는 이미지 형식입니다 (webp, jpeg, png, gif만 가능).');

  // Recorded now so the post page can reserve each photo's real aspect ratio
  // instead of forcing every shot into one box and cropping it.
  const dimensions = readImageDimensions(header);

  const path = `${randomUUID()}.${EXTENSION_BY_MIME_TYPE[contentType]}`;

  const { error } = await supabase.storage.from(POST_IMAGE_BUCKET).upload(path, await file.arrayBuffer(), {
    contentType,
  });

  if (error) throw new Error(`사진을 업로드하지 못했습니다: ${error.message}`);
  return { path, ...dimensions };
}
