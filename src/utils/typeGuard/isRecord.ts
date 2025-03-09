export const isRecordStringUnknown = (
  value: unknown,
): value is Record<string, unknown> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).every((key) => typeof key === 'string')
  );
};
