import { DateTime } from 'luxon';
import type { Comparator } from '../types/comparator';
import {
  isBooleanArray,
  isNumberArray,
  isStringArray,
} from '../utils/typeGuard/isArray';

export const compareInCondition = (
  condition: Comparator['_in'],
  data: unknown,
): boolean => {
  if (condition === null) throw new Error('expected a list, but found null');
  if (condition === undefined) return true;
  if (isNumberArray(condition)) {
    return typeof data === 'number' ? condition.includes(data) : false;
  }
  if (isBooleanArray(condition)) {
    return typeof data === 'boolean' ? condition.includes(data) : false;
  }
  if (isStringArray(condition)) {
    if (typeof data !== 'string') return false;
    // yyyy-MM-ddの判定
    const dateFormat = 'yyyy-M-d';
    const validYmdDates = condition
      .map((dateStr) => DateTime.fromFormat(dateStr, dateFormat))
      .filter((date) => date.isValid);
    if (validYmdDates.length === condition.length) {
      const dataDate = DateTime.fromFormat(data as string, dateFormat);
      if (dataDate.isValid) {
        return validYmdDates.some((date) => date.equals(dataDate));
      }
    }

    // timestampの等価判定
    const validTimestampDates = condition
      .map((dateStr) => DateTime.fromISO(dateStr))
      .filter((date) => date.isValid);
    if (validTimestampDates.length === condition.length) {
      const dataDate = DateTime.fromISO(data as string);
      if (dataDate.isValid) {
        return validTimestampDates.some((date) => date.equals(dataDate));
      }
    }
    return condition.includes(data);
  }
  return true;
};
