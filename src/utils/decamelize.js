export const toSnake = (str) =>
  str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

export const decamelizeKeys = (obj) => {
  if (Array.isArray(obj)) return obj.map(decamelizeKeys);
  if (obj && typeof obj === 'object') {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      acc[toSnake(key)] = decamelizeKeys(value);
      return acc;
    }, {});
  }
  return obj;
};
