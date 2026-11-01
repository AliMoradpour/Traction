/**
 * The backend serves every route under `/api`. Accept the server origin with
 * or without that prefix so `http://host:3000` and `http://host:3000/api`
 * both work.
 */
export function resolveApiUrl(raw: string | undefined): string {
  const base = (raw ?? 'http://localhost:3000').trim().replace(/\/+$/, '');
  return /\/api$/.test(base) ? base : `${base}/api`;
}
