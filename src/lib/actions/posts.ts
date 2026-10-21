'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  ATTACHMENT_CONTENT_TYPES,
  getAttachmentExtension,
  MAX_ATTACHMENT_BYTES,
  MAX_POST_ATTACHMENTS,
  normalizeAttachmentName,
  parsePostAttachmentsJson,
  POST_ATTACHMENT_BUCKET,
  type PostAttachment,
} from '~/lib/attachments';
import { requireUser } from '~/lib/auth';
import { uploadPostImage } from '~/lib/image-upload';
import { MAX_POST_IMAGES, parsePostImagesJson, type PostImage } from '~/lib/images';
import { createPost, deletePost, postSlugExists, updatePost } from '~/lib/posts';
import { ensureUniqueSlug, slugify } from '~/lib/slugify';
import { createClient } from '~/lib/supabase/server';
import { postSchema } from '~/lib/validation';

export interface PostFormState {
  error?: string;
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

async function uploadPostAttachment(file: File): Promise<PostAttachment> {
  const name = normalizeAttachmentName(file.name);
  // The extension picks both the storage key's suffix and the content type,
  // so neither is built from the browser's say-so.
  const extension = getAttachmentExtension(name);
  if (!extension) throw new Error(`첨부할 수 없는 파일 형식입니다: ${name || file.name}`);
  if (file.size > MAX_ATTACHMENT_BYTES) {
    throw new Error(`첨부 파일은 ${MAX_ATTACHMENT_BYTES / 1024 / 1024}MB 이하만 올릴 수 있습니다: ${name}`);
  }

  const supabase = await createClient();
  const path = `${randomUUID()}.${extension}`;

  // Sent as raw bytes, not the File: storage-js wraps a Blob in multipart and
  // ignores `contentType`, falling back to the browser's type — empty for
  // .hwp or .md, which the bucket's allowed_mime_types then rejects.
  const { error } = await supabase.storage.from(POST_ATTACHMENT_BUCKET).upload(path, await file.arrayBuffer(), {
    contentType: ATTACHMENT_CONTENT_TYPES[extension],
  });

  if (error) throw new Error(`첨부 파일을 업로드하지 못했습니다: ${error.message}`);
  return { path, name, size: file.size };
}

/** Same as `resolvePostImages`, for the post's attached files. */
async function resolvePostAttachments(formData: FormData): Promise<PostAttachment[]> {
  const kept = parsePostAttachmentsJson(formData.get('keptAttachments'));
  const files = formData
    .getAll('attachments')
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (kept.length + files.length > MAX_POST_ATTACHMENTS) {
    throw new Error(`첨부 파일은 한 글에 최대 ${MAX_POST_ATTACHMENTS}개까지 올릴 수 있습니다.`);
  }

  const uploaded = await Promise.all(files.map(uploadPostAttachment));
  return [...kept, ...uploaded];
}

interface PostFiles {
  images: PostImage[];
  attachments: PostAttachment[];
}

async function resolvePostFiles(formData: FormData): Promise<PostFiles> {
  const [images, attachments] = await Promise.all([resolvePostImages(formData), resolvePostAttachments(formData)]);
  return { images, attachments };
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '파일을 처리하지 못했습니다.';
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

  let files: PostFiles;
  try {
    files = await resolvePostFiles(formData);
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
      ...files,
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

  let files: PostFiles;
  try {
    files = await resolvePostFiles(formData);
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
      ...files,
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
