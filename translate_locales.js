import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const LANGUAGE_NAMES = {
  it: "Italian",
  tr: "Turkish",
  id: "Indonesian",
  hi: "Hindi",
  zh: "Chinese (Simplified)",
  ja: "Japanese",
  ko: "Korean"
};

const BATCH_SIZE = 50;

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function cleanAndParseJson(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/, "");
  }
  cleaned = cleaned.trim();

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

async function translateBatch(enBatch, targetLangName) {
  const prompt = `You are an expert software localization translator.
Translate the following English translation key-value pairs (in JSON format) into ${targetLangName}.

Rules:
1. Return ONLY a valid JSON object where keys match the input keys EXACTLY and the values are translated into ${targetLangName}.
2. Keep the keys unchanged.
3. Translate ONLY the values.
4. Preserve all formatting, markdown, HTML tags, and placeholders EXACTLY.
   Examples of placeholders to keep unchanged:
   - {{count}}
   - {{name}}
   - {url}
   - {section}
   - {author}
   - {speed}
   - and any other placeholders inside curly braces.
5. Ensure any double quotes inside the translated values are properly escaped as \\" to maintain valid JSON syntax.
6. Do not add any conversational text or surrounding markdown blocks (like \`\`\`json) in your response. Return only the raw JSON.

Input JSON:
${JSON.stringify(enBatch, null, 2)}`;

  let attempts = 0;
  while (attempts < 5) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.1,
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("Empty response from Gemini");
      }

      let translated;
      try {
        translated = cleanAndParseJson(text);
      } catch (parseErr) {
        console.error(`[Parse Debug] Failed parsing. Text length: ${text.length}`);
        console.error(`[Parse Debug] First 50 chars: ${JSON.stringify(text.slice(0, 50))}`);
        console.error(`[Parse Debug] Last 100 chars: ${JSON.stringify(text.slice(-100))}`);
        throw parseErr;
      }
      
      // Auto-correct any model key typos
      const expectedKeys = Object.keys(enBatch);
      const corrected = {};
      for (const k in translated) {
        if (expectedKeys.includes(k)) {
          corrected[k] = translated[k];
        } else {
          // Fuzzy-match key typos like repeating words
          const match = expectedKeys.find(expectedKey => {
            return expectedKey.toLowerCase() === k.toLowerCase().replace(/developerdeveloper/g, "developer") ||
                   expectedKey.toLowerCase().replace(/developer/g, "") === k.toLowerCase().replace(/developer/g, "") ||
                   expectedKey.toLowerCase().replace(/[^a-z0-9]/g, "") === k.toLowerCase().replace(/[^a-z0-9]/g, "");
          });
          if (match) {
            console.warn(`[Key Typo Correction] Auto-mapped "${k}" to expected key "${match}"`);
            corrected[match] = translated[k];
          } else {
            corrected[k] = translated[k];
          }
        }
      }
      translated = corrected;
      
      const missingKeys = Object.keys(enBatch).filter(k => !(k in translated));
      if (missingKeys.length > 0) {
        console.warn(`[Warning] Translated batch missing keys: ${missingKeys.join(', ')}. Retrying...`);
        attempts++;
        await delay(2000 * attempts);
        continue;
      }

      return translated;
    } catch (e) {
      console.error(`[Error] Translate batch failed (Attempt ${attempts + 1}): ${e.message}`);
      attempts++;
      await delay(3000 * attempts);
    }
  }
  throw new Error(`Failed to translate batch after 5 attempts`);
}

