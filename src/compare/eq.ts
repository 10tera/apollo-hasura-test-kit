import { DateTime } from 'luxon';
import type { Comparator } from '../types/comparator';

export const compareEqCondition = (
  condition: Comparator['_eq'],
  data: unknown,
): boolean => {
  if (condition === null)
    throw new Error("unexpected null value for type 'String'");
  if (condition === undefined) return true;

  // yyyy-MM-ddの等価判定
  if (typeof condition === 'string' && typeof data === 'string') {
    const dateFormat = 'yyyy-M-d';
    const conditionDate = DateTime.fromFormat(condition, dateFormat);
    const dataDate = DateTime.fromFormat(data, dateFormat);
    if (conditionDate.isValid && dataDate.isValid) {
      return conditionDate.equals(dataDate);
    }
  }

  // timestampの等価判定
  if (typeof condition === 'string' && typeof data === 'string') {
    const conditionDate = DateTime.fromISO(condition);
    const dataDate = DateTime.fromISO(data);
    //TODO: より適切なバリデーションを入れる
    if (conditionDate.isValid && dataDate.isValid) {
      console.log(conditionDate, dataDate);
      return conditionDate.equals(dataDate);
    }
  }

  return data === condition;
};
