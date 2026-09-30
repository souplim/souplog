'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireUser } from '~/lib/auth';
import { createPost, deletePost, postSlugExists, updatePost } from '~/lib/posts';
import { ensureUniqueSlug, slugify } from '~/lib/slugify';
import { createClient } from '~/lib/supabase/server';
import { postSchema } from '~/lib/validation';

export interface PostFormState {
  error?: string;
}

const COVER_IMAGE_BUCKET = 'post-images';

const EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
};

async function uploadCoverImage(file: File): Promise<string> {
  const supabase = await createClient();
  // Derived from the MIME type rather than the user-supplied filename, so the
  // storage key is never built from arbitrary client-controlled text.
  const extension = EXTENSION_BY_MIME_TYPE[file.type];
  if (!extension) throw new Error('지원하지 않는 이미지 형식입니다 (webp, jpeg, png, gif만 가능).');

  const path = `${randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(COVER_IMAGE_BUCKET).upload(path, file, {
    contentType: file.type,
  });

  if (error) throw new Error(`표지 이미지를 업로드하지 못했습니다: ${error.message}`);
  return path;
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

  const coverImage = formData.get('coverImage');
  const coverImagePath = coverImage instanceof File && coverImage.size > 0 ? await uploadCoverImage(coverImage) : null;

  await createPost(
    {
      title: parsed.data.title,
      slug,
      content: parsed.data.content,
      excerpt: parsed.data.excerpt,
      menuId: parsed.data.menuId,
      coverImagePath,
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

  const coverImage = formData.get('coverImage');
  const existingCoverImagePath = formData.get('existingCoverImagePath');
  const coverImagePath =
    coverImage instanceof File && coverImage.size > 0
      ? await uploadCoverImage(coverImage)
      : typeof existingCoverImagePath === 'string' && existingCoverImagePath.length > 0
        ? existingCoverImagePath
        : null;

  await updatePost(
    postId,
    {
      title: parsed.data.title,
      slug,
      content: parsed.data.content,
      excerpt: parsed.data.excerpt,
      menuId: parsed.data.menuId,
      coverImagePath,
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
