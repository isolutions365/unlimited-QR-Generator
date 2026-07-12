const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');
const dotenv = require('dotenv');

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

const TARGET_FILES = [
  'src/pages/BlogSection.tsx',
  'src/pages/CompareHub.tsx',
  'src/pages/EnterpriseAIGateway.tsx',
  'src/pages/FaqSection.tsx',
  'src/pages/GrowthSuite.tsx',
  'src/pages/I18nDashboard.tsx',
  'src/pages/KnowledgeHub.tsx',
  'src/pages/PlatformHub.tsx',
  'src/pages/ProgrammaticHub.tsx',
  'src/pages/TemplatesHub.tsx',
  'src/pages/landing/SEOPage.tsx',
  'src/pages/landing/URLQRContent.tsx'
];

const LOCALES = ['en', 'ar', 'ur', 'es', 'fr', 'de', 'pt', 'it', 'tr', 'id', 'hi', 'ja', 'ko', 'zh'];

const pagePrefixes = {
  'BlogSection.tsx': 'blog',
  'CompareHub.tsx': 'compare',
  'EnterpriseAIGateway.tsx': 'enterprise',
  'FaqSection.tsx': 'faq',
  'GrowthSuite.tsx': 'growth',
  'I18nDashboard.tsx': 'i18n',
  'KnowledgeHub.tsx': 'knowledge',
  'PlatformHub.tsx': 'platform',
  'ProgrammaticHub.tsx': 'programmatic',
  'TemplatesHub.tsx': 'templates',
  'SEOPage.tsx': 'seo',
  'URLQRContent.tsx': 'urlqr'
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function callGeminiWithRetry(prompt, maxRetries = 5, initialDelay = 2000) {
  let delay = initialDelay;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt
      });
      return response.text;
    } catch (error) {
      console.warn(`[Retry ${i + 1}/${maxRetries}] Gemini call failed. Error: ${error.message || error}`);
      if (i === maxRetries - 1) throw error;
      await sleep(delay);
      delay *= 2; // Exponential backoff
    }
  }
}

async function migrateFile(filePath) {
  const filename = path.basename(filePath);
  const prefix = pagePrefixes[filename] || 'page';
  const code = fs.readFileSync(filePath, 'utf8');

  console.log(`\n--- Migrating ${filename} (prefix: ${prefix}) ---`);

  const prompt = `
You are an expert React/TypeScript senior software engineer.
Analyze the following React/TypeScript component code and refactor it to replace ALL visible, hardcoded English UI text/strings with translation keys using the useTranslation 't' hook.

Rules:
1. If 'useTranslation' is not imported, import it from "../../utils/i18n" or "../utils/i18n" depending on file depth:
   - For files in 'src/pages/landing/', use '../../utils/i18n'
   - For files in 'src/pages/', use '../utils/i18n'
2. Define 'const { t } = useTranslation();' at the top of the component if missing.
3. Replace hardcoded English strings with:
   - t('prefix.key', 'Default English string')
   - Replace strings in attributes like placeholder, title, and tooltip if appropriate.
   - Do NOT modify variables, CSS class names, tailwind utilities, database schema IDs, state definitions, icon names, import statements, or general programming/logic details.
   - Keep dynamic placeholders and standard templating intact (e.g. JSX expressions, template literals).
4. Keys must be camelCase and prefixed with "${prefix}.", e.g., t('${prefix}.heroTitle', 'Main Hero Title').
5. Output MUST match the original structure, logic, states, hooks, and responsive styling. DO NOT REDESIGN THE UI.

Return your response strictly in the following delimited text format:

=== TRANSLATIONS ===
{
  "prefix.someKey": "Default English string",
  ...
}
=== CODE ===
[The fully migrated TSX code here]

Do not wrap the entire output in markdown code blocks. Keep the delimiters exactly as written.

The input file content:
\`\`\`tsx
${code}
\`\`\`
  `;

  try {
    const responseText = await callGeminiWithRetry(prompt);
    
    // Parse the delimited format
    const transIndex = responseText.indexOf('=== TRANSLATIONS ===');
    const codeIndex = responseText.indexOf('=== CODE ===');
    
    if (transIndex === -1 || codeIndex === -1) {
      throw new Error("Could not find delimiters in response");
    }
    
    const jsonStr = responseText.substring(transIndex + '=== TRANSLATIONS ==='.length, codeIndex).trim();
    let codeStr = responseText.substring(codeIndex + '=== CODE ==='.length).trim();
    
    // Strip trailing/leading markdown fences from code if Gemini added them anyway
    if (codeStr.startsWith('```tsx')) {
      codeStr = codeStr.substring(6);
    } else if (codeStr.startsWith('```')) {
      codeStr = codeStr.substring(3);
    }
    if (codeStr.endsWith('```')) {
      codeStr = codeStr.substring(0, codeStr.length - 3);
    }
    codeStr = codeStr.trim();
    
    const translations = JSON.parse(jsonStr);
    
    return {
      migratedCode: codeStr,
      translations
    };
  } catch (error) {
    console.error(`Error migrating ${filename}:`, error);
    return null;
  }
}

