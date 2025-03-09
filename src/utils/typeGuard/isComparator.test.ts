import { describe, expect, it } from 'vitest';
import { isComparator } from './isComparator';

describe('isComparator', () => {
  it('should return true for a valid comparator object', () => {
    expect(isComparator({ _eq: 'value' })).toBe(true);
    expect(isComparator({ _in: ['value1', 'value2'] })).toBe(true);
    expect(isComparator({ _is_null: true })).toBe(true);
    expect(isComparator({ _regex: 'pattern' })).toBe(true);
    expect(isComparator({ _neq: 'value' })).toBe(true);
    expect(isComparator({ _gte: 10 })).toBe(true);
    expect(isComparator({ _gt: 5 })).toBe(true);
    expect(isComparator({ _lte: 20 })).toBe(true);
    expect(isComparator({ _lt: 15 })).toBe(true);
  });

  it('should return false for an object with invalid keys', () => {
    expect(isComparator({ invalidKey: 'value' })).toBe(false);
  });

  it('should return false for an empty object', () => {
    expect(isComparator({})).toBe(false);
  });

  it('should return false for a non-object value', () => {
    expect(isComparator(null)).toBe(false);
    expect(isComparator(undefined)).toBe(false);
    expect(isComparator(123)).toBe(false);
    expect(isComparator('string')).toBe(false);
    expect(isComparator([1, 2, 3])).toBe(false);
  });
});
