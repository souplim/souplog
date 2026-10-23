import { describe, expect, it } from 'vitest';
import { checkCronRequest } from './cron-auth';

describe('checkCronRequest', () => {
  it('accepts the bearer token Vercel Cron sends', () => {
    expect(checkCronRequest('s3cret', 'Bearer s3cret', true)).toBe('ok');
  });

  it('refuses a missing or wrong token', () => {
    expect(checkCronRequest('s3cret', null, true)).toBe('unauthorized');
    expect(checkCronRequest('s3cret', 'Bearer nope', true)).toBe('unauthorized');
    expect(checkCronRequest('s3cret', 's3cret', true)).toBe('unauthorized');
  });

  it('fails closed in production when no secret is configured', () => {
    expect(checkCronRequest(undefined, null, true)).toBe('misconfigured');
    expect(checkCronRequest('', 'Bearer ', true)).toBe('misconfigured');
  });

  it('stays open in development so the route can be tried locally', () => {
    expect(checkCronRequest(undefined, null, false)).toBe('ok');
  });
});
