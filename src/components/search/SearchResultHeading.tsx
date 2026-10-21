import { FeedHeading } from '~/components/post/FeedLayout';

interface SearchResultHeadingProps {
  query: string;
  count: number;
}

/** Stands in for the feed's "최근 글" label while a search is on. */
export function SearchResultHeading({ query, count }: SearchResultHeadingProps) {
  return (
    <FeedHeading>
      <span className="font-medium text-foreground">‘{query}’</span> 검색 결과 {count}개
    </FeedHeading>
  );
}

export const NO_SEARCH_RESULT_MESSAGE = '일치하는 글이 없습니다. 다른 단어로 검색해 보세요.';
