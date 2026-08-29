const fs = require('fs');
const path = require('path');

const arPath = path.join(__dirname, '../src/locales/ar.json');
const ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));

const fixes = {
  // barcode
  "barcode.format.code128": "كود 128 (شامل - نصوص وأرقام)",
  "barcode.format.code39": "كود 39 (الصناعي وقطع الغيار والسيارات)",
  "barcode.valCode39Chars": "يدعم كود 39 الأرقام 0-9 والحروف الإنجليزية الكبيرة A-Z والمسافة والرموز: - . $ / + %",
  "barcode.valCode128Ascii": "يدعم كود 128 أحرف ASCII القياسية فقط.",
  "barcode.helpCode39": "يدعم كود 39 الحروف الإنجليزية الكبيرة (A-Z) والأرقام (0-9) والرموز: - . $ / + % والمسافة.",
  "barcode.helpCode128": "يتميز كود 128 بمرونة فائقة ويدعم كافة أحرف ASCII القياسية (حروف، أرقام، رموز).",

  // company
  "company.about.website": "isolutionsico.com",
  "company.aboutDesc": "بدأنا بإيمان بسيط: لا ينبغي أن تكون رموز QR مجرد مربعات تقليدية بالأبيض والأسود، بل يمكنها أن تصبح امتداداً فنياً وتفاعلياً لهويتك البصرية والتجارية.",
  "company.backButton": "العودة إلى استوديو التصميم",
  "company.contactBadge": "تواصل معنا",
  "company.details.corp": "القطاع والفرع التجاري",
  "company.details.corpName": "مجموعة آي سوليوشنز الرقمية",
  "company.details.inquiry": "الاستفسارات والملاحظات",
  "company.details.location": "مقر الخوادم والعمليات",
  "company.details.locationVal": "مركز التكنولوجيا العالمي، منطقة الحلول الرقمية",
  "company.detailsTitle": "بيانات وتفاصيل الاتصال",
  "company.inboxesDesc": "نراجع الاستفسارات الواردة خلال 24 ساعة عمل. يتم التعامل مع جميع البيانات بسرية وأمان تامين وفقاً لأعلى معايير الحماية والتخزين.",
  "company.inboxesTitle": "صناديق البريد المشفرة",
  "company.journeyBadge": "مسيرتنا وتطورنا",
  "company.labelMessage": "نص الرسالة",
  "company.labelSubject": "موضوع الرسالة",
  "company.lastUpdated": "آخر تحديث: 2 يونيو 2026",
  "company.principlesTitle": "مبادئنا وقيمنا الأساسية",

  // control
  "control.advancedSettingsDesc": "تخصيص مستوى تصحيح الأخطاء، والمنطقة الهادئة المحيطة، وتباعد النقاط.",
  "control.err.invalidUrlFormat": "تنسيق الرابط غير صالح. يرجى إدخال عنوان موقع ويب صحيح (مثل: https://example.com).",
  "control.label.trackingId": "معرف التتبع الفريد للرابط",
  "control.label.vcardEmail": "البريد الإلكتروني للوجهة",
  "control.label.vcardName": "الاسم الأول واسم العائلة",
  "control.label.vcardOrg": "اسم الشركة أو المنظمة",
  "control.label.vcardPhone": "رقم الهاتف المباشر",
  "control.labelTextColor": "لون نص التسمية",
  "control.linkExpiration": "تحديد موعد انتهاء صلاحية الرابط (اختياري)",
  "control.linkExpirationDescLong": "تعطيل رمز QR تلقائياً في تاريخ محدد. عند انتهاء الصلاحية، سيرى الزائر رسالة مخصصة أو تتم إعادة توجيهه إلى رابط بديل.",
  "control.liveViewport": "نافذة المعاينة التفاعلية",
  "control.locateMe": "تحديد موقعي الحالي",
  "control.logoAutoCenterDesc": "تفريغ وتنسيق وحدات البيانات تلقائياً أسفل شعار المركز دون الإخلال ببيانات الرمز.",
  "control.placeholder.expiryUrl": "مثال: https://yoursite.com/new-destination",
  "control.quietZoneDescLong": "تحيط المنطقة الهادئة بالرمز بهامش أبيض نقي لتتمكن الماسحات والكاميرات من تمييز حواف الرمز فوراً، خاصة على المواد الخشنة أو اللامعة."
};

let count = 0;
for (const [key, value] of Object.entries(fixes)) {
  ar[key] = value;
  count++;
}

fs.writeFileSync(arPath, JSON.stringify(ar, null, 2), 'utf8');
console.log(`Updated remaining clean translations (${count} keys) in ar.json.`);
