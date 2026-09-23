import 'server-only';
import { createClient } from '~/lib/supabase/server';
import type { PublicComment } from '~/lib/supabase/types';

export async function getCommentsForPost(postId: string): Promise<PublicComment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('comments_public')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(`댓글을 불러오지 못했습니다: ${error.message}`);
  return data;
}

export interface CreateCommentInput {
  postId: string;
  authorName: string;
  password: string;
  content: string;
}

/**
 * Password hashing and the "only public posts accept comments" rule both
 * live in the `create_comment` DB function — never re-implemented here — so
 * a client that bypasses this app still can't create a comment the DB
 * itself wouldn't allow.
 */
export async function createComment(input: CreateCommentInput): Promise<PublicComment> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('create_comment', {
    p_post_id: input.postId,
    p_author_name: input.authorName,
    p_password: input.password,
    p_content: input.content,
  });

  if (error) throw new Error(error.message);
  const [comment] = data;
  if (!comment) throw new Error('댓글을 저장하지 못했습니다.');
  return comment;
}

/** Guest-facing delete: requires the comment's own password. */
export async function deleteCommentWithPassword(commentId: string, password: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('delete_comment', {
    p_comment_id: commentId,
    p_password: password,
  });
  if (error) throw new Error(error.message);
  return data;
}

/** Owner-facing delete: no password needed, relies on the authenticated RLS policy. */
export async function deleteCommentAsOwner(commentId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('comments').delete().eq('id', commentId);
  if (error) throw new Error(`댓글을 삭제하지 못했습니다: ${error.message}`);
}
