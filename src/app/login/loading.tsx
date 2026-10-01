import { Skeleton } from '~/components/ui/skeleton';

/**
 * Exists so the root feed skeleton isn't what a visitor sees on the way to
 * the login form — the heading and lead are static text, so only the form
 * controls need a placeholder.
 */
export default function LoginLoading() {
  return (
    <div
      role="status"
      className="mx-auto flex max-w-[var(--page-width)] justify-center px-4 py-[var(--space-section)] sm:px-6"
    >
      <span className="sr-only">로그인 화면을 불러오는 중입니다.</span>
      <div className="flex w-full max-w-[340px] flex-col gap-7">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading text-[1.625rem] tracking-[-0.03em]">로그인</h1>
          <p className="text-sm text-muted-foreground">관리자 계정으로만 로그인할 수 있습니다.</p>
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
    </div>
  );
}
