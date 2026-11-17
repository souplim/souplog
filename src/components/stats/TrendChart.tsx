'use client';

import dynamic from 'next/dynamic';

import { Skeleton } from '~/components/ui/skeleton';
import type { TrendPoint } from '~/lib/kosis-series';
import { formatPercent } from '~/lib/stat-format';
import type { TrendSeries } from '~/lib/women-stats';

interface TrendChartProps {
  title: string;
  series: TrendSeries[];
  points: TrendPoint[];
}

/**
 * recharts (~100KB gzipped) loads after the page, client-only — the plot is
 * aria-hidden and the figcaption below already carries every number, so
 * nothing is lost by not server-rendering it. The skeleton holds the plot's
 * exact height so nothing shifts when it arrives.
 */
const TrendPlot = dynamic(() => import('./TrendPlot'), {
  ssr: false,
  loading: () => <Skeleton className="h-44 w-full" aria-hidden="true" />,
});

/** Yearly lines for one indicator, with a screen-reader caption listing every value. */
export function TrendChart({ title, series, points }: TrendChartProps) {
  return (
    <figure className="min-w-0">
      <TrendPlot series={series} points={points} />
      <figcaption className="sr-only">
        {title}:{' '}
        {points
          .map(({ period, values }) => {
            const parts = series.flatMap(({ key, label }) => {
              const value = values[key];
              return value === null || value === undefined ? [] : [`${label} ${formatPercent(value)}`];
            });
            return `${period}년 ${parts.join(', ')}`;
          })
          .join('; ')}
      </figcaption>
    </figure>
  );
}
