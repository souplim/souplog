import { describe, expect, it } from 'vitest';
import { isAllowedCoverUrl, pickIsbn13, resolveCoverSourceUrl, toBookSearchResult } from './book-search';

const THUMBNAIL =
  'https://search1.kakaocdn.net/thumb/R120x174.q85/?fname=http%3A%2F%2Ft1.daumcdn.net%2Flbook%2Fimage%2F1467038%3Ftimestamp%3D20240101';

const DOCUMENT = {
  title: '데미안',
  authors: ['헤르만 헤세'],
  translators: ['전영애'],
  publisher: '민음사',
  isbn: '8937460440 9788937460449',
  datetime: '2000-12-20T00:00:00.000+09:00',
  thumbnail: THUMBNAIL,
};

describe('pickIsbn13', () => {
  it('prefers the 13-digit ISBN when both are given', () => {
    expect(pickIsbn13('8937460440 9788937460449')).toBe('9788937460449');
  });

  it('falls back to the 10-digit ISBN when that is all there is', () => {
    expect(pickIsbn13('8937460440 ')).toBe('8937460440');
  });

  it('is null when the book has no ISBN', () => {
    expect(pickIsbn13(' ')).toBeNull();
  });
});

describe('resolveCoverSourceUrl', () => {
  it('reaches past the small thumbnail to the full-size original', () => {
    expect(resolveCoverSourceUrl(THUMBNAIL)).toBe('https://t1.daumcdn.net/lbook/image/1467038?timestamp=20240101');
  });

  it('keeps the thumbnail when it does not wrap an original', () => {
    const plain = 'https://search1.kakaocdn.net/thumb/R120x174.q85/cover.jpg';
    expect(resolveCoverSourceUrl(plain)).toBe(plain);
  });

  it('is null for a book without a cover', () => {
    expect(resolveCoverSourceUrl('')).toBeNull();
  });

  it('drops an original hosted somewhere it does not trust', () => {
    const wrapped = 'https://search1.kakaocdn.net/thumb/R120x174/?fname=http%3A%2F%2F169.254.169.254%2Flatest';
    expect(resolveCoverSourceUrl(wrapped)).toBe(wrapped);
  });
});

describe('isAllowedCoverUrl', () => {
  it('accepts the two Kakao image hosts over https', () => {
    expect(isAllowedCoverUrl('https://t1.daumcdn.net/lbook/image/1')).toBe(true);
    expect(isAllowedCoverUrl(THUMBNAIL)).toBe(true);
  });

  it('rejects any other host, so the server never fetches an address the browser chose', () => {
    expect(isAllowedCoverUrl('https://169.254.169.254/latest/meta-data')).toBe(false);
    expect(isAllowedCoverUrl('https://t1.daumcdn.net.evil.example/x')).toBe(false);
  });

  it('rejects plain http and garbage', () => {
    expect(isAllowedCoverUrl('http://t1.daumcdn.net/lbook/image/1')).toBe(false);
    expect(isAllowedCoverUrl('not a url')).toBe(false);
  });
});

describe('toBookSearchResult', () => {
  it('flattens a search document into what the form fills in', () => {
    expect(toBookSearchResult(DOCUMENT)).toEqual({
      title: '데미안',
      author: '헤르만 헤세',
      publisher: '민음사',
      isbn: '9788937460449',
      year: '2000',
      thumbnailUrl: THUMBNAIL,
      coverUrl: 'https://t1.daumcdn.net/lbook/image/1467038?timestamp=20240101',
    });
  });

  it('joins several authors', () => {
    expect(toBookSearchResult({ ...DOCUMENT, authors: ['A', 'B'] }).author).toBe('A, B');
  });

  it('leaves out the year and covers it was not given', () => {
    const result = toBookSearchResult({ ...DOCUMENT, datetime: '', thumbnail: '' });
    expect(result).toMatchObject({ year: null, thumbnailUrl: null, coverUrl: null });
  });
});
