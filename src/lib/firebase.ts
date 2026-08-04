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

// Enable debug token for App Check ONLY on localhost
if (typeof window !== 'undefined') {
  const isLocalhost = window.location.hostname === 'localhost';
  if (isLocalhost) {
    (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    console.log('[Firebase App Check] Debug token enabled on localhost.');
  } else {
    // Ensure it's not set on production (freeqrgen.pro) so reCAPTCHA runs naturally
    if ('FIREBASE_APPCHECK_DEBUG_TOKEN' in self) {
      delete (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN;
    }
    console.log('[Firebase App Check] Debug token disabled for production environment.');
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

