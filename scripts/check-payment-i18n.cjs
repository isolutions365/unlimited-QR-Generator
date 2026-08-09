const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../src/locales');
const files = fs.readdirSync(localesDir);

files.forEach(file => {
  if (file.endsWith('.json')) {
    const filePath = path.join(localesDir, file);
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      console.log(`${file}: control.type.payment = "${content['control.type.payment']}"`);
    } catch (err) {
      console.error(`Error reading ${file}:`, err);
    }
  }
});
