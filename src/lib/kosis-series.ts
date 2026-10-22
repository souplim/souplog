import { z } from 'zod';

/**
 * One cell of a KOSIS table: a period, an item, up to three classification
 * codes, and the value as text. Only the fields the dashboard reads are kept.
 */
const kosisRowSchema = z.object({
  PRD_DE: z.string(),
  DT: z.string(),
  ITM_ID: z.string(),
  C1: z.string().optional(),
  C2: z.string().optional(),
  C3: z.string().optional(),
  LST_CHN_DE: z.string().optional(),
});

/** KOSIS answers errors with HTTP 200 and this body, so status alone can't tell. */
const kosisErrorSchema = z.object({
  err: z.string(),
  errMsg: z.string().optional(),
});

export type KosisRow = z.infer<typeof kosisRowSchema>;

export type RowMatcher = (row: KosisRow) => boolean;

export interface TrendPoint {
  period: string;
  values: Record<string, number | null>;
}

export interface SeriesDefinition {
  key: string;
  match: RowMatcher;
}

export interface LatestChange {
  period: string;
  value: number;
  previousPeriod: string | null;
  /** Latest minus previous, in the series' own unit. */
  change: number | null;
}

/**
 * Throws on anything but a non-empty row list. The caller caches whatever this
 * returns for a day, so an error body or an empty answer must never get through.
 */
export function parseKosisResponse(body: unknown): KosisRow[] {
  const error = kosisErrorSchema.safeParse(body);
  if (error.success) {
    throw new Error(`통계를 불러오지 못했습니다: ${error.data.errMsg ?? `오류 코드 ${error.data.err}`}`);
  }

  const rows = z.array(kosisRowSchema).safeParse(body);
  if (!rows.success) throw new Error('통계 응답 형식을 읽지 못했습니다.');
  if (rows.data.length === 0) throw new Error('통계 데이터가 비어 있습니다.');
  return rows.data;
}

/** KOSIS marks suppressed or missing cells with `-`, `x`, or an empty string. */
export function parseKosisNumber(value: string): number | null {
  if (value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10;
}

function valuesByPeriod(rows: KosisRow[], match: RowMatcher): Map<string, number | null> {
  return new Map(rows.filter(match).map((row) => [row.PRD_DE, parseKosisNumber(row.DT)]));
}

function sortedPeriods(maps: Map<string, number | null>[]): string[] {
  const periods = new Set(maps.flatMap((map) => [...map.keys()]));
  return [...periods].sort();
}

/** One point per period, each series filled in where the table has a value. */
export function buildTrend(rows: KosisRow[], series: SeriesDefinition[]): TrendPoint[] {
  const maps = series.map(({ key, match }) => ({ key, values: valuesByPeriod(rows, match) }));
  const periods = sortedPeriods(maps.map(({ values }) => values));

  return periods.map((period) => ({
    period,
    values: Object.fromEntries(maps.map(({ key, values }) => [key, values.get(period) ?? null])),
  }));
}

interface RatioDefinition {
  numerator: RowMatcher;
  denominator: RowMatcher;
}

/** `numerator / denominator` as a percentage, for ratios KOSIS doesn't publish itself. */
export function buildRatioTrend(
  rows: KosisRow[],
  key: string,
  { numerator, denominator }: RatioDefinition,
): TrendPoint[] {
  const top = valuesByPeriod(rows, numerator);
  const bottom = valuesByPeriod(rows, denominator);

  return sortedPeriods([top, bottom]).map((period) => {
    const a = top.get(period) ?? null;
    const b = bottom.get(period) ?? null;
    const ratio = a === null || b === null || b === 0 ? null : roundToTenth((a / b) * 100);
    return { period, values: { [key]: ratio } };
  });
}

export interface ShareCategory {
  label: string;
  match: RowMatcher;
}

export interface ShareItem {
  label: string;
  value: number;
  /** Percent of the categories' total, one decimal. */
  share: number;
}

export interface LatestShares {
  period: string;
  items: ShareItem[];
}

/** How the most recent period splits across categories, largest first. */
export function buildLatestShares(rows: KosisRow[], categories: ShareCategory[]): LatestShares {
  const period =
    rows
      .map((row) => row.PRD_DE)
      .sort()
      .at(-1) ?? '';
  const latest = rows.filter((row) => row.PRD_DE === period);
  const counted = categories.map(({ label, match }) => ({
    label,
    value: parseKosisNumber(latest.find(match)?.DT ?? '') ?? 0,
  }));
  const total = counted.reduce((sum, item) => sum + item.value, 0);

  return {
    period,
    items: counted
      .map((item) => ({ ...item, share: total === 0 ? 0 : roundToTenth((item.value / total) * 100) }))
      .sort((a, b) => b.value - a.value),
  };
}

export function latestChange(points: TrendPoint[], key: string): LatestChange | null {
  const present = points.flatMap(({ period, values }) => {
    const value = values[key];
    return value === null || value === undefined ? [] : [{ period, value }];
  });

  const latest = present.at(-1);
  if (!latest) return null;

  const previous = present.at(-2);
  return {
    period: latest.period,
    value: latest.value,
    previousPeriod: previous?.period ?? null,
    change: previous ? roundToTenth(latest.value - previous.value) : null,
  };
}

/** The table's last revision date (`YYYY-MM-DD`), which says how fresh the numbers are. */
export function latestUpdate(rows: KosisRow[]): string | null {
  const dates = rows.flatMap((row) => (row.LST_CHN_DE ? [row.LST_CHN_DE] : []));
  return dates.sort().at(-1) ?? null;
}
