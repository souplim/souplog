import { formatDate } from '~/lib/date';
import { getCommentsForPost } from '~/lib/comments';
import { CommentDeleteForm } from './CommentDeleteForm';
import { CommentForm } from './CommentForm';
import { OwnerDeleteCommentButton } from './OwnerDeleteCommentButton';

interface CommentListProps {
  postId: string;
  postSlug: string;
  isOwner: boolean;
}

export async function CommentList({ postId, postSlug, isOwner }: CommentListProps) {
  const comments = await getCommentsForPost(postId);

  return (
    <section className="mt-16 border-t border-border pt-10" aria-labelledby="comments-heading">
      <h2 id="comments-heading" className="font-heading text-xl">
        댓글 {comments.length > 0 && `(${comments.length})`}
      </h2>

      {comments.length === 0 ? (
        <p className="mt-4 text-muted-foreground">아직 댓글이 없습니다.</p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {comments.map((comment) => (
            <li key={comment.id} className="py-4">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium">{comment.author_name}</span>
                <time className="text-muted-foreground" dateTime={comment.created_at}>
                  {formatDate(comment.created_at)}
                </time>
                <span className="ml-auto">
                  {isOwner ? (
                    <OwnerDeleteCommentButton commentId={comment.id} postSlug={postSlug} />
                  ) : (
                    <CommentDeleteForm commentId={comment.id} postSlug={postSlug} />
                  )}
                </span>
              </div>
              <p className="mt-1.5">{comment.content}</p>
            </li>
          ))}
        </ul>
      )}

      <CommentForm postId={postId} postSlug={postSlug} />
    </section>
  );
}
