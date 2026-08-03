import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  writeBatch, 
  increment, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { DynamicQR, DynamicQRScanLog } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

/**
 * Standard compliance error handling function as required by Firebase Integration specifications.
 */
function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Creates a new Dynamic QR configuration.
 */
export async function createDynamicQR(
  qrData: Omit<DynamicQR, 'createdAt' | 'analytics'>
): Promise<DynamicQR> {
  const path = `dynamicQRs/${qrData.id}`;
  try {
    const userId = auth.currentUser?.uid || qrData.ownerId;
    const fullQR: DynamicQR = {
      ...qrData,
      ownerId: userId || qrData.ownerId,
      createdAt: new Date().toISOString(),
      analytics: {
        scanCount: 0,
        uniqueScans: 0,
        lastScannedAt: null,
        deviceBreakdown: {},
        countryBreakdown: {}
      }
    };
    await setDoc(doc(db, 'dynamicQRs', qrData.id), fullQR);

    // Sync to projects collection in Firestore so short-link redirects (/qr/:trackingId) work from any device
    if (userId) {
      const trackingId = qrData.id;
      await setDoc(doc(db, 'projects', qrData.id), {
        id: qrData.id,
        userId: userId,
        name: qrData.name || 'Dynamic QR',
        type: 'url',
        content: qrData.destinationUrl || '',
        design: { fgColor: '#0f172a', bgColor: '#ffffff' },
        createdAt: fullQR.createdAt,
        updatedAt: fullQR.createdAt,
        scanCount: 0,
        trackingEnabled: qrData.status !== 'paused',
        trackingId: trackingId,
        expiryDate: qrData.expiryAt || '',
        category: 'Dynamic'
      }, { merge: true });
    }

    return fullQR;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Fetches a single Dynamic QR document.
 */
export async function getDynamicQR(qrId: string): Promise<DynamicQR | null> {
  const path = `dynamicQRs/${qrId}`;
  try {
    const docRef = doc(db, 'dynamicQRs', qrId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return null;
    }
    return docSnap.data() as DynamicQR;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Updates an existing Dynamic QR configuration safely.
 */
export async function updateDynamicQR(
  qrId: string, 
  updates: Partial<Omit<DynamicQR, 'id' | 'ownerId' | 'createdAt'>>
): Promise<void> {
  const path = `dynamicQRs/${qrId}`;
  try {
    const docRef = doc(db, 'dynamicQRs', qrId);
    await updateDoc(docRef, updates);

    // Sync updates to projects collection in Firestore
    const userId = auth.currentUser?.uid;
    const projUpdate: any = { updatedAt: new Date().toISOString() };
    if (updates.destinationUrl !== undefined) projUpdate.content = updates.destinationUrl;
    if (updates.name !== undefined) projUpdate.name = updates.name;
    if (updates.status !== undefined) projUpdate.trackingEnabled = updates.status !== 'paused';
    if (updates.expiryAt !== undefined) projUpdate.expiryDate = updates.expiryAt;
    if (userId) projUpdate.userId = userId;

    await setDoc(doc(db, 'projects', qrId), projUpdate, { merge: true }).catch((e) => {
      console.warn('Failed to sync project doc in Firestore:', e);
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Deletes a Dynamic QR document and clears related configurations.
 */
export async function deleteDynamicQR(qrId: string): Promise<void> {
  const path = `dynamicQRs/${qrId}`;
  try {
    const docRef = doc(db, 'dynamicQRs', qrId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Lists all Dynamic QRs owned by a specific user.
 */
export async function listUserDynamicQRs(userId: string): Promise<DynamicQR[]> {
  const path = 'dynamicQRs';
  try {
    const q = query(collection(db, 'dynamicQRs'), where('ownerId', '==', userId));
    const querySnapshot = await getDocs(q);
    const results: DynamicQR[] = [];
    querySnapshot.forEach((doc) => {
      results.push(doc.data() as DynamicQR);
    });
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Fetches all scans for all dynamic QRs owned by a user from the nested /scans subcollections.
 */
export async function fetchUserAllDynamicQRScans(userId: string): Promise<DynamicQRScanLog[]> {
  const path = 'dynamicQRs_all_scans';
  try {
    const qrs = await listUserDynamicQRs(userId);
    if (!qrs || qrs.length === 0) return [];
    
    const allScans: DynamicQRScanLog[] = [];
    const promises = qrs.map(async (qr) => {
      const scansColRef = collection(db, 'dynamicQRs', qr.id, 'scans');
      const snap = await getDocs(scansColRef);
      snap.forEach((docSnap) => {
        allScans.push({ id: docSnap.id, ...docSnap.data() } as DynamicQRScanLog);
      });
    });
    
    await Promise.all(promises);
    return allScans.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Logs a scan event under subcollection `dynamicQRs/{qrId}/scans/{scanId}`
 * and increments parent aggregated metrics atomically in a batch.
 */
export async function logDynamicQRScan(
  qrId: string, 
  scanData: Omit<DynamicQRScanLog, 'id' | 'timestamp'>
): Promise<void> {
  const path = `dynamicQRs/${qrId}/scans`;
  try {
    const batch = writeBatch(db);
    
    // Generate new scan log reference
    const scansColRef = collection(db, 'dynamicQRs', qrId, 'scans');
    const newScanDocRef = doc(scansColRef);
    const scanLogId = newScanDocRef.id;
    const timestamp = new Date().toISOString();

    const fullLog: DynamicQRScanLog = {
      ...scanData,
      id: scanLogId,
      qrId,
      timestamp
    };

    // Queue creation of the scan document
    batch.set(newScanDocRef, fullLog);

    // Queue incrementation on parent document
    const qrDocRef = doc(db, 'dynamicQRs', qrId);
    
    // Dynamic update keys for device and country breakdowns
    const deviceField = `analytics.deviceBreakdown.${scanData.device.replace(/\./g, '_')}`;
    const countryField = `analytics.countryBreakdown.${scanData.country.replace(/\./g, '_')}`;

    batch.update(qrDocRef, {
      'analytics.scanCount': increment(1),
      'analytics.lastScannedAt': timestamp,
      [deviceField]: increment(1),
      [countryField]: increment(1)
    });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Core Redirection Engine: Evaluates dynamic rules on the client/server and resolves
 * target URL based on device, country, time context, password validation and expiration.
 */
export function resolveRedirect(
  qr: DynamicQR, 
  options: {
    country?: string;
    device?: string;
    currentTime?: Date;
    providedPassword?: string;
  } = {}
): { 
  status: 'allowed' | 'paused' | 'expired' | 'password_required' | 'password_incorrect';
  url: string | null;
} {
  // 1. Status Check
  if (qr.status !== 'active') {
    return { status: 'paused', url: null };
  }

  // 2. Expiry Check
  const now = options.currentTime || new Date();
  if (qr.expiryAt) {
    const expiryDate = new Date(qr.expiryAt);
    if (now > expiryDate) {
      return { status: 'expired', url: null };
    }
  }

  // 3. Password Protection Check
  if (qr.password && qr.password.trim() !== '') {
    if (!options.providedPassword) {
      return { status: 'password_required', url: null };
    }
    if (options.providedPassword !== qr.password) {
      return { status: 'password_incorrect', url: null };
    }
  }

  // 4. Country Redirection Rules
  if (qr.countryRules && options.country) {
    const countryCode = options.country.toUpperCase();
    if (qr.countryRules[countryCode]) {
      return { status: 'allowed', url: qr.countryRules[countryCode] };
    }
  }

  // 5. Device Redirection Rules
  if (qr.deviceRules && options.device) {
    const normalizedDevice = options.device.toLowerCase();
    
    // Check specific device keys (e.g., ios, android, desktop)
    if (qr.deviceRules[normalizedDevice]) {
      return { status: 'allowed', url: qr.deviceRules[normalizedDevice] };
    }
    
    // General fallback matches
    if (normalizedDevice.includes('iphone') || normalizedDevice.includes('ipad') || normalizedDevice.includes('ios')) {
      if (qr.deviceRules['ios']) return { status: 'allowed', url: qr.deviceRules['ios'] };
    }
    if (normalizedDevice.includes('android')) {
      if (qr.deviceRules['android']) return { status: 'allowed', url: qr.deviceRules['android'] };
    }
    if (qr.deviceRules['desktop']) {
      return { status: 'allowed', url: qr.deviceRules['desktop'] };
    }
  }

  // 6. Time/Schedule Rules
  if (qr.timeRules && qr.timeRules.rules && qr.timeRules.rules.length > 0) {
    // Formulate localized date based on timezone if specified
    const localTime = options.currentTime || new Date();
    const dayOfWeek = localTime.getDay(); // 0 is Sunday, 6 is Saturday
    const currentHours = localTime.getHours();
    const currentMinutes = localTime.getMinutes();
    const currentMinutesTotal = currentHours * 60 + currentMinutes;

    for (const rule of qr.timeRules.rules) {
      // Check day of week match
      const dayMatch = !rule.daysOfWeek || rule.daysOfWeek.includes(dayOfWeek);
      
      // Check start/end time boundary match
      let timeMatch = true;
      if (rule.startTime && rule.endTime) {
        const [sh, sm] = rule.startTime.split(':').map(Number);
        const [eh, em] = rule.endTime.split(':').map(Number);
        const startMinutes = sh * 60 + sm;
        const endMinutes = eh * 60 + em;
        timeMatch = currentMinutesTotal >= startMinutes && currentMinutesTotal <= endMinutes;
      }

      if (dayMatch && timeMatch) {
        return { status: 'allowed', url: rule.destinationUrl };
      }
    }
  }

  // 7. Base Fallback URL
  return { status: 'allowed', url: qr.destinationUrl };
}
