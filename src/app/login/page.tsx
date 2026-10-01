import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '~/lib/auth';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = { title: '로그인' };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect('/');

  return (
    <div className="mx-auto flex max-w-[var(--page-width)] justify-center px-4 py-[var(--space-section)] sm:px-6">
      <div className="flex w-full max-w-[340px] flex-col gap-7">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading text-[1.625rem] tracking-[-0.03em]">로그인</h1>
          <p className="text-sm text-muted-foreground">관리자 계정으로만 로그인할 수 있습니다.</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
