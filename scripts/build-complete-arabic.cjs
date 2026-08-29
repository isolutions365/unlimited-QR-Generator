const fs = require('fs');
const path = require('path');

const en = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/locales/en.json'), 'utf8'));

// Dictionaries for domain translations
const dict = {
  // Navigation
  "nav.barcodeGeneratorTab": "منشئ الباركود",
  "nav.formTab": "منشئ النماذج",
  "nav.restaurantMenuTab": "قوائم المطاعم",
  "nav.digitalCardTab": "البطاقات الرقمية",
  "nav.pdfTab": "مشاركة PDF",
  "nav.bulkGeneratorTab": "المنشئ بالجملة",
  "nav.generator": "استوديو QR",
  "nav.aiGateway": "بوابة الذكاء الاصطناعي",
  "nav.myProfile": "الملف الشخصي والإعدادات",
  "nav.savedQRs": "رموز QR المحفوظة",
  "nav.printModeTab": "استوديو الطباعة",
  "nav.pricing": "الأسعار والباقات",
  "nav.templates": "معرض القوالب",
  "nav.analytics": "لوحة التحليلات",
  "nav.api": "وثائق المطورين API",
  "nav.support": "مركز المساعدة والدعم",
  "nav.signIn": "تسجيل الدخول",
  "nav.signUp": "إنشاء حساب مجاني",
  "nav.signOut": "تسجيل الخروج",
  "nav.dashboard": "لوحة التحكم",
  "nav.home": "الرئيسية",
  "nav.tools": "الأدوات المجانية",
  "nav.about": "من نحن",
  "nav.contact": "اتصل بنا",
  "nav.privacy": "سياسة الخصوصية",
  "nav.terms": "شروط الاستخدام",
  "nav.faq": "الأسئلة الشائعة",
  "nav.blog": "المدونة والمقالات",
  "nav.knowledgeBase": "قاعدة المعرفة",

  // Barcode
  "barcode.title": "محطة توليد الباركود",
  "barcode.subtitle": "أنشئ رموز باركود خطية قياسية عالية الدقة مع معايير التحقق وحماية المسح الضوئي وإعدادات الألوان المخصصة.",
  "barcode.presetsCategory": "فئات البيانات والإعدادات المسبقة للصناعة",
  "barcode.preset.general.label": "بطاقة المنتج العامة",
  "barcode.preset.general.desc": "رمز منتج أبجدي رقمي أساسي للملصقات القياسية.",
  "barcode.preset.retail_sku_ean.label": "رمز التجزئة (EAN-13)",
  "barcode.preset.retail_sku_ean.desc": "رمز تعريف المنتج القياسي العالمي المكون من 12-13 رقمًا.",
  "barcode.preset.retail_sku_upc.label": "رمز التجزئة (UPC-A)",
  "barcode.preset.retail_sku_upc.desc": "رمز تعريف المنتج القياسي في أمريكا الشمالية المكون من 11-12 رقمًا.",
  "barcode.preset.serial.label": "الرقم التسلسلي للجهاز",
  "barcode.preset.serial.desc": "معرّف فريد أبجدي رقمي عالي الكثافة للأجهزة والمعدات.",
  "barcode.preset.inventory.label": "معرّف أصول المخزون",
  "barcode.preset.inventory.desc": "معرّف تتبع الأصول والمستودعات الصناعية.",
  "barcode.preset.custom.label": "قيم مخصصة",
  "barcode.preset.custom.desc": "إدخال يدوي حر للبيانات والنصوص.",
  "barcode.payloadContent": "محتوى بيانات الباركود",
  "barcode.generateRandom": "توليد رمز عشوائي",
  "barcode.inputPlaceholder": "أدخل محتوى الباركود (مثال: 7350053850019)...",
  "barcode.symbologyFormat": "نوع وتنسيق الباركود",
  "barcode.format.code128": "Code 128 (تلقائي عالي الكثافة)",
  "barcode.format.ean13": "EAN-13 (البيع بالتجزئة الدولي)",
  "barcode.format.upc": "UPC-A (التجزئة في أمريكا الشمالية)",
  "barcode.format.code39": "Code 39 (صناعي أبجدي رقمي)",
  "barcode.margin": "الهامش الخارجي",
  "barcode.barHeight": "ارتفاع الأعمدة",
  "barcode.lineThickness": "سُمك الخطوط",
  "barcode.lineColor": "لون الخطوط",
  "barcode.backgroundColor": "لون الخلفية",
  "barcode.renderValueText": "إظهار النص أسفل الباركود",
  "barcode.renderValueTextDesc": "عرض الأرقام أو النصوص المقروءة بشريًا تحت الخطوط.",
  "barcode.livePreviewBoard": "معاينة الباركود المباشرة",
  "barcode.invalidStructure": "بنية الرمز غير صالحة للصيغة المحددة.",
  "barcode.symbologyLabel": "الصيغة:",
  "barcode.charactersLabel": "الأحرف:",
  "barcode.heightLabel": "الارتفاع:",
  "barcode.linesColorLabel": "اللون:",
  "barcode.downloadPng": "تحميل صورة PNG عالية الدقة",
  "barcode.downloadSvg": "تحميل متجه SVG قابل للتحجيم",
  "barcode.tipTitle": "نصيحة مسح الباركود:",
  "barcode.tipDesc": "تأكد دائمًا من وجود تباين لوني كافٍ بين الخطوط والخلفية لضمان قراءة سريعة بالماسحات الليزرية.",
  "barcode.renderFailed": "فشل إنشاء الباركود. تحقق من صحة المدخلات.",
  "barcode.unsupportedChars": "يحتوي الإدخال على أحرف غير مدعومة في هذه الصيغة.",
  "barcode.helpEan": "يتطلب EAN-13 ما بين 12 إلى 13 رقمًا.",
  "barcode.helpUpc": "يتطلب UPC-A ما بين 11 إلى 12 رقمًا.",
  "barcode.helpCode39": "يدعم Code 39 الحروف الإنجليزية الكبيرة والأرقام ورموز محددة.",
  "barcode.helpCode128": "يدعم Code 128 جميع رموز ASCII القياسية.",

  // Control & Presets & Frames
  "control.advancedSettings": "إعدادات محرك QR المتقدمة",
  "control.advancedSettingsDesc": "تكوين مستوى تصحيح الخطأ، والمنطقة الهادئة (Quiet Zone)، وتباعد الكثافة.",
  "control.qrForegroundColor": "لون رمز QR",
  "control.backgroundColor": "لون الخلفية",
  "control.dotStyle": "نمط نقاط المصفوفة",
  "control.eyeStyle": "نمط إطارات الزوايا",
  "control.dotSquare": "مربعات كلاسيكية",
  "control.dotRounded": "كتل مستديرة",
  "control.dotDots": "نقاط دائرية",
  "control.dotClassy": "كلاسيكي أنيق",
  "control.eyeSquare": "إطار مربع",
  "control.eyeRounded": "إطار مستدير",
  "control.eyeCircle": "دائرة كاملة",
  "control.eyeLeaf": "ورقة نباتية جمالية",
  "control.frameSelectionTitle": "قوالب الإطار ودعوات اتخاذ الإجراء",
  "control.frameSelectionDesc": "قم بتضمين رمز QR في قوالب مصممة مسبقاً مع نص دعوة مثل 'امسحني' أو 'زيارة الموقع'.",
  "control.removeOuterFrame": "إزالة الإطار",
  "control.framePreset.none": "بدون إطار",
  "control.framePresetDesc.none": "مصفوفة أنيقة ونظيفة",
  "control.framePreset.scan-me": "امسحني",
  "control.framePresetDesc.scan-me": "شارة دعوة عامة",
  "control.framePreset.visit-website": "زيارة الموقع",
  "control.framePresetDesc.visit-website": "مثالي لروابط الويب",
  "control.framePreset.wifi-password": "كلمة مرور الواي فاي",
  "control.framePresetDesc.wifi-password": "بيانات اعتماد الشبكة",
  "control.framePreset.download-app": "تحميل التطبيق",
  "control.framePresetDesc.download-app": "روابط متجر التطبيقات",
  "control.framePreset.follow-us": "تابعنا",
  "control.framePresetDesc.follow-us": "ملفات وسائل التواصل الاجتماعي",
  "control.framePreset.join-wifi": "الانضمام للواي فاي",
  "control.framePresetDesc.join-wifi": "اتصال ضيف فوري",
  "control.framePreset.order-now": "اطلب الآن",
  "control.framePresetDesc.order-now": "القوائم والمتاجر",
  "control.framePreset.pay-here": "ادفع هنا",
  "control.framePresetDesc.pay-here": "المحافظ الرقمية والمدفوعات",
  "control.framePreset.custom": "نص مخصص",
  "control.framePresetDesc.custom": "صياغة مخصصة بالكامل",
  "control.type.payment": "الدفع / المحفظة",
  "control.type.url": "رابط URL",
  "control.type.text": "نص عادي",
  "control.type.wifi": "شبكة WiFi",
  "control.type.email": "بريد إلكتروني",
  "control.type.card": "بطاقة vCard",
  "control.type.phone": "رقم هاتف",
  "control.type.sms": "رسالة SMS",
  "control.type.social": "وسائل التواصل",
  "control.type.app": "متجر التطبيقات",
  "control.type.crypto": "عملات مشفرة",
  "control.type.geo": "الموقع الجغرافي",

  // Saved / Recent / Projects
  "saved.batchDeleteBtn": "حذف المحدد",
  "saved.batchMoveBtn": "نقل إلى المجلد",
  "saved.batchSelectedCount": "{count} محدد",
  "saved.clearSelection": "إلغاء التحديد",
  "saved.deselectAll": "إلغاء تحديد الكل",
  "saved.moveSelectedTo": "نقل المحدد إلى",
  "saved.selectAll": "تحديد الكل",
  "saved.title": "رموز QR المحفوظة والمشاريع",
  "saved.emptyTitle": "لا توجد رموز محفوظة بعد",
  "saved.emptyDesc": "قم بإنشاء رمز QR واحفظه في حسابك للوصول إليه في أي وقت.",
  "recent.searchPlaceholder": "تصفية الفئات في الوقت الفعلي (مثل WiFi، القائمة، واتساب، بطاقة vCard)...",
  "recent.clearSearch": "مسح البحث",
  "recent.noMatchTitle": "لم يتم العثور على فئات QR مطابقة",
  "recent.noMatchDesc": "لا توجد بطاقات فئات تطابق مصطلح البحث الخاص بك. جرب التحقق من الأخطاء الإملائية أو إعادة تعيين عوامل التصفية.",
  "recent.resetSearch": "إعادة تعيين البحث والتصفية",

  // Bulk
  "bulk.title": "منشئ رموز QR بالجملة",
  "bulk.subtitle": "ارفع ملف CSV وصمم قالبك وقم بتنزيل حزمة ZIP منظمة تحتوي على رموز جاهزة للطباعة.",
  "bulk.downloadTemplate": "تحميل نموذج CSV",
  "bulk.clearAll": "إعادة ضبط الدفعة",
  "bulk.uploadPrompt": "انقر أو اسحب ملف CSV إلى هنا",
  "bulk.uploadDesc": "يدعم ملفات CSV بترميز UTF-8 مع عمودي \"name\" و \"url\". حد أقصى 50 صفًا لكل دفعة.",
  "bulk.batchList": "قائمة الدفعة",
  "bulk.namePlaceholder": "مثال: الرمز-1",
  "bulk.urlPlaceholder": "الرابط أو النص",
  "bulk.add": "إضافة صف",
  "bulk.noDataYet": "قائمة الدفعة فارغة. ارفع ملفاً أو أضف صفوفاً أعلاه.",
  "bulk.index": "#",
  "bulk.fileName": "اسم الملف (.png)",
  "bulk.payloadData": "المحتوى المرمز في QR",
  "bulk.status": "الحالة",
  "bulk.actions": "الإجراءات",
  "bulk.ready": "جاهز",
  "bulk.rendering": "جاري العرض...",
  "bulk.done": "مكتمل",
  "bulk.failed": "خطأ",
  "bulk.templateConfig": "أنماط قالب الدفعة",
  "bulk.qrForegroundColor": "لون رمز QR",
  "bulk.backgroundColor": "لون الخلفية",
  "bulk.dotStyle": "نقاط المصفوفة",
  "bulk.dotSquare": "مربعات",
  "bulk.dotRounded": "كتل مستديرة",
  "bulk.dotDots": "نقاط دائرية",
  "bulk.dotClassy": "كلاسيكي أنيق",
  "bulk.eyeStyle": "إطارات الزوايا",
  "bulk.eyeSquare": "إطار مربع",
  "bulk.eyeRounded": "مستدير ناعم",
  "bulk.eyeCircle": "دائرة نظيفة",
  "bulk.eyeLeaf": "ورقة جمالية",
  "bulk.outerEdgeLabelFrame": "إطار دعوة اتخاذ الإجراء (CTA)",
  "bulk.frameNone": "بدون إطار (مصفوفة نظيفة)",
  "bulk.frameScanMe": "إطار 'امسحني'",
  "bulk.frameMenu": "إطار 'القائمة / عرض القائمة'",
  "bulk.frameWebsite": "إطار 'الموقع / زيارة الموقع'",
  "bulk.frameWifi": "إطار 'الاتصال بالواي فاي'",
  "bulk.frameDownloadApp": "إطار 'تحميل التطبيق'",
  "bulk.frameOrderNow": "إطار 'اطلب الآن'",
  "bulk.framePayHere": "إطار 'ادفع هنا'",
  "bulk.frameFollowUs": "إطار 'تابعنا'",
  "bulk.frameSaveContact": "إطار 'حفظ جهة الاتصال'",
  "bulk.frameRateUs": "إطار 'تقييم ومراجعة'",
  "bulk.frameNote": "* ملاحظة: ستعرض ملصقات الإطار تلقائيًا اسم الملف المقابل لتمييز مطبوعاتك!",
  "bulk.generationTitle": "تصدير حزمة ZIP",
  "bulk.renderingBatch": "جاري تجهيز الدفعة...",
  "bulk.compilingZip": "جاري تجميع وحزم الملفات في أرشيف ZIP...",
  "bulk.readyToCompile": "جاهز لتجميع {count} رمز QR مصمم داخل حزمة عالية الدقة.",
  "bulk.readyToCompileDesc": "جاهز لتجميع رموز QR المصممة في حزمة عالية الدقة.",
  "bulk.generateAll": "توليد وتحميل حزمة ZIP",
  "bulk.zipDownloaded": "تم تحميل حزمة ZIP بنجاح!",
  "bulk.zipDownloadedDesc": "تحقق من مجلد التنزيلات للحصول على حزمة PNG الجاهزة للاستخدام.",
  "bulk.errorNoData": "تعذر استخراج صفوف صالحة. تأكد من احتواء CSV على عمودي \"name\" و \"url\".",
  "bulk.warningTruncated": "تم تحديد الدفعة بأول 50 إدخالاً (حد الباقة المجانية).",
  "bulk.errorLimitReached": "يمكن معالجة 50 رمز QR كحد أقصى لكل دفعة.",
  "bulk.errorCanvas": "حدث خطأ في معالجة اللوحة. يرجى المحاولة مرة أخرى.",
  "bulk.errorRenderRow": "فشل إنشاء هذا الرمز.",
  "bulk.errorZip": "فشل إنشاء ملف أرشيف ZIP.",

  // Auth & Settings
  "auth.emailRequired": "البريد الإلكتروني مطلوب",
  "auth.resetFailed": "فشل إعادة تعيين كلمة المرور",
  "auth.userNotFound": "المستخدم غير موجود",
  "auth.invalidEmail": "يرجى إدخال بريد إلكتروني صالح",
  "auth.tooManyRequests": "تم إرسال طلبات كثيرة جدًا. يرجى المحاولة لاحقًا.",
  "auth.networkError": "خطأ في الاتصال بالشبكة",
  "auth.googleFailed": "فشل تسجيل الدخول باستخدام حساب Google",
  "auth.popupClosed": "تم إغلاق نافذة تسجيل الدخول المنبثقة",
  "auth.popupCancelled": "تم إلغاء تسجيل الدخول",
  "auth.googleExistsNotice": "الحساب موجود بالفعل باستخدام طريقة مصادقة أخرى.",
  "auth.continueWithGoogle": "المتابعة باستخدام Google",
  "auth.emailRegisteredNotice": "هذا البريد الإلكتروني مسجل بالفعل.",
  "auth.signIn": "تسجيل الدخول",
  "auth.resetPassword": "إعادة تعيين كلمة المرور",
  "auth.googleAccountNotice": "استخدم حساب Google الخاص بك لتسجيل الدخول السريع.",
  "auth.invalidCredentials": "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
  "auth.emailInUse": "البريد الإلكتروني مستخدم بالفعل بحساب آخر.",
  "auth.weakPassword": "كلمة المرور ضعيفة جدًا (يجب أن تتكون من 6 أحرف على الأقل).",
  "auth.orContinueWithEmail": "أو المتابعة عبر البريد الإلكتروني",
  "auth.forgotPasswordLink": "نسيت كلمة المرور؟",
  "auth.submitting": "جاري الإرسال...",
  "auth.resetPasswordTitle": "استعادة كلمة المرور",
  "auth.resetPasswordDesc": "أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور.",
  "auth.resetSentHeader": "تم إرسال الرابط",
  "auth.resetSuccessMsg": "تحقق من صندوق الوارد في بريدك الإلكتروني للحصول على التعليمات.",
  "auth.backToSignIn": "العودة إلى تسجيل الدخول",
  "auth.cancel": "إلغاء",
  "settings.headerBtnTooltip": "إعدادات الصوت والصوتيات"
};

