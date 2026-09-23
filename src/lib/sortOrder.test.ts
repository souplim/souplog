import { describe, expect, it } from 'vitest';
import { assignSortOrder, moveItem } from './sortOrder';

describe('moveItem', () => {
  it('moves an item forward', () => {
    expect(moveItem(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd']);
  });

  it('moves an item backward', () => {
    expect(moveItem(['a', 'b', 'c', 'd'], 3, 1)).toEqual(['a', 'd', 'b', 'c']);
  });

  it('returns a copy unchanged when indexes are equal', () => {
    const items = ['a', 'b', 'c'];
    const result = moveItem(items, 1, 1);
    expect(result).toEqual(items);
    expect(result).not.toBe(items);
  });

  it('returns a copy unchanged when an index is out of range', () => {
    const items = ['a', 'b', 'c'];
    expect(moveItem(items, -1, 1)).toEqual(items);
    expect(moveItem(items, 0, 5)).toEqual(items);
  });

  it('does not mutate the input array', () => {
    const items = ['a', 'b', 'c'];
    moveItem(items, 0, 2);
    expect(items).toEqual(['a', 'b', 'c']);
  });
});

describe('assignSortOrder', () => {
  it('numbers items 0..n-1 by their current position', () => {
    const result = assignSortOrder([{ name: 'x' }, { name: 'y' }, { name: 'z' }]);
    expect(result.map((item) => item.sortOrder)).toEqual([0, 1, 2]);
  });

  it('ignores any pre-existing sortOrder value', () => {
    const result = assignSortOrder([
      { name: 'x', sortOrder: 99 },
      { name: 'y', sortOrder: 1 },
    ]);
    expect(result.map((item) => item.sortOrder)).toEqual([0, 1]);
  });

  it('does not mutate the input items', () => {
    const items = [{ name: 'x' }];
    assignSortOrder(items);
    expect(items[0]).not.toHaveProperty('sortOrder');
  });
});
