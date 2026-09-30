import { initializeApp, getApps, getApp, cert, applicationDefault, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getStorage, type Storage } from 'firebase-admin/storage';
import firebaseAppletConfig from '../firebase-applet-config.json';

let adminAppInstance: App | null = null;
let rawAdminDb: Firestore | null = null;
let rawAdminAuth: Auth | null = null;
let rawAdminStorage: Storage | null = null;
let customStorageBucket: any = null;
let customAdminDb: any = null;

console.log('Loading Firebase Admin...');

const storageBucketName =
  process.env.FIREBASE_STORAGE_BUCKET ||
  process.env.VITE_FIREBASE_STORAGE_BUCKET ||
  (firebaseAppletConfig as any).storageBucket ||
  'gen-lang-client-0962876854.firebasestorage.app';

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

    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || (firebaseAppletConfig as any).projectId;

    adminAppInstance = initializeApp({
      credential,
      ...(projectId ? { projectId } : {}),
      storageBucket: storageBucketName,
    });
  }

  const rawDatabaseId =
    process.env.FIREBASE_FIRESTORE_DATABASE_ID ||
    process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID ||
    (firebaseAppletConfig as any).firestoreDatabaseId ||
    '(default)';
  const databaseId = (rawDatabaseId && rawDatabaseId.includes('='))
    ? rawDatabaseId.split('=').pop() || '(default)'
    : rawDatabaseId;

  rawAdminDb = getFirestore(adminAppInstance, databaseId);
  rawAdminAuth = getAuth(adminAppInstance);
  rawAdminStorage = getStorage(adminAppInstance);

  console.log('Firebase Admin initialized successfully with Cloud Storage bucket:', storageBucketName);
} catch (err: any) {
  console.log('Firebase Admin unavailable. Running in degraded mode.');
  if (process.env.NODE_ENV === 'development') {
    console.error('Firebase Admin initialization error:', err?.message || err);
  }
}

// Safe Proxy getters to ensure calling adminDb, adminAuth, or adminStorage methods when unavailable throws a handled runtime error rather than undefined property crash
export const adminDb = new Proxy({} as Firestore, {
  get(_target, prop) {
    if (customAdminDb) {
      const val = customAdminDb[prop];
      return typeof val === 'function' ? val.bind(customAdminDb) : val;
    }
    if (!rawAdminDb) {
      throw new Error('Firebase Admin DB is unavailable or not initialized');
    }
    const val = (rawAdminDb as any)[prop];
    return typeof val === 'function' ? val.bind(rawAdminDb) : val;
  },
});

export function setCustomAdminDb(db: any) {
  customAdminDb = db;
}

export const adminAuth = new Proxy({} as Auth, {
  get(_target, prop) {
    if (!rawAdminAuth) {
      throw new Error('Firebase Admin Auth is unavailable or not initialized');
    }
    const val = (rawAdminAuth as any)[prop];
    return typeof val === 'function' ? val.bind(rawAdminAuth) : val;
  },
});

export const adminStorage = new Proxy({} as Storage, {
  get(_target, prop) {
    if (!rawAdminStorage) {
      throw new Error('Firebase Admin Storage is unavailable or not initialized');
    }
    const val = (rawAdminStorage as any)[prop];
    return typeof val === 'function' ? val.bind(rawAdminStorage) : val;
  },
});

export function getStorageBucket() {
  if (customStorageBucket) {
    return customStorageBucket;
  }
  if (!rawAdminStorage) {
    throw new Error('Firebase Admin Storage is unavailable or not initialized');
  }
  return rawAdminStorage.bucket(storageBucketName);
}

export function setCustomStorageBucket(bucket: any) {
  customStorageBucket = bucket;
}

export const adminApp = adminAppInstance as App;


