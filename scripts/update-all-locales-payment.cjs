const fs = require('fs');
const path = require('path');

const paymentTranslations = {
  en: "Payment / Wallet",
  ar: "الدفع / المحفظة",
  ur: "ادائیگی / والیٹ",
  de: "Zahlung / Wallet",
  es: "Pago / Monedero",
  fr: "Paiement / Portefeuille",
  hi: "भुगतान / वॉलेट",
  id: "Pembayaran / Dompet",
  it: "Pagamento / Portafoglio",
  ja: "支払い / ウォレット",
  ko: "결제 / 지갑",
  pt: "Pagamento / Carteira",
  tr: "Ödeme / Cüzdan",
  zh: "支付 / 钱包"
};

const localesDir = path.join(__dirname, '../src/locales');
const files = fs.readdirSync(localesDir);

files.forEach(file => {
  if (file.endsWith('.json')) {
    const filePath = path.join(localesDir, file);
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      // Determine lang from filename e.g. en.json -> en, or translation_progress_it.json -> it
      let lang = 'en';
      if (file.match(/^[a-z]{2}\.json$/)) {
        lang = file.slice(0, 2);
      } else if (file.includes('it')) {
        lang = 'it';
      } else if (file.includes('ar')) {
        lang = 'ar';
      } else if (file.includes('ur')) {
        lang = 'ur';
      }
      
      const translation = paymentTranslations[lang] || paymentTranslations.en;
      content['control.type.payment'] = translation;
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');
      console.log(`Updated ${file} with control.type.payment = "${translation}"`);
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
    }
  }
});
