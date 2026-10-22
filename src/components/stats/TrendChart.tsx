'use client';

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '~/components/ui/chart';
import type { TrendPoint } from '~/lib/kosis-series';
import { formatPercent } from '~/lib/stat-format';
import type { TrendSeries } from '~/lib/women-stats';

interface TrendChartProps {
  title: string;
  series: TrendSeries[];
  points: TrendPoint[];
}

const Y_AXIS_WIDTH = 36;

/**
 * Yearly lines. The headline series takes the accent; the comparison series
 * stays muted so the eye lands on the one the card is about.
 */
export function TrendChart({ title, series, points }: TrendChartProps) {
  const config = Object.fromEntries(
    series.map(({ key, label, isPrimary }) => [
      key,
      { label, color: isPrimary ? 'var(--color-accent)' : 'var(--color-text-muted)' },
    ]),
  ) satisfies ChartConfig;
  const data = points.map(({ period, values }) => ({ period, ...values }));

  return (
    <figure className="min-w-0">
      <ChartContainer config={config} className="aspect-auto h-44 w-full" aria-hidden="true">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="period"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={24}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={Y_AXIS_WIDTH}
            domain={['auto', 'auto']}
            tick={{ fontSize: 11 }}
          />
          <ChartTooltip
            content={<ChartTooltipContent indicator="line" labelFormatter={(label) => `${String(label)}년`} />}
          />
          {series.map(({ key, isPrimary }) => (
            <Line
              key={key}
              dataKey={key}
              type="monotone"
              stroke={`var(--color-${key})`}
              strokeWidth={isPrimary ? 2 : 1.5}
              dot={false}
              connectNulls
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ChartContainer>
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
