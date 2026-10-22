import { describe, expect, it } from 'vitest';
import {
  buildLatestShares,
  buildRatioTrend,
  buildTrend,
  latestChange,
  latestUpdate,
  parseKosisNumber,
  parseKosisResponse,
  type KosisRow,
} from './kosis-series';

function row(overrides: Partial<KosisRow>): KosisRow {
  return { PRD_DE: '2024', DT: '0', ITM_ID: 'T1', LST_CHN_DE: '2025-11-07', ...overrides };
}

describe('parseKosisResponse', () => {
  it('returns the rows of a successful response', () => {
    const rows = parseKosisResponse([
      { PRD_DE: '2025', DT: '1105.2', ITM_ID: 'T21', C1: '00', LST_CHN_DE: '2025-11-07' },
    ]);

    expect(rows).toEqual([{ PRD_DE: '2025', DT: '1105.2', ITM_ID: 'T21', C1: '00', LST_CHN_DE: '2025-11-07' }]);
  });

  it('throws the KOSIS message when the API answers 200 with an error body', () => {
    expect(() => parseKosisResponse({ err: '30', errMsg: '데이터가 존재하지 않습니다' })).toThrow(
      '데이터가 존재하지 않습니다',
    );
  });

  it('throws when the body is neither rows nor an error', () => {
    expect(() => parseKosisResponse({ unexpected: true })).toThrow('통계 응답 형식을 읽지 못했습니다.');
  });

  it('throws on an empty row list so an empty chart is never cached', () => {
    expect(() => parseKosisResponse([])).toThrow('통계 데이터가 비어 있습니다.');
  });
});

describe('parseKosisNumber', () => {
  it('reads decimal strings', () => {
    expect(parseKosisNumber('54.7')).toBe(54.7);
  });

  it('treats KOSIS placeholders as missing', () => {
    expect(parseKosisNumber('-')).toBeNull();
    expect(parseKosisNumber('')).toBeNull();
    expect(parseKosisNumber('x')).toBeNull();
  });
});

describe('buildTrend', () => {
  it('lines up each series by period, oldest first', () => {
    const rows = [
      row({ PRD_DE: '2025', C1: '3', DT: '55.3' }),
      row({ PRD_DE: '2024', C1: '3', DT: '54.7' }),
      row({ PRD_DE: '2024', C1: '2', DT: '70.1' }),
    ];

    const points = buildTrend(rows, [
      { key: 'women', match: (r) => r.C1 === '3' },
      { key: 'men', match: (r) => r.C1 === '2' },
    ]);

    expect(points).toEqual([
      { period: '2024', values: { women: 54.7, men: 70.1 } },
      { period: '2025', values: { women: 55.3, men: null } },
    ]);
  });
});

describe('buildRatioTrend', () => {
  it('divides numerator by denominator as a percentage rounded to one decimal', () => {
    const rows = [
      row({ PRD_DE: '2025', ITM_ID: 'T21', DT: '1105.2' }),
      row({ PRD_DE: '2025', ITM_ID: 'T00', DT: '7402.8' }),
    ];

    const points = buildRatioTrend(rows, 'rate', {
      numerator: (r) => r.ITM_ID === 'T21',
      denominator: (r) => r.ITM_ID === 'T00',
    });

    expect(points).toEqual([{ period: '2025', values: { rate: 14.9 } }]);
  });

  it('leaves the period empty when either side is missing or the denominator is zero', () => {
    const rows = [
      row({ PRD_DE: '2023', ITM_ID: 'T21', DT: '10' }),
      row({ PRD_DE: '2024', ITM_ID: 'T21', DT: '10' }),
      row({ PRD_DE: '2024', ITM_ID: 'T00', DT: '0' }),
    ];

    const points = buildRatioTrend(rows, 'rate', {
      numerator: (r) => r.ITM_ID === 'T21',
      denominator: (r) => r.ITM_ID === 'T00',
    });

    expect(points).toEqual([
      { period: '2023', values: { rate: null } },
      { period: '2024', values: { rate: null } },
    ]);
  });
});

describe('buildLatestShares', () => {
  const categories = [
    { label: '결혼', match: (r: KosisRow) => r.C2 === '10' },
    { label: '육아', match: (r: KosisRow) => r.C2 === '30' },
    { label: '가족돌봄', match: (r: KosisRow) => r.C2 === '50' },
  ];

  it('splits the latest period into shares, largest first', () => {
    const rows = [
      row({ PRD_DE: '2024', C2: '10', DT: '900' }),
      row({ PRD_DE: '2025', C2: '10', DT: '250' }),
      row({ PRD_DE: '2025', C2: '30', DT: '450' }),
      row({ PRD_DE: '2025', C2: '50', DT: '50' }),
    ];

    expect(buildLatestShares(rows, categories)).toEqual({
      period: '2025',
      items: [
        { label: '육아', value: 450, share: 60 },
        { label: '결혼', value: 250, share: 33.3 },
        { label: '가족돌봄', value: 50, share: 6.7 },
      ],
    });
  });

  it('counts a missing category as zero', () => {
    const rows = [row({ PRD_DE: '2025', C2: '10', DT: '10' })];

    expect(buildLatestShares(rows, categories).items).toEqual([
      { label: '결혼', value: 10, share: 100 },
      { label: '육아', value: 0, share: 0 },
      { label: '가족돌봄', value: 0, share: 0 },
    ]);
  });
});

describe('latestChange', () => {
  it('compares the latest value with the one before it', () => {
    const change = latestChange(
      [
        { period: '2023', values: { women: 54.1 } },
        { period: '2024', values: { women: 54.7 } },
        { period: '2025', values: { women: 55.3 } },
      ],
      'women',
    );

    expect(change).toEqual({ period: '2025', value: 55.3, previousPeriod: '2024', change: 0.6 });
  });

  it('skips trailing gaps and has no change for a single value', () => {
    const change = latestChange(
      [
        { period: '2024', values: { women: 54.7 } },
        { period: '2025', values: { women: null } },
      ],
      'women',
    );

    expect(change).toEqual({ period: '2024', value: 54.7, previousPeriod: null, change: null });
  });

  it('returns null when the series has no values', () => {
    expect(latestChange([{ period: '2025', values: { women: null } }], 'women')).toBeNull();
  });
});

describe('latestUpdate', () => {
  it('returns the most recent revision date across rows', () => {
    const rows = [row({ LST_CHN_DE: '2025-11-07' }), row({ LST_CHN_DE: '2026-04-30' }), row({ LST_CHN_DE: undefined })];

    expect(latestUpdate(rows)).toBe('2026-04-30');
  });

  it('returns null when no row carries a date', () => {
    expect(latestUpdate([row({ LST_CHN_DE: undefined })])).toBeNull();
  });
});
