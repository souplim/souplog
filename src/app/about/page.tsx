import type { Metadata } from 'next';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { getCurrentUser } from '~/lib/auth';
import { getPostImageUrl } from '~/lib/images';
import { getProfile } from '~/lib/profile';
import { ProfileAvatar } from '~/components/about/ProfileAvatar';
import { PostContent } from '~/components/post/PostContent';
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
            <header className="flex flex-col items-start gap-6 border-b border-border pb-8 sm:flex-row sm:items-center">
              <ProfileAvatar avatar={profile.avatar} name={profile.name} size={AVATAR_SIZE} />
              <div className="min-w-0 flex-1">
                <p className="mb-2 text-xs font-semibold text-accent-foreground">About</p>
                <h1 className="font-heading text-[length:var(--text-display)] tracking-[-0.03em] text-balance">
                  {profile.name}
                </h1>
                {profile.tagline && (
                  <p className="mt-2 text-[length:var(--text-lg)] text-pretty text-muted-foreground">{profile.tagline}</p>
                )}
              </div>
              {isOwner && <EditButton />}
            </header>

            {profile.content.trim() && (
              <div className="mt-8">
                <PostContent content={profile.content} />
              </div>
            )}
          </>
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">아직 소개가 없습니다.</p>
            {isOwner && (
              <Button asChild className="mt-4">
                <Link href="/admin/about">소개 작성하기</Link>
              </Button>
            )}
          </div>
        )}
      </article>
    </div>
  );
}

function EditButton() {
  return (
    <Button variant="outline" size="sm" asChild className="sm:self-start">
      <Link href="/admin/about">
        <Pencil />
        수정
      </Link>
    </Button>
  );
}
