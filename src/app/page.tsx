import { getCurrentUser } from '~/lib/auth';
import { getMenus } from '~/lib/menus';
import { getPublicPosts, searchPosts } from '~/lib/posts';
import { normalizeSearchQuery } from '~/lib/search';
import { FeedContainer, FeedEmpty, FeedHeading } from '~/components/post/FeedLayout';
import { PostCard } from '~/components/post/PostCard';
import { PostCardGrid, PRIORITY_CARD_COUNT } from '~/components/post/PostCardGrid';
import { SearchForm } from '~/components/search/SearchForm';
import { NO_SEARCH_RESULT_MESSAGE, SearchResultHeading } from '~/components/search/SearchResultHeading';

interface HomePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const query = normalizeSearchQuery((await searchParams).q);
  // The post query depends on who's asking, so it can't start before the auth
  // check resolves — the menu list doesn't, so it rides along with it instead
  // of waiting its turn behind both.
  const [user, menus] = await Promise.all([getCurrentUser(), getMenus()]);
  const isOwner = Boolean(user);
  const posts = query
    ? await searchPosts(query, { includeDrafts: isOwner })
    : await getPublicPosts({ includeDrafts: isOwner });
  const menuNameById = new Map(menus.map((menu) => [menu.id, menu.name]));

  return (
    <FeedContainer>
      <SearchForm />
      {query ? (
        <SearchResultHeading query={query} count={posts.length} />
      ) : (
        <FeedHeading>최근 글</FeedHeading>
      )}
      {posts.length === 0 ? (
        <FeedEmpty>
          {query ? NO_SEARCH_RESULT_MESSAGE : '아직 공개된 글이 없습니다.'}
        </FeedEmpty>
      ) : (
        <PostCardGrid>
          {posts.map((post, index) => (
            <li key={post.id}>
              <PostCard
                post={post}
                menuName={post.menu_id ? menuNameById.get(post.menu_id) : undefined}
                isOwner={isOwner}
                isPriority={index < PRIORITY_CARD_COUNT}
              />
            </li>
          ))}
        </PostCardGrid>
      )}
    </FeedContainer>
  );
}
