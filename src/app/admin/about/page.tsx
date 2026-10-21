import type { Metadata } from 'next';
import { updateProfileAction } from '~/lib/actions/profile';
import { getProfile } from '~/lib/profile';
import { AboutForm } from '~/components/about/AboutForm';
import { PageColumn } from '~/components/page/PageColumn';
import { AdminPageTitle } from '~/components/page/PageHeading';

export const metadata: Metadata = { title: 'About 수정' };

export default async function AdminAboutPage() {
  const profile = await getProfile();

  return (
    <PageColumn className="py-[var(--space-lg)]">
      <AdminPageTitle>About 수정</AdminPageTitle>
      <AboutForm profile={profile} action={updateProfileAction} />
    </PageColumn>
  );
}
