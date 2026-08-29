const fs = require('fs');
const path = require('path');

const arPath = path.join(__dirname, '../src/locales/ar.json');
const ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));

const translations = {
  // Announcements
  "👋 Welcome to FreeQRGen": "👋 مرحباً بك في FreeQRBarcodes.com",
  "Automated Silent Zone Margin Calculations": "الحساب التلقائي لهوامش منطقة الأمان",
  "We launched new customized security guidelines for enterprise QR deployment on secure local networks, ensuring zero-trust credential encapsulation.": "أطلقنا إرشادات أمان مخصصة وجديدة لنشر رموز QR للمؤسسات عبر الشبكات المحلية الآمنة مع ضمان تشفير وحماية بيانات الاعتماد وفق معايير انعدام الثقة.",

  // i18n Languages & UI
  "i18n.langDe": "الألمانية",
  "i18n.langEn": "الإنجليزية",
  "i18n.langEs": "الإسبانية",
  "i18n.langFr": "الفرنسية",
  "i18n.langHi": "الهندية",
  "i18n.langId": "الإندونيسية",
  "i18n.langIt": "الإيطالية",
  "i18n.langJa": "اليابانية",
  "i18n.langKo": "الكورية",
  "i18n.langPt": "البرتغالية",
  "i18n.langTr": "التركية",
  "i18n.langUr": "الأردية",
  "i18n.langZh": "الصينية المبسطة",
  "i18n.langAr": "العربية",

  "i18n.carouselDesc": "تتحرك عناصر العرض الدوار من اليسار إلى اليمين في اللغات اللاتينية، ومن اليمين إلى اليسار في اللغة العربية.",
  "i18n.coverageDescriptionPart1": "تغطي حزمة الترجمة الحالية",
  "i18n.coverageDescriptionPart2": "مفتاحاً معتمداً في",
  "i18n.coverageDescriptionPart3": "علامة التبويب النشطة.",
  "i18n.developerExporterDesc": "استخراج كافة مفاتيح الترجمة المعتمدة كملفات JSON مهيكلة للترجمة أو النشر الفوري.",
  "i18n.directionAuto": "تحديد اتجاه النص تلقائياً",
  "i18n.directionLtr": "من اليسار إلى اليمين",
  "i18n.directionRtl": "من اليمين إلى اليسار",
  "i18n.exportJson": "تصدير ملف JSON",
  "i18n.languageSelector": "اختيار لغة الواجهة",
  "i18n.missingKeys": "المفاتيح المفقودة",
  "i18n.rtlSupport": "دعم كامل للغة العربية والاتجاه من اليمين لليسار",
  "i18n.translationProgress": "نسبة اكتمال الترجمة:",

  // Footer & Gateway
  "footer.rights": "جميع الحقوق محفوظة © {{year}} FreeQRBarcodes.com",
  "footer.builtWith": "تم التطوير بأحدث تقنيات الويب السريعة والآمنة",
  "footer.enterpriseDesc": "حلول متقدمة للمؤسسات لإنشاء وإدارة رموز الباركود و QR بكفاءة وموثوقية عالية.",
  "footer.terms": "شروط الخدمة والترخيص",
  "gateway.title": "بوابة التحقق السحابية والروابط الذكية",
  "gateway.desc": "إعادة توجيه فورية فائقة السرعة للروابط الديناميكية مع تحليلات جغرافية دقيقة.",

  // Growth & Socials
  "growth.github": "حساب GitHub",
  "growth.githubPlaceholder": "اسم المستخدم على GitHub",
  "growth.githubProfile": "رابط حسابك على GitHub",
  "growth.linkedin": "حساب LinkedIn",
  "growth.linkedinPlaceholder": "رابط ملفك الشخصي على LinkedIn",
  "growth.linkedinUrl": "رابط LinkedIn المهني",
  "growth.placeholderGithub": "اسم المستخدم على GitHub",
  "growth.placeholderLinkedin": "رابط حسابك على LinkedIn",
  "growth.facebook": "حساب فيسبوك",
  "growth.twitter": "حساب إكس (تويتر)",
  "growth.instagram": "حساب إنستغرام",
  "growth.youtube": "قناة يوتيوب",
  "growth.tiktok": "حساب تيك توك",
  "growth.whatsapp": "رقم واتساب",
  "growth.telegram": "حساب تيليجرام",
  "growth.wechat": "معرف وي شات",
  "growth.snapchat": "حساب سناب شات",
  "growth.pinterest": "حساب بنترست",
  "growth.reddit": "حساب ريديت",
  "growth.discord": "خادم ديسكورد",
  "growth.twitch": "قناة تويتش",
  "growth.spotify": "قائمة سبوتيفاي",
  "growth.appleMusic": "رابط أبل ميوزك",
  "growth.soundCloud": "حساب ساوند كلاود",

  // Knowledge & Nav & Tour
  "knowledge.byAuthor": "بواسطة:",
  "knowledge.publisherName": "FreeQRBarcodes.com للحلول الرقمية",
  "nav.faqTitle": "الأسئلة الشائعة",
  "nav.templatesHub": "مركز القوالب الجاهزة",
  "tour.welcomeBody": "مرحباً بك في FreeQRBarcodes.com! دعنا نأخذك في جولة إرشادية سريعة لاستعراض أدوات التصميم والتتبع وإدارة المجلدات.",
  "tour.welcomeTitle": "جولة تعريفية في مساحة العمل 👋",

  // Templates & TemplatesHub
  "templates.catAll": "جميع القوالب",
  "templatesHub.noFound": "لم يتم العثور على أي قوالب",
  "templatesHub.noFoundDesc": "جرب تعديل خيارات البحث أو التصفية لاستكشاف تصميمات أخرى متوفرة.",
  "templatesHub.recommendedIndustry": "القطاع التجاري الموصى به",

  // Saved & Shortcuts
  "saved.folderPlaceholder": "اسم المجلد الجديد...",
  "shortcuts.downloadDesc": "تنزيل الرمز بأعلى دقة متجهة فوراً (Ctrl+S / ⌘S)",
  "shortcuts.print": "خيارات الطباعة والتصدير",
  "shortcuts.printDesc": "فتح لوحة إعدادات وتخطيط الطباعة فوراً (Ctrl+P / ⌘P)"
};

let count = 0;
for (const [key, value] of Object.entries(translations)) {
  ar[key] = value;
  count++;
}

fs.writeFileSync(arPath, JSON.stringify(ar, null, 2), 'utf8');
console.log(`Updated clean UI translations (${count} keys) in ar.json.`);
