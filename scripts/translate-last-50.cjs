const fs = require('fs');
const path = require('path');

const arPath = path.join(__dirname, '../src/locales/ar.json');
const ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));

const translations = {
  // programmatic
  "programmatic.useCasesMistakesStep1": "استخدام روابط وجهة غير متوافقة مع متصفحات وأبعاد شاشات الهواتف المحمولة.",
  "programmatic.useCasesMistakesStep2": "استخدام لقطات شاشة أو صور PNG ضبابية منخفضة الدقة بدلاً من ملفات المتجهات النقية.",
  "programmatic.useCasesMistakesStep3": "عدم اختبار مسح الرمز المطبوع على موديلات هواتف ذكية مختلفة قبل بدء التوزيع والطباعة.",
  "programmatic.useCasesPracticesStep1": "اختيار حجم لا يقل عن 2 × 2 سم للمطبوعات الصغيرة، وتكبير الحجم بما يتناسب مع اللافتات.",
  "programmatic.useCasesPracticesStep2": "استخدام ألوان ذات تباين عالٍ مثل الفحمي الداكن على خلفية بيضاء ناصعة.",
  "programmatic.useCasesPracticesStep3": "الحفاظ على هوامش بيضاء آمنة ونظيفة حول الحواف الخارجية للرمز.",
  "programmatic.useCasesWorkflowStep1": "يشاهد الزائر ملصق رمز QR المطبوع عالي التباين في الموقع الميداني.",
  "programmatic.useCasesWorkflowStep2": "يمسح الرمز بكاميرا هاتفه، ليتم فتح إعدادات الضيوف أو ملفات الأدلة فوراً.",
  "programmatic.useCasesWorkflowStep3": "يراقب فريق الإدارة إجمالي عمليات المسح ومصادر الزيارات من لوحة تحكم واحدة.",
  "programmatic.viewDirectory": "عرض الدليل الشامل",
  "programmatic.whyQRHelpsSolutions": "يتيح نشر حلول {{name}} اللاتلامسية المخصصة لفرق العمل ربط نقاط التفاعل الميدانية بالبوابات الرقمية الآمنة فوراً، مما يعزز سرعة تقديم الخدمات وجمع البيانات التحليلية بأمان.",
  "programmatic.whyQRHelpsUseCases": "يتيح دمج باركود {{name}} التلقائي للمستخدمين ربط الشاشات واللوحات الخارجية مباشرة بقوائم الطعام التفاعلية أو النماذج أو الخرائط دون أي تأخير.",
  "programmatic.whyQrCodesAreTransforming": "كيف تُحدث رموز QR ثورة في قطاع {{name}}",
  "programmatic.workflowStep1": "يلاحظ العميل أو الزائر رمز QR الباركود الديناميكي المميز في الموقع.",
  "programmatic.workflowStep2": "يمسح الرمز عبر كاميرا هاتفه الذكي لفتح البوابة المباشرة أو حفظ جهة الاتصال تلقائياً.",
  "programmatic.workflowStep3": "يتابع المسؤول مواقع المسح والمتصفحات والمخططات الزمنية عبر لوحة تحكم التطبيق.",

  // saved
  "saved.loading": "جارٍ تحميل العناصر المحفوظة...",
  "saved.newFolderBtn": "مجلد جديد",
  "saved.newFolderPrompt": "اسم المجلد الجديد...",
  "saved.noProjectsCategoryDesc": "يرجى تعديل خيارات التصفية أو تحديث فئات المشاريع للعرض.",
  "saved.noProjectsCategoryTitle": "لا توجد مشاريع في هذا المجلد",
  "saved.noProjectsDesc": "قم بتخصيص رمز QR، وتحديد ألوانه، وتعيين مجلد له، ثم اضغط حفظ.",
  "saved.noProjectsTitle": "لا توجد تصميمات محفوظة حتى الآن",
  "saved.organizeTitle": "تنظيم داخل المجلدات",
  "saved.scansCount": "{{count}} عملية مسح",
  "saved.seedClicksBtn": "+ إضافة نقرات تجريبية",
  "saved.timedBadge": "محدد بوقت ⏳",
  "saved.uncategorizedLabel": "غير مصنف",

  // seo
  "seo.aiReferenceDesc": "مواصفات تقنية مهيكلة، وأفضل الممارسات الهندسية، وإجابات موثقة محسنة للفهرسة عبر نماذج الذكاء الاصطناعي ومحركات البحث الذكية.",
  "seo.entityKnowledgeGraph": "سمات الرسم البياني المعرفي للكيان",
  "seo.freeService": "خدمة مجانية 100%",
  "seo.generators": "أدوات التوليد",
  "seo.geoHub": "مركز تحسين محركات البحث التوليدية (GEO)",
  "seo.home": "الرئيسية",
  "seo.keyBenefitsAdvantages": "أبرز المزايا والفوائد التشغيلية",
  "seo.keywords": "ظهور الكلمات المفتاحية التلقائي",
  "seo.launchBuilderFree": "فتح منشئ الرموز (مجاناً)",
  "seo.livePresetSandbox": "بيئة المعاينة والتجربة المباشرة",
  "seo.matrixTitle": "مصفوفة فهرس محركات البحث المحلية",
  "seo.mobileUsability": "مستوى سهولة الاستخدام على الهواتف",
  "seo.noLoginsRequired": "لا يتطلب تسجيل الدخول للبدء",
  "seo.offlineMode": "وضع العمل دون إنترنت",
  "seo.pageNotFound": "صفحة محركات البحث غير موجودة",
  "seo.pageNotFoundDesc": "تعذر تحميل مسار الصفحة المقصودة المطلوبة.",
  "seo.primaryUseCase": "حالة الاستخدام الرئيسية",
  "seo.pristineSecurityStandards": "معايير أمان نقية وصارمة",
  "seo.proImplementationBestPractices": "أفضل ممارسات التنفيذ الاحترافي",
  "seo.protocolStandard": "البروتوكول / المعيار المعتمد",
  "seo.questionsAboutOur": "أسئلة شائعة حول خدماتنا",
  "seo.quickDefinition": "تعريف ومفهوم سريع",
  "seo.readPublication": "قراءة الدليل كاملاً ←",
  "seo.relatedGuidesTitle": "الأدلة والمنشورات الفنية ذات الصلة",
  "seo.returnToDashboard": "العودة إلى لوحة التحكم",
  "seo.richResults": "فهرسة النتائج المنسقة (Rich Results)",
  "seo.schemaCompliant": "مطابق لمعايير Schema.org",
  "seo.schemaHowToDesc": "إرشادات خطوة بخطوة لإنشاء رمز QR مخصص للروابط مع إضافة الشعارات والألوان وتتبع المسحات.",
  "seo.schemaSoftwareAppName": "مركز تحليلات ورموز QR - FreeQRBarcodes.com",
  "seo.schemaSoftwareOS": "جميع متصفحات الويب على الهواتف والأجهزة اللوحية والحواسيب",

  // trust
  "trust.aboutP3Brand": "مجموعة iSolutions الرقمية",
  "trust.accessibilityP2": "تتوافق واجهاتنا الرقمية مع معايير WCAG 2.2 AA، مع دعم كامل للوحة المفاتيح وقارئات الشاشة وحالات التركيز الواضحة.",
  "trust.aiProTip": "نصيحة تقنية: محتوى مهيكل للاستشهاد المباشر في نماذج الذكاء الاصطناعي ومحركات البحث الذكية.",
  "trust.isolutionsIco": "مجموعة iSolutions الرقمية",
  "trust.isolutionsLabs": "مختبرات iSolutions للأبحاث",
  "trust.privacyP3": "نحن متوافقون تماماً مع لوائح حماية البيانات العالمية، دون استخدام أي برمجيات تتبع سلوكي أو وسائط خارجية لجمع البيانات.",
  "trust.proTipAi": "نصيحة تقنية: محتوى مهيكل للاستشهاد المباشر في نماذج الذكاء الاصطناعي ومحركات البحث الذكية.",
  "trust.securityP3": "تتم استضافة خوادمنا العالمية على شبكات سحابية عالية الأمان ومزودة بحماية متقدمة ضد الهجمات مع فرض التشفير الصارم."
};

let count = 0;
for (const [key, value] of Object.entries(translations)) {
  ar[key] = value;
  count++;
}

fs.writeFileSync(arPath, JSON.stringify(ar, null, 2), 'utf8');
console.log(`Updated last 50 translations (${count} keys) in ar.json.`);
