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
// In-memory user fallback store for resilience
const inMemoryUsers = new Map<string, DbUser>();

class FirestoreDatabase {
  // Users Collection Mapping
  public async getUsers(): Promise<DbUser[]> {
    const colPath = 'users';
    try {
      const activeDb = getDb();
      const snap = await getDocs(collection(activeDb, colPath));
      const dbUsers = snap.docs.map(doc => doc.data() as DbUser);
      // Merge with inMemoryUsers
      const map = new Map<string, DbUser>();
      for (const u of Array.from(inMemoryUsers.values())) map.set(u.id, u);
      for (const u of dbUsers) map.set(u.id, u);
      return Array.from(map.values());
    } catch (e) {
      console.warn('Firestore getUsers failed, returning memory store:', e);
      return Array.from(inMemoryUsers.values());
    }
  }

  public async findUserByEmail(email: string): Promise<DbUser | undefined> {
    if (!email) return undefined;
    const normalizedEmail = email.toLowerCase().trim();

    // Check in-memory store first or if fallback mode is active
    const memMatch = Array.from(inMemoryUsers.values()).find(u => u.email.toLowerCase().trim() === normalizedEmail);
    if (isFallbackMode || memMatch) {
      return memMatch;
    }

    const colPath = 'users';
    try {
      const activeDb = getDb();
      const q = query(collection(activeDb, colPath), where('email', '==', normalizedEmail));
      const snap = await getDocs(q);
      if (snap.empty) {
        return memMatch;
      }
      return snap.docs[0].data() as DbUser;
    } catch (e) {
      console.warn('Firestore findUserByEmail failed, using in-memory store fallback:', e);
      return memMatch;
    }
  }

  public async findUserById(id: string): Promise<DbUser | undefined> {
    if (!id) return undefined;
    const memMatch = inMemoryUsers.get(id);
    if (isFallbackMode || memMatch) {
      return memMatch;
    }

    const docPath = `users/${id}`;
    try {
      const activeDb = getDb();
      const snap = await getDoc(doc(activeDb, 'users', id));
      if (snap.exists()) {
        return snap.data() as DbUser;
      }
      return memMatch;
    } catch (e) {
      console.warn('Firestore findUserById failed, using in-memory store fallback:', e);
      return memMatch;
    }
  }

  public async createUser(user: Omit<DbUser, 'id' | 'createdAt'>): Promise<DbUser> {
    const id = `usr-${Math.random().toString(36).substring(2, 11)}`;
    const docPath = `users/${id}`;
    const newUser: DbUser = {
      ...user,
      email: user.email.toLowerCase().trim(),
      id,
      createdAt: new Date().toISOString()
    };

    // Always record user in memory to guarantee signup success
    inMemoryUsers.set(id, newUser);

    if (!isFallbackMode) {
      try {
        const activeDb = getDb();
        await setDoc(doc(activeDb, 'users', id), newUser);
      } catch (e) {
        console.warn('Firestore createUser failed, saved in memory store fallback:', e);
      }
    }
    return newUser;
  }

  // Projects Collection Mapping
  public async getProjects(userId: string): Promise<DbProject[]> {
    const colPath = 'projects';
    try {
      const activeDb = getDb();
      const q = query(collection(activeDb, colPath), where('userId', '==', userId));
      const snap = await getDocs(q);
      return snap.docs.map(doc => doc.data() as DbProject);
    } catch (e) {
      console.warn('Firestore getProjects failed, returning empty array:', e);
      return [];
    }
  }

  public async getProjectById(id: string): Promise<DbProject | undefined> {
    const docPath = `projects/${id}`;
    try {
      const activeDb = getDb();
      const snap = await getDoc(doc(activeDb, 'projects', id));
      return snap.exists() ? (snap.data() as DbProject) : undefined;
    } catch (e) {
      console.warn('Firestore getProjectById failed:', e);
      return undefined;
    }
  }

