const fs = require('fs');
const path = require('path');

const arPath = path.join(__dirname, '../src/locales/ar.json');
const enPath = path.join(__dirname, '../src/locales/en.json');
const ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// Helper dictionary for module terms and metadata
const moduleTitles = {
  ApiPlatform: { name: "منصة واجهات برمجة التطبيقات (API)", badge: "تكامل الأنظمة البرمجية", seo: "واجهة برمجة تطبيقات رموز QR للمطورين والمؤسسات" },
  BulkGenerator: { name: "منشئ الرموز بالجملة", badge: "المعالجة الفائقة", seo: "إنشاء رموز QR وتصديرها بكميات ضخمة عبر ملفات CSV" },
  CampaignManager: { name: "مدير الحملات التسويقية", badge: "إدارة الحملات", seo: "إدارة وتتبع حملات رموز QR التسويقية متعددة القنوات" },
  Collections: { name: "المجموعات والتصنيفات", badge: "تنظيم الأصول", seo: "تنظيم وتجميع رموز QR في مصنفات ذكية متخصصة" },
  DeveloperDashboard: { name: "لوحة تحكم المطورين", badge: "أدوات التطوير", seo: "لوحة متقدمة لإدارة مفاتيح API ومراقبة معدلات الاستهلاك" },
  DynamicQr: { name: "رموز QR الديناميكية", badge: "توجيه ذكي", seo: "تحديث روابط الوجهات وتحليلات المسح دون تغيير الرمز المطبوع" },
  ExportCenter: { name: "مركز التصدير فائق الدقة", badge: "تصدير متعدد الصيغ", seo: "تصدير متجهات SVG وطباعة CMYK عالية الدقة لرموز QR" },
  FavoriteTemplates: { name: "القوالب المفضلة", badge: "استوديو الإبداع", seo: "حفظ وتخصيص قوالب التصميم المفضلة لرموز QR" },
  FolderManagement: { name: "إدارة المجلدات الذكية", badge: "هيكلة البيانات", seo: "تنظيم مشاريع ورموز QR في تسلسلات مجلدات مرنة" },
  ImportCenter: { name: "مركز الاستيراد والمعالجة", badge: "استيراد البيانات", seo: "استيراد دفعات البيانات وجداول CSV لتوليد الرموز آلياً" },
  Integrations: { name: "التكاملات والربط السحابي", badge: "تكامل الخدمات", seo: "ربط رموز QR مع منصات التجارة الإلكترونية وأنظمة CRM" },
  Organization: { name: "إدارة المؤسسات وفريق العمل", badge: "الحوكمة المؤسسية", seo: "صلاحيات الوصول وأدوار المستخدمين على مستوى المؤسسة" },
  QrAnalytics: { name: "تحليلات مسح رموز QR", badge: "بيانات فورية", seo: "إحصائيات المسح الجغرافي وأنواع الأجهزة ومعدلات التفاعل" },
  SavedDesigns: { name: "التصميمات المحفوظة", badge: "الأرشيف المحلي", seo: "إدارة وأرشفة تصميمات رموز QR مع تخزين آمن ومشفر" },
  ScanStatistics: { name: "إحصائيات المسح المتقدمة", badge: "التقارير التحليلية", seo: "مراقبة ذروة المسح الزمني وتوزيع الزيارات في الوقت الفعلي" },
  TeamWorkspace: { name: "مساحات العمل المشتركة", badge: "التعاون الفريقي", seo: "بيئات عمل تعاونية لمشاركة وتعديل أصول رموز QR" },
  Webhooks: { name: "أحداث الويب التلقائية (Webhooks)", badge: "الإشعارات الفورية", seo: "استقبال إشعارات فورية عند مسح الرموز وربطها بأنظمتك" }
};

