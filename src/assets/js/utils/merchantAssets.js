import { getIpgBaseUrl } from '../config/env.js';

/**
 * Resolve merchant logo URL from API path or absolute URL.
 * @param {string | null | undefined} uri
 * @returns {string | null}
 */
export function resolveMerchantLogoUrl(uri) {
  if (!uri) return null;
  if (uri.startsWith('http')) return uri;
  const base = getIpgBaseUrl();
  if (!base) return null;
  return `${base}${uri.startsWith('/') ? '' : '/'}${uri}`;
}
