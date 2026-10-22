import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { latestChange } from '~/lib/kosis-series';
import { formatPercent, formatPointChange } from '~/lib/stat-format';
import type { ShareStat, StatCard as StatCardData, TrendStat } from '~/lib/women-stats';

import { ShareBars } from './ShareBars';
import { TrendChart } from './TrendChart';

interface StatCardProps {
  card: StatCardData;
}

/**
 * One indicator: what it measures, the latest number large, the history
 * beneath, and where it came from. A bordered card like `PostCard` — no
 * shadow, per the token rules.
 */
export function StatCard({ card }: StatCardProps) {
  const { result } = card;
  const headingId = `${card.id}-heading`;

  return (
    <section
      aria-labelledby={headingId}
      className="flex min-w-0 flex-col rounded-xl border border-border bg-card p-[var(--space-md)]"
    >
      <h2 id={headingId} className="font-heading text-[length:var(--text-lg)] font-semibold">
        {card.title}
      </h2>
      <p className="mt-[var(--space-3xs)] text-sm text-muted-foreground text-pretty">{card.description}</p>

      <div className="mt-[var(--space-md)] flex-1">
        {result.status === 'ok' ? (
          result.data.kind === 'trend' ? (
            <TrendBody title={card.title} stat={result.data} />
          ) : (
            <ShareBody stat={result.data} />
          )
        ) : (
          <p role="alert" className="text-sm text-muted-foreground">
            {result.message} 잠시 후 다시 확인해 주세요.
          </p>
        )}
      </div>

      <footer className="mt-[var(--space-md)] flex flex-wrap items-center gap-x-[var(--space-xs)] gap-y-[var(--space-3xs)] text-xs text-muted-foreground">
        <a
          href={card.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 rounded-xs underline-offset-2 outline-none transition-colors duration-[var(--duration-fast)] hover:text-accent-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          {card.survey}
          <ArrowUpRight className="size-3" aria-hidden="true" />
          <span className="sr-only">(KOSIS에서 새 창으로 열기)</span>
        </a>
        {result.status === 'ok' && result.updatedAt && <span className="tabular-nums">갱신 {result.updatedAt}</span>}
      </footer>
    </section>
  );
}

interface HeadlineProps {
  value: string;
  children?: ReactNode;
}

/** The latest figure, with its period and change set small beside it. */
function Headline({ value, children }: HeadlineProps) {
  return (
    <div className="mb-[var(--space-sm)] flex flex-wrap items-baseline gap-x-[var(--space-xs)] gap-y-[var(--space-3xs)]">
      {/* A step below the page title, so six of them don't outshout it. */}
      <p className="font-heading text-[length:var(--text-title)] leading-none font-semibold tracking-[var(--tracking-tight)] tabular-nums">
        {value}
      </p>
      <div className="text-xs text-muted-foreground tabular-nums">{children}</div>
    </div>
  );
}

function TrendBody({ title, stat }: { title: string; stat: TrendStat }) {
  const primary = stat.series.find((series) => series.isPrimary) ?? stat.series[0];
  const latest = primary ? latestChange(stat.points, primary.key) : null;
  const others = stat.series.filter((series) => series !== primary);

  return (
    <>
      {latest && (
        <Headline value={formatPercent(latest.value)}>
          <span>
            {latest.period}년{others.length > 0 && ` ${primary?.label}`}
          </span>
          {latest.change !== null && (
            <span className="ml-[var(--space-2xs)]">
              {latest.previousPeriod}년 대비 {formatPointChange(latest.change)}
            </span>
          )}
          {others.map((series) => {
            const other = latestChange(stat.points, series.key);
            return (
              other && (
                <span key={series.key} className="block">
                  {series.label} {formatPercent(other.value)}
                </span>
              )
            );
          })}
        </Headline>
      )}
      {stat.series.length > 1 && <SeriesLegend series={stat.series} />}
      <TrendChart title={title} series={stat.series} points={stat.points} />
    </>
  );
}

function SeriesLegend({ series }: { series: TrendStat['series'] }) {
  return (
    <ul className="mb-[var(--space-2xs)] flex gap-[var(--space-sm)] text-xs text-muted-foreground" aria-hidden="true">
      {series.map(({ key, label, isPrimary }) => (
        <li key={key} className="flex items-center gap-1.5">
          <span
            className={
              isPrimary
                ? 'h-0.5 w-3 rounded-full bg-[var(--color-accent)]'
                : 'h-0.5 w-3 rounded-full bg-[var(--color-text-muted)]'
            }
          />
          {label}
        </li>
      ))}
    </ul>
  );
}

function ShareBody({ stat }: { stat: ShareStat }) {
  const [top] = stat.items;

  return (
    <>
      {top && (
        <Headline value={formatPercent(top.share)}>
          <span>
            {stat.period}년 가장 큰 사유는 {top.label}
          </span>
        </Headline>
      )}
      <ShareBars items={stat.items} />
    </>
  );
}
