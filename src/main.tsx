// Robust Global Fallbacks for sandboxed environments (like iframes or restricted previews)
try {
  if (typeof window !== 'undefined') {
    const testKey = '__test_local_storage__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
  }
} catch (e) {
  console.warn('[Sandbox Guard] HTML5 localStorage is blocked or throws in this context. Replaced with in-memory store.', e);
  const memoryStore: Record<string, string> = {};
  const mockLocalStorage = {
    getItem: (key: string): string | null => (key in memoryStore ? memoryStore[key] : null),
    setItem: (key: string, value: string): void => { memoryStore[key] = String(value); },
    removeItem: (key: string): void => { delete memoryStore[key]; },
    clear: (): void => { Object.keys(memoryStore).forEach(k => delete memoryStore[k]); },
    key: (index: number): string | null => Object.keys(memoryStore)[index] || null,
    get length(): number { return Object.keys(memoryStore).length; }
  };
  try {
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true
    });
  } catch (err) {
    console.error('[Sandbox Guard] Failed to override raw window.localStorage:', err);
  }
}

// Ensure state consistency across revisits by sanitizing corrupt or legacy JSON in storage
(function validateAppStateIntegrity() {
  if (typeof window === 'undefined') return;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      // If a key looks like a JSON storage payload, test if it parses cleanly
      if (key.startsWith('qr_') || key.startsWith('app_') || key.startsWith('user_') || key.includes('state') || key.includes('project')) {
        const val = localStorage.getItem(key);
        if (val && (val.startsWith('{') || val.startsWith('['))) {
          try {
            JSON.parse(val);
          } catch (err) {
            console.warn(`[State Guard] Corrupted JSON detected for key "${key}", purging to maintain app consistency:`, err);
            localStorage.removeItem(key);
          }
        }
      }
    }
  } catch (e) {
    console.warn('[State Guard] Error validating application state integrity:', e);
  }
})();

// Service Worker auto-cleanup & Chunk Loading Error Interceptor
(function setupCacheBustingAndSWCleanup() {
  if (typeof window === 'undefined') return;

  // Unregister service workers & purge caches to avoid stale main bundle issues
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((reg) => reg.unregister());
    }).catch((err) => console.warn('[SW Guard] Unregister error:', err));
  }

  if ('caches' in window) {
    caches.keys().then((keys) => {
      keys.forEach((key) => caches.delete(key));
    }).catch((err) => console.warn('[Cache Guard] Clear error:', err));
  }

  // Intercept chunk loading errors (stale dynamic imports or bundle hash mismatches)
  const handleChunkError = (message: string) => {
    const isChunkError =
      message.includes('Failed to fetch dynamically imported module') ||
      message.includes('Loading chunk') ||
      message.includes('importing a module script failed') ||
      message.includes('error loading dynamically imported module');

    if (isChunkError) {
      console.warn('[Cache Buster] Dynamic chunk loading error detected, attempting clean reload:', message);
      const reloadKey = 'app_chunk_reload_timestamp';
      const lastReload = sessionStorage.getItem(reloadKey);
      const now = Date.now();
      // Throttle reload to prevent infinite loops (max once per 10 seconds)
      if (!lastReload || (now - parseInt(lastReload, 10)) > 10000) {
        sessionStorage.setItem(reloadKey, now.toString());
        window.location.reload();
      }
    }
  };

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = reason?.message || String(reason || '');
    handleChunkError(msg);
  });

  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    handleChunkError(msg);
  });
})();

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { I18nProvider } from './utils/i18n.tsx';
import { FirebaseAuthProvider } from './context/FirebaseAuthContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <I18nProvider>
        <FirebaseAuthProvider>
          <App />
        </FirebaseAuthProvider>
      </I18nProvider>
    </ErrorBoundary>
  </StrictMode>,
);
