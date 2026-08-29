const fs = require('fs');
const path = require('path');

const arPath = path.join(__dirname, '../src/locales/ar.json');
const ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));

const translations = {
  "platform.dbDrizzleSchemaTitle": "شفرة Drizzle ORM ومخطط قاعدة بيانات PostgreSQL",
  "platform.dbOmsSchemaCodeTitle": "شفرة Drizzle ORM ومخطط قاعدة بيانات PostgreSQL",
  "platform.ormSchemaTitle": "شفرة Drizzle ORM ومخطط قاعدة بيانات PostgreSQL",
  "preview.downloadHD3000": "تنزيل بدقة 3000 بكسل فائقة الوضوح",
  "preview.size140mm": "140 ملم (ملصق كبير / بوستر)",
  "print.dialogTip": "اضبط الهوامش على 'بلا' في نافذة طباعة المتصفح لضمان دقة البكسل التامة.",
  "programmatic.publisherName": "شركة FreeQRBarcodes.com للحلول الرقمية",
  "programmatic.qrCodesFor": "رموز QR المخصصة لـ",
  "programmatic.solutions": "الحلول المتخصصة",
  "programmatic.solutionsDirectory": "دليل الحلول والقطاعات",
  "programmatic.stepNum": "الخطوة {{num}}: مرحلة التنفيذ والتشغيل",
  "programmatic.tabAll": "الكل",
  "programmatic.tabEducation": "التعليم والتدريب",
  "programmatic.tabHospitality": "الضيافة والمطاعم",
  "programmatic.tabIndustrial": "الصناعة والمستودعات",
  "programmatic.tabMedical": "الرعاية الصحية والطبية",
  "programmatic.tabProfessional": "الخدمات المهنية والشركات",
  "programmatic.technicalChecklistFor": "قائمة الفحص والتحقق الفني لملصقات {{name}} المادية",
  "programmatic.textureFinish": "طبيعة السطح واللمعان الطباعي",
  "programmatic.textureFinishDesc": "يفضل الطباعة على خامات مطفأة غير عاكسة، وتجنب التصفيح الزجاجي شديد اللمعان.",
  "programmatic.theDigitalBridgeSolution": "حل الجسر الرقمي التفاعلي",
  "programmatic.topicalAuthorityVerified": "موثق ومعتمد حسب معايير التخصص الفني",
  "programmatic.useCases": "حالات الاستخدام",
  "programmatic.useCasesCaseStudyMetric": "تسريع استقبال وتوجيه الزوار بمعدل 3.2 أضعاف",
  "programmatic.useCasesCaseStudyResult": "ساهم الانتقال من السجلات الورقية إلى المسح الفوري عالي التباين في تقليص طوابير الانتظار وتحسين تجربة المستخدم.",
  "programmatic.useCasesCaseStudyTitle": "تنفيذ وتطبيق منظومة {{name}}",
  "programmatic.useCasesChallenge1": "صعوبة إدخال الروابط المعقدة يدوياً من قِبل المستخدمين على الهواتف.",
  "programmatic.useCasesChallenge2": "هدر المطبوعات الورقية وارتفاع تكاليف طباعة الكتيبات التعريفية التقليدية.",
  "programmatic.useCasesChallenge3": "غياب مؤشرات التحويل وبيانات التفاعل في الإعلانات والمطبوعات الميدانية التقليدية.",
  "programmatic.useCasesDirectory": "دليل حالات الاستخدام والتطبيقات",
  "seo.geoHub": "مركز تحسين محركات البحث التوليدية للذكاء الاصطناعي",
  "seo.richResults": "فهرسة النتائج التفاعلية المنسقة",
  "seo.schemaCompliant": "متوافق بالكامل مع معايير Schema.org",
  "trust.aboutP3Brand": "مجموعة آي سوليوشنز الرقمية",
  "trust.isolutionsIco": "مجموعة آي سوليوشنز الرقمية",
  "trust.isolutionsLabs": "مختبرات آي سوليوشنز للأبحاث"
};

for (const [key, value] of Object.entries(translations)) {
  ar[key] = value;
}

fs.writeFileSync(arPath, JSON.stringify(ar, null, 2), 'utf8');
console.log('Applied final 36 translations to ar.json.');
