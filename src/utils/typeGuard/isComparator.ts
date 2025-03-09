import type { Comparator } from '../../types/comparator';

export const isComparator = (value: unknown): value is Comparator => {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    return false;
  const keys = Object.keys(value);
  if (keys.length === 0) return false;
  return keys.every(
    (key) =>
      key === '_eq' ||
      key === '_in' ||
      key === '_is_null' ||
      key === '_regex' ||
      key === '_neq' ||
      key === '_gte' ||
      key === '_gt' ||
      key === '_lte' ||
      key === '_lt',
  );
};
