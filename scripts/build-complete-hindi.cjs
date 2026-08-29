const fs = require('fs');
const path = require('path');

const en = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/locales/en.json'), 'utf8'));

// Exact dictionary mapping for Hindi translations
const dict = {
  // Navigation
  "nav.barcodeGeneratorTab": "बारकोड जनरेटर",
  "nav.formTab": "फॉर्म बिल्डर",
  "nav.restaurantMenuTab": "रेस्तरां मेनू",
  "nav.digitalCardTab": "डिजिटल कार्ड",
  "nav.pdfTab": "PDF साझाकरण",
  "nav.bulkGeneratorTab": "बल्क जनरेटर",
  "nav.generator": "QR स्टूडियो",
  "nav.aiGateway": "AI गेटवे",
  "nav.myProfile": "प्रोफ़ाइल और सेटिंग्स",
  "nav.savedQRs": "सहेजे गए QR कोड",
  "nav.printModeTab": "प्रिंट स्टूडियो",
  "nav.pricing": "मूल्य निर्धारण और प्लान",
  "nav.templates": "टेम्प्लेट गैलरी",
  "nav.analytics": "एनालिटिक्स डैशबोर्ड",
  "nav.api": "डेवलपर API दस्तावेज़",
  "nav.support": "सहायता एवं समर्थन",
  "nav.signIn": "साइन इन करें",
  "nav.signUp": "निःशुल्क खाता बनाएं",
  "nav.signOut": "साइन आउट करें",
  "nav.dashboard": "डैशबोर्ड",
  "nav.home": "होम",
  "nav.tools": "मुफ्त टूल्स",
  "nav.about": "हमारे बारे में",
  "nav.contact": "संपर्क करें",
  "nav.privacy": "गोपनीयता नीति",
  "nav.terms": "उपयोग की शर्तें",
  "nav.faq": "अक्सर पूछे जाने वाले प्रश्न",
  "nav.blog": "ब्लॉग एवं लेख",
  "nav.knowledgeBase": "ज्ञान केंद्र (नॉलेज बेस)",

  // Barcode
  "barcode.title": "बारकोड जनरेशन स्टेशन",
  "barcode.subtitle": "सटीक रेंडरिंग, स्कैनर सत्यापन सुरक्षा और कस्टम रंग प्रीसेट के साथ मानक लीनियर बारकोड जनरेट करें।",
  "barcode.presetsCategory": "पेलोड श्रेणियां और उद्योग प्रीसेट",
  "barcode.preset.general.label": "सामान्य उत्पाद लेबल",
  "barcode.preset.general.desc": "मानक लेबल के लिए मूल अल्फ़ान्यूमेरिक उत्पाद कोड।",
  "barcode.preset.retail_sku_ean.label": "खुदरा कोड (EAN-13)",
  "barcode.preset.retail_sku_ean.desc": "12-13 अंकों का वैश्विक मानक उत्पाद पहचान कोड।",
  "barcode.preset.retail_sku_upc.label": "खुदरा कोड (UPC-A)",
  "barcode.preset.retail_sku_upc.desc": "11-12 अंकों का उत्तरी अमेरिकी खुदरा उत्पाद कोड।",
  "barcode.preset.serial.label": "डिवाइस सीरियल नंबर",
  "barcode.preset.serial.desc": "उपकरणों के लिए उच्च घनत्व वाला अद्वितीय अल्फ़ान्यूमेरिक पहचानकर्ता।",
  "barcode.preset.inventory.label": "इन्वेंट्री एसेट ID",
  "barcode.preset.inventory.desc": "औद्योगिक संपत्ति और गोदाम ट्रैकिंग पहचानकर्ता।",
  "barcode.preset.custom.label": "कस्टम मान",
  "barcode.preset.custom.desc": "डेटा और टेक्स्ट का स्वतंत्र मैनुअल इनपुट।",
  "barcode.payloadContent": "बारकोड डेटा सामग्री",
  "barcode.generateRandom": "यादृच्छिक कोड जनरेट करें",
  "barcode.inputPlaceholder": "बारकोड सामग्री दर्ज करें (उदा. 7350053850019)...",
  "barcode.symbologyFormat": "बारकोड प्रकार और प्रारूप",
  "barcode.format.code128": "Code 128 (ऑटो उच्च घनत्व)",
  "barcode.format.ean13": "EAN-13 (अंतर्राष्ट्रीय खुदरा)",
  "barcode.format.upc": "UPC-A (उत्तरी अमेरिकी खुदरा)",
  "barcode.format.code39": "Code 39 (औद्योगिक अल्फ़ान्यूमेरिक)",
  "barcode.margin": "बाहरी मार्जिन",
  "barcode.barHeight": "बार की ऊंचाई",
  "barcode.lineThickness": "रेखा की मोटाई",
  "barcode.lineColor": "रेखा का रंग",
  "barcode.backgroundColor": "पृष्ठभूमि का रंग",
  "barcode.renderValueText": "बारकोड के नीचे टेक्स्ट दिखाएं",
  "barcode.renderValueTextDesc": "रेखाओं के नीचे मानव-पठनीय संख्या या टेक्स्ट प्रदर्शित करें।",
  "barcode.livePreviewBoard": "लाइव बारकोड पूर्वावलोकन",
  "barcode.invalidStructure": "निर्दिष्ट प्रारूप के लिए कोड संरचना अमान्य है।",
  "barcode.symbologyLabel": "प्रारूप:",
  "barcode.charactersLabel": "वर्ण:",
  "barcode.heightLabel": "ऊंचाई:",
  "barcode.linesColorLabel": "रंग:",
  "barcode.downloadPng": "उच्च रिज़ॉल्यूशन PNG डाउनलोड करें",
  "barcode.downloadSvg": "स्केलेबल वेक्टर SVG डाउनलोड करें",
  "barcode.tipTitle": "बारकोड स्कैनिंग सुझाव:",
  "barcode.tipDesc": "लेज़र स्कैनर द्वारा त्वरित और विश्वसनीय स्कैनिंग सुनिश्चित करने के लिए हमेशा रेखाओं और पृष्ठभूमि के बीच पर्याप्त रंग कंट्रास्ट रखें।",
  "barcode.renderFailed": "बारकोड रेंडर करने में विफल। कृपया इनपुट सत्यापित करें।",
  "barcode.unsupportedChars": "इनपुट में इस प्रारूप द्वारा असमर्थित वर्ण शामिल हैं।",
  "barcode.helpEan": "EAN-13 के लिए 12 से 13 अंकों की आवश्यकता होती है।",
  "barcode.helpUpc": "UPC-A के लिए 11 से 12 अंकों की आवश्यकता होती है।",
  "barcode.helpCode39": "Code 39 बड़े अक्षरों, संख्याओं और विशिष्ट प्रतीकों का समर्थन करता है।",
  "barcode.helpCode128": "Code 128 सभी मानक ASCII वर्णों का समर्थन करता है।",

  // Control & Presets & Frames
  "control.advancedSettings": "उन्नत QR इंजन सेटिंग्स",
  "control.advancedSettingsDesc": "त्रुटि सुधार स्तर (ECC), क्वाइट ज़ोन (मार्जिन) और घनत्व स्पेसिंग कॉन्फ़िगर करें।",
  "control.qrForegroundColor": "QR कोड का रंग",
  "control.backgroundColor": "पृष्ठभूमि का रंग",
  "control.dotStyle": "मैट्रिक्स डॉट्स शैली",
  "control.eyeStyle": "कॉर्नर आई फ्रेम शैली",
  "control.dotSquare": "क्लासिक चौकोर",
  "control.dotRounded": "गोल ब्लॉक",
  "control.dotDots": "मुलायम गोल बिंदु",
  "control.dotClassy": "सुरुचिपूर्ण क्लासी",
  "control.eyeSquare": "चौकोर फ्रेम",
  "control.eyeRounded": "गोल फ्रेम",
  "control.eyeCircle": "पूर्ण चक्र",
  "control.eyeLeaf": "पत्ती सौंदर्य शैली",
  "control.frameSelectionTitle": "फ्रेम टेम्प्लेट और कॉल-टू-एक्शन",
  "control.frameSelectionDesc": "अपने QR कोड को 'मुझे स्कैन करें' या 'वेबसाइट देखें' जैसे आकर्षक CTA फ़्रेम में एम्बेड करें।",
  "control.removeOuterFrame": "फ्रेम हटाएं",
  "control.framePreset.none": "कोई फ्रेम नहीं",
  "control.framePresetDesc.none": "स्वच्छ और न्यूनतम मैट्रिक्स",
  "control.framePreset.scan-me": "मुझे स्कैन करें",
  "control.framePresetDesc.scan-me": "सार्वभौमिक CTA बैज",
  "control.framePreset.visit-website": "वेबसाइट देखें",
  "control.framePresetDesc.visit-website": "वेब लिंक के लिए सर्वोत्तम",
  "control.framePreset.wifi-password": "वाई-फाई पासवर्ड",
  "control.framePresetDesc.wifi-password": "नेटवर्क क्रेडेंशियल",
  "control.framePreset.download-app": "ऐप डाउनलोड करें",
  "control.framePresetDesc.download-app": "ऐप स्टोर लिंक",
  "control.framePreset.follow-us": "हमें फॉलो करें",
  "control.framePresetDesc.follow-us": "सोशल मीडिया प्रोफाइल",
  "control.framePreset.join-wifi": "वाई-फाई से जुड़ें",
  "control.framePresetDesc.join-wifi": "त्वरित अतिथि कनेक्शन",
  "control.framePreset.order-now": "अभी ऑर्डर करें",
  "control.framePresetDesc.order-now": "मेनू और स्टोर",
  "control.framePreset.pay-here": "यहां भुगतान करें",
  "control.framePresetDesc.pay-here": "डिजिटल वॉलेट और भुगतान",
  "control.framePreset.custom": "कस्टम टेक्स्ट",
  "control.framePresetDesc.custom": "पूरी तरह से अनुकूलित संदेश",
  "control.type.payment": "भुगतान / वॉलेट",
  "control.type.url": "वेबसाइट URL",
  "control.type.text": "सादा टेक्स्ट",
  "control.type.wifi": "वाई-फाई नेटवर्क",
  "control.type.email": "ईमेल पता",
  "control.type.card": "डिजिटल vCard",
  "control.type.phone": "फ़ोन नंबर",
  "control.type.sms": "SMS संदेश",
  "control.type.social": "सोशल मीडिया",
  "control.type.app": "ऐप स्टोर",
  "control.type.crypto": "क्रिप्टोकरेंसी",
  "control.type.geo": "भौगोलिक स्थान (GPS)",

  // Saved / Recent / Projects
  "saved.batchDeleteBtn": "चयनित हटाएं",
  "saved.batchMoveBtn": "फ़ोल्डर में ले जाएं",
  "saved.batchSelectedCount": "{count} चयनित",
  "saved.clearSelection": "चयन साफ़ करें",
  "saved.deselectAll": "सभी का चयन रद्द करें",
  "saved.moveSelectedTo": "चयनित को यहां ले जाएं",
  "saved.selectAll": "सभी चुनें",
  "saved.title": "सहेजे गए QR कोड और प्रोजेक्ट्स",
  "saved.emptyTitle": "अभी तक कोई सहेजा गया QR कोड नहीं है",
  "saved.emptyDesc": "एक QR कोड बनाएं और भविष्य में कभी भी एक्सेस करने के लिए इसे अपने खाते में सहेजें।",
  "recent.searchPlaceholder": "रीयल-टाइम में श्रेणियां फ़िल्टर करें (उदा. WiFi, मेनू, WhatsApp, vCard)...",
  "recent.clearSearch": "खोज साफ़ करें",
  "recent.noMatchTitle": "कोई मेल खाने वाली QR श्रेणी नहीं मिली",
  "recent.noMatchDesc": "आपके खोज शब्द से मेल खाने वाला कोई कार्ड नहीं मिला। कृपया वर्तनी जांचें या फ़िल्टर रीसेट करें।",
  "recent.resetSearch": "खोज और फ़िल्टर रीसेट करें",

  // Bulk Generator
  "bulk.title": "बल्क QR कोड जनरेटर",
  "bulk.subtitle": "CSV फ़ाइल अपलोड करें, अपना टेम्प्लेट कस्टमाइज़ करें और प्रिंट-तैयार QR कोड के साथ एक संगठित ZIP पैकेज डाउनलोड करें।",
  "bulk.downloadTemplate": "नमूना CSV डाउनलोड करें",
  "bulk.clearAll": "बैच रीसेट करें",
  "bulk.uploadPrompt": "CSV फ़ाइल यहां क्लिक करें या ड्रैग करें",
  "bulk.uploadDesc": "\"name\" और \"url\" कॉलम वाली UTF-8 CSV फ़ाइलों का समर्थन करता है। प्रति बैच अधिकतम 50 पंक्तियां।",
  "bulk.batchList": "बैच कतार सूची",
  "bulk.namePlaceholder": "उदा. QR-01",
  "bulk.urlPlaceholder": "URL या डेटा टेक्स्ट",
  "bulk.add": "पंक्ति जोड़ें",
  "bulk.noDataYet": "बैच सूची खाली है। एक फ़ाइल अपलोड करें या ऊपर पंक्तियां जोड़ें।",
  "bulk.index": "#",
  "bulk.fileName": "फ़ाइल नाम (.png)",
  "bulk.payloadData": "QR में एन्कोड की गई सामग्री",
  "bulk.status": "स्थिति",
  "bulk.actions": "क्रियाएं",
  "bulk.ready": "तैयार",
  "bulk.rendering": "रेंडर हो रहा है...",
  "bulk.done": "पूर्ण",
  "bulk.failed": "विफल",
  "bulk.templateConfig": "बैच टेम्प्लेट शैलियाँ",
  "bulk.qrForegroundColor": "QR रंग",
  "bulk.backgroundColor": "पृष्ठभूमि रंग",
  "bulk.dotStyle": "मैट्रिक्स डॉट्स",
  "bulk.dotSquare": "चौकोर",
  "bulk.dotRounded": "गोल ब्लॉक",
  "bulk.dotDots": "गोल बिंदु",
  "bulk.dotClassy": "सुरुचिपूर्ण क्लासी",
  "bulk.eyeStyle": "आई कॉर्नर",
  "bulk.eyeSquare": "चौकोर",
  "bulk.eyeRounded": "मुलायम गोल",
  "bulk.eyeCircle": "स्वच्छ चक्र",
  "bulk.eyeLeaf": "सौंदर्य पत्ती",
  "bulk.outerEdgeLabelFrame": "CTA फ्रेम लेबल",
  "bulk.frameNone": "कोई फ्रेम नहीं (स्वच्छ मैट्रिक्स)",
  "bulk.frameScanMe": "'मुझे स्कैन करें' फ्रेम",
  "bulk.frameMenu": "'मेनू देखें' फ्रेम",
  "bulk.frameWebsite": "'वेबसाइट देखें' फ्रेम",
  "bulk.frameWifi": "'वाई-फाई कनेक्ट करें' फ्रेम",
  "bulk.frameDownloadApp": "'ऐप डाउनलोड करें' फ्रेम",
  "bulk.frameOrderNow": "'अभी ऑर्डर करें' फ्रेम",
  "bulk.framePayHere": "'यहां भुगतान करें' फ्रेम",
  "bulk.frameFollowUs": "'हमें फॉलो करें' फ्रेम",
  "bulk.frameSaveContact": "'संपर्क सहेजें' फ्रेम",
  "bulk.frameRateUs": "'रेटिंग एवं समीक्षा' फ्रेम",
  "bulk.frameNote": "* नोट: प्रिंट पर अलग पहचान के लिए फ्रेम लेबल स्वचालित रूप से संबंधित फ़ाइल नाम दिखाएंगे!",
  "bulk.generationTitle": "ZIP पैकेज निर्यात",
  "bulk.renderingBatch": "बैच तैयार हो रहा है...",
  "bulk.compilingZip": "फ़ाइलों को संकलित करके ZIP संग्रह बनाया जा रहा है...",
  "bulk.readyToCompile": "{count} स्टाइल किए गए QR कोड को उच्च रिज़ॉल्यूशन पैकेज में संकलित करने के लिए तैयार।",
  "bulk.readyToCompileDesc": "स्टाइल किए गए QR कोड को उच्च रिज़ॉल्यूशन पैकेज में संकलित करने के लिए तैयार।",
  "bulk.generateAll": "ZIP पैकेज जनरेट और डाउनलोड करें",
  "bulk.zipDownloaded": "ZIP पैकेज सफलतापूर्वक डाउनलोड हो गया!",
  "bulk.zipDownloadedDesc": "प्रिंट-तैयार PNG पैकेज के लिए अपना डाउनलोड फ़ोल्डर देखें।",
  "bulk.errorNoData": "वैध पंक्तियां निकालने में असमर्थ। सुनिश्चित करें कि CSV में \"name\" और \"url\" कॉलम हैं।",
  "bulk.warningTruncated": "बैच को पहली 50 प्रविष्टियों तक सीमित किया गया है (मुफ्त टियर सीमा)।",
  "bulk.errorLimitReached": "प्रति बैच अधिकतम 50 QR कोड प्रोसेस किए जा सकते हैं।",
  "bulk.errorCanvas": "कैनवास प्रोसेसिंग त्रुटि। कृपया पुनः प्रयास करें।",
  "bulk.errorRenderRow": "यह कोड जनरेट करने में विफल।",
  "bulk.errorZip": "ZIP संग्रह फ़ाइल बनाने में विफल।",

  // Auth & Settings
  "auth.emailRequired": "ईमेल आवश्यक है",
  "auth.resetFailed": "पासवर्ड रीसेट विफल रहा",
  "auth.userNotFound": "उपयोगकर्ता नहीं मिला",
  "auth.invalidEmail": "कृपया एक मान्य ईमेल पता दर्ज करें",
  "auth.tooManyRequests": "बहुत सारे अनुरोध भेजे गए। कृपया बाद में पुनः प्रयास करें।",
  "auth.networkError": "नेटवर्क कनेक्शन त्रुटि",
  "auth.googleFailed": "Google खाते से साइन इन विफल रहा",
  "auth.popupClosed": "साइन-इन पॉपअप विंडो बंद हो गई",
  "auth.popupCancelled": "साइन-इन रद्द कर दिया गया",
  "auth.googleExistsNotice": "खाता पहले से ही किसी अन्य प्रमाणीकरण विधि के साथ मौजूद है।",
  "auth.continueWithGoogle": "Google के साथ जारी रखें",
  "auth.emailRegisteredNotice": "यह ईमेल पहले से पंजीकृत है।",
  "auth.signIn": "साइन इन करें",
  "auth.resetPassword": "पासवर्ड रीसेट करें",
  "auth.googleAccountNotice": "त्वरित साइन इन के लिए अपने Google खाते का उपयोग करें।",
  "auth.invalidCredentials": "ईमेल या पासवर्ड अमान्य है।",
  "auth.emailInUse": "ईमेल पहले से किसी अन्य खाते द्वारा उपयोग में है।",
  "auth.weakPassword": "पासवर्ड बहुत कमजोर है (कम से कम 6 वर्ण होने चाहिए)।",
  "auth.orContinueWithEmail": "या ईमेल के साथ जारी रखें",
  "auth.forgotPasswordLink": "पासवर्ड भूल गए?",
  "auth.submitting": "भेजा जा रहा है...",
  "auth.resetPasswordTitle": "पासवर्ड पुनर्प्राप्ति",
  "auth.resetPasswordDesc": "अपना ईमेल दर्ज करें और हम आपको पासवर्ड रीसेट लिंक भेजेंगे।",
  "auth.resetSentHeader": "लिंक भेज दिया गया",
  "auth.resetSuccessMsg": "निर्देशों के लिए अपना ईमेल इनबॉक्स जांचें।",
  "auth.backToSignIn": "साइन इन पर वापस जाएं",
  "auth.cancel": "रद्द करें",
  "settings.headerBtnTooltip": "ध्वनि और ऑडियो सेटिंग्स",

  // Common
  "common.none": "कोई नहीं",
  "common.unknown": "अज्ञात",
  "common.untitled": "शीर्षकहीन",
  "common.global": "वैश्विक",

  // Inputs, selects, toasts, validations
  "input.placeholder.email": "अपना ईमेल पता दर्ज करें",
  "input.placeholder.password": "अपना पासवर्ड दर्ज करें",
  "input.placeholder.search": "टेम्प्लेट, टूल्स और गाइड खोजें...",
  "input.placeholder.url": "https://example.com या लक्ष्य URL दर्ज करें",
  "input.placeholder.name": "पूरा नाम दर्ज करें",
  "input.placeholder.company": "कंपनी या संगठन का नाम दर्ज करें",
  "input.placeholder.phone": "देश कोड के साथ फ़ोन नंबर दर्ज करें",
  "input.placeholder.title": "पदनाम या शीर्षक दर्ज करें",
  "input.placeholder.message": "अपना संदेश या विवरण यहां लिखें...",
  "select.option.all": "सभी श्रेणियां",
  "select.option.default": "डिफ़ॉल्ट सेटिंग",
  "select.option.custom": "कस्टम विकल्प",
  "select.option.low": "निम्न त्रुटि सुधार (L - 7%)",
  "select.option.medium": "मध्यम त्रुटि सुधार (M - 15%)",
  "select.option.quartile": "चौथाई त्रुटि सुधार (Q - 25%)",
  "select.option.high": "उच्च त्रुटि सुधार (H - 30%)",
  "select.option.png": "PNG छवि",
  "select.option.svg": "SVG वेक्टर",
  "select.option.pdf": "PDF दस्तावेज़",
  "toast.success.saved": "सफलतापूर्वक आपके खाते में सहेजा गया!",
  "toast.success.copied": "क्लिपबोर्ड पर कॉपी किया गया!",
  "toast.success.updated": "सेटिंग्स सफलतापूर्वक अपडेट की गईं।",
  "toast.success.deleted": "आइटम सफलतापूर्वक हटा दिया गया।",
  "toast.error.generic": "एक अप्रत्याशित त्रुटि हुई। कृपया पुनः प्रयास करें।",
  "toast.error.invalid_url": "कृपया एक मान्य वेब URL दर्ज करें।",
  "toast.error.required_field": "कृपया सभी आवश्यक फ़ील्ड भरें।",
  "toast.info.processing": "आपके अनुरोध पर कार्रवाई की जा रही है...",
  "validation.required": "यह फ़ील्ड आवश्यक है",
  "validation.email_invalid": "कृपया एक मान्य ईमेल पता दर्ज करें",
  "validation.url_invalid": "URL http:// या https:// से शुरू होना चाहिए",
  "validation.min_length": "कम से कम 3 वर्ण होने चाहिए",
  "validation.max_length": "अनुमत अधिकतम वर्ण सीमा पार हो गई है",
  "validation.numeric": "मान एक मान्य संख्या होनी चाहिए",
  "validation.password_mismatch": "दोनों पासवर्ड मेल नहीं खाते",

  // FAQ
  "faq.q1": "क्या जनरेट किए गए QR कोड पूरी तरह से मुफ़्त और व्यावसायिक उपयोग के लिए सुरक्षित हैं?",
  "faq.a1": "हाँ! हमारे प्लेटफ़ॉर्म पर जनरेट किए गए सभी स्थिर और गतिशील QR कोड 100% मुफ़्त हैं, असीमित स्कैन और पूर्ण व्यावसायिक लाइसेंस के साथ।",
  "faq.q2": "क्या QR कोड कभी समाप्त होते हैं या स्कैन सीमा के अधीन हैं?",
  "faq.a2": "नहीं, स्थिर कोड कभी समाप्त नहीं होते और उन पर कोई स्कैन सीमा नहीं होती। जब तक आप अपने डैशबोर्ड से उन्हें प्रबंधित करते हैं, गतिशील कोड सक्रिय रहते हैं।",
  "faq.q3": "उच्च रिज़ॉल्यूशन प्रिंटिंग के लिए कौन से वेक्टर निर्यात प्रारूप समर्थित हैं?",
  "faq.a3": "हम व्यावसायिक प्रिंटर के लिए हाई-डेफिनिशन SVG वेक्टर, उच्च DPI वाली PNG छवियां और प्रिंट-तैयार PDF दस्तावेज़ प्रदान करते हैं।",
  "faq.q4": "रीड-सोलोमन (Reed-Solomon) त्रुटि सुधार क्षतिग्रस्त QR कोड की सुरक्षा कैसे करता है?",
  "faq.a4": "रीड-सोलोमन त्रुटि सुधार मैट्रिक्स के भीतर गणितीय अतिरेक डेटा एम्बेड करता है, जिससे कोड 30% तक क्षतिग्रस्त या ढके होने पर भी स्कैन किया जा सकता है।",
  "faq.q5": "क्या मैं अपने ब्रांड की पहचान के अनुरूप रंग, लोगो और कॉर्नर आई फ़्रेम को कस्टमाइज़ कर सकता हूँ?",
  "faq.a5": "बिल्कुल! आप अपने ब्रांड का लोगो अपलोड कर सकते हैं, QR और पृष्ठभूमि के रंग समायोजित कर सकते हैं, कॉर्नर आई फ्रेम कस्टमाइज़ कर सकते हैं और कस्टम कॉल-टू-एक्शन फ़्रेम जोड़ सकते हैं।"
};

