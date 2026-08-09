const fs = require('fs');
const path = require('path');

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = getFiles('src');
const en = JSON.parse(fs.readFileSync('src/locales/en.json', 'utf8'));
const enValues = new Set(Object.values(en));

let potentialHardcoded = [];

files.forEach(file => {
  const code = fs.readFileSync(file, 'utf8');
  // Find JSX text nodes: >Some Text<
  const regex = />\s*([A-Z][a-zA-Z0-9\s,\/&'\-\(\)\.]+)\s*</g;
  let match;
  while ((match = regex.exec(code)) !== null) {
    const text = match[1].trim();
    if (text.length > 3 && !text.includes('t(') && !text.includes('lucide') && !text.match(/^[0-9\s\/\-\+\.\:\,\%]+$/)) {
      if (!enValues.has(text)) {
        potentialHardcoded.push({ file, text });
      }
    }
  }
});

console.log('Found potential hardcoded strings:', potentialHardcoded.length);
potentialHardcoded.slice(0, 50).forEach(item => {
  console.log(`${item.file}: "${item.text}"`);
});
