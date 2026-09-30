import type { ReactNode } from 'react';
import { requireUser } from '~/lib/auth';

/**
 * Only gates the section — the post editor runs full-bleed, so each admin page
 * owns whatever container it needs.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireUser();

  return <>{children}</>;
}
