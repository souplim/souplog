/**
 * The title field at the top of the editor pane.
 *
 * The `md:` copy of the size is not redundant: the field is an `Input`, whose
 * base styles carry `md:text-sm`. An unprefixed `text-[...]` loses to that at
 * md and up, leaving the title at 14px on desktop.
 */
export const EDITOR_TITLE_CLASS =
  'font-heading text-[clamp(1.75rem,1.35rem+1.6vw,2.5rem)] md:text-[clamp(1.75rem,1.35rem+1.6vw,2.5rem)] font-bold leading-tight tracking-tight';

/**
 * One gutter for the whole editor — the title, the meta row, the body and the
 * action bar all hang off this same edge.
 */
export const EDITOR_GUTTER_CLASS = 'px-6 sm:px-10 lg:px-14';

export const EDITOR_PANE_PADDING = `${EDITOR_GUTTER_CLASS} pt-8 pb-10`;

/** Sentinel for "이 글은 메뉴에 속하지 않음" — a Select item cannot hold an empty value. */
export const NO_MENU_VALUE = 'none';
