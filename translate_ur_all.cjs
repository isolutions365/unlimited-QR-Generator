const fs = require('fs');

const ur = JSON.parse(fs.readFileSync('src/locales/ur.json', 'utf8'));
const en = JSON.parse(fs.readFileSync('src/locales/en.json', 'utf8'));

// High quality Urdu translation dictionary for all app sections
const translations = {
  // Analytics
  "analytics.statDistinct": "منفرد کلائنٹ یوزر ایجنٹس",
  "analytics.statGrade": "عالمی کنورژن گریڈ",
  "analytics.statScans": "کل مہم کے اسکین کلکس",
  "analytics.streamTitle": "اسکین لاگ ٹریکنگ اسٹریم",
  
  // Animations
  "animations.canvasDesc": "فعال فریمر موشن ہارڈ ویئر لیئرز کے ساتھ لائیو سمولیشن",
  "animations.canvasTitle": "متحرک متحرک کینوس",
  "animations.deploy.instore.desc": "کنٹینر کے نیچے واضح ہدایات کے ساتھ حسب ضرورت سائز کا جوڑا بنائیں۔",
  "animations.deploy.instore.title": "ان اسٹور اسکرینز",
  "animations.deploy.social.desc": "موبائل فیڈز اور ریلس پر زیادہ مصروفیت کے لیے MP4/GIF ایکسپورٹ استعمال کریں۔",
  "animations.deploy.social.title": "سوشل میڈیا اور فیڈز",
  "animations.deploy.tv.title": "ڈیجیٹل سائن ایج اور TV",
  "animations.deployTitle": "تجویز کردہ تعیناتی چینلز",
  "animations.effectSettings": "متحرک اثرات کی ترتیبات",
  "animations.exportFormat": "ایکسپورٹ فارمیٹ",
  "animations.fpsNotice": "60 FPS پر ہموار کارکردگی کے لیے ویب جی ایل کینوس استعمال کیا گیا ہے۔",
  "animations.galleryTitle": "اینیمیشن پریسیٹس کی گیلری",
  "animations.loopDuration": "لوپ کا دورانیہ (سیکنڈ)",
  "animations.preset.ambientGlow.title": "ایمبیئنٹ نیون گلو",
  "animations.preset.pulseWave.desc": "بصری توجہ حاصل کرنے کے لیے مسلسل نبض لہر کا اثر۔",
  "animations.preset.pulseWave.title": "پلس ویو اینیمیشن",
  "animations.preset.radarScan.desc": "سرکلر رڈار لائن جو QR پیٹرن پر مسلسل اسکین کرتی ہے۔",
  "animations.preset.radarScan.title": "رڈار اسکینر",
  "animations.preset.shimmerGleam.desc": "خوبصورت اور چمکدار پرمیئم شیمر لائن جو سطح پر تیرتی ہے۔",
  "animations.preset.shimmerGleam.title": "شیمر اینیمیشن",
  "animations.previewBadge": "60 FPS اینیمیٹڈ پریویو",
  "animations.speedLabel": "اینیمیشن کی رفتار",
  "animations.subtitle": "پرنٹ اور ڈیجیٹل ڈسپلے کے لیے شاندار متحرک QR کوڈز بنائیں۔",
  "animations.title": "متحرک اینیمیٹڈ QR جنریٹر",

  // Color Palette
  "colorPalette.amber.desc": "گرم اور دوستانہ پیلا زرد رنگ کا ڈیزائن",
  "colorPalette.amber.name": "گرم امبر",
  "colorPalette.cherry.desc": "متحرک اور جرات مندانہ سرخ برانڈ کا انتخاب",
  "colorPalette.cherry.name": "چری ریڈ",
  "colorPalette.customDesc": "اپنے برانڈ کی گائیڈ لائنز کے مطابق اپنے حسب ضرورت رنگ منتخب کریں۔",
  "colorPalette.customTitle": "حسب ضرورت کلر پیلیٹ",
  "colorPalette.emerald.desc": "پائیدار اور قدرتی سبز رنگ کا امتزاج",
  "colorPalette.emerald.name": "زمردی سبز",
  "colorPalette.indigo.desc": "جدید ٹیکنالوجی اور کارپوریٹ نیوی بلیو",
  "colorPalette.indigo.name": "انڈیگو بلیو",
  "colorPalette.slate.desc": "صاف ستھرا اور غیر جانبدار گرے نائٹ ڈیزائن",
  "colorPalette.slate.name": "سلیٹ گرے",
  "colorPalette.violet.desc": "خلاقانہ اور پریمیئم جامنی ڈیزائن",
  "colorPalette.violet.name": "شاہی وائلٹ",

  // Company & Trust
  "company.aboutP1": "FreeQRBarcodes.com کا مقصد اداروں، ڈویلپرز اور برانڈز کو بغیر کسی اشتہار کے تیز ترین اور محفوظ ترین QR کوڈ اور بارکوڈ ٹولز فراہم کرنا ہے۔",
  "company.aboutP2": "ہم یقین رکھتے ہیں کہ بنیادی ویب ٹولز بغیر کسی پوشیدہ فیس یا اشتہارات کے فوري اور مفت ہونے چاہئیں۔ تمام جامد کوڈز براؤزر میں مقامی طور پر تیار ہوتے ہیں۔",
  "company.aboutP3": "یہ پلیٹ فارم iSolutions ICo کے تحت تیار اور تیار کیا گیا ہے، جو کلاؤڈ ایپلی کیشنز میں پیش پیش ہے۔",
  "company.aboutSubtitle": "پیشے ورانہ QR کوڈز اور بارکوڈز کی تخلیق کا تیز اور محفوظ ٹول۔",
  "company.badgeAbout": "ہمارے بارے میں اور ہمارا عزم",
  "company.badgeContact": "براہ راست رابطہ کریں",
  "company.badgeLegal": "قانونی دستاویزات اور تعمیل",
  "company.badgePolicy": "پرائیویسی اور سیکیورٹی پالیسی",
  "company.btnSendFeedback": "استفسار یا رائے ارسال کریں",
  "company.contactDirect": "براہ راست رابطہ قنوات",
  "company.contactDirectDesc": "فوری استفسارات یا سیکیورٹی رپورٹس کے لیے، آپ ہمیں براہ راست ای میل کے ذریعے مراسلت کر سکتے ہیں۔",

  // Control & Generator
  "control.accordionAppearance": "ظاہری شکل اور برانڈ ڈیزائن",
  "control.accordionBarcodeSetup": "بارکوڈ کنفیگریشن اور ڈیٹا",
  "control.accordionContent": "مواد اور منزل کا URL",
  "control.accordionFrameLogo": "فریم، متن اور لوگو انٹیگریشن",
  "control.accordionHighResExport": "اعلیٰ کوالٹی ایکسپورٹ اور فارمیٹس",
  "control.activeTabBarcode": "بارکوڈ موڈ",
  "control.activeTabQr": "QR کوڈ موڈ",

  // Copilot & AI
  "copilot.aiPromptLabel": "AI کو اپنی پسندیدہ خصوصیات بتائیں",
  "copilot.applyDesignBtn": "ڈیزائن پریسیٹ لاگو کریں",
  "copilot.suggestedPrompts": "تجویز کردہ AI پرامپٹس",

  // Directory & Guides
  "directory.allCategories": "تمام زمرے",
  "directory.desc": "تمام پیشہ ورانہ QR کوڈ اور بارکوڈ جنریٹرز کی مکمل فہرست۔",
  "directory.noResults": "کوئی مماثل ٹولز نہیں ملے۔",
  "guides.readGuide": "مکمل گائیڈ پڑھیں",
  "guides.subtitle": "QR کوڈ کی تعمیل، ڈیزائننگ اور پرنٹنگ کی بہترین عملی تدابیر۔",

  // SEO & Platform
  "seo.aestheticOptimization": "جمالیاتی بصری بہتری",
  "seo.aiReferenceTitle": "AI حوالہ جات اور گائیڈ سورس",
  "platform.academicCitationsTitle": "علمی حوالہ جات اور ریسرچ پیپرز",
  "platform.apiDocsTitle": "ڈویلپر API ڈاکیو منٹیشن",
  "platform.architectureTitle": "سسٹم آرکیٹیکچر اور کارکردگی",

  // Saved & History
  "saved.allCount": "تمام ({count})",
  "saved.batchSelectedCount": "{count} منتخب شدہ",
  "saved.desc": "محفوظ شدہ QR کوڈز کا نظم کریں، اسکین لاگز دیکھیں، اور حسب ضرورت فولڈرز میں دیکھیں۔",
  "saved.title": "محفوظ شدہ QR ڈیزائنز اور تاریخ",

  // Compare & URL QR
  "compare.title": "جامد اور متحرک QR کوڈز کا موازنہ",
  "urlqr.comparisonTitle": "Static vs Dynamic URL QR Codes"
};

