import { describe, expect, it } from 'vitest';
import { ANONYMOUS_BODY_LIMIT, rejectOversizedBody } from './request-body-limit';

function post(contentLength: string | null, extraHeaders: Record<string, string> = {}): Request {
  const headers = new Headers(extraHeaders);
  if (contentLength !== null) headers.set('content-length', contentLength);
  return new Request('https://example.com/posts/hello', { method: 'POST', headers });
}

describe('rejectOversizedBody', () => {
  it('lets a visitor send a comment-sized Server Action', () => {
    expect(rejectOversizedBody(post('2048', { 'next-action': 'abc123' }), false)).toBeNull();
    expect(rejectOversizedBody(post(String(ANONYMOUS_BODY_LIMIT)), false)).toBeNull();
  });

  it('refuses a visitor body over the limit', () => {
    expect(rejectOversizedBody(post(String(ANONYMOUS_BODY_LIMIT + 1), { 'next-action': 'abc123' }), false)).toBe(413);
  });

  it('applies without the next-action header too — a no-JS form posts an action as a plain form', () => {
    expect(rejectOversizedBody(post(String(ANONYMOUS_BODY_LIMIT + 1)), false)).toBe(413);
  });

  it('refuses a visitor body whose size is not declared up front', () => {
    expect(rejectOversizedBody(post(null), false)).toBe(411);
    expect(rejectOversizedBody(post('abc'), false)).toBe(411);
  });

  it('leaves the signed-in owner to the app-wide limit for uploads', () => {
    expect(rejectOversizedBody(post(String(15 * 1024 * 1024)), true)).toBeNull();
  });

  it('ignores requests without a body', () => {
    expect(rejectOversizedBody(new Request('https://example.com/posts'), false)).toBeNull();
    expect(rejectOversizedBody(new Request('https://example.com/posts', { method: 'HEAD' }), false)).toBeNull();
  });
});
