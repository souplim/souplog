import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '~/lib/auth';
import { LoginForm } from './LoginForm';
import { Card, CardContent, CardHeader } from '~/components/ui/card';

export const metadata: Metadata = { title: '로그인' };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect('/');

  return (
    <div className="mx-auto flex max-w-[var(--page-width)] justify-center px-4 py-[var(--space-section)] sm:px-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <h1 className="font-heading text-2xl font-semibold">로그인</h1>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
