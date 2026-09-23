import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '~/lib/auth';
import { LoginForm } from './LoginForm';
import styles from './page.module.css';

export const metadata: Metadata = { title: '로그인' };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect('/admin');

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>로그인</h1>
      <LoginForm />
    </div>
  );
}
