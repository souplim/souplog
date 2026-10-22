import { describe, expect, it } from 'vitest';
import { collectPairs, copyTextOf, parseProfileFacts, parseProfileLinks, profileLinkSchema } from './profile-fields';

describe('collectPairs', () => {
  it('pairs labels with values in order and trims both', () => {
    expect(collectPairs([' 하는 일 ', '사는 곳'], ['기획자', ' 서울 '])).toEqual([
      ['하는 일', '기획자'],
      ['사는 곳', '서울'],
    ]);
  });

  it('drops rows the owner left completely empty', () => {
    expect(collectPairs(['하는 일', '  ', ''], ['기획자', '', '  '])).toEqual([['하는 일', '기획자']]);
  });

  it('keeps a half-filled row so validation can name what is missing', () => {
    expect(collectPairs(['하는 일'], [''])).toEqual([['하는 일', '']]);
  });

  it('ignores non-string form entries', () => {
    expect(collectPairs([new File([], 'x'), '사는 곳'], ['기획자', '서울'])).toEqual([['사는 곳', '서울']]);
  });
});

describe('parseProfileFacts', () => {
  it('keeps well-formed entries', () => {
    expect(parseProfileFacts([{ label: '하는 일', value: '기획자' }])).toEqual([{ label: '하는 일', value: '기획자' }]);
  });

  it('skips malformed entries instead of failing the page', () => {
    expect(parseProfileFacts([{ label: '하는 일' }, 3, { label: '사는 곳', value: '서울' }])).toEqual([
      { label: '사는 곳', value: '서울' },
    ]);
  });

  it('returns an empty list for anything that is not an array', () => {
    expect(parseProfileFacts(null)).toEqual([]);
    expect(parseProfileFacts({ label: 'a', value: 'b' })).toEqual([]);
  });
});

describe('parseProfileLinks', () => {
  it('keeps http(s) and mailto links', () => {
    const links = [
      { label: '블로그', url: 'https://example.com' },
      { label: '이메일', url: 'mailto:me@example.com' },
    ];
    expect(parseProfileLinks(links)).toEqual(links);
  });

  it('drops links that would run script or are not URLs at all', () => {
    expect(
      parseProfileLinks([
        { label: '나쁜 링크', url: 'javascript:alert(1)' },
        { label: '데이터', url: 'data:text/html,hi' },
        { label: '깨진 주소', url: 'https://' },
      ]),
    ).toEqual([]);
  });
});

describe('copyTextOf', () => {
  it('copies just the address of a mailto link', () => {
    expect(copyTextOf('mailto:me@example.com')).toBe('me@example.com');
  });

  it('drops the subject line and decodes the address', () => {
    expect(copyTextOf('mailto:%EB%82%98@example.com?subject=hi')).toBe('나@example.com');
  });

  it('copies a web address as-is', () => {
    expect(copyTextOf('https://example.com/me')).toBe('https://example.com/me');
  });
});

describe('profileLinkSchema', () => {
  it('turns a bare email address into a mailto link', () => {
    expect(profileLinkSchema.parse({ label: '이메일', url: ' me@example.com ' }).url).toBe('mailto:me@example.com');
  });

  it('keeps web and mailto addresses as written', () => {
    expect(profileLinkSchema.parse({ label: '블로그', url: 'https://example.com' }).url).toBe('https://example.com');
    expect(profileLinkSchema.parse({ label: '이메일', url: 'mailto:me@example.com' }).url).toBe(
      'mailto:me@example.com',
    );
  });

  it('rejects text that is neither an address nor an email', () => {
    expect(profileLinkSchema.safeParse({ label: '이메일', url: 'me at example' }).success).toBe(false);
    expect(profileLinkSchema.safeParse({ label: '나쁜 링크', url: 'javascript:alert(1)' }).success).toBe(false);
  });
});
