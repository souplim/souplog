/** One decimal at most, grouped the Korean way (`1,105.2`). */
function formatNumber(value: number): string {
  return value.toLocaleString('ko-KR', { maximumFractionDigits: 1 });
}

/** Exactly one decimal, so a card's `72.0%` sits evenly beside its `+1.1%p`. */
function formatTenths(value: number): string {
  return value.toLocaleString('ko-KR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function formatPercent(value: number): string {
  return `${formatTenths(value)}%`;
}

/** A change between two percentages, in percentage points (`+0.6%p`). */
export function formatPointChange(change: number): string {
  if (change === 0) return '변화 없음';
  // U+2212 minus: the hyphen reads as a dash beside tabular figures.
  const sign = change > 0 ? '+' : '−';
  return `${sign}${formatTenths(Math.abs(change))}%p`;
}

const THOUSANDS_PER_MAN = 10;

/** KOSIS counts people in thousands; Korean reads large counts in 만. */
export function formatThousandPersons(thousands: number): string {
  return thousands >= THOUSANDS_PER_MAN
    ? `${formatNumber(thousands / THOUSANDS_PER_MAN)}만 명`
    : `${formatNumber(thousands)}천 명`;
}
