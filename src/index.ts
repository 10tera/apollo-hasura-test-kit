export const mockQueryResult = <
  TData,
  TVariables extends { [k: string]: Where | number | undefined | null },
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
      //console.log(variables[value.where]);
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
} & {
  [k: Exclude<string, '_and' | '_or' | '_not'>]: Where | Comparator | null;
};
type Comparator = {
  _eq?: string | number | null;
  _in?: string[] | number[] | null;
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

//TODO: ジェネリクスいらないかも
const matchCondition = <TData extends Record<string, unknown>>(
  where: Where,
  data: TData,
): boolean => {
  let result = true;
  for (const [whereKey, whereCondition] of Object.entries(where)) {
    if (isNullish(whereCondition)) continue;
    if (whereKey === '_and' && Array.isArray(whereCondition)) {
      result = result && whereCondition.every((w) => matchCondition(w, data));
      continue;
    }
    if (whereKey === '_or' && Array.isArray(whereCondition)) {
      result = result && whereCondition.some((w) => matchCondition(w, data));
      continue;
    }
    if (
      whereKey === '_not' &&
      !isNullish(whereCondition) &&
      !Array.isArray(whereCondition) &&
      !isComparator(whereCondition)
    ) {
      result = result && !matchCondition(whereCondition, data);
      continue;
    }
    if (isComparator(whereCondition)) {
      if (Object.prototype.hasOwnProperty.call(data, whereKey)) {
        result = result && compareData(whereCondition, data[whereKey]);
      }
      continue;
    }
    const a = whereCondition;

    if (
      !isNullish(whereCondition) &&
      !Array.isArray(whereCondition) &&
      Object.prototype.hasOwnProperty.call(data, whereKey)
    ) {
      if (Array.isArray(data[whereKey])) {
        result =
          result &&
          data[whereKey].some((item) => matchCondition(whereCondition, item));
      } else if (isRecordStringUnknown(data[whereKey])) {
        result = result && matchCondition(whereCondition, data[whereKey]);
      }
    }
  }
  return result;
};

const compareData = (condition: Comparator, data: unknown): boolean => {
  let result = true;
  console.log(condition, data);
  if (condition._eq !== undefined) {
    result = result && data === condition._eq;
  }
  if (isStringArray(condition._in) && typeof data === 'string') {
    result = result && condition._in.includes(data);
  }
  if (isNumberArray(condition._in) && typeof data === 'number') {
    result = result && condition._in.includes(data);
  }
  return result;
};

const objectEntries = <K extends PropertyKey, V>(obj: { [P in K]: V }) =>
  Object.entries(obj) as [K, V][];

const isNullish = (value: unknown) => value === null || value === undefined;
