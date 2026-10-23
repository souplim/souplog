/**
 * `next.config.ts` raises the Server Action body limit to 20MB so the post
 * form can carry photos and attachments — but that limit is app-wide, so a
 * visitor's comment form would accept 20MB too. Only the signed-in owner
 * uploads anything; everyone else is held to this.
 */
export const ANONYMOUS_BODY_LIMIT = 1024 * 1024;

const BODYLESS_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * The status to refuse `request` with, or `null` to let it through. Checked
 * from the declared length before any of the body is read; a visitor request
 * that doesn't declare one (chunked) is refused rather than trusted.
 *
 * Every method with a body counts, not just requests with the `next-action`
 * header — a form submitted without JavaScript posts its action without it.
 */
export function rejectOversizedBody(request: Request, isSignedIn: boolean): 411 | 413 | null {
  if (isSignedIn || BODYLESS_METHODS.has(request.method)) return null;

  const declared = request.headers.get('content-length');
  const length = declared === null ? Number.NaN : Number(declared);
  if (!Number.isSafeInteger(length) || length < 0) return 411;
  return length > ANONYMOUS_BODY_LIMIT ? 413 : null;
}