async function main() {
  const args = process.argv.slice(2);
  let languagesToProcess = LANGUAGE_NAMES;
  if (args.length > 0) {
    languagesToProcess = {};
    args.forEach(arg => {
      const lang = arg.toLowerCase();
      if (LANGUAGE_NAMES[lang]) {
        languagesToProcess[lang] = LANGUAGE_NAMES[lang];
      } else {
        console.warn(`[Warning] Unknown language code: ${arg}`);
      }
    });
  }

  const enPath = path.join('src', 'locales', 'en.json');
  const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const enKeys = Object.keys(enData);
  console.log(`Loaded English source with ${enKeys.length} keys.`);

  // Migrate old combined progress file to individual files
  const oldProgressPath = path.join('src', 'locales', '.translation_progress.json');
  if (fs.existsSync(oldProgressPath)) {
    try {
      const oldProgress = JSON.parse(fs.readFileSync(oldProgressPath, 'utf8'));
      for (const [langCode, keys] of Object.entries(oldProgress)) {
        const individualPath = path.join('src', 'locales', `.translation_progress_${langCode}.json`);
        if (!fs.existsSync(individualPath)) {
          fs.writeFileSync(individualPath, JSON.stringify(keys, null, 2), 'utf8');
          console.log(`Migrated old progress for ${langCode} to ${individualPath}`);
        }
      }
      fs.unlinkSync(oldProgressPath);
    } catch (e) {
      console.warn("Failed migrating old progress file:", e.message);
    }
  }

  for (const [langCode, langName] of Object.entries(languagesToProcess)) {
    console.log(`\n========================================`);
    console.log(`Processing ${langName} (${langCode})...`);
    console.log(`========================================`);

    const targetPath = path.join('src', 'locales', `${langCode}.json`);
    let targetData = {};
    if (fs.existsSync(targetPath)) {
      try {
        targetData = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
      } catch (e) {
        console.warn(`Failed to parse existing ${langCode}.json, starting fresh:`, e.message);
      }
    }

    const progressPath = path.join('src', 'locales', `.translation_progress_${langCode}.json`);
    let progressKeys = {};
    if (fs.existsSync(progressPath)) {
      try {
        progressKeys = JSON.parse(fs.readFileSync(progressPath, 'utf8'));
      } catch (e) {
        console.warn(`Failed to parse progress for ${langCode}, starting fresh:`, e.message);
      }
    }

    const keysToTranslate = enKeys.filter(k => !progressKeys[k]);
    console.log(`${langName}: ${keysToTranslate.length} keys left to translate.`);

    if (keysToTranslate.length === 0) {
      console.log(`All keys for ${langName} are already translated!`);
      continue;
    }

    for (let i = 0; i < keysToTranslate.length; i += BATCH_SIZE) {
      const batchKeys = keysToTranslate.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(keysToTranslate.length / BATCH_SIZE);
      console.log(`Translating batch ${batchNum} / ${totalBatches} for ${langName} (${batchKeys.length} keys)...`);

      const enBatch = {};
      batchKeys.forEach(k => {
        enBatch[k] = enData[k];
      });

      try {
        const translatedBatch = await translateBatch(enBatch, langName);

        batchKeys.forEach(k => {
          targetData[k] = translatedBatch[k];
          progressKeys[k] = true;
        });

        fs.writeFileSync(targetPath, JSON.stringify(targetData, null, 2), 'utf8');
        fs.writeFileSync(progressPath, JSON.stringify(progressKeys, null, 2), 'utf8');

        console.log(`Saved batch to ${targetPath}.`);
        await delay(300);
      } catch (e) {
        console.error(`FATAL error processing batch: ${e.message}`);
        console.log(`Pausing before retrying same batch...`);
        await delay(5000);
        i -= BATCH_SIZE; 
      }
    }

    console.log(`Finished ${langName}!`);
  }

  console.log(`\nReconstructing data.json with new translations...`);
  const locales = ['en', 'ar', 'ur', 'de', 'fr', 'es', 'pt', 'it', 'tr', 'id', 'hi', 'zh', 'ja', 'ko'];
  const dataPath = path.join('src', 'locales', 'data.json');
  if (fs.existsSync(dataPath)) {
    const dataContent = fs.readFileSync(dataPath, 'utf8');
    const transIndex = dataContent.indexOf('"translations"');
    if (transIndex !== -1) {
      const commaIndex = dataContent.lastIndexOf(',', transIndex);
      const intactPart = dataContent.slice(0, commaIndex);
      try {
        const baseObj = JSON.parse(intactPart + '}');
        const translations = {};
        locales.forEach(loc => {
          const filePath = path.join('src', 'locales', `${loc}.json`);
          if (fs.existsSync(filePath)) {
            translations[loc] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          }
        });
        baseObj.translations = translations;
        fs.writeFileSync(dataPath, JSON.stringify(baseObj, null, 2), 'utf8');
        console.log(`Updated ${dataPath} successfully!`);
      } catch (e) {
        console.error(`Failed to update data.json:`, e.message);
      }
    }
  }

  console.log(`All translations and integration complete!`);
}

main().catch(console.error);
