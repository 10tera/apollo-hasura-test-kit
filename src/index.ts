import { DateTime } from 'luxon';
import type { Comparator } from './types/comparator';
import type { Where } from './types/where';
import { type Result, createFailure, createSuccess } from './utils/result';
import {
  isBooleanArray,
  isNumberArray,
  isStringArray,
} from './utils/typeGuard/isArray';
import { isComparator } from './utils/typeGuard/isComparator';
import { isNullish } from './utils/typeGuard/isNullish';
import { isRecordStringUnknown } from './utils/typeGuard/isRecord';
import { objectEntries } from './utils/typeGuard/objectEntries';

export const mockQueryResult = <
  TData,
  TVariables extends Record<string, Where | number | undefined | null>,
>(
  data: TData,
  variables: TVariables,
  map: {
    [K in keyof TData]: {
      limit?: {
        [P in keyof TVariables]: TVariables[P] extends number | null | undefined
          ? P
          : never;
      }[keyof TVariables];
      where?: {
        [P in keyof TVariables]: TVariables[P] extends Where | null | undefined
          ? P
          : never;
      }[keyof TVariables];
    };
  },
): Result<TData, Error> => {
  try {
    const result = structuredClone(data);
    for (const [key, value] of objectEntries(map)) {
      if (!isNullish(value.where)) {
        const whereValue = variables[value.where];
        if (
          typeof whereValue === 'object' &&
          !isNullish(whereValue) &&
          Array.isArray(data[key])
        ) {
          const filteredData = data[key].filter((item) => {
            return matchCondition(whereValue, item);
            //TODO: fix type
          }) as TData[keyof TData];
          result[key] = filteredData;
        }
      }
      if (!isNullish(value.limit)) {
        //console.log(variables[value.limit]);
      }
    }

    return createSuccess(result);
  } catch (error) {
    return createFailure(error as Error);
  }
};

const matchCondition = (
  where: Where,
  data: Record<string, unknown>,
): boolean => {
  let result = true;
  for (const [whereKey, whereCondition] of Object.entries(where)) {
    if (isNullish(whereCondition)) continue;
    if (whereKey === '_and') {
      if (Array.isArray(whereCondition)) {
        result = result && whereCondition.every((w) => matchCondition(w, data));
      }
      continue;
    }
    if (whereKey === '_or') {
      if (Array.isArray(whereCondition)) {
        result = result && whereCondition.some((w) => matchCondition(w, data));
      }
      continue;
    }
    if (whereKey === '_not') {
      if (!Array.isArray(whereCondition) && !isComparator(whereCondition)) {
        //TODO: Aggregate Typeは未考慮
        result = result && !matchCondition(whereCondition as Where, data);
      }
      continue;
    }
    if (isComparator(whereCondition)) {
      if (Object.prototype.hasOwnProperty.call(data, whereKey)) {
        result = result && compareData(whereCondition, data[whereKey]);
      }
      continue;
    }

    //NOTE: _and,_or以外でWhere[]は来ない想定
    if (Array.isArray(whereCondition)) {
      continue;
    }
    if (
      Object.prototype.hasOwnProperty.call(data, whereKey) &&
      isRecordStringUnknown(data[whereKey])
    ) {
      result =
        //NOTE: Aggregate Typeは未考慮
        result && matchCondition(whereCondition as Where, data[whereKey]);
    }
  }
  return result;
};

const compareData = (condition: Comparator, data: unknown): boolean => {
  let result = true;
  /**
   * _eq
   */
  result = result && compareEqCondition(condition._eq, data);
  /**
   * _neq
   */
  if (!isNullish(condition._neq)) {
    result = result && (isNullish(data) ? false : data !== condition._neq);
  } else if (condition._eq === null) {
    throw new Error("unexpected null value for type 'String'");
  }
  /**
   * _in
   */
  result = result && compareInCondition(condition._in, data);
  /**
   * _is_null
   */
  if (!isNullish(condition._is_null)) {
    result =
      result && (condition._is_null ? isNullish(data) : !isNullish(data));
  } else if (condition._is_null === null) {
    throw new Error("expected a boolean for type 'Boolean', but found null");
  }
  /**
   * _regex
   */
  if (!isNullish(condition._regex)) {
    result =
      result &&
      (typeof data === 'string' ? !!data.match(condition._regex) : false);
  } else if (condition._regex === null) {
    throw new Error("unexpected null value for type 'String'");
  }
  /**
   * _gte,_gt,_lte,_lt
   */
  result = result && compareGteCondition(condition._gte, data);
  result = result && compareGtCondition(condition._gt, data);
  result = result && compareLteCondition(condition._lte, data);
  result = result && compareLtCondition(condition._lt, data);
  return result;
};

const compareEqCondition = (
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

const compareInCondition = (
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

const compareGteCondition = (
  condition: Comparator['_gte'],
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
      return dataDate >= conditionDate;
    }
  }

  // timestampの等価判定
  if (typeof condition === 'string' && typeof data === 'string') {
    const conditionDate = DateTime.fromISO(condition);
    const dataDate = DateTime.fromISO(data);
    //TODO: より適切なバリデーションを入れる
    if (conditionDate.isValid && dataDate.isValid) {
      return dataDate >= conditionDate;
    }
  }

  if (typeof data === 'string' && typeof condition === 'string') {
    return data >= condition;
  }
  if (typeof data === 'number' && typeof condition === 'number') {
    return data >= condition;
  }

  return true;
};

const compareGtCondition = (
  condition: Comparator['_gt'],
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
      return dataDate > conditionDate;
    }
  }

  // timestampの等価判定
  if (typeof condition === 'string' && typeof data === 'string') {
    const conditionDate = DateTime.fromISO(condition);
    const dataDate = DateTime.fromISO(data);
    //TODO: より適切なバリデーションを入れる
    if (conditionDate.isValid && dataDate.isValid) {
      return dataDate > conditionDate;
    }
  }

  if (typeof data === 'string' && typeof condition === 'string') {
    return data > condition;
  }
  if (typeof data === 'number' && typeof condition === 'number') {
    return data > condition;
  }

  return true;
};

const compareLteCondition = (
  condition: Comparator['_lte'],
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
      return dataDate <= conditionDate;
    }
  }

  // timestampの等価判定
  if (typeof condition === 'string' && typeof data === 'string') {
    const conditionDate = DateTime.fromISO(condition);
    const dataDate = DateTime.fromISO(data);
    //TODO: より適切なバリデーションを入れる
    if (conditionDate.isValid && dataDate.isValid) {
      return dataDate <= conditionDate;
    }
  }

  if (typeof data === 'string' && typeof condition === 'string') {
    return data <= condition;
  }
  if (typeof data === 'number' && typeof condition === 'number') {
    return data <= condition;
  }

  return true;
};

const compareLtCondition = (
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
