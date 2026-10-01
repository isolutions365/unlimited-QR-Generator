import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  RulesTestEnvironment
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, getBytes, uploadBytes, deleteObject } from 'firebase/storage';

const PROJECT_ID = 'demo-freeqrbarcodes-security';
const FIRESTORE_PORT = 8085;
const STORAGE_PORT = 9199;

describe('STEP 6H-CLOSURE: Genuine Firebase Emulator Security Rules Tests', () => {
  let testEnv: RulesTestEnvironment;

  before(async () => {
    const firestoreRules = fs.readFileSync(path.resolve(process.cwd(), 'firestore.rules'), 'utf-8');
    const storageRules = fs.readFileSync(path.resolve(process.cwd(), 'storage.rules'), 'utf-8');

    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        host: '127.0.0.1',
        port: FIRESTORE_PORT,
        rules: firestoreRules,
      },
      storage: {
        host: '127.0.0.1',
        port: STORAGE_PORT,
        rules: storageRules,
      }
    });
  });

  after(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  beforeEach(async () => {
    if (testEnv) {
      await testEnv.clearFirestore();
      await testEnv.clearStorage();
    }
  });

  // =========================================================================
  // TASK B.1: FIRESTORE SECURITY RULES (GENUINE EMULATOR EXECUTION)
  // =========================================================================
  describe('Firestore Security Rules: Direct Access Denial and Anti-Regression', () => {
    it('Unauthenticated read of pdf_shares/{id} fails on emulator', async () => {
      // Setup fixture via Admin/rules-disabled context
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await setDoc(doc(adminDb, 'pdf_shares', 'share-unauth-test'), {
          title: 'Private Share',
          userId: 'owner-1'
        });
      });

      const unauthDb = testEnv.unauthenticatedContext().firestore();
      await assertFails(getDoc(doc(unauthDb, 'pdf_shares', 'share-unauth-test')));
    });

    it('Authenticated owner read of pdf_shares/{id} fails on emulator', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await setDoc(doc(adminDb, 'pdf_shares', 'share-owner-test'), {
          title: 'Owner Document',
          userId: 'owner-1'
        });
      });

      const ownerDb = testEnv.authenticatedContext('owner-1').firestore();
      await assertFails(getDoc(doc(ownerDb, 'pdf_shares', 'share-owner-test')));
    });

    it('Authenticated owner direct write of pdf_shares/{id} fails on emulator', async () => {
      const ownerDb = testEnv.authenticatedContext('owner-1').firestore();
      await assertFails(setDoc(doc(ownerDb, 'pdf_shares', 'share-owner-write'), {
        title: 'Bypassing Server API',
        userId: 'owner-1'
      }));
    });

    it('Non-owner read and write of pdf_shares/{id} fail on emulator', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await setDoc(doc(adminDb, 'pdf_shares', 'share-target-doc'), {
          title: 'Secret Document',
          userId: 'owner-1'
        });
      });

      const attackerDb = testEnv.authenticatedContext('attacker-user').firestore();
      await assertFails(getDoc(doc(attackerDb, 'pdf_shares', 'share-target-doc')));
      await assertFails(setDoc(doc(attackerDb, 'pdf_shares', 'share-target-doc'), {
        title: 'Tampered Document'
      }));
    });

    it('Direct read and write of pdf_share_rate_limits/{id} fail on emulator', async () => {
      const userDb = testEnv.authenticatedContext('any-user').firestore();
      const unauthDb = testEnv.unauthenticatedContext().firestore();

      await assertFails(setDoc(doc(userDb, 'pdf_share_rate_limits', 'limit-doc-1'), {
        attempts: 0
      }));
      await assertFails(getDoc(doc(userDb, 'pdf_share_rate_limits', 'limit-doc-1')));
      await assertFails(getDoc(doc(unauthDb, 'pdf_share_rate_limits', 'limit-doc-1')));
    });

    it('Admin fixture setup succeeds through rules-disabled context', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        const testDocRef = doc(adminDb, 'pdf_shares', 'admin-created-doc');
        await setDoc(testDocRef, {
          title: 'Admin Created Doc',
          userId: 'admin'
        });
        const snap = await getDoc(testDocRef);
        assert.strictEqual(snap.exists(), true);
        assert.strictEqual(snap.data()?.title, 'Admin Created Doc');
      });
    });

    it('Existing users collection owner read/write succeeds according to real rule', async () => {
      const userDb = testEnv.authenticatedContext('alice-uid').firestore();
      const userDocRef = doc(userDb, 'users', 'alice-uid');

      await assertSucceeds(setDoc(userDocRef, {
        displayName: 'Alice',
        email: 'alice@example.com'
      }));
      const snap = await assertSucceeds(getDoc(userDocRef));
      assert.strictEqual(snap.data()?.displayName, 'Alice');
    });

    it('Cross-user users access fails according to real rule', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await setDoc(doc(adminDb, 'users', 'alice-uid'), {
          displayName: 'Alice Private Profile',
          email: 'alice@example.com'
        });
      });

      const bobDb = testEnv.authenticatedContext('bob-attacker-uid').firestore();
      const aliceDocRef = doc(bobDb, 'users', 'alice-uid');

      await assertFails(getDoc(aliceDocRef));
      await assertFails(updateDoc(aliceDocRef, { displayName: 'Hacked Alice' }));
    });

    it('Existing projects collection owner create succeeds according to real rule', async () => {
      const ownerDb = testEnv.authenticatedContext('owner-proj-1').firestore();
      const projectRef = doc(ownerDb, 'projects', 'proj-123');

      await assertSucceeds(setDoc(projectRef, {
        userId: 'owner-proj-1',
        title: 'Project Alpha'
      }));
    });

    it('Cross-owner projects operation fails according to real rule', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await setDoc(doc(adminDb, 'projects', 'proj-456'), {
          userId: 'legitimate-owner',
          title: 'Confidential Project'
        });
      });

      const attackerDb = testEnv.authenticatedContext('attacker-user').firestore();
      const projRef = doc(attackerDb, 'projects', 'proj-456');

      // Public read is permitted for redirects:
      await assertSucceeds(getDoc(projRef));

      // Attacker update and delete MUST fail:
      await assertFails(updateDoc(projRef, { title: 'Overwritten Project' }));
      await assertFails(deleteDoc(projRef));
    });

    it('Dynamic QRs collection preserves owner validation and blocks cross-owner update', async () => {
      const ownerDb = testEnv.authenticatedContext('qr-owner-1').firestore();
      const qrRef = doc(ownerDb, 'dynamicQRs', 'qr-123');

      // Valid owner creation
      await assertSucceeds(setDoc(qrRef, {
        id: 'qr-123',
        ownerId: 'qr-owner-1',
        destinationUrl: 'https://example.com/target',
        status: 'active',
        createdAt: '2026-10-01T00:00:00Z'
      }));

      // Cross-owner update attempt
      const attackerDb = testEnv.authenticatedContext('attacker-user').firestore();
      const targetQrRef = doc(attackerDb, 'dynamicQRs', 'qr-123');
      await assertFails(updateDoc(targetQrRef, { destinationUrl: 'https://malicious.example.com' }));
    });
  });

  // =========================================================================
  // TASK B.2: STORAGE SECURITY RULES (GENUINE EMULATOR EXECUTION)
  // =========================================================================
  describe('Storage Security Rules: Direct Access Denial and Anti-Regression', () => {
    const dummyBytes = Buffer.from('%PDF-1.4 synthetic pdf');

    it('Unauthenticated read of pdf_shares/** fails on storage emulator', async () => {
      // Seed storage fixture via rules disabled
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminStorage = context.storage();
        const fileRef = ref(adminStorage, 'pdf_shares/owner-1/share-1.pdf');
        await uploadBytes(fileRef, dummyBytes, { contentType: 'application/pdf' });
      });

      const unauthStorage = testEnv.unauthenticatedContext().storage();
      const fileRef = ref(unauthStorage, 'pdf_shares/owner-1/share-1.pdf');
      await assertFails(getBytes(fileRef));
    });

    it('Authenticated owner direct read of pdf_shares/** fails on storage emulator', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminStorage = context.storage();
        const fileRef = ref(adminStorage, 'pdf_shares/owner-1/share-1.pdf');
        await uploadBytes(fileRef, dummyBytes, { contentType: 'application/pdf' });
      });

      const ownerStorage = testEnv.authenticatedContext('owner-1').storage();
      const fileRef = ref(ownerStorage, 'pdf_shares/owner-1/share-1.pdf');
      await assertFails(getBytes(fileRef));
    });

    it('Authenticated owner direct write to pdf_shares/** fails on storage emulator', async () => {
      const ownerStorage = testEnv.authenticatedContext('owner-1').storage();
      const fileRef = ref(ownerStorage, 'pdf_shares/owner-1/share-new.pdf');
      await assertFails(uploadBytes(fileRef, dummyBytes, { contentType: 'application/pdf' }));
    });

    it('Cross-owner direct access to pdf_shares/** fails on storage emulator', async () => {
      const attackerStorage = testEnv.authenticatedContext('attacker-user').storage();
      const fileRef = ref(attackerStorage, 'pdf_shares/owner-1/share-1.pdf');
      await assertFails(getBytes(fileRef));
      await assertFails(uploadBytes(fileRef, dummyBytes, { contentType: 'application/pdf' }));
      await assertFails(deleteObject(fileRef));
    });

    it('Admin SDK/rules-disabled context can successfully manage storage fixtures', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminStorage = context.storage();
        const fileRef = ref(adminStorage, 'pdf_shares/system/sample.pdf');
        await assertSucceeds(uploadBytes(fileRef, dummyBytes, { contentType: 'application/pdf' }));
        const downloaded = await assertSucceeds(getBytes(fileRef));
        assert.deepStrictEqual(Buffer.from(downloaded), dummyBytes);
        await assertSucceeds(deleteObject(fileRef));
      });
    });

    it('Existing non-PDF storage paths retain default deny behavior', async () => {
      const userStorage = testEnv.authenticatedContext('user-1').storage();
      const unauthStorage = testEnv.unauthenticatedContext().storage();

      const userFileRef = ref(userStorage, 'user_uploads/avatar.png');
      const unauthFileRef = ref(unauthStorage, 'public_files/doc.txt');

      await assertFails(uploadBytes(userFileRef, Buffer.from('image bytes')));
      await assertFails(getBytes(unauthFileRef));
    });
  });
});
