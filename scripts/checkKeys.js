import fs from 'fs';
import path from 'path';

const enPath = './src/locales/en.json';
const controlPanelPath = './src/components/ControlPanel.tsx';

if (!fs.existsSync(enPath)) {
  console.error(`en.json not found`);
  process.exit(1);
}

if (!fs.existsSync(controlPanelPath)) {
  console.error(`ControlPanel.tsx not found`);
  process.exit(1);
}

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const controlPanelContent = fs.readFileSync(controlPanelPath, 'utf8');

// Regex to match t('key', ...) calls
// Matches t('...', or t("...", or t(`...
// Let's capture the key inside
const tRegex = /\bt\(\s*['"`]([a-zA-Z0-9._-]+)['"`]/g;
let match;
const foundKeys = new Set();

while ((match = tRegex.exec(controlPanelContent)) !== null) {
  foundKeys.add(match[1]);
}

console.log(`Found ${foundKeys.size} distinct static translation keys in ControlPanel.tsx`);

const missing = [];
for (const key of foundKeys) {
  if (enData[key] === undefined) {
    missing.push(key);
  }
}

if (missing.length > 0) {
  console.log(`\nMissing keys in en.json (${missing.length}):`);
  missing.forEach(k => console.log(`  - ${k}`));
} else {
  console.log(`\nAll static keys found in ControlPanel.tsx are present in en.json!`);
}
