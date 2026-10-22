import { z } from 'zod';

/** One row of the About page's "이런 사람입니다" list. */
export interface ProfileFact {
  label: string;
  value: string;
}

/** One contact link at the bottom of the About page. */
export interface ProfileLink {
  label: string;
  url: string;
}

export const MAX_PROFILE_FACTS = 8;
export const MAX_PROFILE_LINKS = 6;
export const MAX_PAIR_LABEL_LENGTH = 20;
export const MAX_FACT_VALUE_LENGTH = 80;
export const MAX_LINK_URL_LENGTH = 300;

/**
 * Only addresses a visitor can safely open. Anything else — `javascript:`,
 * `data:` — would run in the page's origin when clicked, so it is rejected
 * on save and dropped again on read.
 */
const SAFE_LINK_PROTOCOLS = new Set(['https:', 'http:', 'mailto:']);

export function isSafeLinkUrl(value: string): boolean {
  if (!URL.canParse(value)) return false;
  const url = new URL(value);
  if (!SAFE_LINK_PROTOCOLS.has(url.protocol)) return false;
  return url.protocol === 'mailto:' ? url.pathname.length > 0 : url.hostname.length > 0;
}

/** A plain `name@domain.tld` — no scheme, no spaces, nothing that could make it a URL of another kind. */
const BARE_EMAIL_PATTERN = /^[^\s@:/?#]+@[^\s@:/?#]+\.[^\s@:/?#]+$/;

/**
 * Lets the owner type just an email address: it's stored as a `mailto:` link,
 * so every stored link has a scheme the safety check can look at.
 */
export function normalizeLinkUrl(value: string): string {
  return BARE_EMAIL_PATTERN.test(value) ? `mailto:${value}` : value;
}

/**
 * What a contact link's copy button puts on the clipboard: the bare address
 * for `mailto:` (no scheme, no `?subject=`), the URL itself otherwise.
 */
export function copyTextOf(url: string): string {
  if (!url.startsWith('mailto:')) return url;
  const address = url.slice('mailto:'.length).split('?')[0] ?? '';
  try {
    return decodeURIComponent(address);
  } catch {
    return address;
  }
}

export const profileFactSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, '항목 이름을 입력하세요.')
    .max(MAX_PAIR_LABEL_LENGTH, `항목 이름은 ${MAX_PAIR_LABEL_LENGTH}자까지 쓸 수 있어요.`),
  value: z
    .string()
    .trim()
    .min(1, '항목 내용을 입력하세요.')
    .max(MAX_FACT_VALUE_LENGTH, `항목 내용은 ${MAX_FACT_VALUE_LENGTH}자까지 쓸 수 있어요.`),
});

export const profileLinkSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, '링크 이름을 입력하세요.')
    .max(MAX_PAIR_LABEL_LENGTH, `링크 이름은 ${MAX_PAIR_LABEL_LENGTH}자까지 쓸 수 있어요.`),
  url: z
    .string()
    .trim()
    .min(1, '링크 주소를 입력하세요.')
    .max(MAX_LINK_URL_LENGTH)
    .transform(normalizeLinkUrl)
    .pipe(z.string().refine(isSafeLinkUrl, '이메일 주소나 https:// 로 시작하는 주소를 입력하세요.')),
});

/**
 * Zips the repeated label/value inputs of a pair list into rows. Rows left
 * entirely blank are the editor's spare rows and drop out; a half-filled row
 * stays so validation can say which half is missing.
 */
export function collectPairs(
  labels: readonly FormDataEntryValue[],
  values: readonly FormDataEntryValue[],
): [string, string][] {
  return labels.flatMap((label, index): [string, string][] => {
    const value = values[index];
    if (typeof label !== 'string' || typeof value !== 'string') return [];
    const pair: [string, string] = [label.trim(), value.trim()];
    return pair[0] || pair[1] ? [pair] : [];
  });
}

function parseList<T>(value: unknown, schema: z.ZodType<T>, max: number): T[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => schema.safeParse(entry))
    .flatMap((result) => (result.success ? [result.data] : []))
    .slice(0, max);
}

/** The stored `facts` jsonb as a list; malformed entries are skipped rather than failing the page. */
export function parseProfileFacts(value: unknown): ProfileFact[] {
  return parseList(value, profileFactSchema, MAX_PROFILE_FACTS);
}

/** The stored `links` jsonb as a list — unsafe addresses never reach an `href`. */
export function parseProfileLinks(value: unknown): ProfileLink[] {
  return parseList(value, profileLinkSchema, MAX_PROFILE_LINKS);
}
