import fs from 'fs';
import path from 'path';

const LOCALES_DIR = './src/locales';
const TARGET_LOCALES = ['ar', 'ur', 'fr', 'de', 'es', 'it', 'pt', 'tr', 'id', 'hi', 'ja', 'ko', 'zh'];

const enPath = path.join(LOCALES_DIR, 'en.json');
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

for (const locale of TARGET_LOCALES) {
  const localePath = path.join(LOCALES_DIR, `${locale}.json`);
  if (!fs.existsSync(localePath)) continue;
  
  const data = JSON.parse(fs.readFileSync(localePath, 'utf8'));
  const remainingEnglishKeys = [];
  
  for (const [key, enVal] of Object.entries(enData)) {
    if (data[key] === enVal) {
      remainingEnglishKeys.push(key);
    }
  }
  
  console.log(`Locale ${locale.toUpperCase()} has ${remainingEnglishKeys.length} remaining English keys:`);
  console.log(JSON.stringify(remainingEnglishKeys, null, 2));
}
