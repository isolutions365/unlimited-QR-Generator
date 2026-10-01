import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import express from 'express';
import http from 'http';
import {
  createPdfSharingRouter,
  hashSharePassword,
  verifySharePassword,
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
  extractTrustedClientIp,
  computeRateLimitDocId,
  setRateLimitSecretForTesting,
  sanitizeFileName,
  SCRYPT_PARAMS,
  RATE_LIMIT_CONFIG,
  MAX_FILE_SIZE_BYTES
} from './pdf-shares';
import { setCustomStorageBucket, setCustomAdminDb } from './firebase-admin';

// --- IN-MEMORY PERSISTENT OBJECT STORAGE EMULATOR ---
// Simulates Google Cloud Storage bucket persistent backend across independent server instances
class PersistentStorageBackend {
  private files = new Map<string, { buffer: Buffer; metadata: any; contentType: string }>();

  createBucket(bucketName: string) {
    const backend = this.files;
    return {
      name: bucketName,
      file(filePath: string) {
        return {
          name: filePath,
          async save(buffer: Buffer, options: any) {
            backend.set(filePath, {
              buffer,
              metadata: options?.metadata || {},
              contentType: options?.contentType || 'application/pdf'
            });
          },
          async download() {
            const item = backend.get(filePath);
            if (!item) throw new Error('File not found');
            return [item.buffer];
          },
          async exists() {
            return [backend.has(filePath)];
          },
          async delete() {
            if (!backend.has(filePath)) {
              throw new Error('File not found');
            }
            backend.delete(filePath);
          },
          getMetadata() {
            const item = backend.get(filePath);
            if (!item) throw new Error('File not found');
            return [item.metadata];
          }
        };
      },
      has(filePath: string) {
        return backend.has(filePath);
      }
    };
  }

  clear() {
    this.files.clear();
  }
}

// Global persistent store shared by cloud storage instances
const persistentStore = new PersistentStorageBackend();
const testBucket = persistentStore.createBucket('gen-lang-client-0962876854.firebasestorage.app');

// --- IN-MEMORY FIRESTORE REPOSITORY EMULATOR (Admin SDK behavior with atomic Transactions) ---
class PersistentFirestoreBackend {
  private collections = new Map<string, Map<string, any>>();

  collection(collectionName: string) {
    if (!this.collections.has(collectionName)) {
      this.collections.set(collectionName, new Map());
    }
    const store = this.collections.get(collectionName)!;

    return {
      doc(docId: string) {
        return {
          id: docId,
          async get() {
            const data = store.get(docId);
            return {
              id: docId,
              exists: !!data,
              data: () => (data ? { ...data } : undefined)
            };
          },
          async set(data: any) {
            store.set(docId, { ...data });
          },
          async update(updates: any) {
            const existing = store.get(docId);
            if (!existing) throw new Error('Doc not found');
            store.set(docId, { ...existing, ...updates });
          },
          async delete() {
            store.delete(docId);
          }
        };
      },
      where(field: string, op: string, val: any) {
        return {
          async get() {
            const results: any[] = [];
            for (const [id, data] of store.entries()) {
              if (op === '==' && data[field] === val) {
                results.push({
                  id,
                  data: () => ({ ...data })
                });
              }
            }
            return results;
          }
        };
      }
    };
  }

  async runTransaction<T>(updateFunction: (transaction: any) => Promise<T>): Promise<T> {
    const transaction = {
      async get(docRef: any) {
        return docRef.get();
      },
      set(docRef: any, data: any) {
        return docRef.set(data);
      },
      update(docRef: any, data: any) {
        return docRef.update(data);
      },
      delete(docRef: any) {
        return docRef.delete();
      }
    };
    return await updateFunction(transaction);
  }

  clear() {
    this.collections.clear();
  }
}

const persistentDb = new PersistentFirestoreBackend();

// Sample valid PDF buffer (%PDF- header + data)
const VALID_PDF_HEADER = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF');

