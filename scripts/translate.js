import { GoogleGenAI, Type } from '@google/genai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load env variables
dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const LOCALES_DIR = './src/locales';
const TARGET_LOCALES = ['ar', 'ur', 'fr', 'de', 'es', 'it', 'pt', 'tr', 'id', 'hi', 'ja', 'ko', 'zh'];

const LANGUAGE_NAMES = {
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
  zh: 'Simplified Chinese'
};

const EXCLUDED_BRANDS = ['FreeQRGen.pro', 'Free QR Generator', 'iSolutions', 'QR Code'];

// Simple check to identify if a value is a URL, hex color, or something that shouldn't be translated
function shouldSkipTranslation(key, val) {
  if (!val || typeof val !== 'string') return true;
  const trimmed = val.trim();
  if (trimmed === '') return true;
  // Keep hex colors and absolute brand names excluded, but allow others
  if (trimmed.startsWith('#') && (trimmed.length === 4 || trimmed.length === 7)) return true; // Hex color
  if (EXCLUDED_BRANDS.includes(trimmed)) return true;
  return false;
}

// Extract JSON safely even if wrapped in markdown code blocks or conversational text
function cleanAndParseJson(text) {
  let cleaned = text.trim();
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  
  let startIdx = -1;
  let endIdx = -1;
  
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    endIdx = cleaned.lastIndexOf('}');
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    endIdx = cleaned.lastIndexOf(']');
  }
  
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleaned = cleaned.slice(startIdx, endIdx + 1);
  }
  return JSON.parse(cleaned);
}

