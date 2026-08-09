const fs = require('fs');
const path = require('path');

const translations = {
  ar: "هذا الموقع محمي بواسطة reCAPTCHA وتطبق سياسة خصوصية جوجل وشروط الخدمة.",
  de: "Diese Website ist durch reCAPTCHA geschützt, und es gelten die Datenschutzbestimmungen und Nutzungsbedingungen von Google.",
  es: "Este sitio está protegido por reCAPTCHA y se aplican la Política de Privacidad y las Condiciones de Servicio de Google.",
  fr: "Ce site est protégé par reCAPTCHA et les règles de confidentialité et conditions d'utilisation de Google s'appliquent.",
  hi: "यह साइट reCAPTCHA द्वारा सुरक्षित है और Google गोपनीयता नीति और सेवा की शर्तें लागू होती हैं。",
  id: "Situs ini dilindungi oleh reCAPTCHA dan berlaku Kebijakan Privasi serta Persyaratan Layanan Google.",
  it: "Questo sito è protetto da reCAPTCHA e si applicano l'informativa sulla privacy e i Termini di servizio di Google.",
  ja: "このサイトはreCAPTCHAによって保護されており、Googleのプライバシーポリシーと利用規約が適用されます。",
  ko: "이 사이트는 reCAPTCHA로 보호되며 Google 개인정보 처리방침 및 서비스 약관이 적용됩니다.",
  pt: "Este site é protegido pelo reCAPTCHA e aplicam-se a Política de Privacidade e os Termos de Serviço do Google.",
  tr: "Bu site reCAPTCHA ile korunmaktadır ve Google Gizlilik Politikası ile Hizmet Şartları geçerlidir.",
  ur: "یہ سائٹ reCAPTCHA سے محفوظ ہے اور گوگل کی پرائیویسی پالیسی اور سروس کی شرائط لاگو ہوتی ہیں۔",
  zh: "本站点受到 reCAPTCHA 保护，并且适用 Google 隐私权政策和服务条款。"
};

const localesDir = path.join(__dirname, '../src/locales');
const files = fs.readdirSync(localesDir);

files.forEach(file => {
  if (file.endsWith('.json')) {
    const lang = path.basename(file, '.json');
    const filePath = path.join(localesDir, file);
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const noticeText = translations[lang] || translations.en || "This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.";
      content['footer.recaptchaNotice'] = noticeText;
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');
      console.log(`Updated ${file} with footer.recaptchaNotice`);
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
    }
  }
});
