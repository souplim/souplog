'use client';

import { Bar, BarChart, Cell, XAxis } from 'recharts';

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '~/components/ui/chart';

interface MonthlyFinishedChartProps {
  /** Finished-book counts, January first. */
  months: number[];
  year: number;
}

const chartConfig = {
  count: { label: '다 읽은 책', color: 'var(--color-accent)' },
} satisfies ChartConfig;

/** Rounded data-end on top, flat at the baseline. */
const BAR_RADIUS: [number, number, number, number] = [4, 4, 0, 0];
/** Keeps a wide row from turning twelve months into twelve slabs. */
const MAX_BAR_WIDTH = 28;
/** An empty month still gets a stub, so it reads as a month rather than a hole. */
const EMPTY_BAR_HEIGHT = 3;

/**
 * How the year's reading spread over its months. Empty months keep a faint
 * stub; hovering a month names its count.
 */
export function MonthlyFinishedChart({ months, year }: MonthlyFinishedChartProps) {
  const data = months.map((count, index) => ({ month: index + 1, count }));

  return (
    <figure className="min-w-0">
      <ChartContainer config={chartConfig} className="aspect-auto h-20 w-full" aria-hidden="true">
        <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }} barCategoryGap="18%">
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={4}
            height={20}
            interval={0}
            tick={{ fontSize: 11 }}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                hideLabel
                hideIndicator
                className="min-w-0"
                formatter={(value, _, item) => (
                  <span className="tabular-nums">
                    <span className="text-muted-foreground">{item.payload.month}월</span>{' '}
                    <span className="font-medium">{value}권</span>
                  </span>
                )}
              />
            }
          />
          <Bar
            dataKey="count"
            radius={BAR_RADIUS}
            maxBarSize={MAX_BAR_WIDTH}
            minPointSize={EMPTY_BAR_HEIGHT}
            isAnimationActive={false}
          >
            {data.map(({ month, count }) => (
              <Cell key={month} fill={count > 0 ? 'var(--color-count)' : 'var(--color-border-strong)'} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
      <figcaption className="sr-only">
        {year}년 월별로 다 읽은 책: {months.map((count, index) => `${index + 1}월 ${count}권`).join(', ')}
      </figcaption>
    </figure>
  );
}
