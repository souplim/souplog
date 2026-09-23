'use client';

import { useActionState } from 'react';
import { login } from '~/lib/actions/auth';
import styles from './page.module.css';

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <form action={formAction} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="email">
          이메일
        </label>
        <input className={styles.input} id="email" name="email" type="email" autoComplete="username" required />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="password">
          비밀번호
        </label>
        <input
          className={styles.input}
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      {state?.error && <p className={styles.error}>{state.error}</p>}
      <button type="submit" className={styles.submit} disabled={pending}>
        {pending ? '로그인 중…' : '로그인'}
      </button>
    </form>
  );
}
