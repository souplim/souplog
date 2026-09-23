'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '~/lib/auth';
import { createComment, deleteCommentAsOwner, deleteCommentWithPassword } from '~/lib/comments';
import { commentSchema, deleteCommentSchema } from '~/lib/validation';

export interface CommentFormState {
  error?: string;
}

export async function createCommentAction(
  postSlug: string,
  _prevState: CommentFormState | undefined,
  formData: FormData,
): Promise<CommentFormState> {
  const parsed = commentSchema.safeParse({
    postId: formData.get('postId'),
    authorName: formData.get('authorName'),
    password: formData.get('password'),
    content: formData.get('content'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? '입력을 확인하세요.' };
  }

  try {
    await createComment(parsed.data);
  } catch (error) {
    return { error: error instanceof Error ? error.message : '댓글을 저장하지 못했습니다.' };
  }

  revalidatePath(`/posts/${postSlug}`);
  return {};
}

export async function deleteCommentAction(
  postSlug: string,
  _prevState: CommentFormState | undefined,
  formData: FormData,
): Promise<CommentFormState> {
  const parsed = deleteCommentSchema.safeParse({
    commentId: formData.get('commentId'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { error: '비밀번호를 확인하세요.' };
  }

  const deleted = await deleteCommentWithPassword(parsed.data.commentId, parsed.data.password);
  if (!deleted) {
    return { error: '비밀번호가 올바르지 않습니다.' };
  }

  revalidatePath(`/posts/${postSlug}`);
  return {};
}

/** Owner moderation — no password required, gated by `requireUser()` + RLS. */
export async function deleteCommentAsOwnerAction(postSlug: string, commentId: string): Promise<void> {
  await requireUser();
  await deleteCommentAsOwner(commentId);
  revalidatePath(`/posts/${postSlug}`);
}
