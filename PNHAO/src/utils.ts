/**
 * Resolves an asset path with Vite's BASE_URL (e.g. /v1/).
 */
export function getAssetUrl(path: string): string {
  if (!path) return '';
  const baseUrl = (import.meta as any).env.BASE_URL || '/';
  if (path.startsWith('/')) {
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${cleanBase}${path}`;
  }
  return path;
}