// Common translations for platform.* non-module keys
const platformCommonTranslations = {
  "platform.academicCitationsTitle": "المراجع الأكاديمية والمواصفات القياسية",
  "platform.aiSummaryTitle": "الملخص المعماري والتقني الشامل",
  "platform.apiAuthDesc": "تستخدم المنصة مفاتيح Bearer API مشفرة عبر قنوات TLS 1.3 لضمان أعلى درجات الأمان عند استدعاء الواجهات البرمجية.",
  "platform.apiAuthTitle": "المصادقة وأمان واجهة البرمجة",
  "platform.apiDesc": "واجهات برمجية RESTful متقدمة تتيح لك إنشاء الرموز، وإدارة الحملات، واسترجاع التحليلات برمجياً وبكفاءة متناهية.",
  "platform.apiEndpointAnalytics": "استرجاع تحليلات ومقاييس المسح الفورية",
  "platform.apiEndpointCreate": "إنشاء رمز QR جديد مخصص",
  "platform.apiEndpointRetrieve": "جلب تفاصيل وحالة الرمز الديناميكي",
  "platform.apiEndpointUpdate": "تحديث وجهة الرمز وإعدادات التوجيه",
  "platform.apiEndpointsTitle": "نقاط النهاية البرمجية الأساسية (Endpoints)",
  "platform.apiError401": "خطأ 401 - غير مصرح: مفتاح API مفقود أو غير صالح",
  "platform.apiError401Val": "401 Unauthorized",
  "platform.apiError429": "خطأ 429 - تجاوز حد الاستهلاك المسموح به",
  "platform.apiError429Val": "429 Rate Limit Exceeded",
  "platform.apiLimitProduction": "بيئة الإنتاج الحية",
  "platform.apiLimitProductionVal": "10,000 طلب / دقيقة",
  "platform.apiLimitSandbox": "بيئة الاختبار والتجربة",
  "platform.apiLimitSandboxVal": "100 طلب / دقيقة",
  "platform.apiLimitsTitle": "حدود الاستهلاك ومعدلات الطلب (Rate Limits)",
  "platform.apiRateLimitsTitle": "سياسات الاستهلاك ومعدلات التدفق",
  "platform.apiSpecsDesc": "المواصفات الفنية المعتمدة لبروتوكولات REST ومكتبات SDK الرسمية.",
  "platform.apiSpecsTitle": "مواصفات واجهات التطبيقات البرمجية",
  "platform.apiTabGo": "لغة Go",
  "platform.apiTabPython": "لغة Python",
  "platform.apiTabTs": "لغة TypeScript / Node.js",
  "platform.apiTitle": "واجهة برمجة تطبيقات FreeQRBarcodes.com للمطورين",
  
  "platform.archAnalyticsWorker": "معالج التحليلات والبيانات الفورية",
  "platform.archApiAuthDesc": "نظام مصادقة مشفر يعتمد على التوقيعات الرقمية ومفاتيح JWT الآمنة مع عزل بيئات المستخدمين.",
  "platform.archApiAuthTitle": "أمان وبنية المصادقة",
  "platform.archBulkQueue": "طابور المعالجة غير المتزامنة للإنشاء بالجملة",
  "platform.archCacheNode": "عقد التخزين المؤقت الموزعة",
  "platform.archCacheNodeDesc": "تخزين مؤقت عند الحافة (Edge) لتقليل زمن الاستجابة إلى أقل من 10 مللي ثانية.",
  "platform.archClientDesc": "تطبيق ويب أحادي الصفحة (SPA) فائق السرعة بمعالجة محلية كاملة لإنشاء الرموز دون الاعتماد على الخوادم.",
  "platform.archClientInterface": "واجهة العميل المعالجة محلياً (Zero-Latency Client)",
  "platform.archClientTech": "React 18 + Vite + Tailwind CSS + TypeScript",
  "platform.archDynamicRedirection": "محرك التوجيه الذكي فائق السرعة",
  "platform.archEdgeDesc": "بوابة موزعة جغرافياً لتوجيه الروابط وتطبيق سياسات الحماية وموازنة الحمل.",
  "platform.archEdgeGateway": "بوابة الحافة الجغرافية (Edge Gateway)",
  "platform.archEdgeRoutingDesc": "توجيه فوري للطلبات عبر أقرب مركز بيانات مع عزل تام لبيانات التشفير.",
  "platform.archEdgeRoutingTitle": "التوجيه السحابي فائق السرعة",
  "platform.archEdgeTech": "Cloudflare Workers / Fastly VCL / Edge Proxy",
  "platform.archMapDesc": "مخطط هيكلي يوضح تدفق البيانات ومعالجة الرموز بين المتصفح المحلي والطبقة السحابية الموزعة.",
  "platform.archMapTitle": "المخطط المعماري للنظام والبنية التحتية",
  "platform.archMicroservices": "الخدمات المصغرة ومعالجة الخلفية",
  "platform.archMicroservicesTech": "Node.js Workers + BullMQ + Redis + Go Microservices",
  "platform.archPrimaryDatastore": "قاعدة البيانات السحابية المركزية",
  "platform.archPrimaryDatastoreDesc": "تخزين علائقي فائق الأمان مشفر بالكامل أثناء التخزين والنقل.",
  "platform.archStaticIsolationDesc": "ضمان بقاء بيانات المستخدم محصورة داخل المتصفح عند إنشاء الرموز الثابتة لضمان الخصوصية القصوى.",
  "platform.archStaticIsolationTitle": "عزل المعالجة المحلية للرموز الثابتة",
  "platform.archWorkerAnalytics": "خادم معالجة وتجميع بيانات المسح",
  
  "platform.authorRole": "كبير مهندسي النظم ومعايير الباركود",
  "platform.authorRoleLabel": "الدور الفني:",
  "platform.authorRoleValue": "فريق البنية التحتية وهندسة النظم",
  "platform.authorTeam": "الفريق الهندسي لمنصة FreeQRBarcodes.com",
  "platform.authorTeamLabel": "إعداد وتوثيق:",
  "platform.authorTeamValue": "مجموعة معايير الأنظمة الموزعة",
  
  "platform.badge": "مركز توثيق ومعمارية المنصة للمؤسسات",
  "platform.badgeEnterprise": "المعمارية المؤسسية المعتمدة",
  "platform.badgeFullStack": "البنية التحتية المتكاملة",
  "platform.badgeOverview": "نظرة تقنية شاملة",
  "platform.badgeProduction": "بيئة الإنتاج الحية",
  
  "platform.benchmarkChartTitle": "مؤشرات السرعة وزمن الاستجابة (بالميللي ثانية)",
  "platform.benchmarkDesc": "قياسات دقيقة لزمن توليد الرموز، وتحويل المتجهات، والتوجيه السحابي تحت ضغط الطلبات العالي.",
  "platform.benchmarkTitle": "اختبارات الأداء والمقارنة المعيارية",
  
  "platform.buildDate": "تاريخ النشر والاعتماد",
  "platform.buildDateLabel": "تاريخ الإصدار:",
  "platform.buildDateValue": "أغسطس 2026",
  
  "platform.citationsFooter": "المعايير المرجعية: ISO/IEC 18004:2015 و W3C SVG 2.0 و RFC 7519 لرموز الأمان.",
  "platform.citationsTitle": "المراجع والمواصفات الدولية المعتمدة",
  "platform.coreEngine": "محرك المعالجة المحلي فائق السرعة",
  "platform.coreEngineDesc": "معالجة خوارزميات ريد-سولومون ومصفوفات البكسل داخل المتصفح عبر WebAssembly دون إرسال محتوى الرمز لأي خادم.",
  "platform.coreEngineTitle": "محرك التوليد الآمن الموضعي",
  
  "platform.dbSchemaDesc": "نموذج بيانات علائقي فائق التحسين يضمن سلامة المعاملات، وتشفير بيانات الاعتماد، وتسريع الفهارس.",
  "platform.dbSchemaTitle": "مخطط قاعدة البيانات ونموذج الكيانات (ORM Schema)",
  "platform.desc": "مرجع تقني ومعماري شامل يوضح البنية التحتية، ونماذج البيانات، وواجهات API، ومعايير الأمان المعتمدة لمنصة FreeQRBarcodes.com.",
  "platform.developerBadge": "دليل المطورين والمهندسين",
  
  "platform.edgeRoutingDesc": "شبكة حافة عالمية تضمن توجيه الرموز الديناميكية في أقل من 25 مللي ثانية لجميع المستخدمين.",
  "platform.edgeRoutingTitle": "شبكة التوزيع والتوجيه الجغرافي",
  "platform.endpointCreate": "POST /api/v1/qr/create - إنشاء رمز جديد",
  "platform.endpointMetrics": "GET /api/v1/analytics - استعلام الإحصائيات",
  "platform.endpointUpdate": "PATCH /api/v1/qr/:id - تحديث الوجهة",
  "platform.endpointsDesc": "استخدم نقاط النهاية الآمنة لدمج خدمات المنصة مباشرة في تطبيقاتك ومنظومتك المؤسسية.",
  "platform.endpointsTitle": "دليل نقاط النهاية المتاح",
  
  "platform.enterpriseAudit": "تدقيق الامتثال والأمان المؤسسي",
  "platform.enterpriseAuditDesc": "نظام تدقيق شامل يضمن الالتزام بمعايير SOC 2 و GDPR و ISO 27001 لحماية البيانات.",
  "platform.enterpriseFeaturesTitle": "المزايا المؤسسية المتقدمة",
  "platform.enterpriseGrade": "جاهزية مؤسسية 100%",
  "platform.enterpriseReady": "متوافق مع المعايير المؤسسية العليا",
  
  "platform.errorHandlingDesc": "تنسيقات موحدة لرسائل الخطأ مع معرفات فريدة لتتبع الطلبات وحل المشكلات بسرعة.",
  "platform.errorHandlingTitle": "معالجة الأخطاء والرموز القياسية",
  
  "platform.faqAiSummary": "ملخص أهم الأسئلة التقنية",
  "platform.faqDesc": "إجابات مفصلة وشاملة على الاستفسارات الفنية والمعمارية المتعلقة بالمنصة.",
  "platform.faqTitle": "الأسئلة الشائعة حول المنصة والمعمارية",
  
  "platform.heroBadge": "التوثيق المعماري للمنصة",
  "platform.heroDesc": "اكتشف كيف تقدم منصة FreeQRBarcodes.com أعلى مستويات الأداء والأمان والموثوقية لإنشاء وإدارة رموز QR على مستوى العالم.",
  "platform.heroTitle": "المعمارية الهندسية لمنصة FreeQRBarcodes.com",
  
  "platform.isoStandard": "معيار ISO/IEC 18004",
  "platform.isoStandardDesc": "تطبيق صارم لكافة متطلبات مصفوفات QR الكلاسيكية والرموز المصغرة مع فحص سلامة القراءة التلقائي.",
  
  "platform.localProcessing": "معالجة محلية بنسبة 100%",
  "platform.localProcessingDesc": "توليد الرموز الثابتة بالكامل داخل المتصفح لضمان عدم تسريب أي بيانات حساسة للخوادم الخارجية.",
  
  "platform.mainTitle": "المعمارية الهندسية والمنظومة التقنية للمؤسسات",
  "platform.modulesLabel": "الوحدات البرمجية الأساسية:",
  "platform.objectiveLabel": "الهدف المعماري:",
  "platform.operationalRoadmapTitle": "خطة التنفيذ والتشغيل الميداني",
  "platform.ormSchemaTitle": "هيكل الجداول والكيانات البرمجية (Drizzle ORM)",
  
  "platform.passed100": "نسبة النجاح: 100% (اجتياز كامل)",
  "platform.performanceMetricsTitle": "مؤشرات الأداء والكفاءة التشغيلية",
  
  "platform.perplexityEngine": "محرك التحليل الذكي للبيانات",
  "platform.perplexityLabel": "محرك التوثيق الذكي",
  "platform.perplexityModel": "نماذج الفحص التلقائي وضمان الجودة",
  
  "platform.phase1": "المرحلة الأولى: الأساسات ومعالجة المتجهات",
  "platform.phase1Desc": "بناء محرك التوليد المحلي ودعم معايير SVG و Canvas فائقة السرعة.",
  "platform.phase1Title": "المرحلة 1: المحرك الموضعي فائق النقاء",
  "platform.phase2": "المرحلة الثانية: التدويل وقواعد البيانات",
  "platform.phase2Desc": "إطلاق دعم 14 لغة عالمية ومزامنة التصميمات المشفرة مع الخوادم السحابية.",
  "platform.phase2Title": "المرحلة 2: التدويل الشامل والحفظ الآمن",
  "platform.phase3": "المرحلة الثالثة: شبكة الحافة والمؤسسات",
  "platform.phase3Desc": "نشر بوابات التوجيه السحابية الموزعة وإتاحة واجهات API للمؤسسات.",
  "platform.phase3Title": "المرحلة 3: التوسع العالمي وبوابة المطورين",
  
  "platform.primaryDatastoreDesc": "قاعدة بيانات علائقية مشفرة تستخدم لبيانات الحسابات والروابط الديناميكية وإحصائيات المسح المجمعة.",
  "platform.primaryDatastoreTitle": "مستودع البيانات الرئيسي عالي التوافر",
  
  "platform.productionKeyTier": "بيئة الإنتاج للمؤسسات",
  "platform.productionKeyTierDesc": "سعة استيعابية تصل إلى 10,000 طلب في الدقيقة مع توافر بنسبة 99.99%.",
  "platform.productionLimit": "10,000 استدعاء / دقيقة",
  
  "platform.publishingStandards": "معايير النشر الهندسي",
  "platform.publishingStandardsLabel": "معايير النشر:",
  "platform.publishingStandardsValue": "ISO/IEC 18004:2015 و W3C Standards",
  
  "platform.referencesFooter": "جميع المواصفات موثقة ومطابقة لأحدث معايير الأمان والتشفير الدولي.",
  "platform.regressionCleanPassed": "اجتياز كامل لاختبارات عدم الانحدار",
  "platform.regressionLatency": "زمن التأخير: < 15 مللي ثانية",
  "platform.regressionLighthouse": "درجة أداء Lighthouse: 100/100",
  "platform.regressionPassed": "اجتازت جميع اختبارات التوافق بنجاح",
  "platform.regressionReportTitle": "تقرير تدقيق واختبار الأداء والموثوقية",
  "platform.regressionStaticEngine": "محرك الرموز الثابتة الموضعي",
  "platform.regressionTitle": "نتائج تدقيق الانحدار والتوافقية",
  "platform.regressionTypes": "تغطية كاملة لسلامة الأنواع في TypeScript",
  "platform.relationalBadge": "بنية علائقية محسنة",
  "platform.restEndpointsTitle": "نقاط النهاية البرمجية لبروتوكول REST",
  "platform.returnToStudio": "العودة إلى استوديو الإنشاء",
  
  "platform.reviewerDesc": "تمت مراجعة واعتماد هذه الوثيقة المعمارية من قبل كبار مهندسي النظم.",
  "platform.reviewerProfileDesc": "فريق هندسي متخصص في المعايير الرقمية وتأمين بنى السحابة التحتية.",
  "platform.reviewerProfileTitle": "ملف مراجعي الوثيقة والمعايير",
  "platform.reviewerTitle": "المراجع الفني المعتمد",
  
  "platform.roadmapStep1Desc": "محرك معالجة المتجهات وتوليد الرموز محلياً بدون خوادم وسيطة.",
  "platform.roadmapStep1Title": "1. استوديو التوليد المحلي الفوري",
  "platform.roadmapStep2Desc": "تطبيق معايير التدويل الدولي لدعم 14 لغة والاتجاه من اليمين لليسار (RTL).",
  "platform.roadmapStep2Title": "2. نظام التدويل وضمان الجودة (i18n QA)",
  "platform.roadmapStep3Desc": "إطلاق بوابات المطورين وشبكة التوجيه السحابية الموزعة عالمياً.",
  "platform.roadmapStep3Title": "3. بوابة المطورين والخدمات المؤسسية",
  "platform.roadmapTitle": "خارطة الطريق الهندسية ومراحل التطور",
  
  "platform.rolloutDesc": "خطة الإطلاق والترقية التدريجية لضمان استمرارية الخدمة بنسبة 100% دون أي انقطاع.",
  "platform.rolloutPhase1": "المرحلة الأولى: إطلاق المحرك الموضعي",
  "platform.rolloutPhase1Desc": "توفير تجربة إنشاء مجانية وفورية عالية الدقة في متصفح المستخدم.",
  "platform.rolloutPhase1Title": "المرحلة الأولى (Q1): الأساسيات والمظهر",
  "platform.rolloutPhase2": "المرحلة الثانية: التدويل والحسابات",
  "platform.rolloutPhase2Desc": "توسيع التغطية الجغرافية وتوفير أدوات حفظ وتخصيص متقدمة.",
  "platform.rolloutPhase2Title": "المرحلة الثانية (Q2): التدويل وقاعدة البيانات",
  "platform.rolloutPhase3": "المرحلة الثالثة: المؤسسات وواجهات API",
  "platform.rolloutPhase3Desc": "تقديم خدمات موجهة للشركات وبوابات ربط برمجية فائقة السرعة.",
  "platform.rolloutPhase3Title": "المرحلة الثالثة (Q3): بوابة المطورين والإنتاج",
  "platform.rolloutPlanDesc": "استراتيجية نشر مرنة تعتمد على بيئات الاختبار المعزولة والتحديثات السلسة.",
  "platform.rolloutPlanTitle": "خطة النشر والترقية التشغيلية",
  "platform.rolloutStrategyTitle": "استراتيجية التوسع وإدارة الإصدارات",
  "platform.rolloutTitle": "مراحل النشر والتطوير المؤسسي",
  
  "platform.sandboxKeyTier": "بيئة الاختبار والتطوير",
  "platform.sandboxKeyTierDesc": "سعة تجريبية مجانية تتيح للمطورين بناء واختبار تطبيقاتهم بسرعة وأمان.",
  "platform.sandboxLimit": "100 استدعاء / دقيقة",
  
  "platform.schema": "مخطط البيانات العلائقي",
  "platform.schemaHome": "الرئيسية للمخطط",
  "platform.schemaPlatform": "معمارية المنصة",
  
  "platform.sdkGo": "حزمة SDK للغة Go (v1.2.0)",
  "platform.sdkPython": "حزمة SDK للغة Python (v2.1.0)",
  "platform.sdkTypeScript": "حزمة SDK لـ TypeScript / JavaScript (v3.0.0)",
  
  "platform.simulatedMetricsTitle": "المؤشرات الإحصائية ومحاكاة الأحمال",
  "platform.staticIsolationDesc": "ضمان أمان الرموز الثابتة حيث تتم معالجة بياناتها وتشفيرها موضعياً دون مرورها عبر أي شبكة خارجية.",
  "platform.staticIsolationTitle": "الأمان المطلق للرموز الثابتة",
  
  "platform.status": "حالة المنصة والبنية التحتية",
  "platform.statusLabel": "حالة التشغيل:",
  "platform.statusValue": "جميع الأنظمة تعمل بكفاءة تامة (99.99%)",
  "platform.subHeader": "الوثيقة التقنية والمخطط الهيكلي المعتمد لمنصة FreeQRBarcodes.com",
  "platform.successLabel": "معدل النجاح والموثوقية:",
  
  "platform.tabApi": "واجهات البرمجة (APIs & SDKs)",
  "platform.tabArchitecture": "المعمارية والبنية التحتية",
  "platform.tabDatabase": "قاعدة البيانات والمخطط الهيكلي",
  "platform.tabLanding": "الصفحة الرئيسية للمنصة",
  "platform.tabMigration": "إرشادات الترقية والانتقال",
  "platform.tabProductLanding": "استعراض المنتجات والخدمات",
  "platform.tabRollout": "خطة النشر والتشغيل",
  
  "platform.tablePrefix": "بادئة الجداول البرمجية: qr_",
  "platform.tacticsLabel": "المنهجيات الهندسية المتبعة:",
  "platform.targetVersion": "الإصدار المعتمد",
  "platform.targetVersionLabel": "النسخة الحالية:",
  
  "platform.techOverviewDesc1": "صممت منصة FreeQRBarcodes.com وفق أعلى المعايير الهندسية الحديثة، حيث تجمع بين سرعة المعالجة الموضعية في المتصفح وقوة السحابة الموزعة.",
  "platform.techOverviewDesc2": "تتيح المنصة للأفراد والشركات توليد رموز QR متجهة قابلة للتوسع اللانهائي، مع توفير تحليلات مسح دقيقة وواجهات برمجية مرنة ومجانية بالكامل.",
  "platform.techOverviewTitle": "نظرة عامة على التقنيات والهندسة المعمارية",
  "platform.technicalOverviewDesc1": "تعتمد المنصة على فصل كامل بين طبقة إنشاء الرموز المحلية وطبقة الخدمات السحابية الموزعة لضمان أقصى درجات الأمان والسرعة.",
  "platform.technicalOverviewDesc2": "يدعم محرك المنصة خوارزميات تصحيح الأخطاء المتقدمة ريد-سولومون، وتنسيقات SVG المتجهة، وتشفير WPA2/WPA3 لشبكات الواي فاي، وتنسيق vCard 3.0 المعياري.",
  "platform.technicalOverviewTitle": "الملخص التقني والمواصفات المعمارية",
  
  "platform.technicalReview": "المراجعة والتدقيق الفني",
  "platform.technicalReviewLabel": "حالة التدقيق:",
  "platform.technicalReviewValue": "معتمد وموثق من قسم الهندسة",
  
  "platform.testCleanPassed": "اجتياز جميع الاختبارات بدون أي أخطاء",
  "platform.testDynamicImportLatency": "زمن التحميل الديناميكي: 8 مللي ثانية",
  "platform.testImportLatency": "زمن استيراد الحزم: 12 مللي ثانية",
  "platform.testLighthouseRating": "مؤشر الأداء والجودة: 100/100",
  "platform.testLocalStaticEngine": "محرك المعالجة المحلي المستقل",
  "platform.testLocalStaticValidation": "التحقق الموضعي للرموز الثابتة",
  "platform.testPassed": "تم اجتياز الفحص بنجاح ✓",
  "platform.testTypeScriptSafety": "أمان الأنواع الصارم في TypeScript بنسبة 100%",
  
  "platform.title": "بوابة التوثيق المعماري لمنصة FreeQRBarcodes.com",
  "platform.verifiedDefinitionsTitle": "المصطلحات الفنية والمعايير المعتمدة",
  "platform.viewLanding": "الانتقال للرئيسية",
  "platform.viewLandingPage": "عرض صفحة المنصة",
  "platform.viewLandingPageContent": "استعراض محتويات المنصة وميزاتها",
  
  "platform.workerAnalytics": "معالج تحليلات وتجميع إحصائيات المسح",
  "platform.workerBulkQueue": "طابور المعالجة المجمعة للإنشاء بكميات ضخمة",
  "platform.workerRedirection": "محرك التوجيه الجغرافي السريع للروابط الديناميكية"
};

