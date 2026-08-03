import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaEnterpriseProvider, AppCheck } from 'firebase/app-check';
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

// Enable debug token for App Check during development & preview testing
if (typeof window !== 'undefined') {
  (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN ?? true;
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

