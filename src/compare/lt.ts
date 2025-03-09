import { DateTime } from 'luxon';
import type { Comparator } from '../types/comparator';
import { isNullish } from '../utils/typeGuard/isNullish';

export const compareLtCondition = (
  condition: Comparator['_lt'],
  data: unknown,
): boolean => {
  if (condition === null)
    throw new Error("unexpected null value for type 'String'");
  if (condition === undefined) return true;
  if (isNullish(data)) return false;

  // yyyy-MM-ddの等価判定
  if (typeof condition === 'string' && typeof data === 'string') {
    const dateFormat = 'yyyy-M-d';
    const conditionDate = DateTime.fromFormat(condition, dateFormat);
    const dataDate = DateTime.fromFormat(data, dateFormat);
    if (conditionDate.isValid && dataDate.isValid) {
      return dataDate < conditionDate;
    }
  }

  // timestampの等価判定
  if (typeof condition === 'string' && typeof data === 'string') {
    const conditionDate = DateTime.fromISO(condition);
    const dataDate = DateTime.fromISO(data);
    //TODO: より適切なバリデーションを入れる
    if (conditionDate.isValid && dataDate.isValid) {
      return dataDate < conditionDate;
    }
  }

  if (typeof data === 'string' && typeof condition === 'string') {
    return data < condition;
  }
  if (typeof data === 'number' && typeof condition === 'number') {
    return data < condition;
  }

  return true;
};