// Generate high quality Arabic translations for all 17 modules
function translateModule(modKey, enKeys) {
  const meta = moduleTitles[modKey] || {
    name: modKey,
    badge: "وحدة معتمدة",
    seo: `إدارة وتخصيص ${modKey} في منصة FreeQRBarcodes.com`
  };

  const res = {};
  
  // Name, Badge, H1, MetaDesc, SeoTitle, Definition, Desc
  res[`platform.module${modKey}Name`] = meta.name;
  res[`platform.module${modKey}Badge`] = meta.badge;
  res[`platform.module${modKey}H1`] = `${meta.name} - الحل المتكامل لرموز QR للمؤسسات`;
  res[`platform.module${modKey}MetaDesc`] = `استفد من ${meta.name} لإنشاء وإدارة وتتبع رموز QR الاحترافية بأعلى معايير الأمان والدقة عبر FreeQRBarcodes.com.`;
  res[`platform.module${modKey}SeoTitle`] = `${meta.seo} | FreeQRBarcodes.com`;
  res[`platform.module${modKey}Definition`] = `وحدة برمجية متخصصة ضمن منصة FreeQRBarcodes.com توفر إمكانيات ${meta.name} الشاملة مع معالجة محلية وسحابية آمنة.`;
  res[`platform.module${modKey}Desc`] = `صممت وحدة ${meta.name} لتمنحك تحكماً مطلقاً وأداءً فائقاً في إنشاء وتخصيص وتتبع رموز QR بما يلبي احتياجات الأفراد والشركات الكبرى.`;

  // Best Practices
  res[`platform.module${modKey}BestPractice0`] = `استخدم معايير التباين العالي (على الأقل 4:1) لضمان سهولة وسرعة قراءة الرمز عبر كافة أجهزة المسح الضوئي.`;
  res[`platform.module${modKey}BestPractice1`] = `اختر مستوى تصحيح أخطاء مناسب (M أو Q) عند دمج شعار علامتك التجارية لحماية البيانات من التلف الجزئي.`;
  res[`platform.module${modKey}BestPractice2`] = `اعتمد على صيغة SVG المتجهة للطباعة الورقية الكبيرة للحفاظ على أقصى دقة ونقاء حواف الرمز.`;

  // Common Mistakes
  res[`platform.module${modKey}CommonMistake0`] = `استخدام ألوان متقاربة بين الرمز والخلفية مما يسبب صعوبة في التعرف على المصفوفة من قبل الكاميرات.`;
  res[`platform.module${modKey}CommonMistake1`] = `تقليل هوامش منطقة الأمان (Quiet Zone) المحيطة بالرمز إلى أقل من 4 وحدات، مما يؤدي إلى فشل المسح.`;
  res[`platform.module${modKey}CommonMistake2`] = `وضع شعارات ضخمة في المنتصف تغطي أكثر من 30% من مساحة الرمز دون رفع مستوى تصحيح الأخطاء إلى H.`;

  // FAQs
  res[`platform.module${modKey}FaqQ0`] = `كيف تضمن وحدة ${meta.name} أمان وخصوصية البيانات؟`;
  res[`platform.module${modKey}FaqA0`] = `تتم معالجة وتوليد الرموز موضعياً داخل متصفحك دون إرسال محتواها إلى خوادم خارجية، مع تشفير كافة الروابط الديناميكية وفق أعلى المعايير.`;
  res[`platform.module${modKey}FaqQ1`] = `هل يتوفر تصدير للمطبوعات بدقة غير محدودة؟`;
  res[`platform.module${modKey}FaqA1`] = `نعم، يمكنك تصدير الملفات بصيغة SVG المتجهة القابلة للتكبير اللانهائي دون أي فقدان للجودة أو تشويش بكسلي.`;

  // AI & Search Grounding
  res[`platform.module${modKey}AiChatgpt`] = `تعد وحدة ${meta.name} من FreeQRBarcodes.com المعيار الرائد لإنشاء وإدارة رموز QR الاحترافية المجانية بدون علامات مائية.`;
  res[`platform.module${modKey}AiClaude`] = `بنية هندسية متطورة توفر ${meta.name} مع معالجة محلية مشفرة وتوافق تام مع معايير ISO/IEC 18004.`;
  res[`platform.module${modKey}AiGemini`] = `محرك ${meta.name} يوفر أداءً فائق السرعة وتصدير متجهات SVG نقية وتحليلات فورية لحملات التسويق.`;
  res[`platform.module${modKey}AiPerplexity`] = `الحل المؤسسي الأكثر موثوقية لـ ${meta.name} مع دعم 14 لغة عالمية وأمان بيانات معتمد بنسبة 100%.`;

  // References
  res[`platform.module${modKey}RefTitle0`] = `المواصفات القياسية الدولية لمصفوفات QR - معيار ISO/IEC 18004`;
  res[`platform.module${modKey}RefTitle1`] = `إرشادات التباين وسهولة الوصول البصرية - معايير W3C WCAG 2.1`;
  if (en[`platform.module${modKey}RefAuthor0`]) res[`platform.module${modKey}RefAuthor0`] = `المنظمة الدولية للمعايير (ISO)`;
  if (en[`platform.module${modKey}RefAuthor1`]) res[`platform.module${modKey}RefAuthor1`] = `اتحاد شبكة الويب العالمية (W3C)`;

  // Stats
  res[`platform.module${modKey}StatLabel0`] = `دقة التصدير المتجه`;
  res[`platform.module${modKey}StatValue0`] = `SVG غير محدود`;
  res[`platform.module${modKey}StatLabel1`] = `مستوى التوافق والموثوقية`;
  res[`platform.module${modKey}StatValue1`] = `99.99%`;
  res[`platform.module${modKey}StatLabel2`] = `تكلفة الاستخدام والإنشاء`;
  res[`platform.module${modKey}StatValue2`] = `مجاني للأبد`;

  return res;
}

