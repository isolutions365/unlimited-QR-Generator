import React from 'react';

/**
 * Resilient lazy loader helper for dynamic imports.
 * Retries once by reloading the session if module fetch failed (e.g. after a new deployment).
 */
export function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return React.lazy(async () => {
    try {
      return await factory();
    } catch (error) {
      // Retry once by reloading window session if module fetch failed
      const hasRefreshed = sessionStorage.getItem('lazy_retry_refreshed');
      if (!hasRefreshed) {
        sessionStorage.setItem('lazy_retry_refreshed', 'true');
        window.location.reload();
      }
      throw error;
    }
  });
}
