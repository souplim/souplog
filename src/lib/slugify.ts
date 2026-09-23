const HANGUL_OR_ALPHANUMERIC = /[^a-z0-9가-힣-]+/g;
const MULTIPLE_HYPHENS = /-+/g;
const EDGE_HYPHENS = /^-+|-+$/g;

/**
 * Converts a post title into a URL-safe slug, keeping Hangul syllables as-is
 * (Korean titles don't romanize meaningfully) and stripping everything else
 * that isn't alphanumeric or a hyphen.
 */
export function slugify(title: string): string {
  const normalized = title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(HANGUL_OR_ALPHANUMERIC, '')
    .replace(MULTIPLE_HYPHENS, '-')
    .replace(EDGE_HYPHENS, '');

  return normalized.length > 0 ? normalized : fallbackSlug();
}

function fallbackSlug(): string {
  return `post-${Date.now().toString(36)}`;
}

/**
 * Appends a numeric suffix until the slug no longer collides, given a
 * predicate that checks existing slugs (e.g. a DB lookup).
 */
export async function ensureUniqueSlug(
  baseSlug: string,
  exists: (candidate: string) => Promise<boolean>,
): Promise<string> {
  let candidate = baseSlug;
  let suffix = 2;

  while (await exists(candidate)) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}
