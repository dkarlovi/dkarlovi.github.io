/** Apply Astro's configured base to a public URL; external URLs remain unchanged. */
export function sitePath(path: string): string {
    return pathWithBase(path, import.meta.env.BASE_URL);
}

export function pathWithBase(path: string, configuredBase: string): string {
    if (/^(?:[a-z]+:|\/\/)/i.test(path)) return path;
    const base = new URL(configuredBase, "https://site.invalid").pathname.replace(/\/$/, "");
    return `${base}/${path.replace(/^\//, "")}`;
}
