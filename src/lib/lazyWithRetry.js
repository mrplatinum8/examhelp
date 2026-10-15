import { lazy } from 'react';

/**
 * Wraps React.lazy with an automatic retry / page reload on chunk load failure.
 * This prevents "Failed to fetch dynamically imported module" errors when a new
 * deployment changes chunk hashes while a user has an older version open.
 */
export function lazyWithRetry(componentImport) {
  return lazy(async () => {
    const pageHasBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('examfocus_chunk_reloaded') || 'false'
    );

    try {
      const component = await componentImport();
      window.sessionStorage.setItem('examfocus_chunk_reloaded', 'false');
      return component;
    } catch (error) {
      if (!pageHasBeenForceRefreshed) {
        // Stale chunk detected after deployment: reload page once to fetch latest bundles
        window.sessionStorage.setItem('examfocus_chunk_reloaded', 'true');
        window.location.reload();
        // Return a promise that never resolves while reloading so React doesn't crash before reload
        return new Promise(() => {});
      }
      throw error;
    }
  });
}
