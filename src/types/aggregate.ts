import type { Comparator } from './comparator';
import type { Where } from './where';

/**
 * For aggregate type
 */
export type Aggregate = {
  [k: string]: Where | Comparator | boolean | null | undefined | unknown;
};
