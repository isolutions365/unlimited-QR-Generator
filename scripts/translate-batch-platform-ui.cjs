const fs = require('fs');
const path = require('path');

const arPath = path.join(__dirname, '../src/locales/ar.json');
const ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));

const translations = {
  // i18n
  "i18n.tab": "التبويب.",

  // platform
  "platform.copySnippet": "نسخ المقتطف البرمجي",
  "platform.dbDescOrganizationsCreatedAt": "الوقت الزمني للإنشاء بتوقيت UTC.",
  "platform.dbDescOrganizationsId": "المعرف الأساسي الفريد للمؤسسة.",
  "platform.dbDescOrganizationsName": "الاسم الرسمي للمؤسسة أو العلامة التجارية.",
  "platform.dbDescOrganizationsSsoProvider": "إعدادات مزود تسجيل الدخول الموحد SSO (مثل SAML أو Okta).",
  "platform.dbDescProjectsCreatedBy": "المستخدم الذي قام بإنشاء المشروع.",
  "platform.dbDescProjectsId": "المعرف الفريد للمشروع.",
  "platform.dbDescProjectsName": "الاسم المخصص للمشروع أو الحملة.",
  "platform.dbDescProjectsOrgId": "المعرف الفريد للمؤسسة التابع لها المشروع.",
  "platform.dbDescQrcodesCreatedAt": "تاريخ ووقت إنشاء الرمز بتوقيت UTC.",
  "platform.dbDescQrcodesDesignConfig": "إعدادات التصميم المهيكلة بصيغة JSON (الألوان، العيون، الشعار).",
  "platform.dbDescQrcodesDynamicUrl": "رابط الوجهة القابل للتعديل لإعادة التوجيه السحابي.",
  "platform.dbDescQrcodesId": "المعرف الفريد لرمز QR.",
  "platform.dbDescQrcodesIsDynamic": "مؤشر منطقي يحدد ما إذا كان الرمز ديناميكياً أم ثابتاً.",
  "platform.dbDescQrcodesProjectId": "المعرف الفريد للمشروع المرتبط بالرمز.",
  "platform.dbDescQrcodesStaticPayload": "البيانات المباشرة المخزنة داخل مصفوفة الرمز الثابت.",
  "platform.dbDescScansCity": "المدينة التقريبية لموقع المسح.",
  "platform.dbDescScansCountry": "رمز الدولة للمسح الجغرافي (وفق ISO).",
  "platform.dbDescScansDevice": "نوع الجهاز والمتصفح المستخدم في المسح.",
  "platform.dbDescScansId": "المعرف الفريد لعملية المسح.",
  "platform.dbDescScansIpHash": "تجزئة مشفرة ومجهولة لعنوان IP لحماية الخصوصية.",
  "platform.dbDescScansQrcodeId": "المعرف الفريد لرمز QR الذي تم مسحه.",
  "platform.dbDescScansScannedAt": "الوقت الدقيق لعملية المسح بتوقيت UTC.",
  "platform.dbDescUsersCreatedAt": "تاريخ إنشاء الحساب بتوقيت UTC.",
  "platform.dbDescUsersEmail": "البريد الإلكتروني الموثق للمستخدم.",
  "platform.dbDescUsersId": "المعرف الأساسي الفريد للمستخدم.",
  "platform.dbDescUsersOrgId": "المعرف الفريد للمؤسسة التي ينتمي إليها المستخدم.",
  "platform.dbDescUsersPasswordHash": "كلمة المرور المشفرة بأمان عالي.",
  "platform.dbDescUsersRole": "دور وصلاحيات المستخدم (مدير، مصمم، مشاهد).",
  "platform.snippetLanguage": "لغة المقتطف البرمجي",

  // templates
  "templates.badgeCorporate": "قالب مؤسسي للأعمال",
  "templates.badgeCreative": "قالب إبداعي وفني",
  "templates.badgeEvent": "قالب للمناسبات والفعاليات",
  "templates.badgeModern": "قالب عصري وأنيق",
  "templates.badgeRestaurant": "قالب للمطاعم وقوائم الطعام",
  "templates.badgeSocial": "قالب لشبكات التواصل الاجتماعي",
  "templates.badgeVcard": "قالب لبطاقات الأعمال الشخصية",
  "templates.badgeWifi": "قالب لشبكات الواي فاي",
  "templates.exploreAll": "استكشاف كافة القوالب المتاحة",

  // templatesHub
  "templatesHub.allTags": "جميع الوسوم والتصنيفات",

  // saved
  "saved.batchDeleteConfirm": "هل أنت متأكد من حذف {{count}} تصميم من المحفوظات؟",
  "saved.batchMove": "نقل العناصر المحددة",
  "saved.clearSelection": "إلغاء التحديد",
  "saved.emptyFolder": "هذا المجلد لا يحتوي على أي تصميمات حالياً.",
  "saved.folderCreated": "تم إنشاء المجلد بنجاح!",
  "saved.folderDeleted": "تم حذف المجلد بنجاح.",
  "saved.folderUpdated": "تم تحديث اسم المجلد.",
  "saved.manageFolders": "إدارة المجلدات",
  "saved.noFolderSelected": "لم يتم اختيار مجلد",
  "saved.openInStudio": "فتح في استوديو التصميم",
  "saved.savedDesignsCount": "{{count}} تصميم محفوظ",
  "saved.selectFolder": "اختر مجلداً للنقل إليه",

  // shortcuts
  "shortcuts.escKey": "مفتاح الهروب (Esc)",
  "shortcuts.navigation": "اختصارات التنقل السريع",
  "shortcuts.quickActions": "الإجراءات السريعة"
};

let count = 0;
for (const [key, value] of Object.entries(translations)) {
  ar[key] = value;
  count++;
}

fs.writeFileSync(arPath, JSON.stringify(ar, null, 2), 'utf8');
console.log(`Updated platform and UI batch translations (${count} keys) in ar.json.`);
