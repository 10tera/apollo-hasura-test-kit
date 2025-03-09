import type { Aggregate } from './aggregate';
import type { Comparator } from './comparator';

export type Where = {
  _and?: Where[] | null;
  _or?: Where[] | null;
  _not?: Where | null;
  [k: string]: Where[] | Where | Comparator | Aggregate | null | undefined;
};
