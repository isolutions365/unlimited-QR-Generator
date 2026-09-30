import express from 'express';
import crypto from 'crypto';
import path from 'path';
import net from 'net';
import Busboy from 'busboy';
import { adminAuth, adminDb, getStorageBucket } from './firebase-admin';

// Shared constant for maximum PDF file size (10 MB = 10,485,760 bytes)
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

// Exact versioned scrypt parameters
export const SCRYPT_PARAMS = {
  version: 'scrypt_v1',
  N: 16384, // 2^14 CPU/memory cost
  r: 8,     // Block size
  p: 1,     // Parallelization
  keyLen: 64, // 64 bytes (512 bits) derived key
  saltLen: 16, // 16 bytes (128 bits) random salt
  maxmem: 32 * 1024 * 1024 // 32 MB max memory limit
} as const;

// Rate limiter configuration:
// 5 attempts allowed within a 15-minute window before triggering a 15-minute lockout
export const RATE_LIMIT_CONFIG = {
  MAX_ATTEMPTS: 5,
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  LOCKOUT_MS: 15 * 60 * 1000, // 15 minutes
  COLLECTION: 'pdf_share_rate_limits'
} as const;

// Keyed HMAC secret loaded from approved server environment configuration
// Never exposed to client bundle, logs, Firestore, or API responses
let cachedRateLimitSecret: string | null = null;

export function getRateLimitSecret(): string {
  if (cachedRateLimitSecret) return cachedRateLimitSecret;
  const envSecret = process.env.RATE_LIMIT_SECRET || process.env.SESSION_SECRET;
  if (envSecret && envSecret.trim()) {
    cachedRateLimitSecret = envSecret.trim();
    return cachedRateLimitSecret;
  }
  // Fallback server-only random secret in dev/test
  cachedRateLimitSecret = crypto.randomBytes(32).toString('hex');
  return cachedRateLimitSecret;
}

export function setRateLimitSecretForTesting(secret: string | null) {
  cachedRateLimitSecret = secret;
}

/**
 * Computes an opaque, irreversible rate-limit document key using HMAC-SHA256.
 * Binds the share ID and trusted client IP without persisting raw IP addresses or password data.
 */
export function computeRateLimitDocId(shareId: string, clientIp: string): string {
  const secret = getRateLimitSecret();
  const cleanShareId = shareId.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 64);
  const clientHmac = crypto.createHmac('sha256', secret).update(clientIp).digest('hex').substring(0, 32);
  return `${cleanShareId}_${clientHmac}`;
}

/**
 * Authoritative client-IP resolution function.
 * Audited for Google Cloud Run and Firebase App Hosting reverse proxy topology:
 * The Google Front End (GFE) appends the true remote client IP at the end of the X-Forwarded-For chain.
 * - Selects the trusted hop (the last entry appended by the reverse proxy)
 * - Protects against attacker-supplied spoofed prefixes in X-Forwarded-For
 * - Normalizes IPv4-mapped IPv6 (::ffff:192.0.2.1 -> 192.0.2.1)
 * - Trims whitespace and strips any accidental ports
 * - Validates with net.isIP()
 * - Falls back safely to socket remoteAddress or 127.0.0.1 for local/direct connections
 */
export function extractTrustedClientIp(req: express.Request): string {
  const rawForwarded = req.headers['x-forwarded-for'];
  let candidate = '';

  if (typeof rawForwarded === 'string' && rawForwarded.trim()) {
    const hops = rawForwarded.split(',').map((h) => h.trim()).filter(Boolean);
    // In GFE/Cloud Run, the trusted reverse proxy appends the true client IP at the end of the chain
    candidate = hops[hops.length - 1] || '';
  } else if (Array.isArray(rawForwarded) && rawForwarded.length > 0) {
    candidate = (rawForwarded[rawForwarded.length - 1] || '').trim();
  }

  if (!candidate) {
    candidate = req.ip || req.socket?.remoteAddress || '127.0.0.1';
  }

  // Normalize IPv4-mapped IPv6 variants (e.g. ::ffff:192.168.1.1)
  if (candidate.startsWith('::ffff:')) {
    candidate = candidate.substring(7);
  }

  // Strip port if IPv4 with port (e.g. 192.168.1.1:8080)
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/.test(candidate)) {
    candidate = candidate.split(':')[0];
  }

  // Validate that candidate is a valid IP address
  if (!net.isIP(candidate)) {
    const fallback = req.socket?.remoteAddress || '127.0.0.1';
    const cleanFallback = fallback.startsWith('::ffff:') ? fallback.substring(7) : fallback;
    return net.isIP(cleanFallback) ? cleanFallback : '127.0.0.1';
  }

  return candidate;
}