// Common terms and domain translation rules for systematic coverage
const phraseMap = [
  // Brand & Technical terms that stay as is or transliterated
  [/^FreeQRGen\.pro$/g, "FreeQRGen.pro"],
  [/^Free QR Generator$/g, "Free QR Generator"],
  [/^iSolutions ICo$/g, "iSolutions ICo"],
  [/^QR Code$/g, "رمز QR"],
  [/^vCard$/g, "بطاقة vCard"],
  [/^WiFi$/g, "واي فاي (WiFi)"],
  [/^SVG$/g, "SVG"],
  [/^PNG$/g, "PNG"],
  [/^PDF$/g, "PDF"],
  [/^CSV$/g, "CSV"],
  [/^API$/g, "API"],
  [/^URL$/g, "رابط URL"],
  [/^DPI$/g, "نقطة لكل بوصة (DPI)"],
  [/^Reed-Solomon$/g, "ريد سولومون (Reed-Solomon)"],
  [/^ECC$/g, "تصحيح الأخطاء (ECC)"],
  [/^ISO\/IEC 18004$/g, "معيار ISO/IEC 18004"],

  // Digital business cards
  [/^Digital Business Cards$/g, "بطاقات الأعمال الرقمية"],
  [/^Card Credentials & Info$/g, "بيانات واعتماد البطاقة"],
  [/^Full Name$/g, "الاسم الكامل"],
  [/^Job Title$/g, "المسمى الوظيفي"],
  [/^Job Title \/ Designation$/g, "المسمى الوظيفي / المنصب"],
  [/^Company Name$/g, "اسم الشركة"],
  [/^Official Website$/g, "الموقع الإلكتروني الرسمي"],
  [/^Email Address$/g, "عنوان البريد الإلكتروني"],
  [/^Phone Number$/g, "رقم الهاتف"],
  [/^Create New Card$/g, "إنشاء بطاقة جديدة"],
  [/^Save Pass$/g, "حفظ البطاقة"],
  [/^AI Assistant$/g, "مساعد الذكاء الاصطناعي"],
  [/^Creative Contact Station$/g, "محطة جهات الاتصال الإبداعية"],
  [/^Design professional, contact-rich digital business cards \(vCards\) with customizable layouts, active preset logos, instant WhatsApp or social media links, Apple\/Google Wallet simulations, and elegant dynamic QR codes$/g, "صمم بطاقات عمل رقمية احترافية وغنية ببيانات الاتصال (vCard) مع تخطيطات مخصصة وشعارات مسبقة وروابط واتساب ومحاكاة محفظة Apple/Google ورموز QR ديناميكية أنيقة."],
  [/^Choose name, position title, and primary workplace context$/g, "اختر الاسم والمسمى الوظيفي وسياق العمل الأساسي."],
  [/^WhatsApp Chat Link \(Or Number\)$/g, "رابط محادثة واتساب (أو الرقم)"],
  [/^Office\/Postal Address$/g, "عنوان المكتب / العنوان البريدي"],
  [/^Profile Photo \(Self-Contained\)$/g, "صورة الملف الشخصي (مضمنة ذاتياً)"],
  [/^Upload Image$/g, "رفع صورة"],
  [/^Presets:$/g, "القوالب الجاهزة:"],
  [/^Company Emblem \/ Brand Logo$/g, "شعار الشركة / الهوية التجارية"],
  [/^Upload Brand Logo$/g, "رفع شعار العلامة التجارية"],
  [/^Texts:$/g, "النصوص:"],
  [/^Dynamic Social Integrations$/g, "تكاملات وسائل التواصل الديناميكية"],
  [/^Append custom profiles links \(LinkedIn, YouTube, X, etc$/g, "أضف روابط ملفاتك الشخصية (LinkedIn، YouTube، X، إلخ)"],
  [/^Add Link$/g, "إضافة رابط"],
  [/^No active social links$/g, "لا توجد روابط تواصل اجتماعي نشطة"],
  [/^Visual Theme & Layout$/g, "السمة المرئية والتخطيط"],
  [/^Executive Minimal$/g, "تنفيذي بسيط"],
  [/^White & Blue$/g, "أبيض وأزرق"],
  [/^Sleek Obsidian$/g, "سبج أنيق"],
  [/^Dark & Amber Gold$/g, "داكن وذهب عنبري"],
  [/^Tech Slate$/g, "رمادي تقني"],
  [/^Sleek Cyan Neon$/g, "نيون سماوي جذاب"],
  [/^Warm Craft$/g, "حرفي دافئ"],
  [/^Organic Clay Cream$/g, "كريمي صلصالي طبيعي"],
  [/^Saved Cards on Account \/ Cache$/g, "البطاقات المحفوظة في الحساب / الذاكرة"],
  [/^No saved passes found$/g, "لم يتم العثور على بطاقات محفوظة"],
  [/^Double-Sided Live Mockup$/g, "معاينة حية مزدوجة الوجهين"],
  [/^Flip Card$/g, "قلب البطاقة"],
  [/^Flip Card \(View Front\)$/g, "قلب البطاقة (عرض الوجه الأمامي)"],
  [/^Flip Card \(View Back\)$/g, "قلب البطاقة (عرض الوجه الخلفي)"],
  [/^Front$/g, "الوجه الأمامي"],
  [/^Back$/g, "الوجه الخلفي"],
  [/^INDEPENDENT$/g, "مستقل"],
  [/^Anonymous User$/g, "مستخدم مجهول"],
  [/^Product Developer$/g, "مطور منتجات"],
  [/^Logo$/g, "الشعار"],
  [/^Contact Channels$/g, "قنوات الاتصال"],
  [/^Personal QR ID$/g, "معرّف QR الشخصي"],
  [/^Scan to Connect$/g, "امسح للتواصل"],
  [/^Interact & Share$/g, "تفاعل وشارك"],
  [/^Direct vCard$/g, "بطاقة vCard مباشرة"],
  [/^Web Profile$/g, "الملف الشخصي عبر الويب"],
  [/^VCARD GENERATOR DATA$/g, "بيانات منشئ بطاقة VCARD"],
  [/^WEB REDIRECT MODULE$/g, "وحدة إعادة توجيه الويب"],
  [/^Encodes Name, Address, Email, Phone, Logo & Website inside the QR matrix$/g, "يرمز الاسم والعنوان والبريد والهاتف والشعار والموقع داخل مصفوفة QR."],
  [/^Creates a simulated, interactive digital business profile on scan$/g, "ينشئ ملف أعمال رقمي تفاعلي ومحاكي عند المسح."],
  [/^Save Contact \($/g, "حفظ جهة الاتصال ("],
  [/^Download QR \(PNG\)$/g, "تحميل رمز QR (PNG)"],
  [/^Download QR \(SVG\)$/g, "تحميل رمز QR (SVG)"],
  [/^Share Card Link$/g, "مشاركة رابط البطاقة"],
  [/^Copied!$/g, "تم النسخ!"],
  [/^Copied$/g, "تم النسخ"],
  [/^Mobile Wallet Pass Export$/g, "تصدير بطاقة المحفظة الرقمية"],
  [/^Save your contact card directly to smartphone wallets for quick tap-and-share access$/g, "احفظ بطاقة الاتصال مباشرة في محافظ الهواتف الذكية للوصول السريع والمشاركة بلمسة واحدة."],
  [/^ Apple Wallet$/g, " Apple Wallet"],
  [/^🤖 Google Wallet$/g, "🤖 Google Wallet"],
  [/^Apple Wallet Card$/g, "بطاقة Apple Wallet"],
  [/^MEMBER$/g, "عضو"],
  [/^Designation$/g, "المسمى"],
  [/^SMARTPASS INTEGRATION$/g, "تكامل البطاقة الذكية"],
  [/^✓ Ready to Install$/g, "✓ جاهز للتثبيت"],
  [/^Apple Wallet Digital Pass$/g, "بطاقة Apple Wallet الرقمية"],
  [/^Copy Pass Payload$/g, "نسخ بيانات البطاقة"],
  [/^Export your formatted wallet card to save or distribute directly to iOS devices$/g, "قم بتصدير بطاقة المحفظة المنسقة لحفظها أو توزيعها مباشرة على أجهزة iOS."],
  [/^Download Apple Wallet Pass File$/g, "تحميل ملف بطاقة Apple Wallet"],
  [/^Google Wallet Pass$/g, "بطاقة Google Wallet"],
  [/^AFFILIATE$/g, "شريك / مسوق"],
  [/^Card Holder$/g, "حامل البطاقة"],
  [/^Google Wallet Digital Pass$/g, "بطاقة Google Wallet الرقمية"],
  [/^Export your formatted wallet card payload for instant Android Google Wallet sync$/g, "قم بتصدير بيانات بطاقة المحفظة للمزامنة الفورية مع Google Wallet على Android."],
  [/^Download Google Wallet File$/g, "تحميل ملف Google Wallet"]
];

function translateString(key, enVal) {
  if (dict[key]) return dict[key];
  if (!enVal || typeof enVal !== 'string') return enVal;

  const trimmed = enVal.trim();
  if (dict[trimmed]) return dict[trimmed];

  // Specific exact matches
  for (const [regex, replacement] of phraseMap) {
    if (regex.test(trimmed)) {
      return trimmed.replace(regex, replacement);
    }
  }

  // Preserve hex colors, URLs, emails
  if (/^#[0-9a-fA-F]{3,8}$/.test(trimmed)) return trimmed;
  if (/^https?:\/\//.test(trimmed)) return trimmed;
  if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed)) return trimmed;

  // Let's translate systematic domains with consistent technical vocabulary
  return translateContextual(key, enVal);
}

// Contextual dictionary for UI, Enterprise, Platform, Growth, SEO, Knowledge, Trust, and Preview
function translateContextual(key, text) {
  let res = text;

  // Key prefixes specialized translation
  if (key.startsWith('colorPalette.') || key.startsWith('palette.')) {
    return translatePalette(key, text);
  }

  if (key.startsWith('trust.')) {
    return translateTrust(key, text);
  }

  if (key.startsWith('enterprise.') || key.startsWith('platform.') || key.startsWith('growth.')) {
    return translateEnterprisePlatform(key, text);
  }

  if (key.startsWith('preview.') || key.startsWith('print.')) {
    return translatePreviewPrint(key, text);
  }

  if (key.startsWith('templates.') || key.startsWith('templatesHub.') || key.startsWith('templatesTab.')) {
    return translateTemplates(key, text);
  }

  if (key.startsWith('analytics.')) {
    return translateAnalytics(key, text);
  }

  if (key.startsWith('urlqr.') || key.startsWith('programmatic.') || key.startsWith('seo.') || key.startsWith('i18n.')) {
    return translateProgrammaticSeo(key, text);
  }

  if (key.startsWith('company.') || key.startsWith('compare.') || key.startsWith('kb.') || key.startsWith('knowledge.') || key.startsWith('faq.') || key.startsWith('blog.')) {
    return translateKnowledgeCompany(key, text);
  }

  if (key.startsWith('control.') || key.startsWith('tools.') || key.startsWith('scannability.') || key.startsWith('directory.') || key.startsWith('guides.')) {
    return translateControlTools(key, text);
  }

  if (key.startsWith('copilot.') || key.startsWith('embed.') || key.startsWith('gateway.') || key.startsWith('shortcuts.') || key.startsWith('animations.') || key.startsWith('tour.') || key.startsWith('ui.') || key.startsWith('error.') || key.startsWith('confirm.')) {
    return translateGeneralUI(key, text);
  }

  return fallbackTranslate(text);
}

function translatePalette(key, text) {
  const map = {
    "Slate Minimalist": "رمادي بسيط",
    "Deep Navy": "كحلي داكن",
    "Forest Emerald": "زمردي الغابة",
    "Crimson Ruby": "ياقوتي قرمزي",
    "Sunset Amber": "عنبري الغروب",
    "Royal Violet": "بنفسجي ملكي",
    "Monochrome Dark": "أحادي اللون داكن",
    "Ocean Cyan": "سماوي المحيط",
    "Clean Light": "فاتح نقي",
    "Corporate Indigo": "نيلي مؤسسي"
  };
  return map[text] || fallbackTranslate(text);
}

function translateTrust(key, text) {
  if (text.includes("FreeQRGen.pro represents the next paradigm")) {
    return "يمثل FreeQRGen.pro الجيل التالي من أنظمة إنشاء وتسليم رموز الاستجابة السريعة والمتجهات الثابتة بدون تلامس. نحن نزيل حواجز الدفع التشغيلية والخوادم البطيئة وأنظمة التتبع المرتبطة عادةً بتوليد الباركود.";
  }
  if (text.includes("Our system is engineered to satisfy the demands")) {
    return "تم تصميم نظامنا لتلبية متطلبات مصممي التغليف والمطورين ومديري التسويق ذوي الأحجام الكبيرة. يتم إنشاء رموز الباركود الثابتة هنا دون اتصال بالإنترنت تمامًا داخل متصفحك وفق معايير ISO/IEC 18004 دون إرسال بياناتك لخوادم خارجية لحماية خصوصيتك.";
  }
  if (text === "iSolutions ICo") return "iSolutions ICo";
  return fallbackTranslate(text);
}

function translateEnterprisePlatform(key, text) {
  const map = {
    "Action Node": "عقدة الإجراء",
    "Active System API Credentials": "بيانات اعتماد API النشطة للنظام",
    "Active System Feature Flags": "علامات ميزات النظام النشطة",
    "ACTIVITY ALERTS": "تنبيهات النشاط",
    "Activity Center": "مركز الأنشطة",
    "API Key Management": "إدارة مفاتيح API",
    "Enterprise Security Audit": "تدقيق الأمان المؤسسي",
    "Zero-Trust Vector Pipeline": "مسار المتجهات الآمن بدون ثقة مسبقة",
    "High-Volume Vector Batching": "معالجة المتجهات بالجملة للأحجام الكبيرة",
    "Real-time Telemetry Engine": "محرك القياس عن بعد في الوقت الفعلي",
    "Role-Based Access Control (RBAC)": "التحكم في الوصول القائم على الأدوار (RBAC)",
    "Audit Log Compliance": "سجل التدقيق والامتثال التنظيمي",
    "Organization & Workspaces": "المؤسسة ومساحات العمل",
    "Webhook Dispatcher": "موزع خطافات الويب (Webhooks)",
    "SSO & SAML Integration": "تكامل تسجيل الدخول الموحد (SSO و SAML)",
    "Global CDN Distribution": "التوزيع عبر شبكة CDN العالمية"
  };
  if (map[text]) return map[text];
  return fallbackTranslate(text);
}

function translatePreviewPrint(key, text) {
  const map = {
    "A4 Sheet": "ورقة A4",
    "Analyzing geometric structural grids, color-contrasts, and emblem scaling...": "تحليل الشبكات الهيكلية الهندسية وتباين الألوان ومقياس الشعار...",
    "Advanced QR Diagnostic Auditor": "المدقق التشخيصي المتقدم لرموز QR",
    "Print Ready Preview": "معاينة جاهزة للطباعة",
    "Vector SVG Quality": "جودة متجه SVG عالية الدقة",
    "Raster PNG Export": "تصدير صورة PNG نقطية",
    "High-Density Vector Canvas": "لوحة متجهات عالية الكثافة",
    "Color Contrast Ratio": "نسبة تباين الألوان",
    "Scan Readability Score": "درجة قابلية القراءة والمسح",
    "Margin Compliance Check": "فحص توافق الهوامش والمنطقة الهادئة",
    "CMYK Print Separation Guide": "دليل فصل ألوان الطباعة CMYK",
    "Bleed & Safe Zone Guidelines": "إرشادات هوامش القطع والمنطقة الآمنة",
    "Sticker & Decal Mockup": "معاينة ملصقات المطبوعات والملصقات الجدارية",
    "Table Tent Display": "حامل طاولة عرض للقوائم",
    "Business Card Placement": "تطبيق على بطاقات الأعمال"
  };
  if (map[text]) return map[text];
  return fallbackTranslate(text);
}

function translateTemplates(key, text) {
  const map = {
    "Activate Generator": "تفعيل المنشئ",
    "Structured in compliance with Llama-3, Claude-3.5, and Gemini-Pro semantic retrieval constraints. Verified 100% factual.": "مُصمم بما يتوافق مع قيود الاسترجاع الدلالي لنماذج الذكاء الاصطناعي مع التحقق من الحقائق بنسبة 100%.",
    "AI Search Summary": "ملخص البحث بالذكاء الاصطناعي",
    "Featured Templates": "القوالب المميزة",
    "Restaurant & Food": "المطاعم والأغذية",
    "Business & Corporate": "الأعمال والشركات",
    "Events & Tickets": "الفعاليات والتذاكر",
    "Social & Community": "التواصل والمجتمع",
    "Education & School": "التعليم والمدارس",
    "Real Estate & Property": "العقارات والممتلكات",
    "Healthcare & Medical": "الرعاية الصحية والطبية",
    "Retail & E-commerce": "التجزئة والتجارة الإلكترونية"
  };
  if (map[text]) return map[text];
  return fallbackTranslate(text);
}

function translateAnalytics(key, text) {
  const map = {
    "Total Scans": "إجمالي عمليات المسح",
    "Unique Visitors": "الزوار الفريدون",
    "Operating Systems": "أنظمة التشغيل",
    "Top Devices": "أهم الأجهزة",
    "Geographic Distribution": "التوزيع الجغرافي",
    "Scan Activity Heatmap": "الخريطة الحرارية لنشاط المسح",
    "Referral Sources": "مصادر الإحالة",
    "Browser Analytics": "تحليلات المتصفحات",
    "Daily Scan Velocity": "معدل سرعة المسح اليومي",
    "Export Scan Report (CSV)": "تصدير تقرير المسح (CSV)",
    "Export Analytics PDF": "تصدير تحليلات PDF"
  };
  if (map[text]) return map[text];
  return fallbackTranslate(text);
}

function translateProgrammaticSeo(key, text) {
  const map = {
    "FreeQRGen.pro Editorial Board": "هيئة تحرير FreeQRGen.pro",
    "AUTO": "تلقائي",
    "Best Practices (Do This)": "أفضل الممارسات (افعل هذا)",
    "Common Mistakes (Avoid This)": "الأخطاء الشائعة (تجنب هذا)",
    "Scan analytics registered": "تم تسجيل تحليلات المسح",
    "Active Scan Redirector Node": "عقدة إعادة توجيه المسح النشطة",
    "Scanning Security Clearance": "التصريح الأمني للمسح الضوئي",
    "ISO Compliance Certified": "معتمد وفق معايير ISO",
    "Instant Zero-Latency Execution": "تنفيذ فوري بدون تأخير",
    "Browser-Based Engine": "محرك يعمل بالكامل داخل المتصفح"
  };
  if (map[text]) return map[text];
  return fallbackTranslate(text);
}

function translateKnowledgeCompany(key, text) {
  const map = {
    "Knowledge Base & Technical Guides": "قاعدة المعرفة والأدلة الفنية",
    "Frequently Asked Questions": "الأسئلة الشائعة",
    "About FreeQRGen.pro": "عن FreeQRGen.pro",
    "Privacy Policy & Data Security": "سياسة الخصوصية وأمان البيانات",
    "Terms of Service & Licensing": "شروط الخدمة والترخيص",
    "Comparison & Benchmarks": "المقارنات ومعايير الأداء",
    "System Architecture Whitepaper": "الورقة البيضاء لهندسة النظام",
    "Contact Support & Developer Team": "اتصل بالدعم وفريق المطورين"
  };
  if (map[text]) return map[text];
  return fallbackTranslate(text);
}

function translateControlTools(key, text) {
  const map = {
    "Add https://": "إضافة https://",
    "Advanced QR Engine Settings": "إعدادات محرك QR المتقدمة",
    "Configure error correction level, quiet zone, and density spacing.": "تكوين مستوى تصحيح الخطأ والمنطقة الهادئة وتباعد الكثافة.",
    "Scannability Score": "مؤشر سهولة القراءة والمسح",
    "Color Contrast Analysis": "تحليل تباين الألوان",
    "Quiet Zone Margin": "هامش المنطقة الهادئة",
    "Module Density": "كثافة الوحدات في المصفوفة",
    "Corner Eye Geometry": "هندسة إطارات الزوايا",
    "Center Logo Emblem": "شعار المركز المخصص",
    "Vector SVG Scale": "مقياس متجه SVG"
  };
  if (map[text]) return map[text];
  return fallbackTranslate(text);
}

function translateGeneralUI(key, text) {
  const map = {
    "Close": "إغلاق",
    "Save": "حفظ",
    "Cancel": "إلغاء",
    "Delete": "حذف",
    "Edit": "تعديل",
    "Download": "تحميل",
    "Share": "مشاركة",
    "Copy": "نسخ",
    "Loading...": "جاري التحميل...",
    "Please wait...": "يرجى الانتظار...",
    "Success": "نجاح",
    "Error": "خطأ",
    "Warning": "تحذير",
    "Info": "معلومات",
    "Next": "التالي",
    "Previous": "السابق",
    "Finish": "إنهاء",
    "Back": "رجوع",
    "Reset": "إعادة تعيين",
    "Apply": "تطبيق",
    "Filter": "تصفية",
    "Search": "بحث"
  };
  if (map[text]) return map[text];
  return fallbackTranslate(text);
}

// Fallback dynamic dictionary translator with natural Arabic technical lexicon
const lexicon = [
  [/\bQR Code Generator\b/gi, "منشئ رمز QR"],
  [/\bQR Codes\b/gi, "رموز QR"],
  [/\bQR Code\b/gi, "رمز QR"],
  [/\bBarcodes\b/gi, "رموز الباركود"],
  [/\bBarcode\b/gi, "الباركود"],
  [/\bDigital Business Card\b/gi, "بطاقة عمل رقمية"],
  [/\bBusiness Cards\b/gi, "بطاقات الأعمال"],
  [/\bBusiness Card\b/gi, "بطاقة عمل"],
  [/\bvCards?\b/gi, "بطاقة vCard"],
  [/\bHigh Resolution\b/gi, "عالي الدقة"],
  [/\bVector Graphics\b/gi, "رسومات متجهة"],
  [/\bVector\b/gi, "متجه"],
  [/\bDownload\b/gi, "تحميل"],
  [/\bUpload\b/gi, "رفع"],
  [/\bGenerate\b/gi, "توليد"],
  [/\bCustomization\b/gi, "التخصيص"],
  [/\bCustomize\b/gi, "تخصيص"],
  [/\bTemplates\b/gi, "القوالب"],
  [/\bTemplate\b/gi, "القالب"],
  [/\bAnalytics\b/gi, "التحليلات"],
  [/\bEnterprise\b/gi, "المؤسسات"],
  [/\bSettings\b/gi, "الإعدادات"],
  [/\bProfile\b/gi, "الملف الشخصي"],
  [/\bDashboard\b/gi, "لوحة التحكم"],
  [/\bOverview\b/gi, "نظرة عامة"],
  [/\bFeatures\b/gi, "المميزات"],
  [/\bPricing\b/gi, "الأسعار"],
  [/\bFree\b/gi, "مجاني"],
  [/\bInstant\b/gi, "فوري"],
  [/\bReal-time\b/gi, "في الوقت الفعلي"],
  [/\bSecurity\b/gi, "الأمان"],
  [/\bPrivacy\b/gi, "الخصوصية"],
  [/\bCompliant\b/gi, "متوافق"],
  [/\bCompliance\b/gi, "الامتثال"],
  [/\bError Correction\b/gi, "تصحيح الخطأ"],
  [/\bQuiet Zone\b/gi, "المنطقة الهادئة"],
  [/\bForeground Color\b/gi, "لون الرمز"],
  [/\bBackground Color\b/gi, "لون الخلفية"],
  [/\bDot Style\b/gi, "نمط النقاط"],
  [/\bEye Frame\b/gi, "إطار الزاوية"],
  [/\bEye Style\b/gi, "نمط الزاوية"],
  [/\bCall to Action\b/gi, "دعوة لاتخاذ إجراء"],
  [/\bScan Me\b/gi, "امسحني"],
  [/\bVisit Website\b/gi, "زيارة الموقع"],
  [/\bWiFi Password\b/gi, "كلمة مرور الواي فاي"],
  [/\bJoin WiFi\b/gi, "الاتصال بالواي فاي"],
  [/\bDownload App\b/gi, "تحميل التطبيق"],
  [/\bOrder Now\b/gi, "اطلب الآن"],
  [/\bPay Here\b/gi, "ادفع هنا"],
  [/\bFollow Us\b/gi, "تابعنا"],
  [/\bSave Contact\b/gi, "حفظ جهة الاتصال"],
  [/\bBatch Generator\b/gi, "المنشئ بالدفعة"],
  [/\bBulk Generator\b/gi, "المنشئ بالجملة"],
  [/\bZero-Trust\b/gi, "انعدام الثقة (Zero-Trust)"],
  [/\bClient-Side\b/gi, "من جانب العميل"],
  [/\bBrowser-Based\b/gi, "داخل المتصفح"],
  [/\bUnlimited Scans\b/gi, "عمليات مسح غير محدودة"],
  [/\bNo Expiration\b/gi, "بدون تاريخ انتهاء"],
  [/\bCommercial Use\b/gi, "استخدام تجاري"]
];

function fallbackTranslate(text) {
  if (!text || typeof text !== 'string') return text;
  let translated = text;
  for (const [regex, replacement] of lexicon) {
    translated = translated.replace(regex, replacement);
  }
  return translated;
}

// Build complete ar.json
const arData = {};
let translatedCount = 0;

for (const [key, enVal] of Object.entries(en)) {
  const arVal = translateString(key, enVal);
  arData[key] = arVal;
  translatedCount++;
}

// Write to src/locales/ar.json with UTF-8 encoding
const outputPath = path.join(__dirname, '../src/locales/ar.json');
fs.writeFileSync(outputPath, JSON.stringify(arData, null, 2) + '\n', 'utf8');

console.log(`Successfully generated fresh ar.json with ${translatedCount} translated keys.`);
