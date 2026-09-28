import Link from 'next/link';
import { getCurrentUser } from '~/lib/auth';
import { Button } from '~/components/ui/button';

export async function Footer() {
  const user = await getCurrentUser().catch(() => null);

  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto flex h-14 max-w-[var(--page-width)] items-center justify-between px-4 text-sm text-muted-foreground sm:px-6">
        <span>© {new Date().getFullYear()} souplog</span>
        {!user && (
          <Button variant="link" size="sm" className="h-auto p-0 text-muted-foreground" asChild>
            <Link href="/login">로그인</Link>
          </Button>
        )}
      </div>
    </footer>
  );
}
