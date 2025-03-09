import { describe, expect, it } from 'vitest';
import { isBooleanArray, isNumberArray, isStringArray } from './isArray';

describe('isStringArray', () => {
  it('should return true for an array of strings', () => {
    expect(isStringArray(['a', 'b', 'c'])).toBe(true);
  });

  it('should return false for an array of numbers', () => {
    expect(isStringArray([1, 2, 3])).toBe(false);
  });

  it('should return false for a mixed array', () => {
    expect(isStringArray(['a', 1, 'b'])).toBe(false);
  });

  it('should return false for a non-array value', () => {
    expect(isStringArray('a')).toBe(false);
  });
});

describe('isNumberArray', () => {
  it('should return true for an array of numbers', () => {
    expect(isNumberArray([1, 2, 3])).toBe(true);
  });

  it('should return false for an array of strings', () => {
    expect(isNumberArray(['a', 'b', 'c'])).toBe(false);
  });

  it('should return false for a mixed array', () => {
    expect(isNumberArray([1, 'a', 2])).toBe(false);
  });

  it('should return false for a non-array value', () => {
    expect(isNumberArray(1)).toBe(false);
  });
});

describe('isBooleanArray', () => {
  it('should return true for an array of booleans', () => {
    expect(isBooleanArray([true, false, true])).toBe(true);
  });

  it('should return false for an array of numbers', () => {
    expect(isBooleanArray([1, 2, 3])).toBe(false);
  });

  it('should return false for a mixed array', () => {
    expect(isBooleanArray([true, 1, false])).toBe(false);
  });

  it('should return false for a non-array value', () => {
    expect(isBooleanArray(true)).toBe(false);
  });
});
