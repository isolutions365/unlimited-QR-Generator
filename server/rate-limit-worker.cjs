const { initializeApp, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const crypto = require('crypto');

let app;
if (getApps().length === 0) {
  app = initializeApp({
    projectId: process.env.GCLOUD_PROJECT || 'demo-freeqrbarcodes-security'
  });
} else {
  app = getApps()[0];
}

const db = getFirestore(app);
const RATE_LIMIT_CONFIG = {
  MAX_ATTEMPTS: 5,
  WINDOW_MS: 15 * 60 * 1000,
  LOCKOUT_MS: 15 * 60 * 1000,
  COLLECTION: 'pdf_share_rate_limits'
};

function computeDocId(shareId, clientIp) {
  const secret = process.env.RATE_LIMIT_SECRET || 'fallback-secret';
  const cleanShareId = shareId.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 64);
  const clientHmac = crypto.createHmac('sha256', secret).update(clientIp).digest('hex').substring(0, 32);
  return `${cleanShareId}_${clientHmac}`;
}

async function checkRateLimit(shareId, clientIp) {
  const docId = computeDocId(shareId, clientIp);
  const snap = await db.collection(RATE_LIMIT_CONFIG.COLLECTION).doc(docId).get();
  if (!snap.exists) return { allowed: true };
  const data = snap.data();
  const now = Date.now();
  const lockUntil = Number(data.lockUntil) || 0;
  if (lockUntil > now) {
    return { allowed: false, retryAfterSeconds: Math.ceil((lockUntil - now) / 1000) };
  }
  return { allowed: true };
}

async function recordFailedAttempt(shareId, clientIp) {
  const docId = computeDocId(shareId, clientIp);
  const docRef = db.collection(RATE_LIMIT_CONFIG.COLLECTION).doc(docId);
  const now = Date.now();

  return await db.runTransaction(async (transaction) => {
    const snap = await transaction.get(docRef);
    const data = snap.exists ? snap.data() : null;

    let attempts = 0;
    let firstAttemptAt = now;
    let lockUntil = 0;

    if (data) {
      const prevFirst = Number(data.firstAttemptAt) || now;
      const prevLock = Number(data.lockUntil) || 0;
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

    transaction.set(docRef, {
      attempts,
      lockUntil,
      firstAttemptAt,
      lastAttemptAt: now,
      expireAt: new Date(now + 24 * 60 * 60 * 1000)
    });

    return {
      attempts,
      locked: lockUntil > now,
      retryAfterSeconds: lockUntil > now ? Math.ceil((lockUntil - now) / 1000) : 0
    };
  });
}

async function resetRateLimit(shareId, clientIp) {
  const docId = computeDocId(shareId, clientIp);
  await db.collection(RATE_LIMIT_CONFIG.COLLECTION).doc(docId).delete();
  return { reset: true };
}

async function main() {
  const [,, action, shareId, clientIp] = process.argv;
  if (action === 'check') {
    const res = await checkRateLimit(shareId, clientIp);
    process.stdout.write(JSON.stringify(res));
  } else if (action === 'fail_3') {
    let lastRes;
    for (let i = 0; i < 3; i++) {
      lastRes = await recordFailedAttempt(shareId, clientIp);
    }
    process.stdout.write(JSON.stringify(lastRes));
  } else if (action === 'fail_2') {
    let lastRes;
    for (let i = 0; i < 2; i++) {
      lastRes = await recordFailedAttempt(shareId, clientIp);
    }
    process.stdout.write(JSON.stringify(lastRes));
  } else if (action === 'reset') {
    const res = await resetRateLimit(shareId, clientIp);
    process.stdout.write(JSON.stringify(res));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
