import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '~/lib/auth';
import { getMenus } from '~/lib/menus';
import { getPublicPosts, searchPosts } from '~/lib/posts';
import { normalizeSearchQuery } from '~/lib/search';
import { FeedContainer, FeedEmpty, FeedTitle } from '~/components/post/FeedLayout';
import { PostCard } from '~/components/post/PostCard';
import { PostCardGrid, PRIORITY_CARD_COUNT } from '~/components/post/PostCardGrid';
import { SearchForm } from '~/components/search/SearchForm';
import { NO_SEARCH_RESULT_MESSAGE, SearchResultHeading } from '~/components/search/SearchResultHeading';

interface MenuPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: MenuPageProps): Promise<Metadata> {
  const { slug } = await params;
  const menus = await getMenus();
  return { title: menus.find((menu) => menu.slug === slug)?.name ?? '메뉴' };
}

export default async function MenuPage({ params, searchParams }: MenuPageProps) {
  const { slug } = await params;
  const query = normalizeSearchQuery((await searchParams).q);
  // `getMenus` is the Header's request-cached call, so this resolves off work
  // that's already in flight; only the auth check is genuinely new here.
  const [menus, user] = await Promise.all([getMenus(), getCurrentUser()]);

  const menu = menus.find((item) => item.slug === slug);
  if (!menu) notFound();

  const isOwner = Boolean(user);
  const listOptions = { menuId: menu.id, includeDrafts: isOwner };
  const posts = query ? await searchPosts(query, listOptions) : await getPublicPosts(listOptions);

  return (
    <FeedContainer>
      <SearchForm />
      <FeedTitle title={menu.name} />
      {query ? <SearchResultHeading query={query} count={posts.length} /> : null}
      {posts.length === 0 ? (
        <FeedEmpty>{query ? NO_SEARCH_RESULT_MESSAGE : '이 메뉴에는 아직 공개된 글이 없습니다.'}</FeedEmpty>
      ) : (
        <PostCardGrid>
          {posts.map((post, index) => (
            <li key={post.id}>
              <PostCard post={post} isOwner={isOwner} isPriority={index < PRIORITY_CARD_COUNT} />
            </li>
          ))}
        </PostCardGrid>
      )}
    </FeedContainer>
  );
}