// Apply exact dict matches
let updatedCount = 0;
for (const [k, v] of Object.entries(translations)) {
  if (ur[k] !== undefined) {
    ur[k] = v;
    updatedCount++;
  }
}
console.log(`Applied ${updatedCount} targeted dictionary translations.`);

// Helper function to translate common English phrase patterns to Urdu
function autoTranslateSentence(text) {
  if (typeof text !== 'string') return text;
  
  // If text is already mostly Urdu script, skip
  const urChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const totalChars = text.length;
  if (urChars > totalChars * 0.5) {
    return text;
  }

  // Common pattern translations
  let t = text;
  t = t.replace(/\bRetail SKU\b/gi, "ریٹیل SKU");
  t = t.replace(/\bUniversal - Text & Numbers\b/gi, "عالمگیر - متن اور اعداد");
  t = t.replace(/\bStandard Retail North America\b/gi, "شمالی امریکہ ریٹیل معیار");
  t = t.replace(/\bIndustrial & Automotive\b/gi, "صنعتی اور آٹوموٹو");
  t = t.replace(/\bFree vector QR code generator for high quality printing\.\b/gi, "اعلیٰ کوالٹی پرنٹنگ کے لیے مفت ویکٹر QR کوڈ جنریٹر۔");
  t = t.replace(/\bAll rights reserved\.\b/gi, "جملہ حقوق محفوظ ہیں۔");
  t = t.replace(/\bPrivacy Policy\b/gi, "پرائیویسی پالیسی");
  t = t.replace(/\bTerms of Service\b/gi, "شرائط و ضوابط");
  t = t.replace(/\bContact Us\b/gi, "ہم سے رابطہ کریں");

  return t;
}

// Ensure all keys are processed
for (const k of Object.keys(ur)) {
  ur[k] = autoTranslateSentence(ur[k]);
}

fs.writeFileSync('src/locales/ur.json', JSON.stringify(ur, null, 2));
console.log('ur.json update complete.');
