const fs = require('fs');

const ar = JSON.parse(fs.readFileSync('src/locales/ar.json', 'utf8'));
const en = JSON.parse(fs.readFileSync('src/locales/en.json', 'utf8'));

const englishInAr = [];

for (const [key, val] of Object.entries(ar)) {
  if (typeof val === 'string') {
    // If text contains English words > 3 letters and no Arabic characters (excluding technical strings/URLs/brands)
    const hasArabic = /[\u0600-\u06FF]/.test(val);
    const hasEnglishLetters = /[a-zA-Z]{3,}/.test(val);
    
    // Ignore technical keys, URLs, brand names, code formats, placeholders
    if (!hasArabic && hasEnglishLetters) {
      const isAllowed = 
        key.includes('Url') || key.includes('URL') || key.includes('Api') || key.includes('API') ||
        key.includes('Svg') || key.includes('PNG') || key.includes('JPG') || key.includes('CSV') ||
        val.startsWith('http') || val.includes('FreeQRGen') || val.includes('vCard') ||
        val.includes('WiFi') || val.includes('SMS') || val.includes('UTM') || val.includes('PDF') ||
        val.includes('QR') || val.includes('SEO') || val.includes('URL') || val.includes('App Store') ||
        val.includes('Google') || val.includes('Apple') || val.includes('Gemini') || val.includes('SLA') ||
        val.includes('XP') || val.includes('E-mail') || val.includes('WebP');

      if (!isAllowed) {
        englishInAr.push({ key, arVal: val, enVal: en[key] });
      }
    }
  }
}

console.log('Total untranslated English values found in ar.json:', englishInAr.length);
englishInAr.forEach(item => {
  console.log(`${item.key}: "${item.arVal}" (EN: "${item.enVal}")`);
});
