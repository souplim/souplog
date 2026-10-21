/**
 * Turns the start of a Markdown body into one line of plain text for a list
 * card. It is a best-effort pass over a snippet that may be cut mid-syntax, not
 * a parser: the goal is that no `#`, `**` or `](https://…)` leaks into the card,
 * not a faithful rendering. Code blocks and images carry nothing readable in a
 * one-line preview, so they are dropped rather than flattened.
 */

const FENCED_CODE = /(```|~~~)[\s\S]*?(\1|$)/g;
const IMAGE = /!\[[^\]]*\]\([^)]*\)/g;
const LINK = /\[([^\]]*)\]\([^)]*\)/g;
const HTML_TAG = /<[^>]+>/g;
const INLINE_CODE = /`([^`]*)`/g;
const STRIKETHROUGH = /~~(.+?)~~/g;
const STRONG = /(\*\*|__)(.+?)\1/g;
// The word-boundary guards keep snake_case and 2*3*4 intact.
const EMPHASIS = /(^|[^\w*])([*_])(?!\s)(.+?)(?<!\s)\2(?!\w)/g;

const HORIZONTAL_RULE = /^\s*([-*_])(\s*\1){2,}\s*$/;
const TABLE_SEPARATOR = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/;
const LINE_PREFIX = /^\s*(#{1,6}\s+|>\s?|[-*+]\s+|\d+[.)]\s+)+/;

function stripLine(line: string): string {
  if (HORIZONTAL_RULE.test(line) || TABLE_SEPARATOR.test(line)) return '';
  return line.replace(LINE_PREFIX, '').replaceAll('|', ' ');
}

export function toPlainPreview(markdown: string): string {
  const withoutBlocks = markdown.replace(FENCED_CODE, '\n').replace(IMAGE, '').replace(HTML_TAG, '');

  return withoutBlocks
    .split('\n')
    .map(stripLine)
    .join(' ')
    .replace(LINK, '$1')
    .replace(INLINE_CODE, '$1')
    .replace(STRIKETHROUGH, '$1')
    .replace(STRONG, '$2')
    .replace(EMPHASIS, '$1$3')
    .replace(/\s+/g, ' ')
    .trim();
}