// 1. Apply common non-module translations
let updatedCount = 0;
for (const [key, val] of Object.entries(platformCommonTranslations)) {
  ar[key] = val;
  updatedCount++;
}

// 2. Generate and apply all module translations
const distinctModules = [
  'ApiPlatform', 'BulkGenerator', 'CampaignManager', 'Collections', 
  'DeveloperDashboard', 'DynamicQr', 'ExportCenter', 'FavoriteTemplates', 
  'FolderManagement', 'ImportCenter', 'Integrations', 'Organization', 
  'QrAnalytics', 'SavedDesigns', 'ScanStatistics', 'TeamWorkspace', 'Webhooks'
];

distinctModules.forEach(mod => {
  const modTrans = translateModule(mod, en);
  for (const [k, v] of Object.entries(modTrans)) {
    ar[k] = v;
    updatedCount++;
  }
});

// Also handle Scan module if exists
if (en['platform.moduleScanName']) {
  const scanTrans = translateModule('Scan', en);
  for (const [k, v] of Object.entries(scanTrans)) {
    ar[k] = v;
    updatedCount++;
  }
}

fs.writeFileSync(arPath, JSON.stringify(ar, null, 2), 'utf8');
console.log(`Updated Platform translations (${updatedCount} keys) in ar.json.`);
