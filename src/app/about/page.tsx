import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getCurrentUser } from '~/lib/auth';
import { getPostImageUrl } from '~/lib/images';
import { getProfile } from '~/lib/profile';
import { ProfileAvatar } from '~/components/about/ProfileAvatar';
import { PostContent } from '~/components/post/PostContent';
import { PageEyebrow, PageTitle } from '~/components/page/PageHeading';
import { Button } from '~/components/ui/button';

const AVATAR_SIZE = 112;

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  return {
    title: 'About',
    description: profile?.tagline || undefined,
    openGraph: {
      title: profile?.name ? `About · ${profile.name}` : 'About',
      description: profile?.tagline || undefined,
      images: profile?.avatar ? [getPostImageUrl(profile.avatar.path)] : undefined,
    },
  };
}

export default async function AboutPage() {
  const [profile, user] = await Promise.all([getProfile(), getCurrentUser()]);
  const isOwner = Boolean(user);

  return (
    <div className="mx-auto max-w-[var(--page-width)] px-4 py-[var(--space-xl)] sm:px-6">
      <article className="mx-auto w-full max-w-[var(--content-width)]">
        {profile ? (
          <>
            <header className="flex flex-col items-start gap-6 border-b border-border pb-[var(--space-lg)] sm:flex-row sm:items-center">
              <ProfileAvatar avatar={profile.avatar} name={profile.name} size={AVATAR_SIZE} />
              <div className="min-w-0 flex-1">
                <PageEyebrow>About</PageEyebrow>
                <PageTitle>{profile.name}</PageTitle>
                {profile.tagline && (
                  <p className="mt-2 text-[length:var(--text-lg)] text-pretty text-muted-foreground">{profile.tagline}</p>
                )}
              </div>
            </header>

            {profile.content.trim() && (
              <div className="mt-[var(--space-lg)]">
                <PostContent content={profile.content} />
              </div>
            )}
          </>
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">아직 소개가 없습니다.</p>
            {isOwner && (
              <Button asChild className="mt-4">
                <Link href="/admin/about">
                  <Plus />
                  소개 작성
                </Link>
              </Button>
            )}
          </div>
        )}
      </article>
    </div>
  );
}