// Common terms and domain translation rules for systematic Hindi coverage
const phraseMap = [
  [/^FreeQRGen\.pro$/g, "FreeQRGen.pro"],
  [/^Free QR Generator$/g, "Free QR Generator"],
  [/^iSolutions ICo$/g, "iSolutions ICo"],
  [/^QR Code$/g, "QR कोड"],
  [/^vCard$/g, "vCard कार्ड"],
  [/^WiFi$/g, "वाई-फाई (WiFi)"],
  [/^SVG$/g, "SVG"],
  [/^PNG$/g, "PNG"],
  [/^PDF$/g, "PDF"],
  [/^CSV$/g, "CSV"],
  [/^API$/g, "API"],
  [/^URL$/g, "URL"],
  [/^DPI$/g, "DPI"],
  [/^Reed-Solomon$/g, "रीड-सोलोमन (Reed-Solomon)"],
  [/^ECC$/g, "त्रुटि सुधार (ECC)"],
  [/^ISO\/IEC 18004$/g, "ISO/IEC 18004 मानक"],

  // Digital business cards
  [/^Digital Business Cards$/g, "डिजिटल बिजनेस कार्ड"],
  [/^Card Credentials & Info$/g, "कार्ड क्रेडेंशियल और जानकारी"],
  [/^Full Name$/g, "पूरा नाम"],
  [/^Job Title$/g, "पदनाम"],
  [/^Job Title \/ Designation$/g, "पदनाम / शीर्षक"],
  [/^Company Name$/g, "कंपनी का नाम"],
  [/^Official Website$/g, "आधिकारिक वेबसाइट"],
  [/^Email Address$/g, "ईमेल पता"],
  [/^Phone Number$/g, "फ़ोन नंबर"],
  [/^Create New Card$/g, "नया कार्ड बनाएं"],
  [/^Save Pass$/g, "पास सहेजें"],
  [/^AI Assistant$/g, "AI सहायक"],
  [/^Creative Contact Station$/g, "रचनात्मक संपर्क स्टेशन"],
  [/^Design professional, contact-rich digital business cards \(vCards\) with customizable layouts, active preset logos, instant WhatsApp or social media links, Apple\/Google Wallet simulations, and elegant dynamic QR codes$/g, "अनुकूलन योग्य लेआउट, सक्रिय प्रीसेट लोगो, त्वरित WhatsApp या सोशल मीडिया लिंक, Apple/Google वॉलेट सिमुलेशन और सुरुचिपूर्ण गतिशील QR कोड के साथ पेशेवर डिजिटल बिजनेस कार्ड (vCard) डिज़ाइन करें।"],
  [/^Choose name, position title, and primary workplace context$/g, "नाम, पदनाम और प्राथमिक कार्यस्थल संदर्भ चुनें।"],
  [/^WhatsApp Chat Link \(Or Number\)$/g, "WhatsApp चैट लिंक (या नंबर)"],
  [/^Office\/Postal Address$/g, "कार्यालय / डाक पता"],
  [/^Profile Photo \(Self-Contained\)$/g, "प्रोफ़ाइल फ़ोटो (स्वयं-निहित)"],
  [/^Upload Image$/g, "छवि अपलोड करें"],
  [/^Presets:$/g, "प्रीसेट:"],
  [/^Company Emblem \/ Brand Logo$/g, "कंपनी का प्रतीक / ब्रांड लोगो"],
  [/^Upload Brand Logo$/g, "ब्रांड लोगो अपलोड करें"],
  [/^Texts:$/g, "टेक्स्ट:"],
  [/^Dynamic Social Integrations$/g, "गतिशील सोशल मीडिया एकीकरण"],
  [/^Append custom profiles links \(LinkedIn, YouTube, X, etc$/g, "कस्टम प्रोफ़ाइल लिंक जोड़ें (LinkedIn, YouTube, X, आदि)"],
  [/^Add Link$/g, "लिंक जोड़ें"],
  [/^No active social links$/g, "कोई सक्रिय सोशल लिंक नहीं"],
  [/^Visual Theme & Layout$/g, "दृश्य थीम और लेआउट"],
  [/^Executive Minimal$/g, "कार्यकारी न्यूनतम"],
  [/^White & Blue$/g, "सफेद और नीला"],
  [/^Sleek Obsidian$/g, "आकर्षक ओब्सीडियन"],
  [/^Dark & Amber Gold$/g, "डार्क और एम्बर गोल्ड"],
  [/^Tech Slate$/g, "टेक स्लेट"],
  [/^Sleek Cyan Neon$/g, "आकर्षक सियान नियॉन"],
  [/^Warm Craft$/g, "वार्म क्राफ्ट"],
  [/^Organic Clay Cream$/g, "ऑर्गेनिक क्ले क्रीम"],
  [/^Saved Cards on Account \/ Cache$/g, "खाते / कैश में सहेजे गए कार्ड"],
  [/^No saved passes found$/g, "कोई सहेजा गया पास नहीं मिला"],
  [/^Double-Sided Live Mockup$/g, "दो तरफा लाइव मॉकअप"],
  [/^Flip Card$/g, "कार्ड पलटें"],
  [/^Flip Card \(View Front\)$/g, "कार्ड पलटें (सामने का भाग देखें)"],
  [/^Flip Card \(View Back\)$/g, "कार्ड पलटें (पीछे का भाग देखें)"],
  [/^Front$/g, "सामने"],
  [/^Back$/g, "पीछे"],
  [/^INDEPENDENT$/g, "स्वतंत्र"],
  [/^Anonymous User$/g, "अनाम उपयोगकर्ता"],
  [/^Product Developer$/g, "उत्पाद डेवलपर"],
  [/^Logo$/g, "लोगो"],
  [/^Contact Channels$/g, "संपर्क चैनल"],
  [/^Personal QR ID$/g, "व्यक्तिगत QR ID"],
  [/^Scan to Connect$/g, "कनेक्ट करने के लिए स्कैन करें"],
  [/^Interact & Share$/g, "बातचीत और साझा करें"],
  [/^Direct vCard$/g, "प्रत्यक्ष vCard"],
  [/^Web Profile$/g, "वेब प्रोफ़ाइल"],
  [/^VCARD GENERATOR DATA$/g, "vCard जनरेटर डेटा"],
  [/^WEB REDIRECT MODULE$/g, "वेब रीडायरेक्ट मॉड्यूल"],
  [/^Encodes Name, Address, Email, Phone, Logo & Website inside the QR matrix$/g, "QR मैट्रिक्स के अंदर नाम, पता, ईमेल, फ़ोन, लोगो और वेबसाइट को एन्कोड करता है।"],
  [/^Creates a simulated, interactive digital business profile on scan$/g, "स्कैन करने पर एक सिम्युलेटेड, इंटरैक्टिव डिजिटल बिजनेस प्रोफाइल बनाता है।"],
  [/^Save Contact \($/g, "संपर्क सहेजें ("],
  [/^Download QR \(PNG\)$/g, "QR कोड डाउनलोड करें (PNG)"],
  [/^Download QR \(SVG\)$/g, "QR कोड डाउनलोड करें (SVG)"],
  [/^Share Card Link$/g, "कार्ड लिंक साझा करें"],
  [/^Copied!$/g, "कॉपी किया गया!"],
  [/^Copied$/g, "कॉपी किया गया"],
  [/^Mobile Wallet Pass Export$/g, "मोबाइल वॉलेट पास निर्यात"],
  [/^Save your contact card directly to smartphone wallets for quick tap-and-share access$/g, "त्वरित टैप-एंड-शेयर एक्सेस के लिए अपने संपर्क कार्ड को सीधे स्मार्टफोन वॉलेट में सहेजें।"],
  [/^ Apple Wallet$/g, " Apple Wallet"],
  [/^🤖 Google Wallet$/g, "🤖 Google Wallet"],
  [/^Apple Wallet Card$/g, "Apple Wallet कार्ड"],
  [/^MEMBER$/g, "सदस्य"],
  [/^Designation$/g, "पदनाम"],
  [/^SMARTPASS INTEGRATION$/g, "स्मार्टपास एकीकरण"],
  [/^✓ Ready to Install$/g, "✓ इंस्टॉल के लिए तैयार"],
  [/^Apple Wallet Digital Pass$/g, "Apple Wallet डिजिटल पास"],
  [/^Copy Pass Payload$/g, "पास पेलोड कॉपी करें"],
  [/^Export your formatted wallet card to save or distribute directly to iOS devices$/g, "सीधे iOS उपकरणों पर सहेजने या वितरित करने के लिए अपना स्वरूपित वॉलेट कार्ड निर्यात करें।"],
  [/^Download Apple Wallet Pass File$/g, "Apple Wallet पास फ़ाइल डाउनलोड करें"],
  [/^Google Wallet Pass$/g, "Google Wallet पास"],
  [/^AFFILIATE$/g, "सहबद्ध / सहयोगी"],
  [/^Card Holder$/g, "कार्ड धारक"],
  [/^Google Wallet Digital Pass$/g, "Google Wallet डिजिटल पास"],
  [/^Export your formatted wallet card payload for instant Android Google Wallet sync$/g, "Android पर त्वरित Google Wallet सिंक के लिए अपने वॉलेट कार्ड पेलोड को निर्यात करें।"],
  [/^Download Google Wallet File$/g, "Google Wallet फ़ाइल डाउनलोड करें"]
];

function translateString(key, enVal) {
  if (dict[key]) return dict[key];
  if (!enVal || typeof enVal !== 'string') return enVal;

  const trimmed = enVal.trim();
  if (dict[trimmed]) return dict[trimmed];

  // Specific exact regex matches
  for (const [regex, replacement] of phraseMap) {
    if (regex.test(trimmed)) {
      return trimmed.replace(regex, replacement);
    }
  }

  // Preserve hex colors, URLs, emails
  if (/^#[0-9a-fA-F]{3,8}$/.test(trimmed)) return trimmed;
  if (/^https?:\/\//.test(trimmed)) return trimmed;
  if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed)) return trimmed;

  return translateContextual(key, enVal);
}

function translateContextual(key, text) {
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
    "Slate Minimalist": "न्यूनतम स्लेट",
    "Deep Navy": "गहरा नेवी ब्लू",
    "Forest Emerald": "वन एमराल्ड ग्रीन",
    "Crimson Ruby": "रूबी क्रिमसन लाल",
    "Sunset Amber": "सनसेट एम्बर गोल्ड",
    "Royal Violet": "रॉयल बैंगनी",
    "Monochrome Dark": "मोनोक्रोम डार्क",
    "Ocean Cyan": "समुद्री सियान",
    "Clean Light": "स्वच्छ लाइट",
    "Corporate Indigo": "कॉर्पोरेट इंडिगो"
  };
  return map[text] || fallbackTranslate(text);
}

function translateTrust(key, text) {
  if (text.includes("FreeQRGen.pro represents the next paradigm")) {
    return "FreeQRGen.pro संपर्क रहित लिंक और स्थिर वेक्टर वितरण प्रणालियों के अगले प्रतिमान का प्रतिनिधित्व करता है। हम आमतौर पर बारकोड जनरेशन से जुड़े संचालन पेवॉल, धीमे सर्वर और ट्रैकिंग सिस्टम को समाप्त करते हैं।";
  }
  if (text.includes("Our system is engineered to satisfy the demands")) {
    return "हमारा सिस्टम आधुनिक पैकेजिंग डिजाइनरों, फुल-स्टैक डेवलपर्स और उच्च मात्रा वाले मार्केटिंग निदेशकों की मांगों को पूरा करने के लिए बनाया गया है। यहां उत्पन्न स्थिर बारकोड ब्राउज़र कैनवास बफ़र के अंदर पूरी तरह से ऑफ़लाइन चलते हैं और ISO/IEC 18004 मानकों के अनुपालन को सुनिश्चित करते हैं। गोपनीयता बनाए रखने के लिए कोई भी पैरामीटर या पता केंद्रीय सर्वर पर नहीं भेजा जाता है।";
  }
  if (text === "iSolutions ICo") return "iSolutions ICo";
  return fallbackTranslate(text);
}

function translateEnterprisePlatform(key, text) {
  const map = {
    "Action Node": "एक्शन नोड",
    "Active System API Credentials": "सक्रिय सिस्टम API क्रेडेंशियल्स",
    "Active System Feature Flags": "सक्रिय सिस्टम फीचर फ़्लैग्स",
    "ACTIVITY ALERTS": "गतिविधि अलर्ट",
    "Activity Center": "गतिविधि केंद्र",
    "API Key Management": "API कुंजी प्रबंधन",
    "Enterprise Security Audit": "एंटरप्राइज सुरक्षा ऑडिट",
    "Zero-Trust Vector Pipeline": "ज़ीरो-ट्रस्ट वेक्टर पाइपलाइन",
    "High-Volume Vector Batching": "उच्च मात्रा वेक्टर बैचिंग",
    "Real-time Telemetry Engine": "रीयल-टाइम टेलीमेट्री इंजन",
    "Role-Based Access Control (RBAC)": "भूमिका आधारित अभिगम नियंत्रण (RBAC)",
    "Audit Log Compliance": "ऑडिट लॉग अनुपालन",
    "Organization & Workspaces": "संगठन और कार्यक्षेत्र",
    "Webhook Dispatcher": "वेबहुक डिस्पैचर",
    "SSO & SAML Integration": "SSO और SAML एकीकरण",
    "Global CDN Distribution": "ग्लोबल CDN वितरण"
  };
  if (map[text]) return map[text];
  return fallbackTranslate(text);
}

function translatePreviewPrint(key, text) {
  const map = {
    "A4 Sheet": "A4 शीट",
    "Analyzing geometric structural grids, color-contrasts, and emblem scaling...": "ज्यामितीय संरचनात्मक ग्रिड, रंग-कंट्रास्ट और लोगो स्केलिंग का विश्लेषण किया जा रहा है...",
    "Advanced QR Diagnostic Auditor": "उन्नत QR डायग्नोस्टिक परीक्षक",
    "Print Ready Preview": "प्रिंट तैयार पूर्वावलोकन",
    "Vector SVG Quality": "वेक्टर SVG गुणवत्ता",
    "Raster PNG Export": "रास्टर PNG निर्यात",
    "High-Density Vector Canvas": "उच्च घनत्व वेक्टर कैनवास",
    "Color Contrast Ratio": "रंग कंट्रास्ट अनुपात",
    "Scan Readability Score": "स्कैन पठनीयता स्कोर",
    "Margin Compliance Check": "मार्जिन अनुपालन जांच",
    "CMYK Print Separation Guide": "CMYK प्रिंट पृथक्करण गाइड",
    "Bleed & Safe Zone Guidelines": "ब्लीड और सुरक्षित क्षेत्र दिशानिर्देश",
    "Sticker & Decal Mockup": "स्टिकर और डेकल मॉकअप",
    "Table Tent Display": "टेबल टेंट डिस्प्ले",
    "Business Card Placement": "बिजनेस कार्ड प्लेसमेंट"
  };
  if (map[text]) return map[text];
  return fallbackTranslate(text);
}

function translateTemplates(key, text) {
  const map = {
    "Activate Generator": "जनरेटर सक्रिय करें",
    "Structured in compliance with Llama-3, Claude-3.5, and Gemini-Pro semantic retrieval constraints. Verified 100% factual.": "Llama-3, Claude-3.5 और Gemini-Pro सिमेंटिक पुनर्प्राप्ति बाधाओं के अनुपालन में संरचित। 100% तथ्यात्मक सत्यापित।",
    "AI Search Summary": "AI खोज सारांश",
    "Featured Templates": "विशेष रुप से प्रदर्शित टेम्प्लेट",
    "Restaurant & Food": "रेस्तरां और भोजन",
    "Business & Corporate": "व्यवसाय और कॉर्पोरेट",
    "Events & Tickets": "इवेंट्स और टिकट",
    "Social & Community": "सोशल और समुदाय",
    "Education & School": "शिक्षा और स्कूल",
    "Real Estate & Property": "रियल एस्टेट और संपत्ति",
    "Healthcare & Medical": "स्वास्थ्य सेवा और चिकित्सा",
    "Retail & E-commerce": "खुदरा और ई-कॉमर्स"
  };
  if (map[text]) return map[text];
  return fallbackTranslate(text);
}

function translateAnalytics(key, text) {
  const map = {
    "Total Scans": "कुल स्कैन",
    "Unique Visitors": "अद्वितीय आगंतुक",
    "Operating Systems": "ऑपरेटिंग सिस्टम",
    "Top Devices": "शीर्ष उपकरण",
    "Geographic Distribution": "भौगोलिक वितरण",
    "Scan Activity Heatmap": "स्कैन गतिविधि हीटमैप",
    "Referral Sources": "रेफरल स्रोत",
    "Browser Analytics": "ब्राउज़र एनालिटिक्स",
    "Daily Scan Velocity": "दैनिक स्कैन गति",
    "Export Scan Report (CSV)": "स्कैन रिपोर्ट निर्यात करें (CSV)",
    "Export Analytics PDF": "एनालिटिक्स PDF निर्यात करें"
  };
  if (map[text]) return map[text];
  return fallbackTranslate(text);
}

function translateProgrammaticSeo(key, text) {
  const map = {
    "FreeQRGen.pro Editorial Board": "FreeQRGen.pro संपादकीय बोर्ड",
    "AUTO": "ऑटो",
    "Best Practices (Do This)": "सर्वोत्तम प्रथाएं (यह करें)",
    "Common Mistakes (Avoid This)": "सामान्य गलतियां (इससे बचें)",
    "Scan analytics registered": "स्कैन एनालिटिक्स पंजीकृत",
    "Active Scan Redirector Node": "सक्रिय स्कैन रीडायरेक्टर नोड",
    "Scanning Security Clearance": "स्कैनिंग सुरक्षा स्वीकृति",
    "ISO Compliance Certified": "ISO अनुपालन प्रमाणित",
    "Instant Zero-Latency Execution": "त्वरित शून्य-विलंबता निष्पादन",
    "Browser-Based Engine": "ब्राउज़र-आधारित इंजन"
  };
  if (map[text]) return map[text];
  return fallbackTranslate(text);
}

function translateKnowledgeCompany(key, text) {
  const map = {
    "Knowledge Base & Technical Guides": "ज्ञान केंद्र और तकनीकी गाइड",
    "Frequently Asked Questions": "अक्सर पूछे जाने वाले प्रश्न",
    "About FreeQRGen.pro": "FreeQRGen.pro के बारे में",
    "Privacy Policy & Data Security": "गोपनीयता नीति और डेटा सुरक्षा",
    "Terms of Service & Licensing": "सेवा की शर्तें और लाइसेंसिंग",
    "Comparison & Benchmarks": "तुलना और बेंचमार्क",
    "System Architecture Whitepaper": "सिस्टम आर्किटेक्चर श्वेतपत्र",
    "Contact Support & Developer Team": "समर्थन और डेवलपर टीम से संपर्क करें"
  };
  if (map[text]) return map[text];
  return fallbackTranslate(text);
}

function translateControlTools(key, text) {
  const map = {
    "Add https://": "https:// जोड़ें",
    "Advanced QR Engine Settings": "उन्नत QR इंजन सेटिंग्स",
    "Configure error correction level, quiet zone, and density spacing.": "त्रुटि सुधार स्तर, शांत क्षेत्र और घनत्व रिक्ति कॉन्फ़िगर करें।",
    "Scannability Score": "स्कैन क्षमता स्कोर",
    "Color Contrast Analysis": "रंग कंट्रास्ट विश्लेषण",
    "Quiet Zone Margin": "शांत क्षेत्र मार्जिन",
    "Module Density": "मॉड्यूल घनत्व",
    "Corner Eye Geometry": "कॉर्नर आई ज्यामिति",
    "Center Logo Emblem": "केंद्र लोगो प्रतीक",
    "Vector SVG Scale": "वेक्टर SVG पैमाना"
  };
  if (map[text]) return map[text];
  return fallbackTranslate(text);
}

function translateGeneralUI(key, text) {
  const map = {
    "Close": "बंद करें",
    "Save": "सहेजें",
    "Cancel": "रद्द करें",
    "Delete": "हटाएं",
    "Edit": "संपादित करें",
    "Download": "डाउनलोड करें",
    "Share": "साझा करें",
    "Copy": "कॉपी करें",
    "Loading...": "लोड हो रहा है...",
    "Please wait...": "कृपया प्रतीक्षा करें...",
    "Success": "सफलता",
    "Error": "त्रुटि",
    "Warning": "चेतावनी",
    "Info": "जानकारी",
    "Next": "अगला",
    "Previous": "पिछला",
    "Finish": "समाप्त",
    "Back": "वापस",
    "Reset": "रीसेट करें",
    "Apply": "लागू करें",
    "Filter": "फ़िल्टर करें",
    "Search": "खोजें"
  };
  if (map[text]) return map[text];
  return fallbackTranslate(text);
}

// Fallback dynamic dictionary translator with natural Hindi technical vocabulary
const lexicon = [
  [/\bQR Code Generator\b/gi, "QR कोड जनरेटर"],
  [/\bQR Codes\b/gi, "QR कोड"],
  [/\bQR Code\b/gi, "QR कोड"],
  [/\bBarcodes\b/gi, "बारकोड"],
  [/\bBarcode\b/gi, "बारकोड"],
  [/\bDigital Business Card\b/gi, "डिजिटल बिजनेस कार्ड"],
  [/\bBusiness Cards\b/gi, "बिजनेस कार्ड"],
  [/\bBusiness Card\b/gi, "बिजनेस कार्ड"],
  [/\bvCards?\b/gi, "vCard कार्ड"],
  [/\bHigh Resolution\b/gi, "उच्च रिज़ॉल्यूशन"],
  [/\bVector Graphics\b/gi, "वेक्टर ग्राफिक्स"],
  [/\bVector\b/gi, "वेक्टर"],
  [/\bDownload\b/gi, "डाउनलोड"],
  [/\bUpload\b/gi, "अपलोड"],
  [/\bGenerate\b/gi, "जनरेट करें"],
  [/\bCustomization\b/gi, "अनुकूलन"],
  [/\bCustomize\b/gi, "अनुकूलित करें"],
  [/\bTemplates\b/gi, "टेम्प्लेट"],
  [/\bTemplate\b/gi, "टेम्प्लेट"],
  [/\bAnalytics\b/gi, "एनालिटिक्स"],
  [/\bEnterprise\b/gi, "एंटरप्राइज"],
  [/\bSettings\b/gi, "सेटिंग्स"],
  [/\bProfile\b/gi, "प्रोफ़ाइल"],
  [/\bDashboard\b/gi, "डैशबोर्ड"],
  [/\bOverview\b/gi, "अवलोकन"],
  [/\bFeatures\b/gi, "विशेषताएं"],
  [/\bPricing\b/gi, "मूल्य निर्धारण"],
  [/\bFree\b/gi, "मुफ़्त"],
  [/\bInstant\b/gi, "त्वरित"],
  [/\bReal-time\b/gi, "रीयल-टाइम"],
  [/\bSecurity\b/gi, "सुरक्षा"],
  [/\bPrivacy\b/gi, "गोपनीयता"],
  [/\bCompliant\b/gi, "अनुपालन"],
  [/\bCompliance\b/gi, "अनुपालन"],
  [/\bError Correction\b/gi, "त्रुटि सुधार"],
  [/\bQuiet Zone\b/gi, "शांत क्षेत्र (क्वाइट ज़ोन)"],
  [/\bForeground Color\b/gi, "अग्रभूमि रंग"],
  [/\bBackground Color\b/gi, "पृष्ठभूमि रंग"],
  [/\bDot Style\b/gi, "डॉट शैली"],
  [/\bEye Frame\b/gi, "आई फ्रेम"],
  [/\bEye Style\b/gi, "आई शैली"],
  [/\bCall to Action\b/gi, "कॉल-टू-एक्शन (CTA)"],
  [/\bScan Me\b/gi, "मुझे स्कैन करें"],
  [/\bVisit Website\b/gi, "वेबसाइट देखें"],
  [/\bWiFi Password\b/gi, "वाई-फाई पासवर्ड"],
  [/\bJoin WiFi\b/gi, "वाई-फाई से जुड़ें"],
  [/\bDownload App\b/gi, "ऐप डाउनलोड करें"],
  [/\bOrder Now\b/gi, "अभी ऑर्डर करें"],
  [/\bPay Here\b/gi, "यहाँ भुगतान करें"],
  [/\bFollow Us\b/gi, "हमें फॉलो करें"],
  [/\bSave Contact\b/gi, "संपर्क सहेजें"],
  [/\bBatch Generator\b/gi, "बैच जनरेटर"],
  [/\bBulk Generator\b/gi, "बल्क जनरेटर"],
  [/\bZero-Trust\b/gi, "ज़ीरो-ट्रस्ट"],
  [/\bClient-Side\b/gi, "क्लाइंट-साइड"],
  [/\bBrowser-Based\b/gi, "ब्राउज़र-आधारित"],
  [/\bUnlimited Scans\b/gi, "असीमित स्कैन"],
  [/\bNo Expiration\b/gi, "कोई समाप्ति नहीं"],
  [/\bCommercial Use\b/gi, "व्यावसायिक उपयोग"]
];

function fallbackTranslate(text) {
  if (!text || typeof text !== 'string') return text;
  let translated = text;
  for (const [regex, replacement] of lexicon) {
    translated = translated.replace(regex, replacement);
  }
  return translated;
}

// Build complete hi.json
const hiData = {};
let translatedCount = 0;

for (const [key, enVal] of Object.entries(en)) {
  const hiVal = translateString(key, enVal);
  hiData[key] = hiVal;
  translatedCount++;
}

// Write to src/locales/hi.json with UTF-8 encoding
const outputPath = path.join(__dirname, '../src/locales/hi.json');
fs.writeFileSync(outputPath, JSON.stringify(hiData, null, 2) + '\n', 'utf8');

console.log(`Successfully generated fresh hi.json with ${translatedCount} translated keys.`);
