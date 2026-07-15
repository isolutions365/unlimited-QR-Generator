import fs from 'fs';
import path from 'path';

const LOCALES_DIR = './src/locales';
const TARGET_LOCALES = ['ar', 'ur', 'fr', 'de', 'es', 'it', 'pt', 'tr', 'id', 'hi', 'ja', 'ko', 'zh'];

const enPath = path.join(LOCALES_DIR, 'en.json');
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const enKeys = Object.keys(enData);

console.log(`English has ${enKeys.length} keys.`);

for (const locale of TARGET_LOCALES) {
  const localePath = path.join(LOCALES_DIR, `${locale}.json`);
  if (!fs.existsSync(localePath)) {
    console.log(`Locale ${locale} does not exist`);
    continue;
  }
  const data = JSON.parse(fs.readFileSync(localePath, 'utf8'));
  const keys = Object.keys(data);
  
  let missing = 0;
  let copyOfEn = 0;
  
  for (const [key, enVal] of Object.entries(enData)) {
    if (data[key] === undefined) {
      missing++;
    } else if (data[key] === enVal) {
      copyOfEn++;
    }
  }
  
  console.log(`Locale ${locale.toUpperCase()}: Total ${keys.length} keys. Missing: ${missing}. Copy of English: ${copyOfEn}.`);
}
