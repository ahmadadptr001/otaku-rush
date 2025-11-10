// src/lib/params.ts
export function asString(v: string | string[] | undefined, fallback = ''): string {
  if (v === undefined) return fallback;
  if (Array.isArray(v)) return v[0] ?? fallback;
  return v;
}