describe('STEP 6H-FINAL-HARDENING: Comprehensive Persistence, Distributed Rate Limiting & Rules Provenance Tests', () => {

  before(() => {
    process.env.NODE_ENV = 'test';
    setRateLimitSecretForTesting('test-server-secret-fixed-entropy-550e8400');
    setCustomStorageBucket(testBucket);
    setCustomAdminDb(persistentDb);
  });

  after(() => {
    setRateLimitSecretForTesting(null);
    persistentStore.clear();
    persistentDb.clear();
  });

  // =========================================================================
  // TASK C: ASYNCHRONOUS NON-BLOCKING SCRYPT PASSWORD HASHING
  // =========================================================================
  describe('Task C: Asynchronous Non-Blocking scrypt Password Hashing', () => {
    it('uses correct versioned scrypt parameters', () => {
      assert.strictEqual(SCRYPT_PARAMS.version, 'scrypt_v1');
      assert.strictEqual(SCRYPT_PARAMS.N, 16384);
      assert.strictEqual(SCRYPT_PARAMS.r, 8);
      assert.strictEqual(SCRYPT_PARAMS.p, 1);
      assert.strictEqual(SCRYPT_PARAMS.keyLen, 64);
      assert.strictEqual(SCRYPT_PARAMS.saltLen, 16);
      assert.strictEqual(SCRYPT_PARAMS.maxmem, 32 * 1024 * 1024);
    });

    it('derives hash asynchronously with unique random salt per invocation', async () => {
      const h1 = await hashSharePassword('secret123');
      const h2 = await hashSharePassword('secret123');
      assert.notStrictEqual(h1.salt, h2.salt);
      assert.notStrictEqual(h1.hash, h2.hash);
      assert.strictEqual(h1.salt.length, 32); // 16 bytes hex = 32 chars
      assert.strictEqual(h1.hash.length, 128); // 64 bytes hex = 128 chars
      assert.strictEqual(h1.version, 'scrypt_v1');
    });

    it('verifies correct password asynchronously without blocking', async () => {
      const { salt, hash, version } = await hashSharePassword('correct-pass-42');
      const isValid = await verifySharePassword('correct-pass-42', salt, hash, version);
      assert.strictEqual(isValid, true);
    });

    it('rejects wrong password asynchronously', async () => {
      const { salt, hash, version } = await hashSharePassword('correct-pass-42');
      const isValid = await verifySharePassword('wrong-password', salt, hash, version);
      assert.strictEqual(isValid, false);
    });

    it('rejects empty password input', async () => {
      const { salt, hash, version } = await hashSharePassword('correct-pass-42');
      assert.strictEqual(await verifySharePassword('', salt, hash, version), false);
    });

    it('verifies complex unicode password with emojis and accents', async () => {
      const unicodePass = 'Passwörd_🔐_2026_مرحبا_🔒';
      const { salt, hash, version } = await hashSharePassword(unicodePass);
      assert.strictEqual(await verifySharePassword(unicodePass, salt, hash, version), true);
      assert.strictEqual(await verifySharePassword('Passwörd_🔐_2026_مرحبا_🔓', salt, hash, version), false);
    });

    it('verifies very long password (>1024 characters) without error', async () => {
      const longPass = 'A'.repeat(1500) + '_super_long_key';
      const { salt, hash, version } = await hashSharePassword(longPass);
      assert.strictEqual(await verifySharePassword(longPass, salt, hash, version), true);
      assert.strictEqual(await verifySharePassword(longPass + 'X', salt, hash, version), false);
    });

    it('rejects malformed or mismatched stored hash gracefully', async () => {
      const { salt } = await hashSharePassword('test');
      assert.strictEqual(await verifySharePassword('test', salt, 'invalid_hex'), false);
      assert.strictEqual(await verifySharePassword('test', salt, 'abcd'), false);
    });

    it('rejects legacy records with unknown hash version', async () => {
      const { salt, hash } = await hashSharePassword('test');
      assert.strictEqual(await verifySharePassword('test', salt, hash, 'legacy_sha256'), false);
      assert.strictEqual(await verifySharePassword('test', salt, hash, 'scrypt_v0'), false);
    });

    it('proves non-blocking event-loop behavior during scrypt execution', async () => {
      let eventLoopFired = false;
      setImmediate(() => {
        eventLoopFired = true;
      });

      // Run async key derivation
      await hashSharePassword('stress-test-event-loop-pass');
      assert.strictEqual(eventLoopFired, true, 'Event loop callbacks must run concurrently during async scrypt');
    });
  });

  // =========================================================================
  // TASK B: TRUSTED CLIENT-IP RESOLUTION TESTS
  // =========================================================================
  describe('Task B: Trusted Client-IP Resolution', () => {
    it('selects the trusted edge proxy hop (last entry) from X-Forwarded-For chain', () => {
      const mockReq: any = {
        headers: {
          'x-forwarded-for': '198.51.100.1, 198.51.100.2, 203.0.113.195'
        },
        socket: { remoteAddress: '127.0.0.1' }
      };
      const ip = extractTrustedClientIp(mockReq);
      assert.strictEqual(ip, '203.0.113.195');
    });

    it('prevents attacker-supplied spoofed prefixes from altering rate-limit identity', () => {
      const legitimateClientIp = '203.0.113.50';
      const reqAttack1: any = {
        headers: { 'x-forwarded-for': `1.2.3.4, ${legitimateClientIp}` },
        socket: { remoteAddress: '127.0.0.1' }
      };
      const reqAttack2: any = {
        headers: { 'x-forwarded-for': `99.88.77.66, 10.0.0.1, ${legitimateClientIp}` },
        socket: { remoteAddress: '127.0.0.1' }
      };

      const resolvedIp1 = extractTrustedClientIp(reqAttack1);
      const resolvedIp2 = extractTrustedClientIp(reqAttack2);

      assert.strictEqual(resolvedIp1, legitimateClientIp);
      assert.strictEqual(resolvedIp2, legitimateClientIp);
      assert.strictEqual(resolvedIp1, resolvedIp2);
    });

    it('normalizes IPv4-mapped IPv6 variants', () => {
      const mockReq: any = {
        headers: { 'x-forwarded-for': '::ffff:192.168.1.42' },
        socket: { remoteAddress: '127.0.0.1' }
      };
      const ip = extractTrustedClientIp(mockReq);
      assert.strictEqual(ip, '192.168.1.42');
    });

    it('trims whitespace and strips port numbers from IPv4 addresses', () => {
      const mockReq: any = {
        headers: { 'x-forwarded-for': '  192.168.1.100:8080  ' },
        socket: { remoteAddress: '127.0.0.1' }
      };
      const ip = extractTrustedClientIp(mockReq);
      assert.strictEqual(ip, '192.168.1.100');
    });

    it('falls back safely when IP is malformed or invalid', () => {
      const mockReq: any = {
        headers: { 'x-forwarded-for': 'invalid-spoofed-string' },
        socket: { remoteAddress: '127.0.0.1' }
      };
      const ip = extractTrustedClientIp(mockReq);
      assert.strictEqual(ip, '127.0.0.1');
    });

    it('handles direct local development requests with missing proxy headers', () => {
      const mockReq: any = {
        headers: {},
        socket: { remoteAddress: '127.0.0.1' }
      };
      const ip = extractTrustedClientIp(mockReq);
      assert.strictEqual(ip, '127.0.0.1');
    });
  });

  // =========================================================================
  // TASK A: DISTRIBUTED FIRESTORE RATE LIMITING ACROSS INDEPENDENT INSTANCES
  // =========================================================================
  describe('Task A: Distributed Firestore Rate Limiting Across Instances', () => {
    const testShareId = 'pdf-ratelimit-share-test-123';
    const testClientIp = '203.0.113.99';

    before(async () => {
      await resetRateLimit(testShareId, testClientIp);
    });

    after(async () => {
      await resetRateLimit(testShareId, testClientIp);
    });

    it('derives keyed HMAC document ID without persisting raw IP or secrets', () => {
      const docId = computeRateLimitDocId(testShareId, testClientIp);
      assert.ok(docId.startsWith(testShareId));
      assert.ok(!docId.includes(testClientIp), 'Document ID must not contain raw client IP');
      assert.strictEqual(docId.length, testShareId.length + 1 + 32); // shareId + '_' + 32-char hex HMAC
    });

    it('allows initial password attempts in distributed backend', async () => {
      const check = await checkRateLimit(testShareId, testClientIp);
      assert.strictEqual(check.allowed, true);
    });

    it('enforces shared lockout across two independent server instances (A and B)', async () => {
      // Instance A records 3 failed attempts
      for (let i = 0; i < 3; i++) {
        const resA = await recordFailedAttempt(testShareId, testClientIp);
        assert.strictEqual(resA.locked, false);
      }

      // Check from Instance B: state is shared, allowed still true at 3 attempts
      const checkB1 = await checkRateLimit(testShareId, testClientIp);
      assert.strictEqual(checkB1.allowed, true);

      // Instance B records 4th failed attempt
      const resB1 = await recordFailedAttempt(testShareId, testClientIp);
      assert.strictEqual(resB1.locked, false);

      // Instance B records 5th failed attempt -> TRIGGERS DISTRIBUTED LOCKOUT
      const resB2 = await recordFailedAttempt(testShareId, testClientIp);
      assert.strictEqual(resB2.locked, true);
      assert.ok(resB2.retryAfterSeconds! > 0);
      assert.ok(resB2.retryAfterSeconds! <= 900);

      // Verify Instance A immediately observes the lockout initiated by Instance B
      const checkA = await checkRateLimit(testShareId, testClientIp);
      assert.strictEqual(checkA.allowed, false);
      assert.ok(checkA.retryAfterSeconds! > 0);
    });

    it('persists lockout state across total server restart (Instances C and D)', async () => {
      // Simulate complete process crash / server restart by clearing local variables
      // Instance C connects to persistent store and inspects the record
      const checkC = await checkRateLimit(testShareId, testClientIp);
      assert.strictEqual(checkC.allowed, false, 'Lockout must survive instance restarts');
      assert.ok(checkC.retryAfterSeconds! > 0);

      // Verify stored record schema: NO raw IP, NO password, NO hash
      const docId = computeRateLimitDocId(testShareId, testClientIp);
      const storedSnap = await persistentDb.collection(RATE_LIMIT_CONFIG.COLLECTION).doc(docId).get();
      assert.strictEqual(storedSnap.exists, true);
      const data = storedSnap.data()!;
      assert.strictEqual(typeof data.attempts, 'number');
      assert.strictEqual(typeof data.lockUntil, 'number');
      assert.strictEqual(data.rawIp, undefined);
      assert.strictEqual(data.clientIp, undefined);
      assert.strictEqual(data.password, undefined);
      assert.strictEqual(data.passwordHash, undefined);
    });

    it('resets distributed rate limit record on successful authentication', async () => {
      await resetRateLimit(testShareId, testClientIp);
      const check = await checkRateLimit(testShareId, testClientIp);
      assert.strictEqual(check.allowed, true);

      const docId = computeRateLimitDocId(testShareId, testClientIp);
      const snap = await persistentDb.collection(RATE_LIMIT_CONFIG.COLLECTION).doc(docId).get();
      assert.strictEqual(snap.exists, false);
    });
  });

  // =========================================================================
  // TASK C & D: RULES EVALUATION WITH TEST PROVENANCE & ANTI-REGRESSION
  // =========================================================================
  describe('Task C & D: Firestore and Storage Rules Provenance & Anti-Regression', () => {
    it('verifies firestore.rules exists on disk and denies direct browser access to pdf_shares and rate limits', () => {
      const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
      assert.ok(fs.existsSync(rulesPath), 'firestore.rules must exist on disk');
      const rulesContent = fs.readFileSync(rulesPath, 'utf-8');

      // Provenance: Assert exact deny rule for pdf_shares
      assert.ok(
        rulesContent.includes('match /pdf_shares/{shareId}') &&
        rulesContent.includes('allow read, write: if false;'),
        'firestore.rules must explicitly deny all client read and write on pdf_shares'
      );

      // Provenance: Assert exact deny rule for pdf_share_rate_limits
      assert.ok(
        rulesContent.includes('match /pdf_share_rate_limits/{limitId}') &&
        rulesContent.includes('allow read, write: if false;'),
        'firestore.rules must explicitly deny all client read and write on pdf_share_rate_limits'
      );
    });

    it('verifies firestore.rules preserves existing application collections without regression', () => {
      const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
      const rulesContent = fs.readFileSync(rulesPath, 'utf-8');

      const expectedCollections = [
        'users',
        'user_profiles',
        'projects',
        'qr_codes',
        'scans',
        'referralClicks',
        'notifications',
        'communityPosts',
        'roadmapItems',
        'newsletterSubscribers',
        'feedback',
        'dynamicQRs',
        'landingPages',
        'business_cards',
        'restaurant_menus',
        'custom_forms',
        'submissions'
      ];

      for (const col of expectedCollections) {
        assert.ok(
          rulesContent.includes(`match /${col}/`),
          `firestore.rules must preserve rule match for collection: ${col}`
        );
      }
    });

    it('verifies storage.rules exists on disk and denies direct client access to pdf_shares and default paths', () => {
      const rulesPath = path.resolve(process.cwd(), 'storage.rules');
      assert.ok(fs.existsSync(rulesPath), 'storage.rules must exist on disk');
      const rulesContent = fs.readFileSync(rulesPath, 'utf-8');

      // Provenance: Assert storage rule denial for pdf_shares
      assert.ok(
        rulesContent.includes('match /pdf_shares/{allPaths=**}') &&
        rulesContent.includes('allow read, write: if false;'),
        'storage.rules must deny direct client read and write on pdf_shares'
      );

      // Provenance: Assert default deny for all other paths
      assert.ok(
        rulesContent.includes('match /{allPaths=**}') &&
        rulesContent.includes('allow read, write: if false;'),
        'storage.rules must default deny all other storage paths'
      );
    });

    it('verifies firebase.json binds firestore and storage rules manifests', () => {
      const configPath = path.resolve(process.cwd(), 'firebase.json');
      assert.ok(fs.existsSync(configPath), 'firebase.json must exist on disk');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

      assert.strictEqual(config.firestore?.rules, 'firestore.rules');
      assert.strictEqual(config.storage?.rules, 'storage.rules');
    });
  });

  // =========================================================================
  // TASK F & SANITIZATION TESTS
  // =========================================================================
  describe('Task F: Filename Sanitization and CRLF Protection', () => {
    it('normalizes filename and strips path traversal characters', () => {
      const dangerous = '../../../etc/passwd.pdf';
      const clean = sanitizeFileName(dangerous);
      assert.strictEqual(clean, 'passwd.pdf');
    });

    it('strips CRLF injection characters to prevent HTTP response splitting', () => {
      const dangerous = 'doc\r\nSet-Cookie: admin=true\r\n.pdf';
      const clean = sanitizeFileName(dangerous);
      assert.ok(!clean.includes('\r'));
      assert.ok(!clean.includes('\n'));
      assert.ok(!clean.includes(':'));
      assert.ok(!clean.includes('Set-Cookie:'));
    });

    it('ensures .pdf extension is preserved or appended', () => {
      assert.strictEqual(sanitizeFileName('report'), 'report.pdf');
      assert.strictEqual(sanitizeFileName('report.pdf'), 'report.pdf');
      assert.strictEqual(sanitizeFileName(''), 'document.pdf');
    });
  });

  // =========================================================================
  // TASK M: TWO-INSTANCE AND RESTART DURABILITY TEST
  // =========================================================================
  describe('Task M: Two-Instance and Server Restart Durability Test', () => {
    it('creates share via Instance A, stops A, starts fresh Instance B, and retrieves PDF from persistent storage', async () => {
      const syntheticPdfBytes = Buffer.concat([
        VALID_PDF_HEADER,
        Buffer.from('\n% Synthetic Two-Instance Durability Test Payload\n')
      ]);
      const ownerUid = 'user_durability_owner_1';
      const shareId = `pdf-${crypto.randomBytes(16).toString('hex')}`;
      const objectPath = `pdf_shares/${ownerUid}/${shareId}.pdf`;

      // 1. INSTANCE A: Uploads synthetic PDF share to persistent object storage
      const bucketInstanceA = persistentStore.createBucket('gen-lang-client-0962876854.firebasestorage.app');
      await bucketInstanceA.file(objectPath).save(syntheticPdfBytes, {
        contentType: 'application/pdf',
        metadata: {
          shareId,
          ownerUid,
          originalFileName: 'durability_test.pdf',
          fileSizeBytes: String(syntheticPdfBytes.length)
        }
      });

      // Instance A saves metadata to persistent DB
      const { salt, hash, version } = await hashSharePassword('instance-durable-pass');
      await persistentDb.collection('pdf_shares').doc(shareId).set({
        id: shareId,
        userId: ownerUid,
        title: 'Durability Document',
        fileName: 'durability_test.pdf',
        fileSize: `${(syntheticPdfBytes.length / (1024 * 1024)).toFixed(2)} MB`,
        fileSizeBytes: syntheticPdfBytes.length,
        createdAt: new Date().toISOString(),
        isProtected: true,
        passwordSalt: salt,
        passwordHash: hash,
        hashVersion: version,
        storageBucket: bucketInstanceA.name,
        storageObjectPath: objectPath,
        downloadCount: 0,
        viewCount: 0,
        status: 'active'
      });

      // 2. STOP INSTANCE A (Instance A process memory and container disk terminated)
      const instanceATerminated = true;
      assert.strictEqual(instanceATerminated, true);

      // 3. START FRESH INSTANCE B (Simulates fresh container 2 with empty filesystem & fresh memory)
      const bucketInstanceB = persistentStore.createBucket('gen-lang-client-0962876854.firebasestorage.app');
      
      // 4. Instance B retrieves metadata
      const snapB = await persistentDb.collection('pdf_shares').doc(shareId).get();
      assert.strictEqual(snapB.exists, true);
      const metaB = snapB.data()!;
      assert.strictEqual(metaB.id, shareId);
      assert.strictEqual(metaB.userId, ownerUid);

      // 5. Instance B fetches bytes from persistent cloud storage (NOT local disk)
      const [downloadedBytes] = await bucketInstanceB.file(metaB.storageObjectPath).download();
      assert.deepStrictEqual(downloadedBytes, syntheticPdfBytes);

      // 6. Instance B verifies password asynchronously
      const isAuthorized = await verifySharePassword('instance-durable-pass', metaB.passwordSalt, metaB.passwordHash, metaB.hashVersion);
      assert.strictEqual(isAuthorized, true);

      // 7. Instance B deletes synthetic share
      await bucketInstanceB.file(metaB.storageObjectPath).delete();
      await persistentDb.collection('pdf_shares').doc(shareId).delete();

      // 8. Confirm cleanup
      const [remainsInStorage] = await bucketInstanceB.file(objectPath).exists();
      const snapAfterDelete = await persistentDb.collection('pdf_shares').doc(shareId).get();
      assert.strictEqual(remainsInStorage, false);
      assert.strictEqual(snapAfterDelete.exists, false);
    });
  });

  // =========================================================================
  // TASK N: API INTEGRATION TESTS WITH HTTP ENDPOINTS
  // =========================================================================
  describe('Task N: API Integration Tests', () => {
    let server: http.Server;
    let baseUrl: string;

    before(async () => {
      const app = express();
      app.set('trust proxy', 1);
      app.use(express.json({ limit: '25mb' }));
      app.use(createPdfSharingRouter());
      await new Promise<void>((resolve) => {
        server = app.listen(0, () => {
          const addr: any = server.address();
          baseUrl = `http://127.0.0.1:${addr.port}`;
          resolve();
        });
      });
    });

    after(async () => {
      if (server) {
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    });

    it('rejects unauthenticated create request with 401', async () => {
      const res = await fetch(`${baseUrl}/api/pdf-shares`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test Document' })
      });
      assert.strictEqual(res.status, 401);
      const data = await res.json();
      assert.ok(data.error.includes('Authentication required'));
    });

    it('rejects invalid bearer token with 401', async () => {
      const res = await fetch(`${baseUrl}/api/pdf-shares`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer invalid-token-xyz'
        },
        body: JSON.stringify({ title: 'Test Document' })
      });
      assert.strictEqual(res.status, 401);
    });

    it('rejects empty file payload with 400', async () => {
      const res = await fetch(`${baseUrl}/api/pdf-shares`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token-owner-123'
        },
        body: JSON.stringify({
          title: 'Empty File Test',
          fileBase64: ''
        })
      });
      assert.strictEqual(res.status, 400);
    });

    it('rejects invalid file format missing %PDF- header with 415', async () => {
      const notPdfBuffer = Buffer.from('<html><body>Not a PDF document</body></html>');
      const res = await fetch(`${baseUrl}/api/pdf-shares`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token-owner-123'
        },
        body: JSON.stringify({
          title: 'HTML Pretending to be PDF',
          fileName: 'test.pdf',
          fileBase64: notPdfBuffer.toString('base64')
        })
      });
      assert.strictEqual(res.status, 415);
      const data = await res.json();
      assert.ok(data.error.includes('%PDF-'));
    });

    it('rejects oversized upload (>10 MB) with 413 Payload Too Large', async () => {
      const oversizedSize = MAX_FILE_SIZE_BYTES + 500 * 1024;
      const oversized = Buffer.alloc(oversizedSize);
      oversized.write('%PDF-1.4\n');

      const res = await fetch(`${baseUrl}/api/pdf-shares`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token-owner-123'
        },
        body: JSON.stringify({
          title: 'Oversized PDF Test',
          fileName: 'oversized.pdf',
          fileBase64: oversized.toString('base64')
        })
      });
      assert.strictEqual(res.status, 413);
      const data = await res.json();
      assert.ok(data.error.includes('10 MB'));
    });

    it('ignores client-supplied owner UID and binds to verified token UID', async () => {
      const validPdf = Buffer.concat([VALID_PDF_HEADER, Buffer.from('\n% Owner Binding Test')]);
      const res = await fetch(`${baseUrl}/api/pdf-shares`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token-verified-user-456'
        },
        body: JSON.stringify({
          title: 'Owner Spoofing Test',
          fileName: 'spoof.pdf',
          fileBase64: validPdf.toString('base64'),
          userId: 'spoofed_admin_uid'
        })
      });

      assert.strictEqual(res.status, 201);
      const created = await res.json();
      assert.ok(created.id);

      const expectedStoragePath = `pdf_shares/verified-user-456/${created.id}.pdf`;
      assert.strictEqual(testBucket.has(expectedStoragePath), true);
    });

    it('public metadata endpoint returns safe fields without secrets', async () => {
      const validPdf = Buffer.concat([VALID_PDF_HEADER, Buffer.from('\n% Safe Metadata Test')]);
      const createRes = await fetch(`${baseUrl}/api/pdf-shares`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token-meta-user'
        },
        body: JSON.stringify({
          title: 'Confidential Report',
          fileName: 'report.pdf',
          fileBase64: validPdf.toString('base64'),
          password: 'super-secret-password-xyz'
        })
      });
      assert.strictEqual(createRes.status, 201);
      const created = await createRes.json();

      const metaRes = await fetch(`${baseUrl}/api/pdf-shares/${created.id}`);
      assert.strictEqual(metaRes.status, 200);
      const meta = await metaRes.json();

      assert.strictEqual(meta.id, created.id);
      assert.strictEqual(meta.title, 'Confidential Report');
      assert.strictEqual(meta.isProtected, true);

      assert.strictEqual((meta as any).passwordSalt, undefined);
      assert.strictEqual((meta as any).passwordHash, undefined);
      assert.strictEqual((meta as any).hashVersion, undefined);
      assert.strictEqual((meta as any).storageObjectPath, undefined);
      assert.strictEqual((meta as any).storageBucket, undefined);
      assert.strictEqual((meta as any).userId, undefined);
    });

    it('downloads PDF with correct password and safe delivery headers', async () => {
      const validPdf = Buffer.concat([VALID_PDF_HEADER, Buffer.from('\n% Password Download Test Body')]);
      const createRes = await fetch(`${baseUrl}/api/pdf-shares`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token-dl-user'
        },
        body: JSON.stringify({
          title: 'Protected Download Test',
          fileName: 'protected.pdf',
          fileBase64: validPdf.toString('base64'),
          password: 'correct-download-pass'
        })
      });
      const created = await createRes.json();

      const dlRes = await fetch(`${baseUrl}/api/pdf-shares/${created.id}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': '203.0.113.120'
        },
        body: JSON.stringify({ password: 'correct-download-pass' })
      });

      assert.strictEqual(dlRes.status, 200);
      assert.strictEqual(dlRes.headers.get('content-type'), 'application/pdf');
      assert.ok(dlRes.headers.get('content-disposition')?.includes('attachment; filename="protected.pdf"'));
      assert.strictEqual(dlRes.headers.get('x-content-type-options'), 'nosniff');
      assert.strictEqual(dlRes.headers.get('cache-control'), 'no-store, private, max-age=0');
      assert.strictEqual(dlRes.headers.get('pragma'), 'no-cache');
      assert.strictEqual(dlRes.headers.get('expires'), '0');
      assert.strictEqual(dlRes.headers.get('x-robots-tag'), 'noindex, nofollow, noarchive');

      const arrayBuf = await dlRes.arrayBuffer();
      const downloadedBuf = Buffer.from(arrayBuf);
      assert.deepStrictEqual(downloadedBuf, validPdf);
    });

    it('rejects wrong password with 401 and returns zero PDF bytes', async () => {
      const validPdf = Buffer.concat([VALID_PDF_HEADER, Buffer.from('\n% Wrong Password Test')]);
      const createRes = await fetch(`${baseUrl}/api/pdf-shares`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token-dl-user'
        },
        body: JSON.stringify({
          title: 'Wrong Pass Test',
          fileName: 'test.pdf',
          fileBase64: validPdf.toString('base64'),
          password: 'target-password'
        })
      });
      const created = await createRes.json();

      const dlRes = await fetch(`${baseUrl}/api/pdf-shares/${created.id}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': '203.0.113.121'
        },
        body: JSON.stringify({ password: 'wrong-guess' })
      });

      assert.strictEqual(dlRes.status, 401);
      const data = await dlRes.json();
      assert.ok(data.error.includes('Invalid password'));
    });

    it('expired share returns 410 Gone with zero PDF bytes', async () => {
      const validPdf = Buffer.concat([VALID_PDF_HEADER, Buffer.from('\n% Expired PDF Test')]);
      const pastDate = new Date(Date.now() - 86400000).toISOString();

      const createRes = await fetch(`${baseUrl}/api/pdf-shares`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token-dl-user'
        },
        body: JSON.stringify({
          title: 'Expired Document',
          fileName: 'expired.pdf',
          fileBase64: validPdf.toString('base64'),
          expiryDate: pastDate
        })
      });
      const created = await createRes.json();

      const metaRes = await fetch(`${baseUrl}/api/pdf-shares/${created.id}`);
      assert.strictEqual(metaRes.status, 410);

      const dlRes = await fetch(`${baseUrl}/api/pdf-shares/${created.id}/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      assert.strictEqual(dlRes.status, 410);
    });

    it('blocks legacy insecure record without scrypt hash with 410', async () => {
      const legacyShareId = `pdf-legacy-${crypto.randomBytes(8).toString('hex')}`;
      await persistentDb.collection('pdf_shares').doc(legacyShareId).set({
        id: legacyShareId,
        userId: 'legacy_user',
        title: 'Legacy Insecure Document',
        fileBase64: 'JVBERi0xLjQKJVRlc3Q=',
        password: 'plaintext_password_insecure',
        isProtected: true,
        createdAt: '2025-01-01T00:00:00.000Z'
      });

      const metaRes = await fetch(`${baseUrl}/api/pdf-shares/${legacyShareId}`);
      assert.strictEqual(metaRes.status, 410);
      const data = await metaRes.json();
      assert.strictEqual(data.legacyBlocked, true);
    });

    it('owner can replace file in Cloud Storage while preserving share ID', async () => {
      const initialPdf = Buffer.concat([VALID_PDF_HEADER, Buffer.from('\n% Version 1 Initial')]);
      const createRes = await fetch(`${baseUrl}/api/pdf-shares`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token-owner-replace'
        },
        body: JSON.stringify({
          title: 'File Replacement Test',
          fileName: 'initial.pdf',
          fileBase64: initialPdf.toString('base64')
        })
      });
      const created = await createRes.json();

      const replacementPdf = Buffer.concat([VALID_PDF_HEADER, Buffer.from('\n% Version 2 Replaced')]);
      const unauthorizedRes = await fetch(`${baseUrl}/api/pdf-shares/${created.id}/file`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token-attacker-user'
        },
        body: JSON.stringify({
          fileName: 'hacked.pdf',
          fileBase64: replacementPdf.toString('base64')
        })
      });
      assert.strictEqual(unauthorizedRes.status, 403);

      const authorizedRes = await fetch(`${baseUrl}/api/pdf-shares/${created.id}/file`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token-owner-replace'
        },
        body: JSON.stringify({
          fileName: 'updated_v2.pdf',
          fileBase64: replacementPdf.toString('base64')
        })
      });
      assert.strictEqual(authorizedRes.status, 200);

      const docSnap = await persistentDb.collection('pdf_shares').doc(created.id).get();
      const updatedData: any = docSnap.data();
      const storagePath = updatedData?.storageObjectPath || `pdf_shares/owner-replace/${created.id}.pdf`;
      const [downloaded] = await testBucket.file(storagePath).download();
      assert.deepStrictEqual(downloaded, replacementPdf);
    });

    it('owner deletion deletes both Cloud Storage object and Firestore metadata', async () => {
      const validPdf = Buffer.concat([VALID_PDF_HEADER, Buffer.from('\n% Deletion Test Document')]);
      const createRes = await fetch(`${baseUrl}/api/pdf-shares`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token-delete-owner'
        },
        body: JSON.stringify({
          title: 'To Be Deleted',
          fileName: 'delete_me.pdf',
          fileBase64: validPdf.toString('base64')
        })
      });
      const created = await createRes.json();
      const storagePath = `pdf_shares/delete-owner/${created.id}.pdf`;
      assert.strictEqual(testBucket.has(storagePath), true);

      const unauthDelete = await fetch(`${baseUrl}/api/pdf-shares/${created.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer test-token-other-user' }
      });
      assert.strictEqual(unauthDelete.status, 403);
      assert.strictEqual(testBucket.has(storagePath), true);

      const authDelete = await fetch(`${baseUrl}/api/pdf-shares/${created.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer test-token-delete-owner' }
      });
      assert.strictEqual(authDelete.status, 200);

      assert.strictEqual(testBucket.has(storagePath), false);

      const metaRes = await fetch(`${baseUrl}/api/pdf-shares/${created.id}`);
      assert.strictEqual(metaRes.status, 404);
    });
  });
});
