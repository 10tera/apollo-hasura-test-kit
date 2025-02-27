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
): TData => {
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
        });
        console.log(filteredData);
      }
    }
    if (!isNullish(value.limit)) {
      console.log(variables[value.limit]);
    }
  }

  return data;
};

type Where = {
  _and?: Where[] | null;
  _or?: Where[] | null;
  _not?: Where | null;
  [k: string]: Where[] | Where | Comparator | Aggregate | null | undefined;
};

type Comparator = {
  _eq?: string | number | boolean | null;
  _in?: string[] | number[] | boolean[] | null;
  [k: string]:
    | string[]
    | string
    | number[]
    | number
    | boolean[]
    | boolean
    | null
    | undefined;
};

/**
 * For aggregate type
 */
type Aggregate = {
  [k: string]: Where | Comparator | boolean | null | undefined | unknown;
};

const isComparator = (value: unknown): value is Comparator => {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    return false;
  const keys = Object.keys(value);
  if (keys.length === 0) return false;
  return keys.every((key) => key === '_eq' || key === '_in');
};
const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every((v) => typeof v === 'string');
};

const isNumberArray = (value: unknown): value is number[] => {
  return Array.isArray(value) && value.every((v) => typeof v === 'number');
};

const isBooleanArray = (value: unknown): value is boolean[] => {
  return Array.isArray(value) && value.every((v) => typeof v === 'boolean');
};

const isRecordStringUnknown = (
  value: unknown,
): value is Record<string, unknown> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).every((key) => typeof key === 'string')
  );
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
  if (condition._eq !== undefined) {
    result = result && data === condition._eq;
  }
  if (isStringArray(condition._in) && typeof data === 'string') {
    result = result && condition._in.includes(data);
  }
  if (isNumberArray(condition._in) && typeof data === 'number') {
    result = result && condition._in.includes(data);
  }
  if (isBooleanArray(condition._in) && typeof data === 'boolean') {
    result = result && condition._in.includes(data);
  }
  return result;
};

const objectEntries = <K extends PropertyKey, V>(obj: { [P in K]: V }) =>
  Object.entries(obj) as [K, V][];

const isNullish = (value: unknown) => value === null || value === undefined;
