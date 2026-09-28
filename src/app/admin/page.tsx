import Link from 'next/link';
import type { Metadata } from 'next';
import { formatDate } from '~/lib/date';
import { getAdminPosts } from '~/lib/posts';
import { DeletePostButton } from './DeletePostButton';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';

export const metadata: Metadata = { title: '글 관리' };

export default async function AdminDashboardPage() {
  const posts = await getAdminPosts();

  return (
    <div>
      <h1 className="mb-6 font-heading text-3xl">글 관리</h1>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">작성된 글이 없습니다.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>제목</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>작성일</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium whitespace-normal">
                  <Link href={`/admin/posts/${post.id}/edit`} className="hover:text-accent-foreground">
                    {post.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={post.is_public ? 'default' : 'outline'}>{post.is_public ? '공개' : '비공개'}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(post.created_at)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/posts/${post.id}/edit`}>수정</Link>
                    </Button>
                    <DeletePostButton postId={post.id} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
