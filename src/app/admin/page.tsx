import Link from 'next/link';
import type { Metadata } from 'next';
import { formatDate } from '~/lib/date';
import { getAdminPosts } from '~/lib/posts';
import { DeletePostButton } from './DeletePostButton';
import styles from './page.module.css';

export const metadata: Metadata = { title: '글 관리' };

export default async function AdminDashboardPage() {
  const posts = await getAdminPosts();

  return (
    <div>
      <h1 className={styles.heading}>글 관리</h1>

      {posts.length === 0 ? (
        <p className={styles.empty}>작성된 글이 없습니다.</p>
      ) : (
        <div className={styles.table}>
          {posts.map((post) => (
            <div key={post.id} className={styles.row}>
              <Link href={`/admin/posts/${post.id}/edit`} className={styles.title}>
                {post.title}
              </Link>
              <span className={`${styles.status} ${post.is_public ? styles.statusPublic : ''}`}>
                {post.is_public ? '공개' : '비공개'}
              </span>
              <span>{formatDate(post.created_at)}</span>
              <div className={styles.rowActions}>
                <Link href={`/admin/posts/${post.id}/edit`}>수정</Link>
                <DeletePostButton postId={post.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