export async function checkRateLimit(
  shareId: string,
  clientIp: string
): Promise<{ allowed: boolean; retryAfterSeconds?: number }> {
  try {
    const docId = computeRateLimitDocId(shareId, clientIp);
    const docRef = adminDb.collection(RATE_LIMIT_CONFIG.COLLECTION).doc(docId);
    const snap = await docRef.get();

    if (!snap || !snap.exists) {
      return { allowed: true };
    }

    const data = snap.data();
    if (!data) return { allowed: true };

    const now = Date.now();
    const lockUntil = Number(data.lockUntil) || 0;

    // Check active lockout
    if (lockUntil > now) {
      const retryAfterSeconds = Math.ceil((lockUntil - now) / 1000);
      return { allowed: false, retryAfterSeconds };
    }

    return { allowed: true };
  } catch (err) {
    console.error('[RateLimit] Error checking distributed rate limit:', (err as any)?.message || err);
    return { allowed: true };
  }
}

export async function recordFailedAttempt(
  shareId: string,
  clientIp: string
): Promise<{ locked: boolean; retryAfterSeconds?: number }> {
  const docId = computeRateLimitDocId(shareId, clientIp);
  const docRef = adminDb.collection(RATE_LIMIT_CONFIG.COLLECTION).doc(docId);
  const now = Date.now();

  try {
    return await adminDb.runTransaction(async (transaction: any) => {
      const snap = await transaction.get(docRef);
      const data = snap && snap.exists ? snap.data() : null;

      let attempts = 0;
      let firstAttemptAt = now;
      let lockUntil = 0;

      if (data) {
        const prevFirst = Number(data.firstAttemptAt) || now;
        const prevLock = Number(data.lockUntil) || 0;

        // If previous lockout has expired and we're past the window, reset
        if (prevLock <= now && now - prevFirst > RATE_LIMIT_CONFIG.WINDOW_MS) {
          attempts = 1;
          firstAttemptAt = now;
        } else {
          attempts = (Number(data.attempts) || 0) + 1;
          firstAttemptAt = prevFirst;
        }
      } else {
        attempts = 1;
        firstAttemptAt = now;
      }

      if (attempts >= RATE_LIMIT_CONFIG.MAX_ATTEMPTS) {
        lockUntil = now + RATE_LIMIT_CONFIG.LOCKOUT_MS;
      }

      // TTL: 24 hours after last attempt
      const expireAt = new Date(now + 24 * 60 * 60 * 1000);

      // Save rate-limit state: note NO raw IP and NO password data are stored
      const record = {
        attempts,
        lockUntil,
        firstAttemptAt,
        lastAttemptAt: now,
        expireAt
      };

      transaction.set(docRef, record);

      if (lockUntil > now) {
        const retryAfterSeconds = Math.ceil((lockUntil - now) / 1000);
        return { locked: true, retryAfterSeconds };
      }

      return { locked: false };
    });
  } catch (err) {
    console.error('[RateLimit] Error updating distributed rate limit transaction:', (err as any)?.message || err);
    return { locked: false };
  }
}

export async function resetRateLimit(shareId: string, clientIp: string): Promise<void> {
  try {
    const docId = computeRateLimitDocId(shareId, clientIp);
    const docRef = adminDb.collection(RATE_LIMIT_CONFIG.COLLECTION).doc(docId);
    await docRef.delete();
  } catch (err) {
    console.error('[RateLimit] Error resetting distributed rate limit:', (err as any)?.message || err);
  }
}

