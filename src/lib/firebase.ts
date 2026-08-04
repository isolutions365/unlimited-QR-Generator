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

  // Intercept and bypass reCAPTCHA domain restriction errors in non-production environments
  const isProd = hostname === 'freeqrgen.pro' || hostname === 'www.freeqrgen.pro';
  if (!isProd) {
    window.addEventListener('error', (e) => {
      const msg = e && e.message ? String(e.message) : '';
      if (msg.includes('Invalid site key') || msg.includes('6LeQA3Qt') || msg.includes('recaptcha') || msg.includes('api.js')) {
        console.warn('[Firebase App Check] Suppressed reCAPTCHA domain verification error in development:', msg);
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);

    const originalOnError = window.onerror;
    window.onerror = function (message, source, lineno, colno, error) {
      const msg = String(message || '');
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
      const reason = e && e.reason ? String(e.reason) : '';
      if (reason.includes('Invalid site key') || reason.includes('6LeQA3Qt') || reason.includes('recaptcha') || reason.includes('api.js')) {
        console.warn('[Firebase App Check] Suppressed unhandled reCAPTCHA rejection:', reason);
        e.preventDefault();
        e.stopPropagation();
      }
    });
  }
}

// Initialize Firebase App Check using reCAPTCHA Enterprise
export let appCheck: AppCheck | undefined;
if (typeof window !== 'undefined') {
  try {
    appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider("6LeQA3QtAAAAAJ-vfZZIUea07Iel3MS2UFvL5ozs"),
      isTokenAutoRefreshEnabled: true
    });
    console.log('[Firebase App Check] Initialized successfully using reCAPTCHA Enterprise.');
  } catch (err) {
    console.warn('[Firebase App Check] Initialization notice:', err);
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
 * This is non-blocking to prevent UI/network latency from delaying or failing reads and writes.
 */
export async function ensureAppCheckReady(): Promise<void> {
  if (typeof window !== 'undefined' && appCheck) {
    // Fire-and-forget background pre-fetch: does NOT await the promise
    getToken(appCheck, false).catch((err) => {
      console.warn('[Firebase App Check] Background token fetch notice:', err);
    });
  }
}

/**
 * Safely triggers an explicit reCAPTCHA Enterprise token execution or fetches a fresh App Check token in the background.
 */
export async function triggerReCaptchaExecution(action: string = 'homepage'): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  // 1. First, attempt standard App Check token fetching (this warms up the App Check layer)
  if (appCheck) {
    try {
      console.log(`[Firebase App Check] Fetching App Check token for action: "${action}"...`);
      const tokenResult = await getToken(appCheck, true); // forceRefresh
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
          grecaptcha.enterprise.execute('6LeQA3QtAAAAAJ-vfZZIUea07Iel3MS2UFvL5ozs', { action: action })
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


