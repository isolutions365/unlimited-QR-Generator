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
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = getFiles('src');
const ar = JSON.parse(fs.readFileSync('src/locales/ar.json', 'utf8'));

const missingKeysInAr = new Map();

files.forEach(file => {
  const code = fs.readFileSync(file, 'utf8');
  const regex = /t\(\s*['"]([^'"]+)['"](?:\s*,\s*['"]([^'"]+)['"])?/g;
  let match;
  while ((match = regex.exec(code)) !== null) {
    const key = match[1];
    const defaultText = match[2];
    if (!key.includes('${') && ar[key] === undefined) {
      if (!missingKeysInAr.has(key)) {
        missingKeysInAr.set(key, { files: [file], defaultText });
      } else {
        missingKeysInAr.get(key).files.push(file);
      }
    }
  }
});

console.log('Keys used in t() that are missing in ar.json:', missingKeysInAr.size);
for (const [key, val] of missingKeysInAr.entries()) {
  console.log(key, '=>', val.defaultText, 'in', val.files[0]);
}
