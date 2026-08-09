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

// Check for JSX text nodes or string literals in UI components that don't use t()
// E.g. >Some Text< or placeholders, tooltips, etc.
let suspiciousStrings = [];

files.forEach(file => {
  const code = fs.readFileSync(file, 'utf8');
  // Simple regex to find JSX text content like >Label< where Label has english letters
  const jsxTextRegex = />\s*([A-Z][a-zA-Z0-9\s,\/&'\-\(\)]+)\s*</g;
  let match;
  while ((match = jsxTextRegex.exec(code)) !== null) {
    const text = match[1].trim();
    // Ignore short words, numbers, single letters, HTML tags
    if (text.length > 3 && !text.includes('t(') && !text.startsWith('http') && !text.includes('lucide')) {
      // Check if text is already in en.json values
      const isInEn = Object.values(en).includes(text);
      if (!isInEn && !text.match(/^[0-9\s\/\-\+\.\:\,\%]+$/)) {
        suspiciousStrings.push({ file, text });
      }
    }
  }
});

console.log('Total suspicious hardcoded JSX strings found:', suspiciousStrings.length);
suspiciousStrings.slice(0, 30).forEach(item => {
  console.log(`${item.file}: "${item.text}"`);
});
