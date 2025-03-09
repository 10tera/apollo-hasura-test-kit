import type { Comparator } from '../types/comparator';
import { isNullish } from '../utils/typeGuard/isNullish';
import { compareEqCondition } from './eq';
import { compareGtCondition } from './gt';
import { compareGteCondition } from './gte';
import { compareInCondition } from './in';
import { compareLtCondition } from './lt';
import { compareLteCondition } from './lte';

export const compareData = (condition: Comparator, data: unknown): boolean => {
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