async function translateKeys(keysObject, targetLocale) {
  if (Object.keys(keysObject).length === 0) return {};
  
  const prompt = `
Translate the following flat key-value object of English UI translation strings into the target language.
Target language code: ${targetLocale}

Rules:
1. Translate the values to ${targetLocale}, but keep the keys exactly the same.
2. Maintain placeholders, dynamic patterns, variables (like {name}), or HTML tags in the values intact.
3. Be professional and contextually accurate for a SaaS marketing dashboard and QR code builder platform.
4. Output a valid JSON mapping with the translated values. Output ONLY the raw JSON object, no other text or explanation.

Object to translate:
${JSON.stringify(keysObject, null, 2)}
`;

  try {
    const responseText = await callGeminiWithRetry(prompt);
    let cleanJson = responseText.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.substring(7);
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.substring(3);
    }
    if (cleanJson.endsWith('```')) {
      cleanJson = cleanJson.substring(0, cleanJson.length - 3);
    }
    cleanJson = cleanJson.trim();
    
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error(`Error translating to ${targetLocale}:`, error);
    return {};
  }
}

async function main() {
  const report = [];
  const allNewTranslations = {};

  for (const filePath of TARGET_FILES) {
    if (!fs.existsSync(filePath)) {
      console.warn(`File ${filePath} does not exist, skipping.`);
      report.push({
        file: filePath,
        stringsFound: 0,
        replaced: 0,
        status: 'Skipped - Not Found'
      });
      continue;
    }

    const filename = path.basename(filePath);
    const result = await migrateFile(filePath);

    if (result && result.migratedCode && result.translations) {
      // Save migrated file
      fs.writeFileSync(filePath, result.migratedCode, 'utf8');
      const numKeys = Object.keys(result.translations).length;
      console.log(`Successfully migrated ${filename}! Replaced ${numKeys} strings.`);
      
      // Store translations for translation merging
      Object.assign(allNewTranslations, result.translations);

      report.push({
        file: filename,
        stringsFound: numKeys,
        replaced: numKeys,
        status: 'Completed'
      });
    } else {
      console.error(`Failed to migrate ${filename}.`);
      report.push({
        file: filename,
        stringsFound: 0,
        replaced: 0,
        status: 'Failed'
      });
    }
    
    // Cool down between files
    await sleep(2000);
  }

  const numNewKeys = Object.keys(allNewTranslations).length;
  console.log(`\nTotal new keys to translate: ${numNewKeys}`);

  if (numNewKeys > 0) {
    // Merge into locales
    for (const locale of LOCALES) {
      const localePath = `src/locales/${locale}.json`;
      let localeData = {};
      if (fs.existsSync(localePath)) {
        try {
          localeData = JSON.parse(fs.readFileSync(localePath, 'utf8'));
        } catch (e) {
          console.error(`Error reading ${localePath}, starting fresh.`);
        }
      }

      let mergedTranslations = {};
      if (locale === 'en') {
        mergedTranslations = allNewTranslations;
      } else {
        console.log(`Translating keys to ${locale}...`);
        mergedTranslations = await translateKeys(allNewTranslations, locale);
        await sleep(1000);
      }

      Object.assign(localeData, mergedTranslations);
      fs.writeFileSync(localePath, JSON.stringify(localeData, null, 2), 'utf8');
      console.log(`Merged and updated ${localePath}`);
    }
  }

  // Print Report Table
  console.log('\n==================================================');
  console.log('MIGRATION REPORT TABLE');
  console.log('==================================================');
  console.log('| Page Name | Strings Found | Replaced | Translation Keys Added | Status |');
  console.log('|---|---|---|---|---|');
  for (const item of report) {
    console.log(`| ${item.file} | ${item.stringsFound} | ${item.replaced} | ${item.stringsFound} | ${item.status} |`);
  }
}

main().catch(console.error);
