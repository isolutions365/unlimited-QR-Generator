const fs = require('fs');
const path = require('path');

const arPath = path.join(__dirname, '../src/locales/ar.json');
const ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));

const finalTranslations = {
  // SEO
  "seo.schemaStep1Name": "اختر نوع الرمز وأدخل البيانات",
  "seo.schemaStep1Text": "اختر من بين أنواع الرموز المختلفة مثل الروابط أو بطاقات vCard أو شبكات الواي فاي وأدخل بياناتك المطلوبة.",
  "seo.schemaStep2Name": "تخصيص الألوان والهوية البصرية",
  "seo.schemaStep2Text": "اختر تدرجاً لونياً جذاباً أو لوناً ثابتاً، مع تخصيص أشكال العيون ونمط النقاط.",
  "seo.schemaStep3Name": "إدراج شعار العلامة التجارية في المركز",
  "seo.schemaStep3Text": "قم برفع شعار شركتك أو اختر أيقونة مناسبة مع ضبط تصحيح الخطأ على مستوى عالٍ.",
  "seo.schemaStep4Name": "تصدير وطباعة الرمز",
  "seo.schemaStep4Text": "قم بتنزيل الرمز كصورة PNG عالية الدقة، أو كملف متجهي SVG أو PDF قابل للتحجيم للطباعة.",
  "seo.securityFeature1": "لا يتم إرسال أي بيانات اعتماد أو نصوص إلى خوادم خارجية، كل شيء يبقى على جهازك فقط.",
  "seo.securityFeature2": "فحوصات تصحيح الخطأ تضمن إمكانية قراءة الرموز حتى لو تعرضت للخدش أو التلف الجزئي.",
  "seo.securityFeature3": "يدعم تصدير صور PNG، ورسومات SVG المتجهية القياسية، وملفات PDF المتجهية.",
  "seo.seoAuthorityDesc": "استكشف صفحاتنا المخصصة لتوليد رموز QR الاحترافية لمختلف الاستخدامات: العروض التجارية، شبكات الواي فاي، وسائل التواصل، وقوائم المطاعم الرقمية:",
  "seo.seoAuthorityTitle": "دليل المراجع والصفحات المتخصصة",
  "seo.technicalReferenceFaq": "المرجع التقني والأسئلة الشائعة",
  "seo.telemetryTitle": "المؤشرات الرئيسية وإحصائيات الزحف",
  "seo.threeDActive": "معاينة تفاعلية ثلاثية الأبعاد",
  "seo.trustedBy": "موثوق من أكثر من 2,490 شركة ومطعماً وإدارة شبكات حول العالم لتصميم وتخصيص رموز QR.",
  "seo.ultraHdScalable": "فائق الدقة وقابل للتحجيم اللانهائي",
  "seo.uprate": "نسبة جاهزية 99.9%",
  "seo.whatIsA": "ما هو {{keyword}}؟",
  "seo.whenShouldYouUse": "متى يجب استخدام هذا التنسيق؟",

  // Shortcuts
  "shortcuts.save": "حفظ قالب الرمز المخصص",
  "shortcuts.saveDesc": "حفظ إعدادات وتكوينات التصميم مباشرة",
  "shortcuts.subtitle": "ضاعف إنتاجيتك باستخدام اختصارات لوحة المفاتيح السريعة",

  // Templates & TemplatesHub
  "templates.relatedTemplates": "قوالب وتصميمات ذات صلة",
  "templates.standardProtocol": "المعيار / البروتوكول المعتمد",
  "templates.standardUseCases": "أبرز حالات الاستخدام الإنتاجية",
  "templates.stepGuide": "دليل الإنشاء خطوة بخطوة",
  "templates.toolUrl": "🌐 منشئ رموز QR للروابط القياسية",
  "templates.toolVcard": "📇 تبادل بطاقات الأعمال vCard التنفيذية",
  "templates.toolWifi": "📶 منشئ رموز الاتصال بالواي فاي بدون كلمة مرور",
  "templates.useTemplateNow": "استخدم هذا القالب الآن",
  "templates.visualPrototype": "النموذج الأولي البصري التفاعلي",
  "templatesHub.scannability": "تقييم جودة وقابلية المسح",

  // Trust
  "trust.authoredBy": "المؤلف:",
  "trust.backButton": "العودة إلى استوديو التصميم",
  "trust.backToCreativeStation": "العودة إلى استوديو التصميم",
  "trust.benchmarkStatistics": "إحصائيات واختبارات الأداء المعيارية",
  "trust.benchmarkStats": "إحصائيات الأداء المعيارية",
  "trust.bestPractices": "أفضل الممارسات والقواعد الرياضية",
  "trust.biography": "السيرة الذاتية والخبرات",
  "trust.breadcrumb": "مسار التنقل",
  "trust.buildLabel": "رقم البناء //",
  "trust.closeAuthorProfile": "إغلاق الملف التعريفي للمؤلف",
  "trust.commonMistakes": "الأخطاء الشائعة في تصميم الباركود",
  "trust.connect": "تواصل مع المؤلف:",
  "trust.coreDefinition": "التعريف والمفهوم الأساسي",
  "trust.credentials": "المؤهلات والاعتمادات المهنية",
  "trust.dataProcessingP2": "نظراً لأن الرموز الثابتة تتم معالجتها بالكامل داخل متصفحك محلياً، لا يتم إرسال أي بيانات شخصية، مما يجعل الامتثال سهلاً. وبالنسبة للرموز الديناميكية التي تجمع إحصائيات المسح، فإننا نعمل كمعالج بيانات ونطبق تدابير فنية وتنظيمية صارمة.",
  "trust.dataProcessingP3": "نقوم بعزل جميع قواعد البيانات واستخدام خوادم استضافة أوروبية آمنة ومتوافقة تماماً مع لائحة GDPR، مما يمنع أي معالجة أو نقل غير مصرح به للبيانات.",
  "trust.desc": "استعرض اتفاقيات مستوى الخدمة (SLA)، وقواعد الامتثال التنظيمي، وممارسات الأمان، وحالة الخوادم المباشرة.",
  "trust.directoryTitle": "دليل مركز الثقة",
  "trust.privacyP3": "نحن متوافقون بالكامل مع لوائح GDPR و CCPA و COPPA. ولا نقوم بدمج أي وسطاء بيانات أو برمجيات تتبع سلوكي أو نصوص تسويقية خارجية، مما يضمن أمان وخصوصية قنواتك التسويقية.",
  "trust.proTipAi": "نصيحة تقنية: محتوى مهيكل للاستشهاد المباشر في نماذج الذكاء الاصطناعي مثل Gemini و ChatGPT و Copilot.",
  "trust.securityP3": "تتم استضافة خوادمنا العالمية على شبكات سحابية متميزة وعالية الأمان مع حماية نشطة ضد هجمات حجب الخدمة (DDoS) وتشفير HTTPS الإلزامي، مما يحمي روابطك من أي ثغرات أو اعتراض أثناء النقل."
};

let count = 0;
for (const [key, value] of Object.entries(finalTranslations)) {
  ar[key] = value;
  count++;
}

// Global replace any remaining FreeQRGen.pro with FreeQRBarcodes.com across all values
for (const [k, v] of Object.entries(ar)) {
  if (typeof v === 'string' && /freeqrgen/i.test(v)) {
    ar[k] = v.replace(/freeqrgen\.pro/gi, 'FreeQRBarcodes.com')
             .replace(/freeqrgen/gi, 'FreeQRBarcodes.com');
  }
}

fs.writeFileSync(arPath, JSON.stringify(ar, null, 2), 'utf8');
console.log(`Updated final translations (${count} keys) in ar.json.`);
