export type Comparator = {
  _eq?: string | number | boolean | null;
  _in?: string[] | number[] | boolean[] | null;
  _is_null?: boolean | null;
  _regex?: string | null;
  _neq?: string | number | boolean | null;
  _gte?: string | number | null;
  _gt?: string | number | null;
  _lte?: string | number | null;
  _lt?: string | number | null;
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
