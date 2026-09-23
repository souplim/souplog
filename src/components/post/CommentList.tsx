import { formatDate } from '~/lib/date';
import { getCommentsForPost } from '~/lib/comments';
import { CommentDeleteForm } from './CommentDeleteForm';
import { CommentForm } from './CommentForm';
import { OwnerDeleteCommentButton } from './OwnerDeleteCommentButton';
import styles from './CommentList.module.css';

interface CommentListProps {
  postId: string;
  postSlug: string;
  isOwner: boolean;
}

export async function CommentList({ postId, postSlug, isOwner }: CommentListProps) {
  const comments = await getCommentsForPost(postId);

  return (
    <section className={styles.section} aria-labelledby="comments-heading">
      <h2 id="comments-heading" className={styles.heading}>
        댓글 {comments.length > 0 && `(${comments.length})`}
      </h2>

      {comments.length === 0 ? (
        <p className={styles.empty}>아직 댓글이 없습니다.</p>
      ) : (
        <ul className={styles.list}>
          {comments.map((comment) => (
            <li key={comment.id} className={styles.comment}>
              <div className={styles.meta}>
                <span className={styles.author}>{comment.author_name}</span>
                <time dateTime={comment.created_at}>{formatDate(comment.created_at)}</time>
                <span className={styles.actions}>
                  {isOwner ? (
                    <OwnerDeleteCommentButton commentId={comment.id} postSlug={postSlug} />
                  ) : (
                    <CommentDeleteForm commentId={comment.id} postSlug={postSlug} />
                  )}
                </span>
              </div>
              <p className={styles.body}>{comment.content}</p>
            </li>
          ))}
        </ul>
      )}

      <CommentForm postId={postId} postSlug={postSlug} />
    </section>
  );
}
