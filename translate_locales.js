import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const languages = {
  ar: 'Arabic',
  ur: 'Urdu',
  fr: 'French',
  de: 'German',
  es: 'Spanish',
  it: 'Italian',
  pt: 'Portuguese',
  tr: 'Turkish',
  id: 'Indonesian',
  hi: 'Hindi',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese (Simplified)'
};

function log(msg) {
  console.log(msg);
  fs.appendFileSync('translate_progress.log', msg + '\n', 'utf8');
}

function shouldTranslate(enVal, targetVal) {
  if (targetVal === undefined) return true;
  if (enVal !== targetVal) return false;
  
  // If no letters (only numbers, punctuation, symbols, spaces, emojis, etc.)
  if (!/[a-zA-Z]/.test(enVal)) return false;
  
  // Brand names and technical terms that should NEVER be translated as standalone values
  const noTranslate = [
    'freeqrgen.pro', 'free qr generator', 'isolutions', 'qr code', 'qr codes',
    'wi-fi', 'ssid', 'url', 'wpa', 'wep', 'vcard', 'pdf', 'png', 'svg', 'utc',
    'saas', 'api', 'http', 'https', 'gps', 'geo'
  ];
  const normalized = enVal.toLowerCase().trim();
  if (noTranslate.includes(normalized)) return false;
  if (noTranslate.some(term => normalized === term || normalized === term + '.' || normalized === term + '!')) return false;
  
  return true;
}

// Helper to chunk an array
function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

// Low-level batch translation function using a specific model
async function translateBatch(batch, langName, model) {
  const payload = {};
  const properties = {};
  const requiredKeys = [];

  batch.forEach(({ key, value }) => {
    payload[key] = value;
    properties[key] = {
      type: Type.STRING,
      description: `The professional ${langName} translation for: "${value}"`
    };
    requiredKeys.push(key);
  });

  const prompt = `You are a professional software translator for a premium QR code generator application.
Translate the following English key-value pairs into ${langName}.

Rules:
1. Preserve all placeholders like {count}, {name}, {{variable}}, {something}, {value}, {time}, {date}, etc. EXACTLY as they are in English. Do not translate or modify the words or variables inside the braces/brackets.
2. Preserve all HTML tags (e.g. <strong>, </strong>, <br>, <a>, etc.) and Markdown formatting exactly.
3. NEVER translate the following brand and product terms (keep them exactly as they are in English):
   - "FreeQRGen.pro"
   - "Free QR Generator"
   - "iSolutions"
   - "QR Code"
   - "QR Codes"
4. Translate all other text professionally, naturally, and contextually for a modern SaaS product/utility.
5. Return ONLY a valid JSON object matching the input keys with their translated values.

Input:
${JSON.stringify(payload, null, 2)}`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties,
        required: requiredKeys
      }
    },
  });

  const text = response.text?.trim();
  if (!text) {
    throw new Error('Empty response from model');
  }

  const translated = JSON.parse(text);
  return translated;
}

// High-level batch translation with automatic model switching, retries, and backoff
async function translateBatchWithRetry(batch, langName) {
  const maxAttempts = 10;
  let delay = 5000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Use gemini-3.1-flash-lite as primary (highly stable and fast), fallback to gemini-3.5-flash
    const model = attempt <= 5 ? 'gemini-3.1-flash-lite' : 'gemini-3.5-flash';
    try {
      const result = await translateBatch(batch, langName, model);
      return result;
    } catch (err) {
      log(`  [Attempt ${attempt}/${maxAttempts} with ${model} failed]: ${err.message}`);
      if (attempt === maxAttempts) {
        throw err;
      }
      const jitter = Math.random() * 3000;
      const actualDelay = delay + jitter;
      log(`  Waiting ${Math.round(actualDelay)}ms before retrying...`);
      await new Promise(r => setTimeout(r, actualDelay));
      delay = Math.min(delay * 1.5, 30000); // Cap backoff at 30 seconds
    }
  }
}

