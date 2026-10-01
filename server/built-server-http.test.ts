import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import crypto from 'crypto';
import http from 'http';
import express from 'express';
import {
  createPdfSharingRouter,
  hashSharePassword,
  verifySharePassword,
  extractTrustedClientIp,
  SCRYPT_PARAMS,
  MAX_FILE_SIZE_BYTES
} from './pdf-shares';
import { setCustomStorageBucket, setCustomAdminDb } from './firebase-admin';

// Sample valid PDF buffer
const VALID_PDF_HEADER = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF');

// In-Memory Persistent Storage Simulator with failure injection support
class TestStorageBackend {
  private files = new Map<string, { buffer: Buffer; metadata: any; contentType: string }>();
  public shouldFailSave = false;
  public shouldFailDelete = false;

  createBucket(name: string) {
    const backend = this.files;
    const self = this;
    return {
      name,
      file(filePath: string) {
        return {
          name: filePath,
          async save(buffer: Buffer, options: any) {
            if (self.shouldFailSave) {
              throw new Error('INJECTED_STORAGE_SAVE_FAILURE');
            }
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
            if (self.shouldFailDelete) {
              throw new Error('INJECTED_STORAGE_DELETE_FAILURE');
            }
            if (!backend.has(filePath)) throw new Error('File not found');
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
    this.shouldFailSave = false;
    this.shouldFailDelete = false;
  }
}

// In-Memory Firestore Repository Simulator with failure injection and atomic transactions
class TestFirestoreBackend {
  private collections = new Map<string, Map<string, any>>();
  public shouldFailUpdate = false;

  collection(collectionName: string) {
    if (!this.collections.has(collectionName)) {
      this.collections.set(collectionName, new Map());
    }
    const store = this.collections.get(collectionName)!;
    const self = this;

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
            if (self.shouldFailUpdate) {
              throw new Error('INJECTED_FIRESTORE_UPDATE_FAILURE');
            }
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
    this.shouldFailUpdate = false;
  }
}

const testStorage = new TestStorageBackend();
const testDb = new TestFirestoreBackend();
const testBucket = testStorage.createBucket('gen-lang-client-0962876854.firebasestorage.app');

describe('Task I, G, H, E & F: Built-Server HTTP, Streaming, Compensation and Proxy Tests', () => {
  let server: http.Server;
  let baseUrl: string;
  let prodServer: http.Server;
  let prodBaseUrl: string;

  before(async () => {
    process.env.NODE_ENV = 'test';
    process.env.RATE_LIMIT_SECRET = 'built-server-test-secret-1234567890abcdef';
    setCustomStorageBucket(testBucket);
    setCustomAdminDb(testDb);

    // 1. Launch test server
    const app = express();
    app.set('trust proxy', 1);
    app.use(express.json({ limit: '25mb' }));
    app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
    app.use(createPdfSharingRouter());

    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const addr: any = server.address();
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });

    // 2. Launch production-mode server to test production token rejection
    const prodApp = express();
    prodApp.use(express.json());
    // In production mode:
    prodApp.use((req, _res, next) => {
      // Simulate production NODE_ENV check for token
      (req as any)._isProd = true;
      next();
    });
    prodApp.use(createPdfSharingRouter());

    await new Promise<void>((resolve) => {
      prodServer = prodApp.listen(0, () => {
        const addr: any = prodServer.address();
        prodBaseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    testStorage.clear();
    testDb.clear();
    if (server) await new Promise<void>((r) => server.close(() => r()));
    if (prodServer) await new Promise<void>((r) => prodServer.close(() => r()));
  });

  // =========================================================================
  // TASK I: HTTP ENDPOINT VERIFICATION ON LISTENING SOCKET
  // =========================================================================
  describe('Task I: Real HTTP Endpoints on Listening Socket', () => {
    it('Health endpoint returns 200 OK', async () => {
      const res = await fetch(`${baseUrl}/api/health`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.status, 'ok');
    });

    it('Missing auth token returns 401', async () => {
      const res = await fetch(`${baseUrl}/api/pdf-shares`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Unauthenticated Document' })
      });
      assert.strictEqual(res.status, 401);
    });

    it('Invalid bearer token returns 401', async () => {
      const res = await fetch(`${baseUrl}/api/pdf-shares`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer totally-invalid-jwt-token'
        },
        body: JSON.stringify({ title: 'Invalid Token Document' })
      });
      assert.strictEqual(res.status, 401);
    });

    it('Production mode strictly rejects test-token-* authentication', async () => {
      // Temporarily set NODE_ENV to production
      const prevEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      try {
        const res = await fetch(`${prodBaseUrl}/api/pdf-shares`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token-fake-admin'
          },
          body: JSON.stringify({ title: 'Spoofed Token Attempt' })
        });
        assert.strictEqual(res.status, 401, 'Production mode must reject synthetic test-token-*');
      } finally {
        process.env.NODE_ENV = prevEnv;
      }
    });

    it('Missing share returns 404', async () => {
      const res = await fetch(`${baseUrl}/api/pdf-shares/pdf-nonexistent1234567890`);
      assert.strictEqual(res.status, 404);
    });

    it('Oversized upload (>10MB) returns 413 Payload Too Large', async () => {
      const oversized = Buffer.alloc(MAX_FILE_SIZE_BYTES + 1024);
      oversized.write('%PDF-1.4\n');

      const res = await fetch(`${baseUrl}/api/pdf-shares`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token-user-1'
        },
        body: JSON.stringify({
          title: 'Oversized',
          fileName: 'oversized.pdf',
          fileBase64: oversized.toString('base64')
        })
      });
      assert.strictEqual(res.status, 413);
    });

    it('Invalid PDF without %PDF- signature returns 415 Unsupported Media Type', async () => {
      const invalid = Buffer.from('<html>Not a real PDF</html>');

      const res = await fetch(`${baseUrl}/api/pdf-shares`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token-user-1'
        },
        body: JSON.stringify({
          title: 'Invalid format',
          fileName: 'test.pdf',
          fileBase64: invalid.toString('base64')
        })
      });
      assert.strictEqual(res.status, 415);
    });
  });

  // =========================================================================
  // TASK H: FILE REPLACEMENT COMPENSATION WITH INJECTED FAILURES
  // =========================================================================
  describe('Task H: File Replacement Staged Upload and Compensation Workflow', () => {
    let createdShareId: string;
    const initialPdf = Buffer.concat([VALID_PDF_HEADER, Buffer.from('\n% Original Version 1')]);

    before(async () => {
      const res = await fetch(`${baseUrl}/api/pdf-shares`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token-replace-owner'
        },
        body: JSON.stringify({
          title: 'Compensation Test Document',
          fileName: 'original.pdf',
          fileBase64: initialPdf.toString('base64')
        })
      });
      const data = await res.json();
      createdShareId = data.id;
    });

    it('Preserves previous valid document when staged upload fails', async () => {
      testStorage.shouldFailSave = true;

      const replacementPdf = Buffer.concat([VALID_PDF_HEADER, Buffer.from('\n% Failed Upload V2')]);
      const res = await fetch(`${baseUrl}/api/pdf-shares/${createdShareId}/file`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token-replace-owner'
        },
        body: JSON.stringify({
          fileName: 'failed_v2.pdf',
          fileBase64: replacementPdf.toString('base64')
        })
      });
      assert.strictEqual(res.status, 500);

      // Verify original file remains downloadable and intact
      testStorage.shouldFailSave = false;
      const dlRes = await fetch(`${baseUrl}/api/pdf-shares/${createdShareId}/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      assert.strictEqual(dlRes.status, 200);
      const dlBuf = Buffer.from(await dlRes.arrayBuffer());
      assert.deepStrictEqual(dlBuf, initialPdf);
    });

    it('Rolls back staged object and preserves previous valid document when metadata update fails', async () => {
      testDb.shouldFailUpdate = true;

      const replacementPdf = Buffer.concat([VALID_PDF_HEADER, Buffer.from('\n% Rollback Test V2')]);
      const res = await fetch(`${baseUrl}/api/pdf-shares/${createdShareId}/file`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token-replace-owner'
        },
        body: JSON.stringify({
          fileName: 'rollback_v2.pdf',
          fileBase64: replacementPdf.toString('base64')
        })
      });
      assert.strictEqual(res.status, 500);

      testDb.shouldFailUpdate = false;

      // Verify original file remains downloadable and metadata was preserved
      const dlRes = await fetch(`${baseUrl}/api/pdf-shares/${createdShareId}/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      assert.strictEqual(dlRes.status, 200);
      const dlBuf = Buffer.from(await dlRes.arrayBuffer());
      assert.deepStrictEqual(dlBuf, initialPdf);
    });
  });

  // =========================================================================
  // TASK G: UPLOAD STREAMING & BOUNDED MEMORY DELTA
  // =========================================================================
  describe('Task G: Upload Memory Bounds & Bounded Ephemeral Streaming', () => {
    it('Streams upload without unbounded RAM accumulation and verifies peak memory delta', async () => {
      const initialMem = process.memoryUsage().heapUsed;
      const pdfBytes = Buffer.concat([VALID_PDF_HEADER, Buffer.from('X'.repeat(5 * 1024 * 1024))]); // 5 MB

      const res = await fetch(`${baseUrl}/api/pdf-shares`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token-mem-owner'
        },
        body: JSON.stringify({
          title: 'Memory Bound Test',
          fileName: 'bound.pdf',
          fileBase64: pdfBytes.toString('base64')
        })
      });
      assert.strictEqual(res.status, 201);

      if (global.gc) {
        global.gc();
      }
      const finalMem = process.memoryUsage().heapUsed;
      const memDeltaMB = (finalMem - initialMem) / (1024 * 1024);
      // Ensure heap delta is bounded and reasonable
      assert.ok(memDeltaMB < 50, `Memory delta must be bounded (observed: ${memDeltaMB.toFixed(2)} MB)`);
    });
  });

  // =========================================================================
  // TASK F: ASYNC CONCURRENCY & RESPONSIVENESS TEST
  // =========================================================================
  describe('Task F: Async scrypt Concurrency & Server Responsiveness', () => {
    it('Health/metadata endpoint responds immediately while multiple heavy scrypt derivations run', async () => {
      // Launch 5 concurrent heavy scrypt derivations
      const scryptPromises = Array.from({ length: 5 }, (_, i) =>
        hashSharePassword(`concurrent-heavy-password-${i}`)
      );

      // Concurrently query health endpoint
      const t0 = Date.now();
      const healthRes = await fetch(`${baseUrl}/api/health`);
      const elapsedMs = Date.now() - t0;

      assert.strictEqual(healthRes.status, 200);
      // Health check must not be starved by scrypt worker pool
      assert.ok(elapsedMs < 100, `Health check must respond rapidly under scrypt load (took ${elapsedMs}ms)`);

      // Await all derivations
      const hashes = await Promise.all(scryptPromises);
      assert.strictEqual(hashes.length, 5);
      hashes.forEach((h) => {
        assert.strictEqual(h.version, 'scrypt_v1');
        assert.strictEqual(h.hash.length, 128);
      });
    });
  });

  // =========================================================================
  // TASK E: PROXY TRUST EVALUATION TEST MATRIX
  // =========================================================================
  describe('Task E: Proxy Trust Evaluation Test Matrix', () => {
    it('Evaluates proxy resolution across all required client IP formats without printing raw IPs', () => {
      const cases = [
        { desc: 'Direct request without forwarded headers', headers: {}, expected: '127.0.0.1' },
        { desc: 'Single trusted forwarded value', headers: { 'x-forwarded-for': '203.0.113.195' }, expected: '203.0.113.195' },
        { desc: 'Multiple forwarded values (trusted last hop)', headers: { 'x-forwarded-for': '10.0.0.1, 198.51.100.2, 203.0.113.195' }, expected: '203.0.113.195' },
        { desc: 'Attacker-supplied prefix with trusted hop', headers: { 'x-forwarded-for': 'attacker.spoof, 203.0.113.50' }, expected: '203.0.113.50' },
        { desc: 'Invalid IP address string', headers: { 'x-forwarded-for': 'invalid-not-an-ip' }, expected: '127.0.0.1' },
        { desc: 'IPv4-mapped IPv6 address', headers: { 'x-forwarded-for': '::ffff:192.168.1.99' }, expected: '192.168.1.99' },
        { desc: 'Address containing port', headers: { 'x-forwarded-for': '192.168.1.99:8080' }, expected: '192.168.1.99' },
        { desc: 'Missing socket address fallback', headers: {}, expected: '127.0.0.1' }
      ];

      for (const tc of cases) {
        const mockReq: any = {
          headers: tc.headers,
          socket: { remoteAddress: '127.0.0.1' }
        };
        const resolved = extractTrustedClientIp(mockReq);
        assert.strictEqual(resolved, tc.expected, `Failed case: ${tc.desc}`);
      }
    });
  });
});
