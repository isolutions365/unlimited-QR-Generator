/**
 * Central site configuration and single source of truth for base URLs.
 * Ensures all generated QR code redirect links, canonical tags, and public share URLs
 * point to the production domain: https://www.freeqrgen.pro
 */

export const PRODUCTION_BASE_URL = 'https://www.freeqrgen.pro';

/**
 * Returns the base URL for public shareable links and generated QR code content.
 * Always resolves to PRODUCTION_BASE_URL ("https://www.freeqrgen.pro") unless explicitly overridden via VITE_APP_URL.
 */
export function getProductionBaseUrl(): string {
  const envUrl = (import.meta as any).env?.VITE_APP_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return PRODUCTION_BASE_URL;
}

/**
 * Helper to build absolute URLs for QR code content, share links, and public landing pages.
 */
export function buildProductionUrl(path: string = ''): string {
  const baseUrl = getProductionBaseUrl();
  if (!path) return baseUrl;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}