async function run() {
  // Append to progress log instead of overwriting, to preserve history
  fs.appendFileSync('translate_progress.log', '\n=== Translation Log Resumed ===\n', 'utf8');

  const enPath = path.join('src', 'locales', 'en.json');
  if (!fs.existsSync(enPath)) {
    log('English locale file not found at: ' + enPath);
    process.exit(1);
  }

  const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const enKeys = Object.keys(en);

  log(`Loaded English locale with ${enKeys.length} keys.`);

  // Process languages sequentially to minimize API concurrency issues
  for (const [loc, langName] of Object.entries(languages)) {
    log(`\n==============================================`);
    log(`Processing Locale: ${loc} (${langName})`);
    log(`==============================================`);

    const locPath = path.join('src', 'locales', `${loc}.json`);
    let target = {};
    if (fs.existsSync(locPath)) {
      try {
        target = JSON.parse(fs.readFileSync(locPath, 'utf8'));
      } catch (e) {
        log(`  Could not parse existing ${loc}.json, starting fresh.`);
      }
    }

    // Determine keys needing translation
    const itemsToTranslate = [];
    enKeys.forEach(k => {
      if (shouldTranslate(en[k], target[k])) {
        itemsToTranslate.push({ key: k, value: en[k] });
      } else {
        if (target[k] === undefined) {
          target[k] = en[k];
        }
      }
    });

    log(`  Total keys: ${enKeys.length}`);
    log(`  Already translated/untranslatable: ${enKeys.length - itemsToTranslate.length}`);
    log(`  Keys needing translation: ${itemsToTranslate.length}`);

    if (itemsToTranslate.length === 0) {
      log(`  No keys need translation for ${loc}. Saving file to align keys.`);
      const aligned = {};
      enKeys.forEach(k => {
        aligned[k] = target[k] !== undefined ? target[k] : en[k];
      });
      fs.writeFileSync(locPath, JSON.stringify(aligned, null, 2), 'utf8');
      continue;
    }

    // Batch size of 80 ensures fast, stable translations with structured outputs
    const BATCH_SIZE = 80;
    const batches = chunkArray(itemsToTranslate, BATCH_SIZE);
    log(`  Divided into ${batches.length} batches of size up to ${BATCH_SIZE}.`);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      log(`  Translating batch ${i + 1}/${batches.length} (${batch.length} keys)...`);
      
      try {
        const translatedBatch = await translateBatchWithRetry(batch, langName);
        Object.entries(translatedBatch).forEach(([k, v]) => {
          target[k] = v;
        });

        // Write incremental updates to file after every batch so we don't lose progress
        const aligned = {};
        enKeys.forEach(k => {
          aligned[k] = target[k] !== undefined ? target[k] : en[k];
        });
        fs.writeFileSync(locPath, JSON.stringify(aligned, null, 2), 'utf8');
      } catch (batchErr) {
        log(`  [CRITICAL] Batch ${i + 1} failed permanently after all retries: ${batchErr.message}`);
        log('  Falling back to English values for failed batch keys to maintain key alignment.');
        batch.forEach(({ key, value }) => {
          if (target[key] === undefined) {
            target[key] = value;
          }
        });
      }

      // Respectful throttle between sequential batches to maintain high API stability
      await new Promise(r => setTimeout(r, 2000));
    }

    // Final alignment check and write to ensure perfectly ordered keys matching en.json
    const finalAligned = {};
    enKeys.forEach(k => {
      finalAligned[k] = target[k] !== undefined ? target[k] : en[k];
    });
    fs.writeFileSync(locPath, JSON.stringify(finalAligned, null, 2), 'utf8');

    let remainingIdentical = 0;
    Object.keys(en).forEach(k => {
      if (shouldTranslate(en[k], finalAligned[k])) remainingIdentical++;
    });
    log(`  Finished ${loc}. Remaining keys identical to English: ${remainingIdentical}`);
  }

  log('\nAll locales processed successfully!');
}

run().catch(err => {
  log('Fatal translation engine error: ' + err.message);
  process.exit(1);
});
