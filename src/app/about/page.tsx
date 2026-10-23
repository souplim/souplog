import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Plus } from 'lucide-react';
import { summarizeAbout, type AboutSummary } from '~/lib/about-summary';
import { getCurrentUser } from '~/lib/auth';
import { getBooks } from '~/lib/books';
import { formatDate } from '~/lib/date';
import { getPostImageUrl } from '~/lib/images';
import { getMenus, getNavItems } from '~/lib/menus';
import type { NavItem, NavItemKey } from '~/lib/nav-items';
import { getPublicPosts } from '~/lib/posts';
import { getProfile } from '~/lib/profile';
import type { Book, PostSummary } from '~/lib/supabase/types';
import { AboutHero } from '~/components/about/AboutHero';
import { AboutSection } from '~/components/about/AboutSection';
import { AboutSteps, type AboutStep } from '~/components/about/AboutSteps';
import { BookCover } from '~/components/books/BookCover';
import { PostCard } from '~/components/post/PostCard';
import { PostCardGrid } from '~/components/post/PostCardGrid';
import { Button } from '~/components/ui/button';

/** One row of cards in the two-column grid. */
const RECENT_POST_COUNT = 2;

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

/** A top-level page's label, or `null` when the owner has hidden it from the nav. */
function visibleLabel(navItems: readonly NavItem[], key: NavItemKey): string | null {
  const item = navItems.find((navItem) => navItem.key === key);
  return item?.isVisible ? item.label : null;
}

function heroStats(summary: AboutSummary<Book>, showBooks: boolean): string[] {
  return [
    `글 ${summary.postCount}편`,
    showBooks && summary.finishedBookCount > 0 ? `읽은 책 ${summary.finishedBookCount}권` : null,
    summary.sinceYear ? `${summary.sinceYear}년부터 기록 중` : null,
  ].filter((fact): fact is string => fact !== null);
}

interface StepLabels {
  posts: string;
  books: string | null;
  stats: string | null;
}

function buildSteps(summary: AboutSummary<Book>, latestPost: PostSummary | undefined, labels: StepLabels): AboutStep[] {
  const steps: (AboutStep | null)[] = [
    labels.books
      ? {
          key: 'books',
          title: '읽는다',
          description: '읽고 싶은 책, 읽는 중인 책, 다 읽은 책을 한 해 단위로 꽂아 둡니다.',
          preview: <FeaturedBookPreview featured={summary.featuredBook} />,
          href: '/books',
          linkLabel: `${labels.books} 구경하기`,
        }
      : null,
    {
      key: 'posts',
      title: '쓴다',
      description: '읽고 겪은 것을 오래 남길 수 있는 글로 정리합니다.',
      preview: <LatestPostPreview post={latestPost} />,
      href: '/posts',
      linkLabel: `${labels.posts} 읽기`,
    },
    labels.stats
      ? {
          key: 'stats',
          title: '센다',
          description: '국가 통계로 여성의 일과 삶이 어떻게 달라지는지 숫자로 들여다봅니다.',
          preview: <p className="text-sm text-muted-foreground">출처 KOSIS 국가통계포털</p>,
          href: '/stats',
          linkLabel: `${labels.stats} 보기`,
        }
      : null,
  ];
  return steps.filter((step): step is AboutStep => step !== null);
}

function FeaturedBookPreview({ featured }: { featured: AboutSummary<Book>['featuredBook'] }) {
  if (!featured) return <p className="text-sm text-muted-foreground">책장에 아직 책이 없어요.</p>;

  const { book, isReading } = featured;
  return (
    <div className="flex items-center gap-[var(--space-sm)]">
      <BookCover
        title={book.title}
        cover={book.cover}
        isPublic={book.is_public}
        sizes="56px"
        className="w-14 shrink-0"
      />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{isReading ? '지금 읽는 책' : '최근에 다 읽은 책'}</p>
        <p className="mt-[var(--space-3xs)] line-clamp-2 text-sm font-semibold break-keep">{book.title}</p>
        {book.author && <p className="truncate text-xs text-muted-foreground">{book.author}</p>}
      </div>
    </div>
  );
}

function LatestPostPreview({ post }: { post: PostSummary | undefined }) {
  if (!post) return <p className="text-sm text-muted-foreground">아직 공개된 글이 없어요.</p>;

  return (
    <div>
      <p className="text-xs text-muted-foreground">최근 글</p>
      <p className="mt-[var(--space-3xs)] line-clamp-2 text-sm font-semibold break-keep">{post.title}</p>
      <time className="text-xs text-muted-foreground tabular-nums" dateTime={post.created_at}>
        {formatDate(post.created_at)}
      </time>
    </div>
  );
}

export default async function AboutPage() {
  const [profile, user, navItems, posts, books, menus] = await Promise.all([
    getProfile(),
    getCurrentUser(),
    getNavItems(),
    getPublicPosts(),
    getBooks(),
    getMenus(),
  ]);
  const isOwner = Boolean(user);

  if (!profile) {
    return (
      <div className="mx-auto max-w-[var(--page-width)] px-4 py-[var(--space-xl)] text-center sm:px-6">
        <p className="py-12 text-muted-foreground">아직 소개가 없습니다.</p>
        {isOwner && (
          <Button asChild>
            <Link href="/admin/about">
              <Plus />
              소개 작성
            </Link>
          </Button>
        )}
      </div>
    );
  }

  // The owner also gets hidden books back from RLS; the page shows what every visitor sees.
  const summary = summarizeAbout(
    posts,
    books.filter((book) => book.is_public),
  );
  const labels: StepLabels = {
    posts: visibleLabel(navItems, 'posts') ?? '게시글',
    books: visibleLabel(navItems, 'books'),
    stats: visibleLabel(navItems, 'stats'),
  };
  const menuNameById = new Map(menus.map((menu) => [menu.id, menu.name]));
  const recentPosts = posts.slice(0, RECENT_POST_COUNT);

  return (
    // Bands after the hero alternate their background, however many of the optional ones are shown.
    <div className="[&>section:nth-child(even)]:bg-muted">
      <AboutHero
        eyebrow={visibleLabel(navItems, 'about') ?? 'About'}
        name={profile.name}
        tagline={profile.tagline}
        stats={heroStats(summary, Boolean(labels.books))}
        links={profile.links}
        facts={profile.facts}
        content={profile.content}
        primaryLink={{ href: '/posts', label: '글 읽으러 가기' }}
        secondaryLink={labels.books ? { href: '/books', label: `${labels.books} 보기` } : null}
        isOwner={isOwner}
      />

      <AboutSection id="about-steps" eyebrow="이 블로그에서는" heading="읽고, 쓰고, 셉니다">
        <AboutSteps steps={buildSteps(summary, posts[0], labels)} />
      </AboutSection>

      {recentPosts.length > 0 && (
        <AboutSection
          id="about-posts"
          eyebrow={labels.posts}
          heading="최근에 쓴 글"
          action={
            <Link
              href="/posts"
              className="inline-flex items-center gap-[var(--space-3xs)] rounded-xs text-sm font-semibold text-accent-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              전체 보기
              <ArrowRight className="size-4" />
            </Link>
          }
        >
          <PostCardGrid>
            {recentPosts.map((post) => (
              <li key={post.id}>
                <PostCard
                  post={post}
                  menuName={post.menu_id ? menuNameById.get(post.menu_id) : undefined}
                  isOwner={isOwner}
                />
              </li>
            ))}
          </PostCardGrid>
        </AboutSection>
      )}
    </div>
  );
}
