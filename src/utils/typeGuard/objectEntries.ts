export const objectEntries = <K extends PropertyKey, V>(obj: { [P in K]: V }) =>
  Object.entries(obj) as [K, V][];
