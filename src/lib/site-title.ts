/** The blog's name before the owner renames it — also the fallback when the setting can't be read. */
export const DEFAULT_SITE_TITLE = 'souplog';

export const MAX_SITE_TITLE_LENGTH = 30;

/** A blank stored title means "not set", so the default stands in. */
export function resolveSiteTitle(stored: string | null | undefined): string {
  return stored?.trim() || DEFAULT_SITE_TITLE;
}