async function translateBatch(locale, langName, keysAndValues) {
  const items = Object.entries(keysAndValues).map(([key, val]) => ({ key, english: val }));

  const prompt = `You are an expert translator. Translate the following list of English key-value pairs into ${langName} (${locale}).

Rules:
1. Translate EVERY "english" value professionally and naturally into the "translation" field.
2. Do NOT translate or modify these brand/product names: "FreeQRGen.pro", "Free QR Generator", "iSolutions", "QR Code".
3. Preserve all ICU variables and curly braces exactly as they are in the original string: e.g. {count}, {name}, {{variable}}, {speed}, {speed_label}, {speed_value}, {plural}, {select}, etc.
4. Keep all HTML tags (like <strong>, <em>, <span>, <code>, <br>) and Markdown unchanged.
5. Keep URLs, email addresses, and hex colors unchanged.
6. The "key" field in each output item MUST be exactly the same as in the input list.

Input list:
${JSON.stringify(items, null, 2)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              key: { type: Type.STRING, description: "The original translation key from the input list." },
              translation: { type: Type.STRING, description: "The professionally translated string." }
            },
            required: ['key', 'translation']
          }
        }
      }
    });

    const text = response.text?.trim() || '[]';
    const parsed = cleanAndParseJson(text);
    
    const result = {};
    if (Array.isArray(parsed)) {
      parsed.forEach(item => {
        if (item && item.key) {
          result[item.key] = item.translation;
        }
      });
    }
    return result;
  } catch (err) {
    console.error(`Error translating batch for ${locale}:`, err.message);
    throw err;
  }
}

async function main() {
  const enPath = path.join(LOCALES_DIR, 'en.json');
  if (!fs.existsSync(enPath)) {
    console.error(`en.json not found at ${enPath}`);
    process.exit(1);
  }

  const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  console.log(`Loaded English base with ${Object.keys(enData).length} keys.`);

  let locales = TARGET_LOCALES;
  if (process.env.LIMIT_LOCALES) {
    locales = process.env.LIMIT_LOCALES.split(',');
  }

  for (const locale of locales) {
    try {
      const langName = LANGUAGE_NAMES[locale];
      if (!langName) {
        console.error(`Unsupported locale: ${locale}`);
        continue;
      }
      console.log(`\n==================================================`);
      console.log(`Processing locale: ${locale.toUpperCase()} (${langName})`);

      const localePath = path.join(LOCALES_DIR, `${locale}.json`);
      let localeData = {};
      if (fs.existsSync(localePath)) {
        localeData = JSON.parse(fs.readFileSync(localePath, 'utf8'));
      }

      // 1. Identify keys to translate: either missing entirely, or equal to English and not excluded
      const keysToTranslate = [];
      for (const [key, enVal] of Object.entries(enData)) {
        const targetVal = localeData[key];
        const isMissing = targetVal === undefined;
        const isCopyOfEnglish = targetVal === enVal;

        const isNewKey = [
          'auth.accessRestrictedDesc',
          'auth.signInSignUpButton',
          'error.signInToSave',
          'error.signInToSimulate',
          'error.seedFailed',
          'error.downloadSuccessClaimSession',
          'confirm.clearAllScans',
          'confirm.deletePreset',
          'error.loadAnalyticsFailed',
          'error.saveFailed',
          'error.removeFailed',
          'error.updateFolderFailed',
          'error.clearLogsFailed'
        ].includes(key);

        if (isMissing && isNewKey && !shouldSkipTranslation(key, enVal)) {
          keysToTranslate.push({ key, val: enVal });
        }
      }

      console.log(`Found ${keysToTranslate.length} keys that need professional translation/updates.`);

      if (keysToTranslate.length === 0) {
        console.log(`All keys in ${locale} are already translated!`);
        continue;
      }

      // 2. Batch translation (e.g. 10 keys per batch)
      const BATCH_SIZE = 10;
      const updatedData = { ...localeData };

      for (let i = 0; i < keysToTranslate.length; i += BATCH_SIZE) {
        if (process.env.LIMIT_BATCHES && (i / BATCH_SIZE) >= parseInt(process.env.LIMIT_BATCHES, 10)) {
          console.log(`Limit of ${process.env.LIMIT_BATCHES} batches reached. Stopping further batches for this locale.`);
          break;
        }
        const chunk = keysToTranslate.slice(i, i + BATCH_SIZE);
        const batchObj = {};
        chunk.forEach(item => {
          batchObj[item.key] = item.val;
        });

        console.log(`Translating batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(keysToTranslate.length / BATCH_SIZE)} (${chunk.length} keys)...`);

        // Add a robust retry mechanism with backoff
        let retries = 5;
        let translatedBatchObj = null;
        let delay = 3000;
        while (retries > 0) {
          try {
            translatedBatchObj = await translateBatch(locale, langName, batchObj);
            break;
          } catch (e) {
            retries--;
            console.log(`Error encountered. Retries left: ${retries}. Waiting ${delay / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // Exponential backoff
          }
        }

        if (translatedBatchObj) {
          for (const [key, transVal] of Object.entries(translatedBatchObj)) {
            updatedData[key] = transVal;
          }
        } else {
          console.error(`Failed to translate batch starting at index ${i} for ${locale}`);
        }

        // Add a generous delay between batches to respect API rate limits and avoid 503 errors
        await new Promise(resolve => setTimeout(resolve, 2500));
      }

      // 3. Keep all keys synchronized with en.json, even skipped ones (like colors/urls)
      for (const [key, enVal] of Object.entries(enData)) {
        if (updatedData[key] === undefined) {
          updatedData[key] = enVal;
        }
      }

      // 4. Remove any stale keys that are not in en.json
      for (const key of Object.keys(updatedData)) {
        if (enData[key] === undefined) {
          delete updatedData[key];
        }
      }

      // 5. Sort keys alphabetically for clean structure
      const sortedData = {};
      Object.keys(enData).sort().forEach(key => {
        sortedData[key] = updatedData[key] !== undefined ? updatedData[key] : enData[key];
      });

      // 6. Write back to file
      fs.writeFileSync(localePath, JSON.stringify(sortedData, null, 2), 'utf8');
      console.log(`Successfully updated and synchronized ${localePath}`);
    } catch (err) {
      console.error(`Critical error processing locale ${locale}:`, err);
    }
  }

  console.log(`\n==================================================`);
  console.log(`All locales rebuilt successfully!`);
}

main().catch(err => {
  console.error("Critical error in translation script:", err);
  process.exit(1);
});