function deriveScryptKey(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(
      password,
      salt,
      SCRYPT_PARAMS.keyLen,
      {
        N: SCRYPT_PARAMS.N,
        r: SCRYPT_PARAMS.r,
        p: SCRYPT_PARAMS.p,
        maxmem: SCRYPT_PARAMS.maxmem
      },
      (err, derivedKey) => {
        if (err) return reject(err);
        resolve(derivedKey as Buffer);
      }
    );
  });
}

// Password hashing utilities using Node.js crypto.scrypt (asynchronous, non-event-loop-blocking)
export async function hashSharePassword(password: string): Promise<{ salt: string; hash: string; version: string }> {
  const salt = crypto.randomBytes(SCRYPT_PARAMS.saltLen).toString('hex');
  const derivedKey = await deriveScryptKey(password, salt);
  return {
    salt,
    hash: derivedKey.toString('hex'),
    version: SCRYPT_PARAMS.version
  };
}

export async function verifySharePassword(
  password: string,
  salt: string,
  expectedHash: string,
  hashVersion: string = SCRYPT_PARAMS.version
): Promise<boolean> {
  if (!password || !salt || !expectedHash) return false;
  if (hashVersion !== SCRYPT_PARAMS.version) {
    return false; // Reject legacy or unsupported hash versions
  }
  try {
    const derivedKey = await deriveScryptKey(password, salt);
    const expectedBuffer = Buffer.from(expectedHash, 'hex');
    if (derivedKey.length !== expectedBuffer.length) return false;
    return crypto.timingSafeEqual(derivedKey, expectedBuffer);
  } catch (_err) {
    return false;
  }
}

// Helper to authenticate user strictly from Firebase ID Bearer token
export async function authenticateRequestUser(req: express.Request): Promise<{ uid: string; email?: string } | null> {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return null;
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : authHeader.trim();
  if (!token) return null;

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    if (decoded && decoded.uid) {
      return { uid: decoded.uid, email: decoded.email };
    }
  } catch (_e) {
    // In test environment, support deterministic test tokens
    if (process.env.NODE_ENV === 'test' && token.startsWith('test-token-')) {
      return { uid: token.replace('test-token-', '') };
    }
  }

  return null;
}

