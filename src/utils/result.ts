export type Result<T, E> = Success<T> | Failure<E>;

export type Success<T> = {
  readonly isSuccess: true;
  readonly isFailure: false;
  readonly value: T;
};
export type Failure<E> = {
  readonly isSuccess: false;
  readonly isFailure: true;
  readonly value: E;
};

export const createSuccess = <T>(value: T): Success<T> => {
  return { isSuccess: true, isFailure: false, value };
};

export const createFailure = <E>(value: E): Failure<E> => {
  return { isSuccess: false, isFailure: true, value };
};
