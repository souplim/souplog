import { ArrowUpRight } from 'lucide-react';
import { formatDate } from '~/lib/date';
import { kciKeywordTrendUrl } from '~/lib/kci-keywords';
import type { FieldKeywordsResult } from '~/lib/research-keywords';

interface FieldKeywordsProps {
  result: FieldKeywordsResult;
}

const KCI_MAIN_URL = 'https://www.kci.go.kr/kciportal/main.kci';

const LINK_CLASS =
  'rounded-xs underline-offset-2 outline-none transition-colors duration-[var(--duration-fast)] hover:text-accent-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring/50';

/**
 * What each field is writing about now, ranked by how many of the year's papers
 * carry the keyword. Each field is a bordered card like `StatCard`; the rows
 * inside keep their dividers.
 */
export function FieldKeywords({ result }: FieldKeywordsProps) {
  const yearLabel = result.status === 'ok' && result.year ? `${result.year}년 ` : '';

  return (
    <section aria-labelledby="field-keywords-heading" className="mt-[var(--space-xl)]">
      <h2 id="field-keywords-heading" className="font-heading text-[length:var(--text-lg)] font-semibold">
        {yearLabel}분야별 인기 키워드
      </h2>
      <p className="mt-[var(--space-3xs)] text-sm text-muted-foreground text-pretty">
        {yearLabel}발행 논문에 가장 많이 등록된 키워드입니다. 키워드를 누르면 KCI 연구동향 분석이 열립니다.
      </p>

      {result.status === 'ok' ? (
        <div className="mt-[var(--space-md)] grid gap-[var(--space-md)] sm:grid-cols-2">
          {result.fields.map(({ field, keywords }) => (
            <section
              key={field}
              aria-labelledby={`keywords-${field}`}
              className="min-w-0 rounded-xl border border-border bg-card p-[var(--space-md)]"
            >
              <h3 id={`keywords-${field}`} className="text-xs font-semibold text-accent-foreground">
                {field}
              </h3>
              <ol className="mt-[var(--space-2xs)]">
                {keywords.map((keyword, index) => (
                  <li
                    key={keyword}
                    className="flex items-baseline gap-[var(--space-sm)] border-b border-border py-2 last:border-b-0 last:pb-0"
                  >
                    <span className="w-5 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                      {index + 1}
                    </span>
                    <a
                      href={kciKeywordTrendUrl(keyword)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`min-w-0 truncate text-sm ${LINK_CLASS}`}
                    >
                      {keyword}
                      <span className="sr-only">(KCI 연구동향을 새 창으로 열기)</span>
                    </a>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      ) : (
        <p role="alert" className="mt-[var(--space-md)] text-sm text-muted-foreground">
          {result.message} 잠시 후 다시 확인해 주세요.
        </p>
      )}

      <footer className="mt-[var(--space-sm)] flex flex-wrap items-center gap-x-[var(--space-xs)] gap-y-[var(--space-3xs)] text-xs text-muted-foreground">
        <a
          href={KCI_MAIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-0.5 ${LINK_CLASS}`}
        >
          KCI 대분야별 인기 키워드 순위
          <ArrowUpRight className="size-3" aria-hidden="true" />
          <span className="sr-only">(KCI에서 새 창으로 열기)</span>
        </a>
        {result.status === 'ok' && <span className="tabular-nums">갱신 {formatDate(result.fetchedAt)}</span>}
      </footer>
    </section>
  );
}
