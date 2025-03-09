import { compareData } from './compare';
import type { Where } from './types/where';
import { type Result, createFailure, createSuccess } from './utils/result';
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