// Helper to sanitize filename to prevent CRLF injection, path traversal, or header tampering
export function sanitizeFileName(inputName: string): string {
  if (!inputName) return 'document.pdf';
  // Strip CRLF, null bytes, backslashes, quotes, and control chars
  const base = path.basename(inputName).replace(/[\r\n\0"'\\]/g, '_').replace(/[^a-zA-Z0-9._-]/g, '_');
  const clean = base.substring(0, 100);
  return clean.toLowerCase().endsWith('.pdf') ? clean : `${clean}.pdf`;
}

// Helper to parse multipart/form-data with streaming busboy parser
export interface ParsedUpload {
  fields: Record<string, string>;
  fileBuffer: Buffer;
  fileName: string;
  mimeType: string;
}

export function parseMultipartUpload(req: express.Request): Promise<ParsedUpload> {
  return new Promise((resolve, reject) => {
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      return reject(new Error('INVALID_CONTENT_TYPE'));
    }

    // Pre-check Content-Length if present (with 64KB margin for multipart boundary overhead)
    const rawContentLength = req.headers['content-length'];
    if (rawContentLength) {
      const parsedLength = parseInt(rawContentLength, 10);
      if (!isNaN(parsedLength) && parsedLength > MAX_FILE_SIZE_BYTES + 65536) {
        return reject(new Error('FILE_TOO_LARGE'));
      }
    }

    let busboy: any;
    try {
      busboy = Busboy({
        headers: req.headers,
        limits: {
          fileSize: MAX_FILE_SIZE_BYTES,
          files: 1,
          fields: 20
        }
      });
    } catch (bbErr) {
      return reject(bbErr);
    }

    const fields: Record<string, string> = {};
    const fileChunks: Buffer[] = [];
    let fileUploaded = false;
    let fileName = 'document.pdf';
    let mimeType = 'application/pdf';
    let fileTooLarge = false;
    let totalBytesReceived = 0;

    busboy.on('field', (name: string, val: string) => {
      fields[name] = val;
    });

    busboy.on('file', (_name: string, stream: NodeJS.ReadableStream, info: any) => {
      fileUploaded = true;
      fileName = info.filename || 'document.pdf';
      mimeType = info.mimeType || 'application/pdf';

      stream.on('data', (chunk: Buffer) => {
        totalBytesReceived += chunk.length;
        if (totalBytesReceived > MAX_FILE_SIZE_BYTES) {
          fileTooLarge = true;
          (stream as any).destroy?.();
          return;
        }
        fileChunks.push(chunk);
      });

      stream.on('limit', () => {
        fileTooLarge = true;
      });
    });

    busboy.on('finish', () => {
      if (fileTooLarge) {
        return reject(new Error('FILE_TOO_LARGE'));
      }
      if (!fileUploaded || fileChunks.length === 0) {
        return reject(new Error('NO_FILE'));
      }
      const combined = Buffer.concat(fileChunks);
      if (combined.length > MAX_FILE_SIZE_BYTES) {
        return reject(new Error('FILE_TOO_LARGE'));
      }
      resolve({
        fields,
        fileBuffer: combined,
        fileName,
        mimeType
      });
    });

    busboy.on('error', (err: any) => {
      reject(err);
    });

    req.pipe(busboy);
  });
}

export function createPdfSharingRouter(): express.Router {
  const router = express.Router();

  // 1. Create a new PDF Share (Multipart upload -> Cloud Storage + Firestore metadata)
  router.post('/api/pdf-shares', async (req, res) => {
    try {
      const user = await authenticateRequestUser(req);
      if (!user) {
        return res.status(401).json({ error: 'Authentication required to create a PDF share' });
      }

      let uploadResult: ParsedUpload;
      const isMultipart = (req.headers['content-type'] || '').includes('multipart/form-data');

      if (isMultipart) {
        try {
          uploadResult = await parseMultipartUpload(req);
        } catch (parseErr: any) {
          if (parseErr.message === 'FILE_TOO_LARGE') {
            return res.status(413).json({
              error: `File size exceeds the 10 MB maximum limit (10,485,760 bytes)`
            });
          }
          if (parseErr.message === 'NO_FILE') {
            return res.status(400).json({ error: 'File payload cannot be empty' });
          }
          return res.status(400).json({ error: 'Malformed multipart form data' });
        }
      } else {
        // Fallback for raw binary or structured JSON (e.g. from automated tests)
        const { title, description, fileName, fileBase64, password, expiryDate, maxDownloads, themeColor } = req.body || {};
        if (!fileBase64 || typeof fileBase64 !== 'string') {
          return res.status(400).json({ error: 'File payload is required' });
        }
        const commaIdx = fileBase64.indexOf(',');
        const rawBase64 = commaIdx !== -1 ? fileBase64.substring(commaIdx + 1) : fileBase64;
        const fileBuffer = Buffer.from(rawBase64, 'base64');

        uploadResult = {
          fields: {
            title: title || '',
            description: description || '',
            password: password || '',
            expiryDate: expiryDate || '',
            maxDownloads: maxDownloads ? String(maxDownloads) : '',
            themeColor: themeColor || 'indigo'
          },
          fileBuffer,
          fileName: fileName || 'document.pdf',
          mimeType: 'application/pdf'
        };
      }

      const { fileBuffer, fileName, fields } = uploadResult;

      // Validate non-empty
      if (fileBuffer.length === 0) {
        return res.status(400).json({ error: 'File payload cannot be empty' });
      }

      // Enforce authoritative 10 MB maximum size limit
      if (fileBuffer.length > MAX_FILE_SIZE_BYTES) {
        return res.status(413).json({
          error: `File size exceeds the 10 MB maximum limit (received ${(fileBuffer.length / (1024 * 1024)).toFixed(1)} MB)`
        });
      }

      // Validate PDF signature (%PDF-)
      const signature = fileBuffer.subarray(0, 5).toString('ascii');
      if (signature !== '%PDF-') {
        return res.status(415).json({
          error: 'Invalid file format: payload does not contain a valid %PDF- header signature'
        });
      }

      // Generate cryptographically random share identifier (128-bit entropy)
      const shareId = `pdf-${crypto.randomBytes(16).toString('hex')}`;
      const safeName = sanitizeFileName(fileName);
      const cleanTitle = (fields.title || safeName).trim().substring(0, 100);
      const cleanDesc = (fields.description || '').trim().substring(0, 300);

      // Handle password hashing if protected
      let isProtected = false;
      let passwordSalt: string | null = null;
      let passwordHash: string | null = null;
      let hashVersion: string | null = null;

      if (fields.password && typeof fields.password === 'string' && fields.password.trim().length > 0) {
        isProtected = true;
        const hashed = await hashSharePassword(fields.password.trim());
        passwordSalt = hashed.salt;
        passwordHash = hashed.hash;
        hashVersion = hashed.version;
      }

      // Cloud Storage persistence: private object at pdf_shares/{ownerUid}/{shareId}.pdf
      const bucket = getStorageBucket();
      const storageObjectPath = `pdf_shares/${user.uid}/${shareId}.pdf`;
      const fileRef = bucket.file(storageObjectPath);

      const expiresAt = fields.expiryDate ? new Date(fields.expiryDate).toISOString() : null;
      const maxDl = fields.maxDownloads && !isNaN(parseInt(fields.maxDownloads, 10)) ? parseInt(fields.maxDownloads, 10) : null;
      const themeColor = ['indigo', 'emerald', 'rose', 'amber'].includes(fields.themeColor) ? fields.themeColor : 'indigo';

      // Stage 1: Upload private object to Cloud Storage (with object metadata)
      await fileRef.save(fileBuffer, {
        contentType: 'application/pdf',
        metadata: {
          shareId,
          ownerUid: user.uid,
          originalFileName: safeName,
          fileSizeBytes: String(fileBuffer.length),
          createdAt: new Date().toISOString(),
          expiresAt: expiresAt || 'none'
        },
        resumable: false,
        validation: false
      });

      // Stage 2: Save metadata to Firestore using Admin SDK
      const metadata = {
        id: shareId,
        userId: user.uid,
        title: cleanTitle,
        description: cleanDesc,
        fileName: safeName,
        fileSize: `${(fileBuffer.length / (1024 * 1024)).toFixed(1)} MB`,
        fileSizeBytes: fileBuffer.length,
        createdAt: new Date().toISOString(),
        expiresAt,
        isProtected,
        passwordSalt,
        passwordHash,
        hashVersion,
        storageBucket: bucket.name || 'default',
        storageObjectPath,
        viewCount: 0,
        downloadCount: 0,
        maxDownloads: maxDl,
        themeColor,
        status: 'active'
      };

      try {
        await adminDb.collection('pdf_shares').doc(shareId).set(metadata);
      } catch (metaErr) {
        // Compensation: Delete uploaded Cloud Storage object if Firestore metadata write fails
        console.error('[PDF Sharing] Metadata persistence failed, executing storage compensation deletion:', metaErr);
        await fileRef.delete().catch((delErr: any) => {
          console.error('[PDF Sharing] Compensation delete failed:', delErr);
        });
        return res.status(500).json({ error: 'Failed to create document share metadata' });
      }

      // Return safe metadata (NEVER expose passwordSalt, passwordHash, hashVersion, or storageObjectPath)
      return res.status(201).json({
        id: shareId,
        shareUrl: `https://www.freeqrbarcodes.com/#pdf-${shareId}`,
        title: cleanTitle,
        description: cleanDesc,
        fileName: safeName,
        fileSize: metadata.fileSize,
        isProtected,
        expiresAt,
        maxDownloads: maxDl,
        themeColor,
        createdAt: metadata.createdAt
      });
    } catch (err: any) {
      console.error('[PDF Sharing] Create share error:', err);
      return res.status(500).json({ error: 'Internal error creating PDF share' });
    }
  });

  // 2. Get Safe Public Metadata for a Share (Gate Check)
  router.get('/api/pdf-shares/:shareId', async (req, res) => {
    try {
      const { shareId } = req.params;
      if (!shareId || !/^[a-zA-Z0-9_-]{10,64}$/.test(shareId)) {
        return res.status(400).json({ error: 'Invalid share identifier' });
      }

      const docSnap = await adminDb.collection('pdf_shares').doc(shareId).get();
      if (!docSnap.exists) {
        return res.status(404).json({ error: 'Document share not found' });
      }

      const data: any = docSnap.data();

      // Check legacy record: if stored with base64 binary or plaintext password without scrypt hash, block access
      if (data.fileBase64 || (!data.storageObjectPath && !data.storagePath) || (data.isProtected && !data.passwordHash)) {
        return res.status(410).json({
          error: 'This document share was created under an outdated security schema and is no longer accessible. Please contact the document owner to re-upload.',
          legacyBlocked: true
        });
      }

      // Check expiration
      if (data.expiresAt && new Date() > new Date(data.expiresAt)) {
        return res.status(410).json({ error: 'This document share has expired', expired: true });
      }

      // Check download limit
      if (data.maxDownloads && data.downloadCount >= data.maxDownloads) {
        return res.status(410).json({ error: 'Download limit has been reached for this document', limitReached: true });
      }

      // Asynchronously increment viewCount
      adminDb.collection('pdf_shares').doc(shareId).update({
        viewCount: (data.viewCount || 0) + 1
      }).catch(() => {});

      // Return public safe metadata (NEVER returns passwordHash, passwordSalt, storageObjectPath, userId, or PDF bytes)
      res.setHeader('Cache-Control', 'no-store, private, max-age=0');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');

      return res.json({
        id: data.id,
        title: data.title,
        description: data.description,
        fileName: data.fileName,
        fileSize: data.fileSize,
        isProtected: Boolean(data.isProtected),
        expiresAt: data.expiresAt,
        maxDownloads: data.maxDownloads,
        downloadCount: data.downloadCount,
        viewCount: (data.viewCount || 0) + 1,
        themeColor: data.themeColor || 'indigo',
        createdAt: data.createdAt
      });
    } catch (err: any) {
      console.error('[PDF Sharing] Metadata fetch error:', err);
      return res.status(500).json({ error: 'Failed to retrieve document metadata' });
    }
  });

  // 3. Download PDF File (Server-Side Authorization, Distributed Rate Limiting, Scrypt Verification & Streaming from Cloud Storage)
  router.post('/api/pdf-shares/:shareId/download', async (req, res) => {
    const clientIp = extractTrustedClientIp(req);
    const { shareId } = req.params;

    try {
      if (!shareId || !/^[a-zA-Z0-9_-]{10,64}$/.test(shareId)) {
        return res.status(400).json({ error: 'Invalid share identifier' });
      }

      const rateLimitCheck = await checkRateLimit(shareId, clientIp);
      if (!rateLimitCheck.allowed) {
        res.setHeader('Retry-After', String(rateLimitCheck.retryAfterSeconds || 60));
        return res.status(429).json({
          error: `Too many failed password attempts. Please wait ${rateLimitCheck.retryAfterSeconds} seconds before trying again.`
        });
      }

      const docSnap = await adminDb.collection('pdf_shares').doc(shareId).get();
      if (!docSnap.exists) {
        return res.status(404).json({ error: 'Document share not found' });
      }

      const data: any = docSnap.data();

      // Check legacy record: if stored with base64 binary or plaintext password, block download
      if (data.fileBase64 || (!data.storageObjectPath && !data.storagePath) || (data.isProtected && !data.passwordHash)) {
        return res.status(410).json({
          error: 'This document share was created under an outdated security schema and is no longer accessible. Please contact the document owner to re-upload.',
          legacyBlocked: true
        });
      }

      // Check expiration
      if (data.expiresAt && new Date() > new Date(data.expiresAt)) {
        return res.status(410).json({ error: 'This document share has expired', expired: true });
      }

      // Check download limit
      if (data.maxDownloads && data.downloadCount >= data.maxDownloads) {
        return res.status(410).json({ error: 'Download limit has been reached for this document', limitReached: true });
      }

      // Server-side password verification if protected
      if (data.isProtected) {
        const { password } = req.body || {};
        if (!password || typeof password !== 'string') {
          return res.status(401).json({ error: 'Password is required to access this document' });
        }

        const isValid = await verifySharePassword(
          password.trim(),
          data.passwordSalt,
          data.passwordHash,
          data.hashVersion || SCRYPT_PARAMS.version
        );

        if (!isValid) {
          const failRecord = await recordFailedAttempt(shareId, clientIp);
          if (failRecord.locked) {
            res.setHeader('Retry-After', String(failRecord.retryAfterSeconds || 60));
            return res.status(429).json({
              error: `Too many failed password attempts. Please wait ${failRecord.retryAfterSeconds} seconds before trying again.`
            });
          }
          return res.status(401).json({ error: 'Invalid password. Please check your credentials and try again.' });
        }
      }

      // Reset rate limit on success
      await resetRateLimit(shareId, clientIp);

      // Fetch private object from Cloud Storage
      const bucket = getStorageBucket();
      const objectPath = data.storageObjectPath || `pdf_shares/${data.userId}/${shareId}.pdf`;
      const fileRef = bucket.file(objectPath);

      const [exists] = await fileRef.exists();
      if (!exists) {
        console.error(`[PDF Sharing] Cloud Storage object missing for share ID: ${shareId} at path: ${objectPath}`);
        return res.status(404).json({ error: 'Document file is unavailable in persistent storage' });
      }

      const [fileBuffer] = await fileRef.download();

      // Increment download count
      adminDb.collection('pdf_shares').doc(shareId).update({
        downloadCount: (data.downloadCount || 0) + 1
      }).catch(() => {});

      // Safe Delivery Headers (RFC 6266 & security hardening)
      const safeDownloadName = sanitizeFileName(data.fileName || 'document.pdf');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${safeDownloadName}"`);
      res.setHeader('Content-Length', fileBuffer.length);
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'no-store, private, max-age=0');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');

      return res.send(fileBuffer);
    } catch (err: any) {
      console.error('[PDF Sharing] Download error:', err);
      return res.status(500).json({ error: 'Internal error processing download' });
    }
  });

  // 4. Delete PDF Share (Owner Only -> Staged Workflow: Storage object + Firestore metadata)
  router.delete('/api/pdf-shares/:shareId', async (req, res) => {
    try {
      const user = await authenticateRequestUser(req);
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { shareId } = req.params;
      const docRef = adminDb.collection('pdf_shares').doc(shareId);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        return res.status(404).json({ error: 'Share not found' });
      }

      const data: any = docSnap.data();
      if (data.userId !== user.uid) {
        return res.status(403).json({ error: 'Unauthorized: you can only delete your own document shares' });
      }

      // Stage 1: Mark metadata as deleting
      await docRef.update({ status: 'deleting' }).catch(() => {});

      // Stage 2: Delete Cloud Storage object
      const bucket = getStorageBucket();
      const objectPath = data.storageObjectPath || `pdf_shares/${user.uid}/${shareId}.pdf`;
      const fileRef = bucket.file(objectPath);

      try {
        const [exists] = await fileRef.exists();
        if (exists) {
          await fileRef.delete();
        }
      } catch (delStorageErr) {
        console.warn(`[PDF Sharing] Cloud storage deletion error for ${shareId}:`, delStorageErr);
        // Record retry state in Firestore metadata if storage deletion fails
        await docRef.update({ status: 'delete_failed', retryPending: true }).catch(() => {});
        return res.status(500).json({ error: 'Failed to delete storage object. Please retry.' });
      }

      // Stage 3: Delete Firestore metadata document
      await docRef.delete();

      return res.json({ success: true, message: 'Document share and stored cloud object deleted successfully' });
    } catch (err: any) {
      console.error('[PDF Sharing] Delete error:', err);
      return res.status(500).json({ error: 'Failed to delete share' });
    }
  });

  // 5. List User's PDF Shares (Owner Only)
  router.get('/api/pdf-shares', async (req, res) => {
    try {
      const user = await authenticateRequestUser(req);
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const snap = await adminDb.collection('pdf_shares').where('userId', '==', user.uid).get();

      const shares: any[] = [];
      snap.forEach((d) => {
        const item: any = d.data();
        if (item.status === 'deleting') return;
        shares.push({
          id: item.id,
          title: item.title,
          description: item.description,
          fileName: item.fileName,
          fileSize: item.fileSize,
          isProtected: Boolean(item.isProtected),
          expiresAt: item.expiresAt,
          maxDownloads: item.maxDownloads,
          downloadCount: item.downloadCount || 0,
          viewCount: item.viewCount || 0,
          createdAt: item.createdAt,
          themeColor: item.themeColor || 'indigo'
        });
      });

      res.setHeader('Cache-Control', 'no-store, private, max-age=0');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      return res.json({ shares });
    } catch (err: any) {
      console.error('[PDF Sharing] List error:', err);
      return res.status(500).json({ error: 'Failed to retrieve shares' });
    }
  });

  // 6. Replace PDF File for an Existing Share (Owner Only - Preserves Existing Share ID and QR Matrix)
  router.put('/api/pdf-shares/:shareId/file', async (req, res) => {
    try {
      const user = await authenticateRequestUser(req);
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { shareId } = req.params;
      const docRef = adminDb.collection('pdf_shares').doc(shareId);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        return res.status(404).json({ error: 'Share not found' });
      }

      const data: any = docSnap.data();
      if (data.userId !== user.uid) {
        return res.status(403).json({ error: 'Unauthorized: you can only update your own document shares' });
      }

      let uploadResult: ParsedUpload;
      const isMultipart = (req.headers['content-type'] || '').includes('multipart/form-data');

      if (isMultipart) {
        try {
          uploadResult = await parseMultipartUpload(req);
        } catch (parseErr: any) {
          if (parseErr.message === 'FILE_TOO_LARGE') {
            return res.status(413).json({
              error: `File size exceeds the 10 MB maximum limit (10,485,760 bytes)`
            });
          }
          return res.status(400).json({ error: 'Malformed multipart form data' });
        }
      } else {
        const { fileName, fileBase64 } = req.body || {};
        if (!fileBase64 || typeof fileBase64 !== 'string') {
          return res.status(400).json({ error: 'File payload is required' });
        }
        const commaIdx = fileBase64.indexOf(',');
        const rawBase64 = commaIdx !== -1 ? fileBase64.substring(commaIdx + 1) : fileBase64;
        const fileBuffer = Buffer.from(rawBase64, 'base64');
        uploadResult = {
          fields: {},
          fileBuffer,
          fileName: fileName || 'document.pdf',
          mimeType: 'application/pdf'
        };
      }

      const { fileBuffer, fileName } = uploadResult;

      if (fileBuffer.length === 0) {
        return res.status(400).json({ error: 'File payload cannot be empty' });
      }

      if (fileBuffer.length > MAX_FILE_SIZE_BYTES) {
        return res.status(413).json({
          error: `File size exceeds the 10 MB maximum limit (received ${(fileBuffer.length / (1024 * 1024)).toFixed(1)} MB)`
        });
      }

      const signature = fileBuffer.subarray(0, 5).toString('ascii');
      if (signature !== '%PDF-') {
        return res.status(415).json({
          error: 'Invalid file format: payload does not contain a valid %PDF- header signature'
        });
      }

      const safeName = sanitizeFileName(fileName);
      const bucket = getStorageBucket();
      const objectPath = data.storageObjectPath || `pdf_shares/${user.uid}/${shareId}.pdf`;
      const fileRef = bucket.file(objectPath);

      // Overwrite private object in Cloud Storage
      await fileRef.save(fileBuffer, {
        contentType: 'application/pdf',
        metadata: {
          shareId,
          ownerUid: user.uid,
          originalFileName: safeName,
          fileSizeBytes: String(fileBuffer.length),
          updatedAt: new Date().toISOString()
        },
        resumable: false,
        validation: false
      });

      const newSize = `${(fileBuffer.length / (1024 * 1024)).toFixed(1)} MB`;
      await docRef.update({
        fileName: safeName,
        fileSize: newSize,
        fileSizeBytes: fileBuffer.length,
        updatedAt: new Date().toISOString()
      });

      return res.json({
        id: shareId,
        fileName: safeName,
        fileSize: newSize,
        message: 'File replaced successfully in cloud storage'
      });
    } catch (err: any) {
      console.error('[PDF Sharing] File replace error:', err);
      return res.status(500).json({ error: 'Failed to replace file' });
    }
  });

  return router;
}
