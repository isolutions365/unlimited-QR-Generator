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

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
