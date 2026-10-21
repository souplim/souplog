import { describe, expect, it } from 'vitest';
import type { PostListRow } from '~/lib/supabase/types';
import { toPostSummary } from './post-summary';

const COVER_PATH = '0a1b2c3d-4e5f-6071-8293-a4b5c6d7e8f9.webp';

const ROW: PostListRow = {
  id: 'post-1',
  title: '제목',
  slug: 'title',
  excerpt: '',
  is_public: true,
  menu_id: null,
  created_at: '2026-10-21T00:00:00Z',
  updated_at: '2026-10-21T00:00:00Z',
  content_preview: '# 본문 **시작**',
  image_count: 3,
  attachment_count: 2,
  cover_image: { path: COVER_PATH, width: 1200, height: 800 },
};

describe('toPostSummary', () => {
  it('uses the author excerpt as the preview when one is written', () => {
    expect(toPostSummary({ ...ROW, excerpt: '직접 쓴 요약' }).preview).toBe('직접 쓴 요약');
  });

  it('falls back to the body as plain text when the excerpt is empty', () => {
    expect(toPostSummary(ROW).preview).toBe('본문 시작');
  });

  it('falls back to the body when the excerpt is only whitespace', () => {
    expect(toPostSummary({ ...ROW, excerpt: '   ' }).preview).toBe('본문 시작');
  });

  it('passes the counts through', () => {
    const summary = toPostSummary(ROW);
    expect(summary.image_count).toBe(3);
    expect(summary.attachment_count).toBe(2);
  });

  it('validates the cover image', () => {
    expect(toPostSummary(ROW).coverImage).toEqual({ path: COVER_PATH, width: 1200, height: 800 });
  });

  it('has no cover image when the post has no photos or the entry is malformed', () => {
    expect(toPostSummary({ ...ROW, cover_image: null }).coverImage).toBeNull();
    expect(toPostSummary({ ...ROW, cover_image: { path: '../secret.png' } }).coverImage).toBeNull();
  });

  it('does not carry the raw markdown or raw cover column along', () => {
    const summary = toPostSummary(ROW);
    expect(summary).not.toHaveProperty('content_preview');
    expect(summary).not.toHaveProperty('cover_image');
  });
});
