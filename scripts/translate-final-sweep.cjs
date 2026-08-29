const fs = require('fs');
const path = require('path');

const arPath = path.join(__dirname, '../src/locales/ar.json');
const ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));

// Read range_strict_fix.json
const strictList = JSON.parse(fs.readFileSync(path.join(__dirname, '../range_strict_fix.json'), 'utf8'));

// Common dictionary for quick translation of phrases
const dictionary = {
  // Navigation & Status
  "FAQ": "الأسئلة الشائعة",
  "CONNECTED": "متصل",
  "DISCONNECTED": "غير متصل",
  "Templates Hub": "مركز القوالب",
  "By:": "بواسطة:",
  "tab.": "التبويب.",

  // Templates
  "All Templates": "جميع القوالب",
  "No Templates Found": "لم يتم العثور على قوالب",
  "Try adjusting your search criteria or filters to explore alternative designs.": "يرجى تعديل معايير البحث أو خيارات التصفية لاستكشاف تصميمات بديلة.",
  "Recommended Industry": "القطاع الموصى به",
  "Highly Scan-Safe": "آمن ومضمون المسح بنسبة 100%",
  "Professional Design Templates": "قوالب التصميم الاحترافية",

  // Shortcuts
  "Print & Export Options": "خيارات الطباعة والتصدير",
  "Opens print settings overlay instantly": "فتح نافذة إعدادات وتخطيط الطباعة فوراً",
  "Reset Canvas & Inputs": "إعادة تعيين اللوحة والمدخلات",
  "Reset all color modifications and payload inputs": "استعادة كافة إعدادات الألوان والمدخلات للافتراضي",
  "Close Modal Windows": "إغلاق النوافذ المنبثقة",
  "Closes active overlays, dropdowns, & dialogs": "إغلاق النوافذ والحوارات المفتوحة",
  "Toggle Real-Time Preview": "تبديل المعاينة الواقعية الفورية",
  "Switches between simulated mobile frames": "التبديل بين إطارات محاكاة الهواتف والمطبوعات",

  // Saved
  "Folder name...": "اسم المجلد...",
  "All Folders": "جميع المجلدات",
  "Select All Designs": "تحديد جميع التصميمات",
  "Unselect All": "إلغاء تحديد الكل",
  "Move to Folder...": "نقل إلى مجلد...",

  // SEO & Programmatic
  "Back to Main Workshop": "العودة إلى مساحة العمل الرئيسية",
  "The Challenges Faced by Modern {{name}} Administrations": "التحديات التشغيلية التي تواجه إدارات {{name}} الحديثة",
  "Academy Guides": "أدلة الأكاديمية التعليمية",
  "Brand Accent Color": "لون تمييز العلامة التجارية",
  "Column Gap": "التباعد بين الأعمدة (ملم)",
  "Row Gap": "التباعد بين الصفوف (ملم)",
  "Sheet Padding": "هوامش الورقة الخارجية",
  "Alignment Guides": "خطوط المحاذاة والقص",
  "Single Large Mode": "وضع الرمز المفرد الكبير",
  "Full Color": "ألوان كاملة",
  "Grayscale": "تدرج رمادي",
  "Ink Saver": "موفر الحبر",
  "Laser Max": "أقصى وضوح ليزري",
  "Pure B&W": "أبيض وأسود نقي",
  "Company / Brand Name": "اسم الشركة أو العلامة التجارية",
  "Contrasting Ratio": "نسبة التباين اللوني",
  "Pre-press corners for physical guillotine cutting alignment.": "علامات الزوايا لمحاذاة مقصات الورق الميكانيكية.",
  "Custom Label String": "نص التسمية المخصصة",
  "Data density parameters": "معايير كثافة وتوزيع البيانات",
  "3. Data Density & Correction": "3. كثافة البيانات ومستوى تصحيح الخطأ",
  "Decoding modules...": "جارٍ فك ترميز الوحدات والمصفوفات...",
  "Display Text / Web URL": "نص العرض أو رابط الموقع الإلكتروني",
  "Download Format": "صيغة التنزيل",
  "Estimated Pre-press Density:": "كثافة ما قبل الطباعة المقدرة:",
  "Fix Colors (Set Slate on White)": "تصحيح الألوان (رمادي غامق على خلفية بيضاء)",
  "Fold and Stand • Easy to Scan": "اطوِ وثبّت • سهل للمسح المباشر",
  "FOLD LINE TO STAND": "خط الطي لتثبيت الحامل المكتبي",
  "Fold and Stand Display": "حامل طاولة مكتبي قابل للطي",
  "Adds size, date, and custom string in footer margins.": "إضافة المقاس والتاريخ والنص في هوامش التذييل.",
  "Critical Scannability Warning": "تحذير حرج: صعوبة في المسح الضوئي",
  "Extremely narrow color contrast or excessively large center overlays detected.": "تم اكتشاف تباين لوني ضعيف للغاية أو شعار مركزي يغطي مساحة زائدة.",
  "Excellent Scannability": "قابلية مسح ممتازة وفائقة",
  "Highly compatible contrast and correct emblem boundaries.": "تباين لوني عالي التوافق وهوامش شعار مثالية ومطابقة للمواصفات.",
  "Moderate Scannability": "قابلية مسح متوسطة ومقبولة",
  "Client Interface": "واجهة العميل المعالجة محلياً",
  "Handles design parameters, canvas rendering, and local-first exports": "معالجة خيارات التصميم وتصيير اللوحة والتصدير المحلي بدون خوادم",
  "Coming Soon": "قريباً",
  "Common Redirection Pitfalls": "أخطاء شائعة في إعادة توجيه الروابط",
  "Configure Recommended Design": "تطبيق التصميم الموصى به",
  "Copied ✓": "تم النسخ بنجاح ✓",
  "Copy ORM Schema": "نسخ مخطط ORM",
  "Copy Schema": "نسخ المخطط",
  "Copy Code": "نسخ الكود",
  "Clean / Passed": "سليم / مجتاز للاختبار",
  "Claude / Anthropic Search": "البحث عبر Claude / Anthropic",
  "OpenAI": "OpenAI",
  "ChatGPT": "ChatGPT",
  "Claude": "Claude",
  "Gemini": "Gemini",
  "Perplexity": "Perplexity"
};

// Replace brand occurrences in all keys first
let brandFixCount = 0;
for (const [k, v] of Object.entries(ar)) {
  if (typeof v === 'string' && /freeqrgen/i.test(v)) {
    ar[k] = v.replace(/freeqrgen\.pro/gi, 'FreeQRBarcodes.com')
             .replace(/freeqrgen\s*platform/gi, 'منصة FreeQRBarcodes.com')
             .replace(/freeqrgen\s*trust\s*center/gi, 'مركز الثقة في FreeQRBarcodes.com')
             .replace(/freeqrgen\s*corp/gi, 'FreeQRBarcodes.com')
             .replace(/freeqrgen/gi, 'FreeQRBarcodes.com');
    brandFixCount++;
  }
}
console.log(`Replaced brand in ${brandFixCount} keys.`);

// Direct dictionary replacements
let dictCount = 0;
strictList.forEach(item => {
  const k = item.key;
  const en = item.en;
  if (dictionary[en]) {
    ar[k] = dictionary[en];
    dictCount++;
  } else if (dictionary[item.ar]) {
    ar[k] = dictionary[item.ar];
    dictCount++;
  }
});
console.log(`Updated ${dictCount} keys from dictionary.`);

// Save
fs.writeFileSync(arPath, JSON.stringify(ar, null, 2), 'utf8');
console.log('Saved initial sweep.');
