'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireUser } from '~/lib/auth';
import { IMAGE_HEADER_BYTES, readImageDimensions } from '~/lib/image-dimensions';
import { MAX_POST_IMAGES, parsePostImagesJson, POST_IMAGE_BUCKET, type PostImage } from '~/lib/images';
import { createPost, deletePost, postSlugExists, updatePost } from '~/lib/posts';
import { ensureUniqueSlug, slugify } from '~/lib/slugify';
import { createClient } from '~/lib/supabase/server';
import { postSchema } from '~/lib/validation';

export interface PostFormState {
  error?: string;
}

const EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
};

async function uploadPostImage(file: File): Promise<PostImage> {
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

/**
 * The images the post should end up with: the ones the author kept (in the
 * order the form shows them), followed by whatever was newly picked.
 */
async function resolvePostImages(formData: FormData): Promise<PostImage[]> {
  const kept = parsePostImagesJson(formData.get('keptImages'));
  const files = formData.getAll('images').filter((value): value is File => value instanceof File && value.size > 0);

  if (kept.length + files.length > MAX_POST_IMAGES) {
    throw new Error(`사진은 한 글에 최대 ${MAX_POST_IMAGES}장까지 올릴 수 있습니다.`);
  }

  const uploaded = await Promise.all(files.map(uploadPostImage));
  return [...kept, ...uploaded];
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '사진을 처리하지 못했습니다.';
}

function parsePostForm(formData: FormData) {
  return postSchema.safeParse({
    title: formData.get('title'),
    slug: formData.get('slug'),
    content: formData.get('content'),
    excerpt: formData.get('excerpt'),
    menuId: formData.get('menuId') ?? '',
    isPublic: formData.get('isPublic') === 'on',
  });
}

export async function createPostAction(
  _prevState: PostFormState | undefined,
  formData: FormData,
): Promise<PostFormState> {
  await requireUser();

  const parsed = parsePostForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? '입력을 확인하세요.' };
  }

  const baseSlug = parsed.data.slug.length > 0 ? slugify(parsed.data.slug) : slugify(parsed.data.title);
  const slug = await ensureUniqueSlug(baseSlug, (candidate) => postSlugExists(candidate));

  let images: PostImage[];
  try {
    images = await resolvePostImages(formData);
  } catch (error: unknown) {
    return { error: getErrorMessage(error) };
  }

  await createPost(
    {
      title: parsed.data.title,
      slug,
      content: parsed.data.content,
      excerpt: parsed.data.excerpt,
      menuId: parsed.data.menuId,
      images,
    },
    parsed.data.isPublic,
  );

  revalidatePath('/');
  revalidatePath(`/posts/${slug}`);
  redirect(`/posts/${encodeURIComponent(slug)}`);
}

export async function updatePostAction(
  postId: string,
  _prevState: PostFormState | undefined,
  formData: FormData,
): Promise<PostFormState> {
  await requireUser();

  const parsed = parsePostForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? '입력을 확인하세요.' };
  }

  const baseSlug = parsed.data.slug.length > 0 ? slugify(parsed.data.slug) : slugify(parsed.data.title);
  const slug = await ensureUniqueSlug(baseSlug, (candidate) => postSlugExists(candidate, postId));

  let images: PostImage[];
  try {
    images = await resolvePostImages(formData);
  } catch (error: unknown) {
    return { error: getErrorMessage(error) };
  }

  await updatePost(
    postId,
    {
      title: parsed.data.title,
      slug,
      content: parsed.data.content,
      excerpt: parsed.data.excerpt,
      menuId: parsed.data.menuId,
      images,
    },
    parsed.data.isPublic,
  );

  revalidatePath('/');
  revalidatePath(`/posts/${slug}`);
  redirect(`/posts/${encodeURIComponent(slug)}`);
}

export async function deletePostAction(postId: string): Promise<void> {
  await requireUser();
  await deletePost(postId);
  revalidatePath('/');
  redirect('/');
}
