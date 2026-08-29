const fs = require('fs');
const path = require('path');

const arPath = path.join(__dirname, '../src/locales/ar.json');
const ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));

const pstList = JSON.parse(fs.readFileSync(path.join(__dirname, '../pst_to_translate.json'), 'utf8'));

const translations = {
  // programmatic
  "programmatic.colorContrastRules": "قواعد ومعايير التباين اللوني",
  "programmatic.colorContrastRulesDesc": "احرص دائماً على إبقاء وحدات الرمز بلون داكن (مثل الأسود أو النيلي الداكن) على خلفية بيضاء ناصعة.",
  "programmatic.commonPitfallsAvoid": "الأخطاء الشائعة (يجب تجنبها)",
  "programmatic.customCenterpieceLogo": "إدراج شعار مخصص في المركز",
  "programmatic.customCenterpieceLogoDesc": "عزز ثقة المستخدمين بوضع شعار علامتك التجارية في منتصف مصفوفة الرمز بدقة.",
  "programmatic.directorySubtitle": "تصفح الأدلة الفنية والمواصفات الطباعية المعتمدة المصممة لإلغاء أي عوائق في التفاعل التلامسي.",
  "programmatic.discoveryPhase": "مرحلة الاستكشاف والتحليل",
  "programmatic.dynamicUrlBarcode": "رمز QR ديناميكي برابط متجدد",
  "programmatic.dynamicUrlBarcodeDesc": "يتيح تعديل الروابط وتتبع إحصائيات المسح وتعيين تواريخ انتهاء الصلاحية فوراً.",
  "programmatic.exploreAuthorityFile": "استعراض ملف التوثيق المرجعي",
  "programmatic.faqA1Solutions": "تتميز جميع رموز QR المنشأة على FreeQRBarcodes.com بعدد غير محدود من عمليات المسح وبدون تواريخ انتهاء صلاحية خفية.",
  "programmatic.faqQ1Solutions": "هل رموز QR المنشأة صالحة للاستخدام التجاري الدائم؟",
  "programmatic.faqA2Solutions": "نعم، يمكنك تصدير التصميمات بصيغة SVG المتجهة النقية القابلة للتكبير اللانهائي للوحات الإعلانية الضخمة.",
  "programmatic.faqQ2Solutions": "هل تدعم المنصة الطباعة على لافتات ومطبوعات كبيرة؟",
  "programmatic.featureMatrixTitle": "مصفوفة الميزات والقدرات الفنية",
  "programmatic.implementationPhase": "مرحلة التنفيذ والتشغيل",
  "programmatic.keyMetricsTelemetry": "القياس والتحليلات المباشرة",
  "programmatic.offlinePrintVerification": "التحقق المسبق من جاهزية الطباعة",
  "programmatic.opticalDensityStandards": "معايير الكثافة البصرية وتصحيح الأخطاء",
  "programmatic.prepressChecklist": "قائمة التحقق لما قبل الإنتاج الطباعي",
  "programmatic.printOptimizationTitle": "تحسين وتجهيز ملفات الطباعة",
  "programmatic.realtimeVectorRendering": "تصيير المتجهات الفوري محلياً",
  "programmatic.recommendedSpecs": "المواصفات والإعدادات الموصى بها",
  "programmatic.rolloutTimeline": "الجدول الزمني للإطلاق والتشغيل",
  "programmatic.scannabilityMetrics": "مؤشرات سرعة ودقة المسح",
  "programmatic.securityCompliance": "الامتثال والضوابط الأمنية",
  "programmatic.staticVsDynamic": "مقارنة الرموز الثابتة بالرموز الديناميكية",
  "programmatic.technicalOverview": "نظرة عامة على المواصفات التقنية",
  "programmatic.useCasesFaqA1": "نعم، جميع أدوات إنشاء الرموز الثابتة مجانية 100% بدون أي اشتراكات أو قيود.",
  "programmatic.useCasesFaqA2": "لا، منصة FreeQRBarcodes.com مجانية بالكامل مع توليد غير محدود وخيارات تخزين آمنة.",
  "programmatic.useCasesFaqQ1": "هل تفرض المنصة أي رسوم على تصدير الرموز؟",
  "programmatic.useCasesFaqQ2": "هل تنتهي صلاحية الرموز المنشأة بعد عدد معين من المسحات؟",
  "programmatic.useCasesHeroDesc": "اكتشف كيف تساعد حلول {{name}} الشركات والمصممين في بناء تجارب تفاعلية متميزة.",
  "programmatic.useCasesHeroTitle": "تطبيقات وحلول {{name}} المعتمدة",
  "programmatic.vectorExportHighDpi": "تصدير متجهات عالية النقاء والوضوح",

  // seo
  "seo.aiReferenceDesc": "مواصفات تقنية مهيكلة، وأفضل الممارسات الهندسية، وإجابات موثقة محسنة للفهرسة والذكاء الاصطناعي عبر Gemini و ChatGPT و Perplexity و Google AI Overviews.",
  "seo.badge": "مركز محركات البحث والمعرض البصري",
  "seo.breadcrumbHome": "الرئيسية",
  "seo.commonMistakesToAvoid": "أخطاء شائعة يجب تجنبها",
  "seo.complementaryQrCodes": "رموز QR مكملة وأدوات ذات صلة",
  "seo.desc": "استكشف إعدادات وتكوينات متوافقة تماماً مع المعايير الدولية لمحركات البحث.",
  "seo.entityKnowledgeGraph": "سمات الرسم البياني المعرفي للكيان (Knowledge Graph)",
  "seo.entityType": "نوع الكيان الرقمي",
  "seo.essentialTakeaways": "النقاط الجوهرية والملخص التقني",
  "seo.faqDescription": "استعرض الأسئلة الأكثر شيوعاً من المسوقين والمطورين حول الاستخدام والتشغيل.",
  "seo.featuredTool": "الأداة المميزة الموصى بها",
  "seo.highResolutionExport": "تصدير عالي الدقة للطباعة",
  "seo.howToCreate": "كيفية إنشاء وتخصيص الرمز",
  "seo.jsonLdSchema": "مخطط البيانات المهيكلة (JSON-LD)",
  "seo.keyCapabilities": "أبرز القدرات والميزات التشغيلية",
  "seo.localFirstArchitecture": "معمارية المعالجة المحلية أولاً",
  "seo.metadataTitle": "بيانات التوثيق والفهرسة لمحركات البحث",
  "seo.opticalVerification": "الفحص والمعايرة البصرية المباشرة",
  "seo.pageType": "نوع الصفحة والتصنيف",
  "seo.performanceMetrics": "مؤشرات الأداء وسرعة التحميل",
  "seo.primaryAction": "الإجراء المستهدف الرئيسي",
  "seo.qualityStandards": "معايير الجودة وموثوقية المسح",
  "seo.recommendedPresets": "القوالب والتصميمات الموصى بها",
  "seo.referenceGuide": "الدليل المرجعي والمواصفات القياسية",
  "seo.relatedResources": "مصادر ومقالات تعليمية ذات صلة",
  "seo.schemaHowToName": "كيفية إنشاء رمز QR للروابط عبر FreeQRBarcodes.com",
  "seo.structuredContent": "محتوى مهيكل ومحسن لمحركات البحث",
  "seo.technicalGuide": "الدليل التقني الشامل",
  "seo.verifiedByEngineers": "تم التدقيق والمراجعة بواسطة خبراء هندسيين",
  "seo.visualShowcase": "المعرض البصري والنماذج التطبيقية",

  // trust
  "trust.aboutP3Brand": "مجموعة iSolutions الرقمية",
  "trust.accessibilityP2": "تتوافق واجهاتنا الرقمية مع معايير WCAG 2.2 AA، وتتضمن دعماً كاملاً للتنقل بلوحة المفاتيح وأوصاف ARIA ومؤشرات تركيز واضحة.",
  "trust.accessibilityP3": "للحملات المطبوعة، ننصح بوضع إرشادات لمسية (مثل إطارات بارزة أو علامات محيطة) وترجمة بطريقة برايل بجوار الرمز لتمكين المكفوفين وضعاف البصر من تحديد موقعه ومسحه بنجاح.",
  "trust.aiProTip": "نصيحة فنية: محتوى مهيكل للاستشهاد المباشر في نماذج Gemini و ChatGPT و Copilot.",
  "trust.aiSearchAnswer": "إجابة سريعة لمحركات البحث الذكية",
  "trust.aiSummaryTitle": "إجابة موجزة لمحركات البحث بالذكاء الاصطناعي",
  "trust.authorBiography": "السيرة الذاتية والخبرات المهنية",
  "trust.authorConnect": "تواصل مع المؤلف:",
  "trust.authorCredentials": "المؤهلات والاعتمادات المهنية",
  "trust.authorPublications": "أبرز المنشورات والأبحاث المختارة",
  "trust.dpaP1": "تقدم FreeQRBarcodes.com ملحقاً ملزماً قانونياً لمعالجة البيانات (DPA) يتوافق مع متطلبات المادة 28 من اللائحة العامة لحماية البيانات (GDPR).",
  "trust.editorialP2": "تتم كتابة كافة الشروحات والأدلة والوثائق الفنية المنشورة على FreeQRBarcodes.com بواسطة خبراء معتمدين في معالجة البيانات البصرية، مع تطبيق نظام مراجعة أقران مزدوج التعمية لضمان الدقة العلمية.",
  "trust.editorialPolicyP2": "تتم كتابة كافة الشروحات والأدلة والوثائق الفنية المنشورة على FreeQRBarcodes.com بواسطة خبراء معتمدين في معالجة البيانات البصرية، مع تطبيق نظام مراجعة أقران مزدوج التعمية لضمان الدقة العلمية.",
  "trust.eeatCertText": "تخضع منصة FreeQRBarcodes.com لعمليات تحسين مستمرة لضمان أعلى مستويات الأمان البصري وسلامة الامتثال ودقة البيانات.",
  "trust.eeatDesc": "تخضع منصة FreeQRBarcodes.com لعمليات تحسين مستمرة لضمان أعلى مستويات الأمان البصري وسلامة الامتثال ودقة البيانات.",
  "trust.portalTitle": "مركز الثقة في FreeQRBarcodes.com",
  "trust.releaseNotesP3": "تضمن هذه التحسينات بقاء FreeQRBarcodes.com المنصة الأكثر أداءً وأماناً ودقة في تصيير باركود 2D على الويب.",
  "trust.whyFreeqrgenP1": "يمتلئ سوق مولدات QR بنماذج الفواتير المضللة ومخترقي الروابط القصيرة والتنسيقات النقطية غير المحسنة. لقد بنينا FreeQRBarcodes.com لتقديم بديل مفتوح وآمن تماماً.",
  "trust.whyFreeqrgenP2": "تعمل معظم المولدات عبر توجيه الرموز الثابتة من خلال نطاقات إعادة توجيه خفية، وبعد فترة وجيزة يطلبون اشتراكاً مالياً مما يعطل المطبوعات. نحن نضمن أن كافة الرموز الثابتة المنشأة على FreeQRBarcodes.com تتضمن بيانات الوجهة مباشرة لتعمل مدى الحياة بدون أي اعتماد على خوادمنا.",
  "trust.whyP1": "يمتلئ سوق مولدات QR بنماذج الفواتير المضللة ومخترقي الروابط القصيرة والتنسيقات النقطية غير المحسنة. لقد بنينا FreeQRBarcodes.com لتقديم بديل مفتوح وآمن تماماً.",
  "trust.whyP2": "تعمل معظم المولدات عبر توجيه الرموز الثابتة من خلال نطاقات إعادة توجيه خفية، وبعد فترة وجيزة يطلبون اشتراكاً مالياً مما يعطل المطبوعات. نحن نضمن أن كافة الرموز الثابتة المنشأة على FreeQRBarcodes.com تتضمن بيانات الوجهة مباشرة لتعمل مدى الحياة بدون أي اعتماد على خوادمنا.",
  "trust.whyP3": "من خلال نقل عمليات معالجة المتجهات (تصيير SVG) إلى المتصفح محلياً، نضمن لك إمكانية تصدير رسومات بدقة لا نهائية للطباعة دون الحاجة للتسجيل أو دفع رسوم ترخيص. إنها تكنولوجيا احترافية متاحة للجميع."
};

let count = 0;
pstList.forEach(item => {
  const k = item.key;
  if (translations[k]) {
    ar[k] = translations[k];
    count++;
  }
});

for (const [key, value] of Object.entries(translations)) {
  ar[key] = value;
}

fs.writeFileSync(arPath, JSON.stringify(ar, null, 2), 'utf8');
console.log(`Updated PST translations in ar.json.`);
