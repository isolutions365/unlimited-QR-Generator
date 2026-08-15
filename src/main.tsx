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
  
  let success = false;
  try {
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true
    });
    success = true;
  } catch (err) {
    // Attempt to override on Window.prototype since window.localStorage itself is non-configurable in some sandboxes
    try {
      if (typeof Window !== 'undefined' && Window.prototype) {
        Object.defineProperty(Window.prototype, 'localStorage', {
          get() { return mockLocalStorage; },
          configurable: true
        });
        success = true;
      }
    } catch (protoErr) {
      console.warn('[Sandbox Guard] Failed to override window.localStorage on Window.prototype:', protoErr);
    }
  }

  if (!success) {
    console.warn('[Sandbox Guard] Fallback warning: Failed to override raw window.localStorage. Direct localStorage operations may fail in this iframe sandbox.');
  } else {
    console.log('[Sandbox Guard] Successfully initialized safe mock localStorage fallback.');
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

  const isDatabaseClosingError = (msg: string) => {
    if (!msg || !msg.trim() || msg === '[object Object]' || msg === 'undefined') return true;
    const lower = String(msg).toLowerCase();
    return (
      lower.includes('database is closing') ||
      lower.includes('database is closing/hidden') ||
      lower.includes('database connection is closing') ||
      lower.includes('the database connection is closing') ||
      lower.includes('closing/hidden') ||
      (lower.includes('indexeddb') && lower.includes('closing')) ||
      lower.includes('not focused') ||
      lower.includes('clipboard') ||
      lower.includes('share canceled') ||
      lower.includes('share cancelled') ||
      lower.includes('user didn\'t interact') ||
      lower.includes('play() failed') ||
      lower.includes('resizeobserver') ||
      lower.includes('the user aborted a request') ||
      lower.includes('aborterror') ||
      lower.includes('networkerror') ||
      lower.includes('failed to fetch') ||
      lower.includes('load failed') ||
      lower.includes('websocket') ||
      lower.includes('ws') ||
      lower.includes('grecaptcha') ||
      lower.includes('recaptcha') ||
      lower.includes('service worker') ||
      lower.includes('cache')
    );
  };

  const sendErrorToMonitoring = (payload: Record<string, any>) => {
    try {
      fetch('/api/monitoring/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: typeof window !== 'undefined' ? window.location.href : '',
          timestamp: new Date().toISOString(),
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          ...payload
        }),
      }).catch(() => {});
    } catch {
      // Ignore network errors during error reporting
    }
  };

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
    const msg = reason?.message || (typeof reason === 'string' ? reason : '') || '';
    if (!msg || isDatabaseClosingError(msg)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    
    sendErrorToMonitoring({
      type: 'unhandledrejection',
      message: msg,
      stack: reason?.stack || String(reason || '')
    });

    handleChunkError(msg);
  });

  window.addEventListener('error', (event) => {
    const msg = event.message || String(event.error?.message || '');
    if (!msg || isDatabaseClosingError(msg)) {
      event.preventDefault();
      event.stopPropagation();
      return true as any;
    }

    sendErrorToMonitoring({
      type: 'window.onerror',
      message: msg,
      source: event.filename || '',
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack || ''
    });

    handleChunkError(msg);
  }, true);
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
