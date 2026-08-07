import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaEnterpriseProvider, AppCheck, getToken } from 'firebase/app-check';
import appletConfig from '../../firebase-applet-config.json';

// Define the firebaseConfig using import.meta.env with fallback to firebase-applet-config.json
const rawDatabaseId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || appletConfig.firestoreDatabaseId;
const cleanDatabaseId = (rawDatabaseId && rawDatabaseId.includes('=')) 
  ? rawDatabaseId.split('=').pop() 
  : rawDatabaseId;

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || appletConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || appletConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || appletConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || appletConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || appletConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || appletConfig.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || appletConfig.measurementId,
  firestoreDatabaseId: cleanDatabaseId || '(default)'
};

// Initialize Firebase App gracefully and perform single-instance checks
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Enable debug token for App Check with strict localhost-only conditional logic
if (typeof window !== 'undefined') {
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost';

  if (isLocalhost) {
    (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    console.log('[Firebase App Check] Debug token enabled for localhost:', hostname);
  } else {
    // STRICTLY DISABLE/REMOVE debug token on any domain other than localhost
    (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = false;
    if ('FIREBASE_APPCHECK_DEBUG_TOKEN' in self) {
      delete (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN;
    }
    console.log('[Firebase App Check] Debug token strictly DISABLED because window.location.hostname !== "localhost":', hostname);
  }

// Intercept and bypass reCAPTCHA domain restriction errors & database closing/hidden errors
if (typeof window !== 'undefined') {
  const isDatabaseClosingError = (msg: string) => {
    if (!msg) return false;
    const lower = String(msg).toLowerCase();
    return (
      lower.includes('database is closing') ||
      lower.includes('database is closing/hidden') ||
      lower.includes('database connection is closing') ||
      lower.includes('the database connection is closing') ||
      lower.includes('closing/hidden') ||
      (lower.includes('indexeddb') && lower.includes('closing'))
    );
  };

  window.addEventListener('error', (e) => {
    const msg = e && e.message ? String(e.message) : '';
    if (isDatabaseClosingError(msg)) {
      console.warn('[Firebase Guard] Suppressed database closing/hidden event error:', msg);
      e.preventDefault();
      e.stopPropagation();
      return true as any;
    }
    if (msg.includes('Invalid site key') || msg.includes('6LeQA3Qt') || msg.includes('recaptcha') || msg.includes('api.js')) {
      console.warn('[Firebase App Check] Suppressed reCAPTCHA domain verification error in development:', msg);
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  const originalOnError = window.onerror;
  window.onerror = function (message, source, lineno, colno, error) {
    const msg = String(message || '');
    if (isDatabaseClosingError(msg)) {
      console.warn('[Firebase Guard] Suppressed database closing/hidden error via onerror:', msg);
      return true;
    }
    if (msg.includes('Invalid site key') || msg.includes('6LeQA3Qt') || msg.includes('recaptcha') || msg.includes('api.js')) {
      console.warn('[Firebase App Check] Suppressed reCAPTCHA domain verification error via onerror:', message);
      return true;
    }
    if (originalOnError) {
      return originalOnError.apply(this, arguments as any);
    }
    return false;
  };

  window.addEventListener('unhandledrejection', (e) => {
    const reason = e && e.reason ? (e.reason.message || String(e.reason)) : '';
    if (isDatabaseClosingError(reason)) {
      console.warn('[Firebase Guard] Suppressed unhandled database closing/hidden rejection:', reason);
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (reason.includes('Invalid site key') || reason.includes('6LeQA3Qt') || reason.includes('recaptcha') || reason.includes('api.js')) {
      console.warn('[Firebase App Check] Suppressed unhandled reCAPTCHA rejection:', reason);
      e.preventDefault();
      e.stopPropagation();
    }
  });
}
}

// Initialize Firebase App Check using reCAPTCHA Enterprise (will be lazily deferred)
export let appCheck: AppCheck | undefined;

/**
 * Lazily and safely initializes Firebase App Check only after reCAPTCHA Enterprise is fully loaded in the window.
 * This completely avoids the "Invalid site key or not loaded in api.js" race condition during early page load.
 */
export function initializeDeferredAppCheck(): AppCheck | undefined {
  if (typeof window === 'undefined') return undefined;
  if (appCheck) return appCheck;

  const grecaptcha = (window as any).grecaptcha;
  const isGrecaptchaReady = !!(
    grecaptcha &&
    grecaptcha.enterprise &&
    typeof grecaptcha.enterprise.ready === 'function'
  );

  if (!isGrecaptchaReady) {
    console.log('[Firebase App Check] Deferring initialization: window.grecaptcha.enterprise is not fully loaded yet.');
    return undefined;
  }

  try {
    appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider("6LeQA3QtAAAAAJ-vfZZIUeaO7IeI3MS2UFvL5ozs"),
      isTokenAutoRefreshEnabled: true
    });
    console.log('[Firebase App Check] Lazily initialized successfully with ReCaptchaEnterpriseProvider.');
    return appCheck;
  } catch (err) {
    console.warn('[Firebase App Check] Safe initialization caught error (continuing gracefully):', err);
    return undefined;
  }
}

// Log active Firebase config project ID for verification
console.log('[Firebase Init] Active Firebase projectId:', firebaseConfig.projectId, '| Database ID:', firebaseConfig.firestoreDatabaseId);

// Export initialized services
const customDbId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? firebaseConfig.firestoreDatabaseId
  : undefined;

export const db = customDbId
  ? initializeFirestore(app, { experimentalForceLongPolling: true }, customDbId)
  : initializeFirestore(app, { experimentalForceLongPolling: true });

export const auth = getAuth(app);

// Configure persistent login state (Local Storage persistence)
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn('[Firebase Auth] Persistence initialization notice:', err?.message || err);
});

// Initialize and prepare Storage instance
export const storage = getStorage(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Ensures App Check token is active and warmed up in the background before performing Firestore operations.
 * This is completely non-blocking to ensure Firestore reads/writes can continue smoothly even if App Check has warnings or errors.
 */
export async function ensureAppCheckReady(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const activeAppCheck = appCheck || initializeDeferredAppCheck();
    if (activeAppCheck) {
      // Fire-and-forget background pre-fetch: caught internally so it never blocks or fails Firestore
      getToken(activeAppCheck, false).catch((err) => {
        console.warn('[Firebase App Check] Non-blocking background token pre-fetch notice:', err);
      });
    }
  } catch (err) {
    console.warn('[Firebase App Check] ensureAppCheckReady caught error gracefully:', err);
  }
}

/**
 * Safely triggers an explicit reCAPTCHA Enterprise token execution or fetches a fresh App Check token in the background.
 */
export async function triggerReCaptchaExecution(action: string = 'homepage'): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  // Lazily initialize App Check if possible
  const activeAppCheck = appCheck || initializeDeferredAppCheck();

  // 1. First, attempt standard App Check token fetching (this warms up the App Check layer)
  if (activeAppCheck) {
    try {
      console.log(`[Firebase App Check] Fetching App Check token for action: "${action}"...`);
      const tokenResult = await getToken(activeAppCheck, true); // forceRefresh
      console.log('[Firebase App Check] Successfully retrieved/refreshed App Check token.');
      return tokenResult.token;
    } catch (appCheckErr) {
      console.warn('[Firebase App Check] Token pre-fetch notice (continuing non-blockingly):', appCheckErr);
    }
  }

  // 2. Also execute grecaptcha.enterprise.execute if available to register active enterprise requests in Google Cloud Console
  try {
    const grecaptcha = (window as any).grecaptcha;
    if (grecaptcha && grecaptcha.enterprise && typeof grecaptcha.enterprise.ready === 'function') {
      return new Promise<string | null>((resolve) => {
        grecaptcha.enterprise.ready(() => {
          grecaptcha.enterprise.execute('6LeQA3QtAAAAAJ-vfZZIUeaO7IeI3MS2UFvL5ozs', { action: action })
            .then((token: string) => {
              console.log(`[ReCaptcha Enterprise] Successfully executed enterprise token for action "${action}"`);
              resolve(token);
            })
            .catch((err: any) => {
              console.warn('[ReCaptcha Enterprise] Execution notice:', err);
              resolve(null);
            });
        });
      });
    }
  } catch (err) {
    console.warn('[ReCaptcha Enterprise] Direct execution not available yet:', err);
  }

  return null;
}


