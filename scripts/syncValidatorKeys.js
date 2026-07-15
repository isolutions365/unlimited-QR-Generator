import fs from 'fs';
import path from 'path';

const enPath = './src/locales/en.json';
const validatorPath = './src/utils/i18nValidator.ts';

if (!fs.existsSync(enPath)) {
  console.error(`en.json not found`);
  process.exit(1);
}
if (!fs.existsSync(validatorPath)) {
  console.error(`i18nValidator.ts not found`);
  process.exit(1);
}

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const enKeys = Object.keys(enData).sort();

const validatorContent = fs.readFileSync(validatorPath, 'utf8');

// We want to find the declaration of EXPECTED_KEYS:
// export const EXPECTED_KEYS = [
//   ...
// ];
// and replace it.

const startToken = 'export const EXPECTED_KEYS = [';
const startIndex = validatorContent.indexOf(startToken);
if (startIndex === -1) {
  console.error(`Could not find start of EXPECTED_KEYS`);
  process.exit(1);
}

const endToken = '];';
const endIndex = validatorContent.indexOf(endToken, startIndex + startToken.length);
if (endIndex === -1) {
  console.error(`Could not find end of EXPECTED_KEYS`);
  process.exit(1);
}

// Construct the new EXPECTED_KEYS definition
const keysBlock = enKeys.map(key => `  '${key}',`).join('\n');
const newExpectedKeysDef = `${startToken}\n${keysBlock}\n`;

const newContent = validatorContent.slice(0, startIndex) + newExpectedKeysDef + validatorContent.slice(endIndex);

fs.writeFileSync(validatorPath, newContent, 'utf8');
console.log(`Successfully updated EXPECTED_KEYS in i18nValidator.ts to include all ${enKeys.length} actual keys from en.json.`);
