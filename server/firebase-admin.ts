import { initializeApp, getApps, getApp, cert, applicationDefault, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';

let adminAppInstance: App | null = null;
let rawAdminDb: Firestore | null = null;
let rawAdminAuth: Auth | null = null;

console.log('Loading Firebase Admin...');

try {
  if (getApps().length > 0) {
    adminAppInstance = getApp();
  } else {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    let credential;

    if (serviceAccount) {
      try {
        if (serviceAccount.trim().startsWith('{')) {
          const parsed = JSON.parse(serviceAccount);
          credential = cert(parsed);
        } else {
          credential = cert(serviceAccount);
        }
      } catch (parseErr: any) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to parse FIREBASE_SERVICE_ACCOUNT, falling back to applicationDefault():', parseErr);
        }
        credential = applicationDefault();
      }
    } else {
      credential = applicationDefault();
    }

    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;

    adminAppInstance = initializeApp({
      credential,
      ...(projectId ? { projectId } : {}),
    });
  }

  const rawDatabaseId =
    process.env.FIREBASE_FIRESTORE_DATABASE_ID ||
    process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID ||
    '(default)';
  const databaseId = (rawDatabaseId && rawDatabaseId.includes('='))
    ? rawDatabaseId.split('=').pop() || '(default)'
    : rawDatabaseId;

  rawAdminDb = getFirestore(adminAppInstance, databaseId);
  rawAdminAuth = getAuth(adminAppInstance);

  console.log('Firebase Admin initialized successfully.');
} catch (err: any) {
  console.log('Firebase Admin unavailable. Running in degraded mode.');
  if (process.env.NODE_ENV === 'development') {
    console.error('Firebase Admin initialization error:', err?.message || err);
  }
}

// Safe Proxy getters to ensure calling adminDb or adminAuth methods when unavailable throws a handled runtime error rather than undefined property crash
export const adminDb = new Proxy({} as Firestore, {
  get(_target, prop) {
    if (!rawAdminDb) {
      throw new Error('Firebase Admin DB is unavailable or not initialized');
    }
    const val = (rawAdminDb as any)[prop];
    return typeof val === 'function' ? val.bind(rawAdminDb) : val;
  },
});

export const adminAuth = new Proxy({} as Auth, {
  get(_target, prop) {
    if (!rawAdminAuth) {
      throw new Error('Firebase Admin Auth is unavailable or not initialized');
    }
    const val = (rawAdminAuth as any)[prop];
    return typeof val === 'function' ? val.bind(rawAdminAuth) : val;
  },
});

export const adminApp = adminAppInstance as App;

