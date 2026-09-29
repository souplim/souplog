import type { ReactNode } from 'react';
import { requireUser } from '~/lib/auth';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireUser();

  return (
    <div className="mx-auto max-w-[var(--page-width)] px-4 py-[var(--space-xl)] sm:px-6">{children}</div>
  );
}
