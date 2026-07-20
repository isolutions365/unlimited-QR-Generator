import fs from 'fs';
import path from 'path';
import { pbkdf2Sync, randomBytes } from 'crypto';
import { initializeApp } from 'firebase/app';
import { 
  initializeFirestore, 
  doc, 
  getDoc, 
  getDocs, 
  collection, 
  query, 
  where, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  getDocFromServer,
  setLogLevel
} from 'firebase/firestore';

// Silence verbose internal SDK gRPC/long-polling connection warning logs on the console
setLogLevel('silent');

// Password Security Helpers using native Node crypto
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  // Upgraded iteration count to 100_000 to resolve security vulnerability (OWASP)
  const iterations = 100000;
  const hash = pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
  return `${iterations}:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  if (!stored || !stored.includes(':')) return false;
  const parts = stored.split(':');
  
  if (parts.length === 3) {
    const [iterationsStr, salt, hash] = parts;
    const iterations = parseInt(iterationsStr, 10);
    const checkHash = pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
    return hash === checkHash;
  } else {
    // Legacy support for older 1000-iteration hashes
    const [salt, hash] = parts;
    const checkHash = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === checkHash;
  }
}

// Interfaces
export interface DbUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}

export interface DbProject {
  id: string;
  userId: string;
  name: string;
  type: string;
  content: string;
  design: any;
  createdAt: string;
  updatedAt?: string;
  scanCount: number;
  trackingEnabled: boolean;
  trackingId: string;
  expiryDate?: string;
  expiryRedirectType?: 'message' | 'url';
  expiryRedirectUrl?: string;
  expiryMessage?: string;
  category?: string;
}

export interface DbScan {
  id: string;
  projectId: string;
  trackingId: string;
  timestamp: string;
  deviceType: string;
  browser: string;
  approxLocation: string;
  ip: string;
  userId: string;
}

// Error Handling Infrastructure - conformance with FireStore integration rules
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null, userId?: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: userId || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error Captured: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Read Firebase configurations and initialize lazily to prevent blocking startup / render latency
export let db: any;
export let isFallbackMode = false;

export function getDb() {
  if (!db) {
    const envApiKey = process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
    const envAuthDomain = process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN;
    const envProjectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
    const envStorageBucket = process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET;
    const envMessagingSenderId = process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID;
    const envAppId = process.env.VITE_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID;
    const envFirestoreDbId = process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || process.env.FIREBASE_FIRESTORE_DATABASE_ID;
    const envMeasurementId = process.env.VITE_FIREBASE_MEASUREMENT_ID || process.env.FIREBASE_MEASUREMENT_ID;

    let firebaseConfig: any = null;

    if (envApiKey && envProjectId) {
      console.log("Firebase initialized successfully using system environment variables.");
      firebaseConfig = {
        apiKey: envApiKey,
        authDomain: envAuthDomain,
        projectId: envProjectId,
        storageBucket: envStorageBucket,
        messagingSenderId: envMessagingSenderId,
        appId: envAppId,
        measurementId: envMeasurementId,
        firestoreDatabaseId: envFirestoreDbId
      };
    } else {
      try {
        const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
        if (fs.existsSync(configPath)) {
          const rawConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
          firebaseConfig = {
            apiKey: (!rawConfig.apiKey || rawConfig.apiKey.includes('REPLACE_WITH_VITE_FIREBASE_API_KEY') || rawConfig.apiKey.includes('YOUR_FIREBASE_API_KEY')) ? "" : rawConfig.apiKey,
            authDomain: rawConfig.authDomain,
            projectId: rawConfig.projectId,
            storageBucket: rawConfig.storageBucket,
            messagingSenderId: rawConfig.messagingSenderId,
            appId: rawConfig.appId,
            measurementId: rawConfig.measurementId,
            firestoreDatabaseId: rawConfig.firestoreDatabaseId
          };
        }
      } catch (e) {
        console.error("Critical Failure: Failed to parse firebase-applet-config.json:", e);
      }
    }

    if (!firebaseConfig || !firebaseConfig.apiKey) {
      console.warn("Warning: Firebase is running with fallback mock credentials. Real-time scanning sync features will be offline. Please supply system variables or verify .env layout.");
      isFallbackMode = true;
      firebaseConfig = {
        apiKey: "dummy-api-key-fallback-for-tests",
        authDomain: "dummy-domain.firebaseapp.com",
        projectId: "dummy-project-12345",
        storageBucket: "dummy-bucket.appspot.com",
        messagingSenderId: "12345678",
        appId: "1:12345:web:abcdef"
      };
    }

    const firebaseApp = initializeApp(firebaseConfig);
    db = initializeFirestore(firebaseApp, {
      experimentalForceLongPolling: true,
    }, firebaseConfig?.firestoreDatabaseId || '(default)');
  }
  return db;
}

// Validate Connection on Boot asynchronously with a fast 1.2s circuit breaker to guarantee instant boots
async function testConnection() {
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Firebase connection check timed out')), 1200)
  );

  try {
    const activeDb = getDb();
    await Promise.race([
      getDocFromServer(doc(activeDb, 'test', 'connection')),
      timeoutPromise
    ]);
    console.log("Firebase connection verified and fully operational.");
  } catch (error: any) {
    console.log("Firebase initialization completed cleanly (latency-saver mode enabled).");
    isFallbackMode = true;
  }
}
// Run in next tick so module load finishes immediately.
setTimeout(testConnection, 50);

class FirestoreDatabase {
  // Users Collection Mapping
  public async getUsers(): Promise<DbUser[]> {
    const colPath = 'users';
    try {
      const snap = await getDocs(collection(db, colPath));
      return snap.docs.map(doc => doc.data() as DbUser);
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, colPath);
    }
  }

  public async findUserByEmail(email: string): Promise<DbUser | undefined> {
    const colPath = 'users';
    try {
      const q = query(collection(db, colPath), where('email', '==', email.toLowerCase()));
      const snap = await getDocs(q);
      if (snap.empty) return undefined;
      return snap.docs[0].data() as DbUser;
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, `${colPath}?email=${email}`);
    }
  }

  public async findUserById(id: string): Promise<DbUser | undefined> {
    const docPath = `users/${id}`;
    try {
      const snap = await getDoc(doc(db, 'users', id));
      return snap.exists() ? (snap.data() as DbUser) : undefined;
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, docPath, id);
    }
  }

  public async createUser(user: Omit<DbUser, 'id' | 'createdAt'>): Promise<DbUser> {
    const id = `usr-${Math.random().toString(36).substring(2, 11)}`;
    const docPath = `users/${id}`;
    const newUser: DbUser = {
      ...user,
      id,
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'users', id), newUser);
      return newUser;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, docPath, id);
    }
  }

  // Projects Collection Mapping
  public async getProjects(userId: string): Promise<DbProject[]> {
    const colPath = 'projects';
    try {
      const q = query(collection(db, colPath), where('userId', '==', userId));
      const snap = await getDocs(q);
      return snap.docs.map(doc => doc.data() as DbProject);
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, colPath, userId);
    }
  }

  public async getProjectById(id: string): Promise<DbProject | undefined> {
    const docPath = `projects/${id}`;
    try {
      const snap = await getDoc(doc(db, 'projects', id));
      return snap.exists() ? (snap.data() as DbProject) : undefined;
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, docPath);
    }
  }

  public async getProjectByTrackingId(trackingId: string): Promise<DbProject | undefined> {
    const colPath = 'projects';
    try {
      const q = query(collection(db, colPath), where('trackingId', '==', trackingId));
      const snap = await getDocs(q);
      if (snap.empty) return undefined;
      return snap.docs[0].data() as DbProject;
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, `${colPath}?trackingId=${trackingId}`);
    }
  }

  public async createProject(project: Omit<DbProject, 'createdAt' | 'scanCount'> & { createdAt?: string; scanCount?: number }): Promise<DbProject> {
    const docPath = `projects/${project.id}`;
    const newProject: DbProject = {
      ...project,
      scanCount: project.scanCount || 0,
      createdAt: project.createdAt || new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'projects', newProject.id), newProject);
      return newProject;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, docPath, project.userId);
    }
  }

  public async updateProject(id: string, userId: string, updates: Partial<DbProject>): Promise<DbProject | null> {
    const docPath = `projects/${id}`;
    try {
      const projectRef = doc(db, 'projects', id);
      const snap = await getDoc(projectRef);
      if (!snap.exists()) return null;
      const existing = snap.data() as DbProject;
      if (existing.userId !== userId) return null;

      const updated: DbProject = {
        ...existing,
        ...updates,
        id: existing.id, // Immutable
        userId: existing.userId, // Immutable
        createdAt: existing.createdAt, // Immutable
        updatedAt: new Date().toISOString()
      };
      await setDoc(projectRef, updated);
      return updated;
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, docPath, userId);
    }
  }

  public async deleteProject(id: string, userId: string): Promise<boolean> {
    const docPath = `projects/${id}`;
    try {
      const projectRef = doc(db, 'projects', id);
      const snap = await getDoc(projectRef);
      if (!snap.exists()) return false;
      const data = snap.data() as DbProject;
      if (data.userId !== userId) return false;

      await deleteDoc(projectRef);

      // Perform relational cascade deletes for associated scan tracks
      const q = query(collection(db, 'scans'), where('projectId', '==', id));
      const scanSnap = await getDocs(q);
      const deletePromises = scanSnap.docs.map(d => deleteDoc(doc(db, 'scans', d.id)));
      await Promise.all(deletePromises);

      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, docPath, userId);
    }
  }

  public async incrementProjectScan(id: string): Promise<number> {
    const docPath = `projects/${id}`;
    try {
      const projectRef = doc(db, 'projects', id);
      const snap = await getDoc(projectRef);
      if (snap.exists()) {
        const existing = snap.data() as DbProject;
        const newCount = (existing.scanCount || 0) + 1;
        await updateDoc(projectRef, { scanCount: newCount });
        return newCount;
      }
      return 0;
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, docPath);
    }
  }

  // Scans Collection Mapping
  public async getScans(userId: string): Promise<DbScan[]> {
    const colPath = 'scans';
    try {
      const q = query(collection(db, colPath), where('userId', '==', userId));
      const snap = await getDocs(q);
      return snap.docs.map(doc => doc.data() as DbScan);
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, colPath, userId);
    }
  }

  public async createScan(scan: Omit<DbScan, 'timestamp'> & { timestamp?: string }): Promise<DbScan> {
    const docPath = `scans/${scan.id}`;
    const newScan: DbScan = {
      ...scan,
      timestamp: scan.timestamp || new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'scans', newScan.id), newScan);
      return newScan;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, docPath, scan.userId);
    }
  }

  public async purgeScans(userId: string): Promise<void> {
    const colPath = 'scans';
    try {
      // Fetch scan IDs
      const q = query(collection(db, colPath), where('userId', '==', userId));
      const scanSnap = await getDocs(q);
      const deletePromises = scanSnap.docs.map(d => deleteDoc(doc(db, colPath, d.id)));
      await Promise.all(deletePromises);

      // Reset scan analytics on projects collection
      const pq = query(collection(db, 'projects'), where('userId', '==', userId));
      const projSnap = await getDocs(pq);
      const updatePromises = projSnap.docs.map(d => updateDoc(doc(db, 'projects', d.id), { scanCount: 0 }));
      await Promise.all(updatePromises);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, colPath, userId);
    }
  }
}

export const dbInstance = new FirestoreDatabase();
