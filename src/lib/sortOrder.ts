/**
 * Moves an item within a list by index. Out-of-range or no-op moves return a
 * shallow copy of the original order rather than throwing, so callers can
 * always render the result.
 */
export function moveItem<T>(items: readonly T[], fromIndex: number, toIndex: number): T[] {
  const inRange = (index: number) => index >= 0 && index < items.length;

  if (fromIndex === toIndex || !inRange(fromIndex) || !inRange(toIndex)) {
    return [...items];
  }

  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

/**
 * Reindexes a list to 0..n-1 based on its current array position. Menus and
 * rule lists never trust a stored sort_order to already be contiguous —
 * every reorder recomputes it from scratch.
 */
export function assignSortOrder<T extends object>(items: readonly T[]): (T & { sortOrder: number })[] {
  return items.map((item, index) => ({ ...item, sortOrder: index }));
}
