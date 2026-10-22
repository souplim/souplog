import { describe, expect, it } from 'vitest';
import { summarizeAbout } from './about-summary';

const book = (title: string, status: 'want' | 'reading' | 'done', finished_at: string | null = null) => ({
  title,
  status,
  finished_at,
});

describe('summarizeAbout', () => {
  it('counts posts and finished books', () => {
    const summary = summarizeAbout(
      [{ created_at: '2025-03-01T00:00:00Z' }, { created_at: '2024-05-01T00:00:00Z' }],
      [book('A', 'done', '2025-01-02'), book('B', 'reading'), book('C', 'done', '2024-12-01'), book('D', 'want')],
    );

    expect(summary.postCount).toBe(2);
    expect(summary.finishedBookCount).toBe(2);
  });

  it('dates the blog from its oldest post, in Seoul time', () => {
    // 2023-12-31 15:30 UTC is already New Year's Day in Seoul.
    const summary = summarizeAbout(
      [{ created_at: '2025-03-01T00:00:00Z' }, { created_at: '2023-12-31T15:30:00Z' }],
      [],
    );
    expect(summary.sinceYear).toBe(2024);
  });

  it('has no start year before the first post', () => {
    expect(summarizeAbout([], []).sinceYear).toBeNull();
  });

  it('features the book being read now', () => {
    const summary = summarizeAbout([], [book('A', 'done', '2025-01-02'), book('B', 'reading')]);
    expect(summary.featuredBook).toEqual({ book: book('B', 'reading'), isReading: true });
  });

  it('falls back to the most recently finished book', () => {
    const summary = summarizeAbout(
      [],
      [book('A', 'done', '2024-01-02'), book('C', 'done', '2025-06-01'), book('D', 'want')],
    );
    expect(summary.featuredBook).toEqual({ book: book('C', 'done', '2025-06-01'), isReading: false });
  });

  it('features nothing when only wished-for books are on the shelf', () => {
    expect(summarizeAbout([], [book('D', 'want')]).featuredBook).toBeNull();
  });
});
