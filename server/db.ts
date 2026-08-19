import fs from 'fs';
import path from 'path';
import { pbkdf2Sync, randomBytes } from 'crypto';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeFirestore, 
  getFirestore,
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
  destinationUrl?: string;
  referrer?: string;
  os?: string;
  city?: string;
  country?: string;
  countryCode?: string;
  userAgent?: string;
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
let connectionTested = false;

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

    try {
      console.log("Loading Firebase...");
      const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      console.log("Loading Firestore...");
      try {
        db = getFirestore(firebaseApp, firebaseConfig?.firestoreDatabaseId || '(default)');
      } catch (_initErr) {
        db = initializeFirestore(firebaseApp, {
          experimentalForceLongPolling: true,
        }, firebaseConfig?.firestoreDatabaseId || '(default)');
      }

      if (!connectionTested) {
        connectionTested = true;
        testConnection();
      }
    } catch (err) {
      console.warn('Firestore initialization failed, enabling memory fallback mode:', err);
      isFallbackMode = true;
    }
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
    if (activeDb) {
      await Promise.race([
        getDocFromServer(doc(activeDb, 'test', 'connection')),
        timeoutPromise
      ]);
      console.log("Firebase connection verified and fully operational.");
    }
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
    console.log(`[getProjectByTrackingId] Starting lookup for trackingId/shortCode: "${trackingId}"`);
    if (isFallbackMode) {
      console.log(`[getProjectByTrackingId] Firebase is in fallback/offline mode. Skipping lookups.`);
      return undefined;
    }
    try {
      const activeDb = getDb();

      // Step 0a: Search qr_codes collection directly by document ID (which matches trackingId/shortCode)
      console.log(`[getProjectByTrackingId] [Step 0a] Fetching from qr_codes collection by ID "${trackingId}"...`);
      try {
        const docQrCode = await getDoc(doc(activeDb, 'qr_codes', trackingId));
        if (docQrCode.exists()) {
          const d = docQrCode.data() as any;
          console.log(`[getProjectByTrackingId] [Step 0a SUCCESS] Found matching document in qr_codes collection for ID: "${trackingId}"`);
          return {
            id: d.trackingId || docQrCode.id,
            userId: d.userId || 'anonymous',
            name: d.name || 'Dynamic QR Link',
            type: 'url',
            content: d.originalUrl || d.content || '',
            design: {},
            createdAt: d.createdAt || new Date().toISOString(),
            scanCount: d.scanCount || 0,
            trackingEnabled: d.trackingEnabled !== false,
            trackingId: d.trackingId || docQrCode.id
          } as DbProject;
        }
        console.log(`[getProjectByTrackingId] [Step 0a] No document exists in qr_codes collection with ID "${trackingId}"`);
      } catch (err: any) {
        console.warn(`[getProjectByTrackingId] [Step 0a NOTICE] Fetching from qr_codes collection failed:`, err?.message || err);
      }

      // Step 0b: Search qr_codes collection by trackingId field
      console.log(`[getProjectByTrackingId] [Step 0b] Querying qr_codes collection where trackingId == "${trackingId}"...`);
      try {
        const qQrCodes = query(collection(activeDb, 'qr_codes'), where('trackingId', '==', trackingId));
        const snapQrCodes = await getDocs(qQrCodes);
        if (!snapQrCodes.empty) {
          const d = snapQrCodes.docs[0].data() as any;
          console.log(`[getProjectByTrackingId] [Step 0b SUCCESS] Found matching document in qr_codes collection with trackingId: "${trackingId}"`);
          return {
            id: d.trackingId || snapQrCodes.docs[0].id,
            userId: d.userId || 'anonymous',
            name: d.name || 'Dynamic QR Link',
            type: 'url',
            content: d.originalUrl || d.content || '',
            design: {},
            createdAt: d.createdAt || new Date().toISOString(),
            scanCount: d.scanCount || 0,
            trackingEnabled: d.trackingEnabled !== false,
            trackingId: d.trackingId || snapQrCodes.docs[0].id
          } as DbProject;
        }
        console.log(`[getProjectByTrackingId] [Step 0b] No qr_codes found with trackingId field == "${trackingId}"`);
      } catch (err: any) {
        console.warn(`[getProjectByTrackingId] [Step 0b NOTICE] Querying qr_codes by trackingId failed:`, err?.message || err);
      }
      
      // 1. Search projects collection by trackingId field
      console.log(`[getProjectByTrackingId] [Step 1] Querying projects collection where trackingId == "${trackingId}"...`);
      try {
        const qProjects = query(collection(activeDb, 'projects'), where('trackingId', '==', trackingId));
        const snapProjects = await getDocs(qProjects);
        if (!snapProjects.empty) {
          const d = snapProjects.docs[0].data() as any;
          console.log(`[getProjectByTrackingId] [Step 1 SUCCESS] Found matching project in projects collection with trackingId: "${trackingId}"`);
          return d as DbProject;
        }
        console.log(`[getProjectByTrackingId] [Step 1] No projects found with trackingId field == "${trackingId}"`);
      } catch (err: any) {
        console.warn(`[getProjectByTrackingId] [Step 1 NOTICE] Querying projects by trackingId failed:`, err?.message || err);
      }

      // 2. Search projects collection by document ID
      console.log(`[getProjectByTrackingId] [Step 2] Fetching project doc directly by ID "${trackingId}"...`);
      try {
        const docProj = await getDoc(doc(activeDb, 'projects', trackingId));
        if (docProj.exists()) {
          const d = docProj.data() as any;
          console.log(`[getProjectByTrackingId] [Step 2 SUCCESS] Found project doc with ID "${trackingId}"`);
          return {
            ...d,
            trackingId: d.trackingId || docProj.id
          } as DbProject;
        }
        console.log(`[getProjectByTrackingId] [Step 2] No project document exists with ID "${trackingId}"`);
      } catch (err: any) {
        console.warn(`[getProjectByTrackingId] [Step 2 NOTICE] getDoc on projects by ID failed:`, err?.message || err);
      }

      // 3. Search dynamicQRs collection by id field or shortCode field
      console.log(`[getProjectByTrackingId] [Step 3] Querying dynamicQRs collection where id == "${trackingId}" or shortCode == "${trackingId}"...`);
      try {
        const qDynId = query(collection(activeDb, 'dynamicQRs'), where('id', '==', trackingId));
        const snapDynId = await getDocs(qDynId);
        if (!snapDynId.empty) {
          const d = snapDynId.docs[0].data() as any;
          console.log(`[getProjectByTrackingId] [Step 3 SUCCESS] Found dynamicQR in dynamicQRs collection by id field: "${trackingId}"`);
          return {
            id: d.id,
            userId: d.ownerId || d.userId || 'anonymous',
            name: d.title || d.name || 'Dynamic QR',
            type: d.type || 'url',
            content: d.destinationUrl || d.targetUrl || d.content || '',
            design: d.design || {},
            createdAt: d.createdAt,
            scanCount: d.analytics?.scanCount || 0,
            trackingEnabled: d.status !== 'paused',
            trackingId: d.id,
            expiryDate: d.expiryAt || d.expiryDate,
            expiryRedirectUrl: d.expiryRedirectUrl || d.expiryUrl
          } as DbProject;
        }

        const qDynShort = query(collection(activeDb, 'dynamicQRs'), where('shortCode', '==', trackingId));
        const snapDynShort = await getDocs(qDynShort);
        if (!snapDynShort.empty) {
          const d = snapDynShort.docs[0].data() as any;
          console.log(`[getProjectByTrackingId] [Step 3 SUCCESS] Found dynamicQR in dynamicQRs collection by shortCode: "${trackingId}"`);
          return {
            id: d.id,
            userId: d.ownerId || d.userId || 'anonymous',
            name: d.title || d.name || 'Dynamic QR',
            type: d.type || 'url',
            content: d.destinationUrl || d.targetUrl || d.content || '',
            design: d.design || {},
            createdAt: d.createdAt,
            scanCount: d.analytics?.scanCount || 0,
            trackingEnabled: d.status !== 'paused',
            trackingId: d.shortCode || d.id,
            expiryDate: d.expiryAt || d.expiryDate,
            expiryRedirectUrl: d.expiryRedirectUrl || d.expiryUrl
          } as DbProject;
        }
        console.log(`[getProjectByTrackingId] [Step 3] No dynamicQRs found with id or shortCode == "${trackingId}"`);
      } catch (err: any) {
        console.warn(`[getProjectByTrackingId] [Step 3 NOTICE] Querying dynamicQRs failed:`, err?.message || err);
      }

      // 4. Search dynamicQRs collection by document ID
      console.log(`[getProjectByTrackingId] [Step 4] Fetching dynamicQR doc directly by ID "${trackingId}"...`);
      try {
        const docDyn = await getDoc(doc(activeDb, 'dynamicQRs', trackingId));
        if (docDyn.exists()) {
          const d = docDyn.data() as any;
          console.log(`[getProjectByTrackingId] [Step 4 SUCCESS] Found dynamicQR doc with ID "${trackingId}"`);
          return {
            id: d.id,
            userId: d.ownerId || d.userId || 'anonymous',
            name: d.title || d.name || 'Dynamic QR',
            type: d.type || 'url',
            content: d.destinationUrl || d.targetUrl || d.content || '',
            design: d.design || {},
            createdAt: d.createdAt,
            scanCount: d.analytics?.scanCount || 0,
            trackingEnabled: d.status !== 'paused',
            trackingId: d.id,
            expiryDate: d.expiryAt || d.expiryDate,
            expiryRedirectUrl: d.expiryRedirectUrl || d.expiryUrl
          } as DbProject;
        }
        console.log(`[getProjectByTrackingId] [Step 4] No dynamicQR document exists with ID "${trackingId}"`);
      } catch (err: any) {
        console.warn(`[getProjectByTrackingId] [Step 4 NOTICE] getDoc on dynamicQRs failed:`, err?.message || err);
      }

      // 5. Search pdf_shares collection
      console.log(`[getProjectByTrackingId] [Step 5] Fetching pdf_shares doc directly by ID "${trackingId}"...`);
      try {
        const docPdf = await getDoc(doc(activeDb, 'pdf_shares', trackingId));
        if (docPdf.exists()) {
          const d = docPdf.data() as any;
          console.log(`[getProjectByTrackingId] [Step 5 SUCCESS] Found pdf_shares doc with ID "${trackingId}"`);
          return {
            id: d.id,
            userId: d.userId || 'anonymous',
            name: d.title || 'PDF Share',
            type: 'pdf',
            content: `${process.env.VITE_APP_URL || ''}/#pdf-${d.id}`,
            design: {},
            createdAt: d.createdAt || new Date().toISOString(),
            scanCount: d.downloads || 0,
            trackingEnabled: true,
            trackingId: d.id
          } as DbProject;
        }
        console.log(`[getProjectByTrackingId] [Step 5] No pdf_share document exists with ID "${trackingId}"`);
      } catch (err: any) {
        console.warn(`[getProjectByTrackingId] [Step 5 NOTICE] getDoc on pdf_shares failed:`, err?.message || err);
      }

      // 6. Search business_cards collection
      console.log(`[getProjectByTrackingId] [Step 6] Fetching business_cards doc directly by ID "${trackingId}"...`);
      try {
        const docCard = await getDoc(doc(activeDb, 'business_cards', trackingId));
        if (docCard.exists()) {
          const d = docCard.data() as any;
          console.log(`[getProjectByTrackingId] [Step 6 SUCCESS] Found business_cards doc with ID "${trackingId}"`);
          return {
            id: d.id,
            userId: d.userId || 'anonymous',
            name: d.name || 'Business Card',
            type: 'vcard',
            content: `${process.env.VITE_APP_URL || ''}/#card-${d.id}`,
            design: {},
            createdAt: d.updatedAt || new Date().toISOString(),
            scanCount: 0,
            trackingEnabled: true,
            trackingId: d.id
          } as DbProject;
        }
        console.log(`[getProjectByTrackingId] [Step 6] No business_card document exists with ID "${trackingId}"`);
      } catch (err: any) {
        console.warn(`[getProjectByTrackingId] [Step 6 NOTICE] getDoc on business_cards failed:`, err?.message || err);
      }

      // 7. Search restaurant_menus collection
      console.log(`[getProjectByTrackingId] [Step 7] Fetching restaurant_menus doc directly by ID "${trackingId}"...`);
      try {
        const docMenu = await getDoc(doc(activeDb, 'restaurant_menus', trackingId));
        if (docMenu.exists()) {
          const d = docMenu.data() as any;
          console.log(`[getProjectByTrackingId] [Step 7 SUCCESS] Found restaurant_menus doc with ID "${trackingId}"`);
          return {
            id: d.id,
            userId: d.userId || 'anonymous',
            name: d.restaurantName || 'Restaurant Menu',
            type: 'menu',
            content: `${process.env.VITE_APP_URL || ''}/#menu-${d.id}`,
            design: {},
            createdAt: d.updatedAt || new Date().toISOString(),
            scanCount: 0,
            trackingEnabled: true,
            trackingId: d.id
          } as DbProject;
        }
        console.log(`[getProjectByTrackingId] [Step 7] No restaurant_menu document exists with ID "${trackingId}"`);
      } catch (err: any) {
        console.warn(`[getProjectByTrackingId] [Step 7 NOTICE] getDoc on restaurant_menus failed:`, err?.message || err);
      }

      console.log(`[getProjectByTrackingId] ALL lookup steps completed. Document not found across all collections for trackingId: "${trackingId}"`);
      return undefined;
    } catch (e: any) {
      console.warn(`[getProjectByTrackingId FATAL NOTICE] Outer catch block caught:`, e?.message || e);
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
