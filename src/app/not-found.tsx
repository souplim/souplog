import Link from 'next/link';
import { Button } from '~/components/ui/button';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[var(--page-width)] px-4 py-[var(--space-section)] text-center sm:px-6">
      <p className="text-muted-foreground">페이지를 찾을 수 없습니다.</p>
      <Button variant="outline" size="sm" className="mt-4" asChild>
        <Link href="/">홈으로 돌아가기</Link>
      </Button>
    </div>
  );
}
