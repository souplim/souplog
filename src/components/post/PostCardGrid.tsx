import type { ReactNode } from 'react';

/** Shared by the real list and its skeleton, so the swap never reflows. */
export const POST_CARD_GRID_CLASS = 'grid gap-5 sm:grid-cols-2';

/** Cards in the first row get eager, high-priority covers. */
export const PRIORITY_CARD_COUNT = 2;

export function PostCardGrid({ children }: { children: ReactNode }) {
  return <ul className={POST_CARD_GRID_CLASS}>{children}</ul>;
}
