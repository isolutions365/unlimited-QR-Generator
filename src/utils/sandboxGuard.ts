// Robust Global Polyfills & Interceptors for sandboxed environments (iframes, restricted storage, missing APIs)

(function initSandboxGuard() {
  if (typeof window === 'undefined') return;

  // 1. In-Memory Storage Fallback helper
  function createMemoryStorage() {
    const memoryStore: Record<string, string> = {};
    return {
      getItem: (key: string): string | null => (key in memoryStore ? memoryStore[key] : null),
      setItem: (key: string, value: string): void => { memoryStore[key] = String(value); },
      removeItem: (key: string): void => { delete memoryStore[key]; },
      clear: (): void => { Object.keys(memoryStore).forEach(k => delete memoryStore[k]); },
      key: (index: number): string | null => Object.keys(memoryStore)[index] || null,
      get length(): number { return Object.keys(memoryStore).length; }
    };
  }

  // Safe localStorage test & polyfill
  try {
    const testKey = '__test_local_storage__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
  } catch (e) {
    console.warn('[Sandbox Guard] HTML5 localStorage is blocked or throws. Replacing with in-memory store.', e);
    const mockStorage = createMemoryStorage();
    try {
      Object.defineProperty(window, 'localStorage', { value: mockStorage, writable: true, configurable: true });
    } catch {
      try {
        if (typeof Window !== 'undefined' && Window.prototype) {
          Object.defineProperty(Window.prototype, 'localStorage', { get: () => mockStorage, configurable: true });
        }
      } catch {}
    }
  }

  // Safe sessionStorage test & polyfill
  try {
    const testKeySession = '__test_session_storage__';
    window.sessionStorage.setItem(testKeySession, '1');
    window.sessionStorage.removeItem(testKeySession);
  } catch (e) {
    console.warn('[Sandbox Guard] HTML5 sessionStorage is blocked or throws. Replacing with in-memory store.', e);
    const mockSession = createMemoryStorage();
    try {
      Object.defineProperty(window, 'sessionStorage', { value: mockSession, writable: true, configurable: true });
    } catch {
      try {
        if (typeof Window !== 'undefined' && Window.prototype) {
          Object.defineProperty(Window.prototype, 'sessionStorage', { get: () => mockSession, configurable: true });
        }
      } catch {}
    }
  }

  // 2. Validate and clean corrupted storage items safely
  try {
    const storage = window.localStorage;
    if (storage) {
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (!key) continue;
        if (key.startsWith('qr_') || key.startsWith('app_') || key.startsWith('user_') || key.includes('state') || key.includes('project')) {
          const val = storage.getItem(key);
          if (val && (val.startsWith('{') || val.startsWith('['))) {
            try {
              JSON.parse(val);
            } catch {
              console.warn(`[State Guard] Corrupted JSON detected for key "${key}", purging:`, key);
              storage.removeItem(key);
            }
          }
        }
      }
    }
  } catch (e) {
    console.warn('[State Guard] Error validating application state integrity:', e);
  }

  // 3. Service Worker auto-cleanup & global error handlers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((reg) => reg.unregister());
    }).catch(() => {});
  }

  if ('caches' in window) {
    caches.keys().then((keys) => {
      keys.forEach((key) => caches.delete(key));
    }).catch(() => {});
  }

  // Handle dynamic import chunk loading errors gracefully
  const handleChunkError = (message: string) => {
    const isChunkError =
      message.includes('Failed to fetch dynamically imported module') ||
      message.includes('Loading chunk') ||
      message.includes('importing a module script failed') ||
      message.includes('error loading dynamically imported module');

    if (isChunkError) {
      console.warn('[Cache Buster] Dynamic chunk loading error detected, attempting clean reload:', message);
      const reloadKey = 'app_chunk_reload_timestamp';
      try {
        const lastReload = window.sessionStorage.getItem(reloadKey);
        const now = Date.now();
        if (!lastReload || (now - parseInt(lastReload, 10)) > 10000) {
          window.sessionStorage.setItem(reloadKey, now.toString());
          window.location.reload();
        }
      } catch {
        window.location.reload();
      }
    }
  };

  const isIgnorableError = (msg: string) => {
    if (!msg || !msg.trim() || msg === '[object Object]' || msg === 'undefined') return true;
    const lower = String(msg).toLowerCase();
    return (
      lower.includes('database is closing') ||
      lower.includes('database is closing/hidden') ||
      lower.includes('closing/hidden') ||
      lower.includes('indexeddb') ||
      lower.includes('recaptcha') ||
      lower.includes('grecaptcha') ||
      lower.includes('share canceled') ||
      lower.includes('share cancelled') ||
      lower.includes('play() failed') ||
      lower.includes('resizeobserver') ||
      lower.includes('aborterror') ||
      lower.includes('websocket')
    );
  };

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = reason?.message || (typeof reason === 'string' ? reason : '') || '';
    if (!msg || isIgnorableError(msg)) {
      if (event.preventDefault) event.preventDefault();
      if (event.stopPropagation) event.stopPropagation();
      return;
    }
    handleChunkError(msg);
  });

  window.addEventListener('error', (event) => {
    const msg = event.message || String(event.error?.message || '');
    if (!msg || isIgnorableError(msg)) {
      if (event.preventDefault) event.preventDefault();
      if (event.stopPropagation) event.stopPropagation();
      return true as any;
    }
    handleChunkError(msg);
  }, true);
})();
