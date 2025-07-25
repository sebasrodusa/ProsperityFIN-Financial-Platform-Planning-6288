export const toCamel = (str) =>
  str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

export const camelizeKeys = (obj) => {
  if (Array.isArray(obj)) return obj.map(camelizeKeys);
  if (obj && typeof obj === 'object') {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      acc[toCamel(key)] = camelizeKeys(value);
      return acc;
    }, {});
  }
  return obj;
};
