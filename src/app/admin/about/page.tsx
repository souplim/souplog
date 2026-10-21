import type { Metadata } from 'next';
import { updateProfileAction } from '~/lib/actions/profile';
import { getProfile } from '~/lib/profile';
import { AboutForm } from '~/components/about/AboutForm';

export const metadata: Metadata = { title: 'About 수정' };

export default async function AdminAboutPage() {
  const profile = await getProfile();

  return (
    <div className="mx-auto max-w-[var(--content-width)] px-4 py-[var(--space-lg)] sm:px-6">
      <h1 className="mb-8 font-heading text-3xl">About 수정</h1>
      <AboutForm profile={profile} action={updateProfileAction} />
    </div>
  );
}
