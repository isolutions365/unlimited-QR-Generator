import fs from 'fs';
import path from 'path';

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath));
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      results.push(fullPath);
    }
  });
  return results;
}

const tsxFiles = getFiles('./src');
const usedKeys = new Map();

tsxFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  // Match t('key', 'default') or t("key", "default")
  const regex = /\bt\s*\(\s*['"]([^'"]+)['"]\s*(?:,\s*(?:['"]([^'"]+)['"]|`([^`]+)`|\{([^}]+)\}))?/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const key = match[1];
    if (
      key.includes('.') && 
      !key.startsWith('.') && 
      !key.startsWith('/') && 
      !key.endsWith('.ts') && 
      !key.endsWith('.tsx') &&
      !key.endsWith('.png') &&
      !key.endsWith('.jpg')
    ) {
      const defaultVal = match[2] || match[3] || key;
      if (!usedKeys.has(key)) {
        usedKeys.set(key, defaultVal);
      }
    }
  }
});

console.log('Total valid t() keys extracted from source code:', usedKeys.size);

const localeDir = './src/locales';
const files = fs.readdirSync(localeDir).filter(f => f.endsWith('.json') && f !== 'coverage_report.json' && f !== '.translation_progress.json');

files.forEach(file => {
  const code = file.replace('.json', '');
  const json = JSON.parse(fs.readFileSync(path.join(localeDir, file), 'utf8'));
  const missingKeys = [];
  usedKeys.forEach((defaultVal, key) => {
    if (!json[key]) {
      missingKeys.push({ key, defaultVal });
    }
  });
  console.log(`${code.padEnd(5)} : missing ${missingKeys.length} keys out of ${usedKeys.size}`);
  if (missingKeys.length > 0) {
    console.log(`Missing keys for ${code}:`, missingKeys.map(m => m.key));
  }
});
