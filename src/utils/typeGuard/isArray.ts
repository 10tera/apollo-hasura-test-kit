export const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every((v) => typeof v === 'string');
};

export const isNumberArray = (value: unknown): value is number[] => {
  return Array.isArray(value) && value.every((v) => typeof v === 'number');
};

export const isBooleanArray = (value: unknown): value is boolean[] => {
  return Array.isArray(value) && value.every((v) => typeof v === 'boolean');
};
