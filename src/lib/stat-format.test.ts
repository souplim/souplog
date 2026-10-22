import { describe, expect, it } from 'vitest';
import { formatPercent, formatPointChange, formatThousandPersons } from './stat-format';

describe('formatPercent', () => {
  it('always shows one decimal so neighbouring figures line up', () => {
    expect(formatPercent(55.3)).toBe('55.3%');
    expect(formatPercent(60)).toBe('60.0%');
  });
});

describe('formatPointChange', () => {
  it('signs the change in percentage points', () => {
    expect(formatPointChange(0.6)).toBe('+0.6%p');
    expect(formatPointChange(-1.25)).toBe('−1.3%p');
    expect(formatPointChange(-1)).toBe('−1.0%p');
  });

  it('says so when nothing moved', () => {
    expect(formatPointChange(0)).toBe('변화 없음');
  });
});

describe('formatThousandPersons', () => {
  it('reads thousand-person counts as 만 명 above ten thousand', () => {
    expect(formatThousandPersons(1105.2)).toBe('110.5만 명');
  });

  it('keeps 천 명 below ten thousand', () => {
    expect(formatThousandPersons(52.4)).toBe('5.2만 명');
    expect(formatThousandPersons(8)).toBe('8천 명');
  });
});
