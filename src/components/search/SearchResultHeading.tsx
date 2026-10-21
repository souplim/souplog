interface SearchResultHeadingProps {
  query: string;
  count: number;
}

/** Same type scale as the feed's "최근 글" label it stands in for. */
export function SearchResultHeading({ query, count }: SearchResultHeadingProps) {
  return (
    <h2 className="mb-4 text-xs font-normal tracking-normal text-muted-foreground">
      <span className="font-medium text-foreground">‘{query}’</span> 검색 결과 {count}개
    </h2>
  );
}

export const NO_SEARCH_RESULT_MESSAGE = '일치하는 글이 없습니다. 다른 단어로 검색해 보세요.';
