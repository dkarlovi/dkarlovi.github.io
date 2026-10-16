/** Apply Astro's configured base to a public URL; external URLs remain unchanged. */
export function sitePath(path: string): string {
  if (/^(?:[a-z]+:|\/\/)/i.test(path)) return path;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
}
