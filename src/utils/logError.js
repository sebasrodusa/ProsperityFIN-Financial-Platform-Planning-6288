export default function logError(operation, err) {
  const message = err?.message || err;
  const code = err?.code;
  const base = `${operation}: ${message}${code ? ` (code: ${code})` : ''}`;
  // eslint-disable-next-line no-console
  console.error(base);
  if (import.meta.env.DEV && err?.stack) {
    // eslint-disable-next-line no-console
    console.error(err.stack);
  }
}