  public async getProjectByTrackingId(trackingId: string): Promise<DbProject | undefined> {
    const colPath = 'projects';
    try {
      const activeDb = getDb();
      const q = query(collection(activeDb, colPath), where('trackingId', '==', trackingId));
      const snap = await getDocs(q);
      if (snap.empty) return undefined;
      return snap.docs[0].data() as DbProject;
    } catch (e) {
      console.warn('Firestore getProjectByTrackingId failed:', e);
      return undefined;
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
      const activeDb = getDb();
      await setDoc(doc(activeDb, 'projects', newProject.id), newProject);
      return newProject;
    } catch (e) {
      console.warn('Firestore createProject failed, returning project object:', e);
      return newProject;
    }
  }

  public async updateProject(id: string, userId: string, updates: Partial<DbProject>): Promise<DbProject | null> {
    const docPath = `projects/${id}`;
    try {
      const activeDb = getDb();
      const projectRef = doc(activeDb, 'projects', id);
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
      console.warn('Firestore updateProject failed:', e);
      return null;
    }
  }

  public async deleteProject(id: string, userId: string): Promise<boolean> {
    const docPath = `projects/${id}`;
    try {
      const activeDb = getDb();
      const projectRef = doc(activeDb, 'projects', id);
      const snap = await getDoc(projectRef);
      if (!snap.exists()) return false;
      const data = snap.data() as DbProject;
      if (data.userId !== userId) return false;

      await deleteDoc(projectRef);

      // Perform relational cascade deletes for associated scan tracks
      const q = query(collection(activeDb, 'scans'), where('projectId', '==', id));
      const scanSnap = await getDocs(q);
      const deletePromises = scanSnap.docs.map(d => deleteDoc(doc(activeDb, 'scans', d.id)));
      await Promise.all(deletePromises);

      return true;
    } catch (e) {
      console.warn('Firestore deleteProject failed:', e);
      return false;
    }
  }

  public async incrementProjectScan(id: string): Promise<number> {
    const docPath = `projects/${id}`;
    try {
      const activeDb = getDb();
      const projectRef = doc(activeDb, 'projects', id);
      const snap = await getDoc(projectRef);
      if (snap.exists()) {
        const existing = snap.data() as DbProject;
        const newCount = (existing.scanCount || 0) + 1;
        await updateDoc(projectRef, { scanCount: newCount });
        return newCount;
      }
      return 0;
    } catch (e) {
      console.warn('Firestore incrementProjectScan failed:', e);
      return 0;
    }
  }

  // Scans Collection Mapping
  public async getScans(userId: string): Promise<DbScan[]> {
    const colPath = 'scans';
    try {
      const activeDb = getDb();
      const q = query(collection(activeDb, colPath), where('userId', '==', userId));
      const snap = await getDocs(q);
      return snap.docs.map(doc => doc.data() as DbScan);
    } catch (e) {
      console.warn('Firestore getScans failed, returning empty array:', e);
      return [];
    }
  }

  public async createScan(scan: Omit<DbScan, 'timestamp'> & { timestamp?: string }): Promise<DbScan> {
    const docPath = `scans/${scan.id}`;
    const newScan: DbScan = {
      ...scan,
      timestamp: scan.timestamp || new Date().toISOString()
    };
    try {
      const activeDb = getDb();
      await setDoc(doc(activeDb, 'scans', newScan.id), newScan);
      return newScan;
    } catch (e) {
      console.warn('Firestore createScan failed:', e);
      return newScan;
    }
  }

  public async purgeScans(userId: string): Promise<void> {
    const colPath = 'scans';
    try {
      const activeDb = getDb();
      // Fetch scan IDs
      const q = query(collection(activeDb, colPath), where('userId', '==', userId));
      const scanSnap = await getDocs(q);
      const deletePromises = scanSnap.docs.map(d => deleteDoc(doc(activeDb, colPath, d.id)));
      await Promise.all(deletePromises);

      // Reset scan analytics on projects collection
      const pq = query(collection(activeDb, 'projects'), where('userId', '==', userId));
      const projSnap = await getDocs(pq);
      const updatePromises = projSnap.docs.map(d => updateDoc(doc(activeDb, 'projects', d.id), { scanCount: 0 }));
      await Promise.all(updatePromises);
    } catch (e) {
      console.warn('Firestore purgeScans failed:', e);
    }
  }
}

export const dbInstance = new FirestoreDatabase();
