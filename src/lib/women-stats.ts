import 'server-only';
import { getKosisRows, type KosisQuery } from '~/lib/external/kosis';
import {
  buildLatestShares,
  buildRatioTrend,
  buildTrend,
  latestUpdate,
  type KosisRow,
  type LatestShares,
  type TrendPoint,
} from '~/lib/kosis-series';

export interface TrendSeries {
  key: string;
  label: string;
  /** The series the card's headline number reports; drawn in the accent color. */
  isPrimary: boolean;
}

export interface TrendStat {
  kind: 'trend';
  series: TrendSeries[];
  points: TrendPoint[];
}

/** Item values are thousand persons. */
export interface ShareStat extends LatestShares {
  kind: 'share';
}

export type StatData = TrendStat | ShareStat;

export type StatResult =
  { status: 'ok'; data: StatData; updatedAt: string | null } | { status: 'error'; message: string };

export interface StatCard {
  id: string;
  title: string;
  description: string;
  /** The survey's name, as KOSIS lists it. */
  survey: string;
  /** Link to the table on KOSIS. */
  sourceUrl: string;
  result: StatResult;
}

interface StatDefinition {
  id: string;
  title: string;
  description: string;
  survey: string;
  query: KosisQuery;
  build: (rows: KosisRow[]) => StatData;
}

const CAREER_BREAK_REASONS: Record<string, string> = {
  '10': '결혼',
  '20': '임신·출산',
  '30': '육아',
  '40': '자녀교육',
  '50': '가족돌봄',
};

function trend(series: TrendSeries[], points: TrendPoint[]): TrendStat {
  return { kind: 'trend', series, points };
}

function buildReasonShares(rows: KosisRow[]): ShareStat {
  const categories = Object.entries(CAREER_BREAK_REASONS).map(([code, label]) => ({
    label,
    match: (row: KosisRow) => row.C2 === code,
  }));
  return { kind: 'share', ...buildLatestShares(rows, categories) };
}

const WOMEN_AND_MEN: TrendSeries[] = [
  { key: 'women', label: '여성', isPrimary: true },
  { key: 'men', label: '남성', isPrimary: false },
];

// Codes come from each table's item metadata (statisticsData.do?type=ITM).
const STAT_DEFINITIONS: StatDefinition[] = [
  {
    id: 'career-break-rate',
    title: '경력단절 비율',
    description: '15–54세 기혼여성 가운데 결혼·임신·출산·육아 등으로 일을 그만둔 여성의 비율',
    survey: '지역별고용조사',
    query: { orgId: '101', tblId: 'DT_1ES4H06J', itmIds: ['T00', 'T21'], classes: [['00']], recentPeriods: 20 },
    // Measured against married women, not as a head count, so a shrinking
    // cohort doesn't read as progress.
    build: (rows) =>
      trend(
        [{ key: 'rate', label: '경력단절 비율', isPrimary: true }],
        buildRatioTrend(rows, 'rate', {
          numerator: (row) => row.ITM_ID === 'T21',
          denominator: (row) => row.ITM_ID === 'T00',
        }),
      ),
  },
  {
    id: 'career-break-reasons',
    title: '경력단절 사유',
    description: '경력단절여성이 일을 그만둔 사유의 구성',
    survey: '지역별고용조사',
    query: {
      orgId: '101',
      tblId: 'DT_1ES4H07J',
      itmIds: ['T00'],
      classes: [['00'], Object.keys(CAREER_BREAK_REASONS)],
      recentPeriods: 1,
    },
    build: buildReasonShares,
  },
  {
    id: 'employment-rate',
    title: '성별 고용률',
    description: '15세 이상 인구 가운데 취업자의 비율',
    survey: '경제활동인구조사',
    query: { orgId: '101', tblId: 'DT_1DA7012S', itmIds: ['T90'], classes: [['3', '2'], ['00']], recentPeriods: 16 },
    build: (rows) =>
      trend(
        WOMEN_AND_MEN,
        buildTrend(rows, [
          { key: 'women', match: (row) => row.C1 === '3' },
          { key: 'men', match: (row) => row.C1 === '2' },
        ]),
      ),
  },
  {
    id: 'wage-ratio',
    title: '성별 임금 비율',
    description: '남성의 시간당 임금총액을 100으로 볼 때 여성의 시간당 임금총액 (전체 근로자)',
    survey: '고용형태별노동실태조사',
    query: {
      orgId: '118',
      tblId: 'DT_118N_LCE0002',
      itmIds: ['16118DD_11'],
      classes: [['13102732815TYPES.00'], ['13102732815SEXS.2', '13102732815SEXS.1']],
      recentPeriods: 20,
    },
    build: (rows) =>
      trend(
        [{ key: 'ratio', label: '남성 대비 여성 임금', isPrimary: true }],
        buildRatioTrend(rows, 'ratio', {
          numerator: (row) => row.C2 === '13102732815SEXS.2',
          denominator: (row) => row.C2 === '13102732815SEXS.1',
        }),
      ),
  },
  {
    id: 'elderly-poverty',
    title: '노인 상대적 빈곤율',
    description: '66세 이상 인구 가운데 처분가능소득이 중위소득의 50% 이하인 사람의 비율',
    survey: '가계금융복지조사',
    query: {
      orgId: '101',
      tblId: 'DT_1HDALF07',
      itmIds: ['2'],
      classes: [['2', '1'], ['20'], ['20']],
      recentPeriods: 20,
    },
    build: (rows) =>
      trend(
        WOMEN_AND_MEN,
        buildTrend(rows, [
          { key: 'women', match: (row) => row.C1 === '2' },
          { key: 'men', match: (row) => row.C1 === '1' },
        ]),
      ),
  },
  {
    id: 'parental-leave',
    title: '육아휴직 사용률',
    description: '그해 태어난 아이의 부모 가운데 육아휴직을 쓴 사람의 비율',
    survey: '육아휴직통계',
    query: { orgId: '101', tblId: 'DT_CC2024D001', itmIds: ['H1'], classes: [['G3', 'G2']], recentPeriods: 20 },
    build: (rows) =>
      trend(
        [
          { key: 'mothers', label: '엄마', isPrimary: true },
          { key: 'fathers', label: '아빠', isPrimary: false },
        ],
        buildTrend(rows, [
          { key: 'mothers', match: (row) => row.C1 === 'G3' },
          { key: 'fathers', match: (row) => row.C1 === 'G2' },
        ]),
      ),
  },
];

function kosisTableUrl({ orgId, tblId }: KosisQuery): string {
  return `https://kosis.kr/statHtml/statHtml.do?${new URLSearchParams({ orgId, tblId })}`;
}

async function loadStat(definition: StatDefinition): Promise<StatResult> {
  try {
    const rows = await getKosisRows(definition.query);
    return { status: 'ok', data: definition.build(rows), updatedAt: latestUpdate(rows) };
  } catch (error: unknown) {
    return { status: 'error', message: error instanceof Error ? error.message : '통계를 불러오지 못했습니다.' };
  }
}

/**
 * Every card, fetched in parallel. A failing table becomes that card's error
 * state rather than a thrown page error — one slow KOSIS table shouldn't blank
 * the other five.
 */
export async function getWomenStats(): Promise<StatCard[]> {
  const results = await Promise.all(STAT_DEFINITIONS.map(loadStat));

  return STAT_DEFINITIONS.map((definition, index) => ({
    id: definition.id,
    title: definition.title,
    description: definition.description,
    survey: definition.survey,
    sourceUrl: kosisTableUrl(definition.query),
    result: results[index],
  }));
}
