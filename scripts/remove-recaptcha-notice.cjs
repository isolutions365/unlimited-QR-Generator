const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../src/locales');
const files = fs.readdirSync(localesDir);

files.forEach(file => {
  if (file.endsWith('.json')) {
    const filePath = path.join(localesDir, file);
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (content['footer.recaptchaNotice'] !== undefined) {
        delete content['footer.recaptchaNotice'];
        fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');
        console.log(`Removed footer.recaptchaNotice from ${file}`);
      }
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
    }
  }
});
