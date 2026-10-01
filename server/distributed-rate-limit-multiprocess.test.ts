import { describe, it } from 'node:test';
import assert from 'node:assert';
import { fork } from 'child_process';
import path from 'path';

describe('Task D: Multi-Process Distributed Rate Limiting via Real Firestore Emulator', () => {
  it('enforces shared lockout across independent Node processes via Firestore emulator', async () => {
    const workerScript = path.resolve(process.cwd(), 'server/rate-limit-worker.cjs');

    const runWorker = (action: string, shareId: string, clientIp: string): Promise<any> => {
      return new Promise((resolve, reject) => {
        const child = fork(workerScript, [action, shareId, clientIp], {
          env: {
            ...process.env,
            FIRESTORE_EMULATOR_HOST: '127.0.0.1:8085',
            GCLOUD_PROJECT: 'demo-freeqrbarcodes-security',
            RATE_LIMIT_SECRET: 'test-multiprocess-secret-1234567890abcdef'
          },
          silent: true
        });

        let output = '';
        child.stdout?.on('data', (d) => (output += d.toString()));
        child.stderr?.on('data', (d) => (output += d.toString()));

        child.on('close', (code) => {
          if (code !== 0) {
            return reject(new Error(`Worker exited with code ${code}: ${output}`));
          }
          try {
            resolve(JSON.parse(output.trim()));
          } catch (e) {
            reject(new Error(`Failed to parse worker output: ${output}`));
          }
        });
      });
    };

    const testShare = 'share-multiprocess-test-42';
    const testIp = '198.51.100.77';

    // Step 0: Ensure cleared
    await runWorker('reset', testShare, testIp);

    // Step 1: Instance A records 3 failed attempts
    const resA = await runWorker('fail_3', testShare, testIp);
    assert.strictEqual(resA.attempts, 3);
    assert.strictEqual(resA.locked, false);

    // Step 2: Instance B continues the same key and records 2 more attempts (total 5)
    const resB = await runWorker('fail_2', testShare, testIp);
    assert.strictEqual(resB.attempts, 5);
    assert.strictEqual(resB.locked, true);
    assert.ok(resB.retryAfterSeconds > 0);

    // Step 3: Both instances A and B have terminated.
    // Step 4: Fresh Instance C starts and observes still-active lockout
    const resC = await runWorker('check', testShare, testIp);
    assert.strictEqual(resC.allowed, false);
    assert.ok(resC.retryAfterSeconds > 0);

    // Step 5: Successful authentication in fresh Instance D resets rate limit
    await runWorker('reset', testShare, testIp);
    const resE = await runWorker('check', testShare, testIp);
    assert.strictEqual(resE.allowed, true);
  });
});
