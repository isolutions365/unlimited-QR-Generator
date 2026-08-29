const fs = require('fs');
const path = require('path');

const arPath = path.join(__dirname, '../src/locales/ar.json');
const ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));

const ppList = JSON.parse(fs.readFileSync(path.join(__dirname, '../preview_print_to_translate.json'), 'utf8'));

const mapTranslations = {
  "preview.downloadHD3000": "تنزيل بدقة 3000 بكسل فائقة (UHD)",
  "preview.grid2x2": "شبكة 2 × 2 (4 نسخ)",
  "preview.grid2x2Desc": "توزيع متوازن ومناسب للورقة",
  "preview.grid3x3": "شبكة 3 × 3 (9 نسخ)",
  "preview.grid3x3Desc": "استغلال أقصى لمساحة الصفحة",
  "preview.grid4x4": "شبكة 4 × 4 (16 نسخة)",
  "preview.grid4x4Desc": "ملصقات صغيرة عالية الكثافة",
  "preview.highResDesc": "اختر مقاسات إخراج عالية الكثافة للوحات الإعلانات والمطبوعات التجارية.",
  "preview.highResTitle": "مطبوعات فائقة الدقة والوضوح",
  "preview.inspectorDesc": "تحليل فوري للتصميم وتباين الألوان ومستوى الدقة",
  "preview.launchSimulatorBtn": "تشغيل محاكي الطباعة الواقعي",
  "preview.layoutFormatMode": "وضع تنسيق وتوزيع الصفحة",
  "preview.layoutFormatModeDesc": "طباعة عدة رموز على الورقة مقارنة بالتخطيط الفردي الممركز",
  "preview.layoutOverflow": "تنبيه: تجاوز المحتوى لهوامش الصفحة",
  "preview.left": "اليسار",
  "preview.right": "اليمين",
  "preview.top": "الأعلى",
  "preview.bottom": "الأسفل",
  "preview.margin10mm": "10 ملم (متوازن)",
  "preview.margin25mm": "25 ملم (عريض)",
  "preview.margin2mm": "2 ملم (الحد الأدنى)",
  "preview.mediaFormats": "تنسيقات ومقاسات الوسائط المطبوعة القياسية",
  "preview.miniBadgeLabel": "شارة التعريف التوضيحية",
  "preview.noAppRequired": "لا يلزم تنزيل أي تطبيق • امسح الرمز مباشرة بكاميرا هاتفك الذكي",
  "preview.offsetX": "الإزاحة الأفقية (X)",
  "preview.offsetY": "الإزاحة الرأسية (Y)",
  "preview.placeholder.creativeStudio": "استوديو الإبداع والتصميم",
  "preview.placeholder.scanToVisit": "امسح الرمز لزيارة الموقع الإلكتروني",
  "preview.postPreview": "معاينة المنشور والملصق",
  "preview.prepressDesc": "مركز معايرة ما قبل الطباعة وتخطيط الهوامش والمقاسات",
  "preview.primaryCta": "عبارة الحث على التفاعل الرئيسية",
  "preview.printBoardDesc": "التحقق من مقاييس الحجم الفيزيائي وإرسال المخرجات مباشرة إلى الطابعة.",
  "preview.printBoardTitle": "لوحة المعاينة البصرية للطباعة المباشرة",
  "preview.printColorOptimization": "تحسين وتجهيز ألوان الطباعة",
  "preview.printReadyOutput": "مخرجات جاهزة للطباعة التجارية الفورية",
  "preview.printSheetDesc": "تخطيط وطباعة شبكات متعددة من الرموز على ورق A4 أو Letter.",
  "preview.printSizeMm": "المقاس الفيزيائي بالملم",
  "preview.printStationBadge": "محطة إعداد وتجهيز الطباعة",
  "preview.printStationDesc": "معايرة دقيقة لما قبل الإنتاج الطباعي مع محاكاة خامات الورق وأحجامها.",
  "preview.printStationTitle": "محطة تجهيز وتوزيع الطباعة",
  "preview.quietZoneDesc": "هامش الأمان الأبيض المحيط بالرمز لتسهيل قراءته عبر الكاميرا.",
  "preview.realWorldLighting": "محاكاة الإضاءة الميدانية الواقعية",
  "preview.recalculateContrast": "إعادة حساب نسبة التباين",
  "preview.resetLayout": "إعادة تعيين التخطيط للافتراضي",
  "preview.resolutionSelector": "اختيار دقة الصورة الناتجة",
  "preview.scaleDimensions": "أبعاد المقياس الفيزيائي",
  "preview.scanAngleOptimal": "زاوية المسح مثالية لجميع الكاميرات",
  "preview.scanDiagnosticReport": "تقرير تشخيص جودة وموثوقية المسح",
  "preview.scanDistanceOptimal": "مسافة المسح التقديرية مثالية ومريحة للمستخدم",
  "preview.scanPerformance": "أداء ومعدل سرعة المسح الضوئي",
  "preview.scanRatingOptimal": "تقييم ممتاز: قراءة فورية في أجزاء من الثانية",
  "preview.selectGrid": "اختر توزيع الشبكة على الصفحة",
  "preview.selectPaper": "اختر مقاس ونوع الورق",
  "preview.sheetCustom": "صفحة مخصصة",
  "preview.sheetGrid": "شبكة توزيع الرموز",
  "preview.sheetLayoutOptions": "خيارات تخطيط وتوزيع الصفحة",
  "preview.sheetMargins": "هوامش الورقة الخارجية (ملم)",
  "preview.sheetPreview": "معاينة الورقة الحقيقية قبل الطباعة",
  "preview.sheetRowsCols": "{{rows}} صفوف × {{cols}} أعمدة",
  "preview.singleLayout": "تخطيط رمز فردي ممركز",
  "preview.simulateDarkRoom": "محاكاة الإضاءة الخافتة",
  "preview.simulateGlossy": "محاكاة الورق اللامع (Glossy)",
  "preview.simulateMatte": "محاكاة الورق المطفأ (Matte)",
  "preview.simulateOutdoor": "محاكاة ضوء النهار الخارجي",
  "preview.tableTentDesc": "حامل طاولة مكتبي قابل للطي للمطاعم والمقاهي والفعاليات.",
  "preview.templateName": "اسم القالب المختار",
  "preview.testScan": "اختبار المسح الافتراضي",
  "preview.vectorFormats": "صيغ المتجهات النقية (SVG و PDF)",
  "preview.viewActualSize": "عرض بالحجم الفيزيائي الحقيقي (100%)",
  "preview.viewDeviceFrame": "عرض داخل إطار الهاتف الذكي",
  "preview.viewfinderReady": "إطار الكاميرا جاهز للمسح.",

  // print
  "print.advancedSettings": "الإعدادات المتقدمة للطباعة",
  "print.alignmentCenter": "محاذاة في المنتصف",
  "print.alignmentLeft": "محاذاة إلى اليسار",
  "print.alignmentRight": "محاذاة إلى اليمين",
  "print.bleedArea": "منطقة التسييل الطباعي (Bleed)",
  "print.bleedAreaDesc": "هامش إضافي لمنع ظهور حواف بيضاء عند قص الورق في المطبعة.",
  "print.cardOrientation": "اتجاه البطاقة",
  "print.cardOrientationLandscape": "بطاقة أفقية (Landscape)",
  "print.cardOrientationPortrait": "بطاقة رأسية (Portrait)",
  "print.colorProfile": "الملف اللوني للطباعة",
  "print.colorProfileCmyk": "ألوان CMYK للطباعة التجارية",
  "print.colorProfileRgb": "ألوان RGB للشاشات الرقمية",
  "print.customGap": "تباعد مخصص بين الرموز",
  "print.customSheetDimensions": "أبعاد ورقة مخصصة",
  "print.exportPdfPrint": "تصدير ملف PDF جاهز للمطابع",
  "print.fitWidth": "ملاءمة عرض الصفحة",
  "print.gridDensity": "كثافة شبكة الرموز في الصفحة",
  "print.guideLines": "خطوط الإرشاد والمحاذاة",
  "print.headerSubtitle": "تخطيط وطباعة دفعات متعددة من الرموز بدقة طباعية متناهية.",
  "print.highDensityLayout": "تخطيط عالي الكثافة (أقصى عدد رموز في الصفحة)",
  "print.labelFont": "نوع وحجم خط التسميات",
  "print.marginGuides": "خطوط توضيح هوامش الصفحة",
  "print.mediaType": "نوع وسيط الطباعة",
  "print.mediaTypeCardstock": "ورق مقوى / كرتون (Cardstock)",
  "print.mediaTypeLabels": "ملصقات لاصقة مقطوعة مسبقاً (Labels)",
  "print.mediaTypePaper": "ورق طباعة مكتبي عادي (Plain Paper)",
  "print.mediaTypeVinyl": "فينيل مقاوم للماء والطقس (Vinyl)",
  "print.multiPageNotice": "سيتم تقسيم الرموز على {{pages}} صفحات للطباعة.",
  "print.pageCount": "صفحة {{current}} من {{total}}",
  "print.paperFeed": "تغذية الورق في الطابعة",
  "print.prepressCheck": "فحص معايير ما قبل الطباعة",
  "print.prepressPassed": "الملف مطابق تماماً لمعايير الإنتاج الطباعي الاحترافي.",
  "print.printerResolution": "دقة الطابعة الموصى بها: 300+ DPI",
  "print.quickPresets": "القوالب الجاهزة السريعة",
  "print.safeMarginDesc": "مسافة أمان تضمن عدم اقتصاص أي جزء من الرمز أثناء القص.",
  "print.saveSettings": "حفظ إعدادات الطباعة",
  "print.selectedPaperSize": "المقاس المختار: {{name}} ({{w}} × {{h}} ملم)",
  "print.sheetLayoutHeader": "إعدادات تخطيط وتوزيع الرموز",
  "print.totalStickers": "إجمالي الملصقات: {{count}} ملصق",
  "print.useSystemDialog": "استخدام نافذة الطباعة الخاصة بالنظام"
};

let count = 0;
ppList.forEach(item => {
  const k = item.key;
  if (mapTranslations[k]) {
    ar[k] = mapTranslations[k];
    count++;
  } else {
    // If not in map, clean up by replacing obvious English fragments with Arabic
    let text = item.en;
    if (mapTranslations[item.en]) {
      ar[k] = mapTranslations[item.en];
      count++;
    }
  }
});

fs.writeFileSync(arPath, JSON.stringify(ar, null, 2), 'utf8');
console.log(`Updated preview and print batch translations (${count} keys) in ar.json.`);
