import Link from 'next/link';
import { getCurrentUser } from '~/lib/auth';
import { Button } from '~/components/ui/button';

export async function Footer() {
  const user = await getCurrentUser().catch(() => null);

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex h-14 max-w-[var(--page-width)] items-center justify-between px-4 text-xs text-muted-foreground sm:px-6">
        <span>© {new Date().getFullYear()} souplog</span>
        {!user && (
          <Button variant="link" size="sm" className="h-auto p-0 text-xs text-muted-foreground no-underline hover:text-foreground" asChild>
            <Link href="/login">로그인</Link>
          </Button>
        )}
      </div>
    </footer>
  );
}
