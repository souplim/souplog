'use client';

import dynamic from 'next/dynamic';

import { Skeleton } from '~/components/ui/skeleton';

interface MonthlyFinishedChartProps {
  /** Finished-book counts, January first. */
  months: number[];
  year: number;
}

/**
 * recharts (~100KB gzipped) loads after the page, client-only — the plot is
 * aria-hidden and the figcaption already lists every month, so nothing is lost
 * by not server-rendering it. The skeleton holds the plot's exact height so
 * nothing shifts when it arrives.
 */
const MonthlyFinishedPlot = dynamic(() => import('./MonthlyFinishedPlot'), {
  ssr: false,
  loading: () => <Skeleton className="h-20 w-full" aria-hidden="true" />,
});

/** How the year's reading spread over its months. */
export function MonthlyFinishedChart({ months, year }: MonthlyFinishedChartProps) {
  return (
    <figure className="min-w-0">
      <MonthlyFinishedPlot months={months} />
      <figcaption className="sr-only">
        {year}년 월별로 다 읽은 책: {months.map((count, index) => `${index + 1}월 ${count}권`).join(', ')}
      </figcaption>
    </figure>
  );
}
