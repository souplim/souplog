'use client';

import { usePathname, useRouter } from 'next/navigation';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';

interface SummaryYearSelectProps {
  years: number[];
  year: number;
  currentYear: number;
}

/**
 * Picks which year the shelf summary shows. The choice lives in `?year=` so
 * it survives a reload and can be shared; the current year keeps a clean URL.
 */
export function SummaryYearSelect({ years, year, currentYear }: SummaryYearSelectProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Select
      value={String(year)}
      onValueChange={(value) => {
        const href = Number(value) === currentYear ? pathname : `${pathname}?year=${value}`;
        router.replace(href, { scroll: false });
      }}
    >
      <SelectTrigger size="sm" aria-label="요약 연도" className="tabular-nums">
        <SelectValue />
      </SelectTrigger>
      {/* Drops below and opens leftward, so the list never covers the button beside it. */}
      <SelectContent position="popper" align="end">
        {years.map((option) => (
          <SelectItem key={option} value={String(option)} className="tabular-nums">
            {option}년
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
