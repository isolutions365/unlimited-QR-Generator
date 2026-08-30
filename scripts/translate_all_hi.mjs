import fs from "fs";

const en = JSON.parse(fs.readFileSync("src/locales/en.json", "utf8"));
const hi = JSON.parse(fs.readFileSync("src/locales/hi.json", "utf8"));

const ALLOWED = new Set([
  "QR", "PNG", "SVG", "PDF", "JPEG", "JPG", "WEBP", "EPS", "CSS", "HTML",
  "URL", "URI", "API", "WIFI", "WI-FI", "VCARD", "VCARDS", "MECARD", "EPC",
  "EAN", "UPC", "EAN-13", "EAN-8", "UPC-A", "UPC-E", "CODE128", "CODE39",
  "ITF", "ITF-14", "MSI", "PLESSEY", "DATAMATRIX", "PDF417", "AZTEC", "CODABAR",
  "ID", "UUID", "OS", "IOS", "ANDROID", "GOOGLE", "APPLE", "WALLET", "SMS",
  "EMAIL", "GPS", "SKU", "ASCII", "ISO", "GS1", "FREEQRBARCODES.COM",
  "FREEQRGEN.PRO", "WHATSAPP", "TWITTER", "FACEBOOK", "LINKEDIN", "INSTAGRAM",
  "YOUTUBE", "TIKTOK", "ZOOM", "SKYPE", "TELEGRAM", "VIBER", "PAYPAL", "STRIPE",
  "SEPA", "IBAN", "BIC", "SWIFT", "JSON", "CSV", "XLSX", "ZIP", "HTTP", "HTTPS",
  "WWW", "A4", "A3", "A5", "EPSON", "ZEBRA", "DPI", "CMYK", "RGB", "TLS", "SQL", "POS"
]);

function getEnglishWords(val) {
  if (typeof val !== "string") return [];
  const words = val.match(/[a-zA-Z]+/g) || [];
  return words.filter(w => !ALLOWED.has(w.toUpperCase()));
}

// Full translation mappings
const translations = {
  // --- NAV & FOOTER & COMMON ---
  "nav.analyticsTab": "स्कैन विश्लेषण",
  "nav.formTab": "फॉर्म बिल्डर",
  "nav.restaurantMenuTab": "रेस्तरां मेनू",
  "nav.digitalCardTab": "डिजिटल कार्ड",
  "nav.pdfTab": "PDF साझाकरण",
  "nav.bulkGeneratorTab": "बल्क जनरेटर",
  "nav.barcodeGeneratorTab": "बारकोड जनरेटर",
  "nav.generator": "QR स्टूडियो",
  "nav.myProfile": "प्रोफ़ाइल और सेटिंग्स",
  "nav.savedQRs": "सहेजे गए QR कोड",
  "footer.aboutUs": "हमारे बारे में",
  "footer.whyUs": "हमें क्यों चुनें?",
  "footer.privacyPolicy": "गोपनीयता नीति",
  "footer.termsOfService": "सेवा की शर्तें",
  "footer.contactUs": "संपर्क करें",
  "footer.rights": "सभी अधिकार सुरक्षित हैं © {{year}} FreeQRGen.pro",
  "ui.back": "वापस जाएं",
  "common.none": "कोई नहीं",

  // --- BARCODE ---
  "barcode.valEmpty": "बारकोड जनरेट करने के लिए कृपया एक मान दर्ज करें।",
  "barcode.valEanDigits": "EAN-13 में केवल संख्यात्मक अंक (0-9) होना आवश्यक है।",
  "barcode.valEanLen": "EAN-13 में ठीक 12 या 13 अंक होने चाहिए (वर्तमान: {count})। 12-अंकों का इनपुट स्वतः ही अपनी चेकसम संख्या जोड़ लेता है।",
  "barcode.valUpcDigits": "UPC-A में केवल संख्यात्मक अंक (0-9) होना आवश्यक है।",
  "barcode.valUpcLen": "UPC-A में ठीक 11 या 12 अंक होने चाहिए (वर्तमान: {count})। 11-अंकों का इनपुट स्वतः ही अपनी चेकसम संख्या जोड़ लेता है।",
  "barcode.valCode39Chars": "CODE39 0-9, A-Z (बड़े अक्षर), स्पेस और प्रतीकों का समर्थन करता है: - . $ / + %",
  "barcode.valCode128Ascii": "CODE128 केवल मानक 128 ASCII वर्णों का समर्थन करता है।",
  "barcode.passedValidation": "प्रारूप सत्यापन सफल! उच्च भौतिक कंट्रास्ट रेंडर के लिए तैयार है।",
  "barcode.validFormat": "वैध बारकोड प्रारूप।",

  // --- BLOG & ANALYTICS ---
  "blog.category.qr_code_guides": "QR कोड गाइड",
  "blog.category.business_marketing": "व्यावसायिक मार्केटिंग",
  "blog.category.digital_marketing": "डिजिटल मार्केटिंग",
  "blog.category.small_business_tools": "लघु व्यवसाय उपकरण",
  "blog.category.technology": "प्रौद्योगिकी",
  "blog.category.contactless_solutions": "कॉन्टैक्टलेस समाधान",
  "blog.category.restaurant_qr_menus": "रेस्तरां QR मेनू",
  "blog.category.event_qr_codes": "इवेंट QR कोड",
  "blog.category.education_qr_codes": "शिक्षा QR कोड",
  "blog.category.social_media_marketing": "सोशल मीडिया मार्केटिंग",

  "analytics.colBrowser": "क्लाइंट ब्राउज़र",
  "analytics.colDatetime": "स्कैन तिथि एवं समय",
  "analytics.colLocation": "अनुमानित स्थान",
  "analytics.colPlatform": "ऑपरेटिंग सिस्टम",
  "analytics.desc": "सक्रिय उपयोगकर्ता रीडायरेक्ट को ट्रैक करने वाले सुरक्षित क्लाउड लॉगिंग मीट्रिक।",
  "analytics.heatmapDesc": "उपयोगकर्ता सहभागिता दर्शाने वाले इंटरैक्टिव होवर हॉटस्पॉट।",
  "analytics.heatmapTitle": "क्षेत्रीय हीटमैप वितरण",
  "analytics.leaderboardDesc": "स्कैन के आधार पर वर्गीकृत सक्रिय क्षेत्र।",
  "analytics.leaderboardTitle": "शीर्ष प्रदर्शन करने वाले क्षेत्र",
  "analytics.liveLogTitle": "लाइव रियल-टाइम स्कैन स्ट्रीम",
  "analytics.noLogs": "अभी तक कोई स्कैन रिकॉर्ड दर्ज नहीं किया गया है।",
  "analytics.noLogsDesc": "जब उपयोगकर्ता आपके जनरेट किए गए QR कोड को स्कैन करेंगे, तो डेटा यहां दिखाई देगा।",
  "analytics.title": "स्कैन विश्लेषण एवं एनालिटिक्स",

  // --- CONTROL ---
  "control.payPixAmountLabel": "राशि (BRL R$)",
  "control.payGrabLinkLabel": "GrabPay भुगतान लिंक या फ़ोन नंबर",
  "control.payTillLabel": "टिल नंबर",
  "control.payPaybillLabel": "पेबिल नंबर (वैकल्पिक)",
  "control.payMpesaAccountLabel": "पेबिल खाता संख्या",
  "control.payJazzAccountLabel": "JazzCash खाता / मोबाइल नंबर",
  "control.payJazzAmountLabel": "राशि (PKR) (वैकल्पिक)",
  "control.payEasyAccountLabel": "EasyPaisa खाता / मोबाइल नंबर",
  "control.payStcPhoneLabel": "STC Pay मोबाइल नंबर",
  "control.payStcAmountLabel": "राशि (SAR) (वैकल्पिक)",

  // --- ERRORS & CONFIRMS ---
  "error.signInToSave": "अपनी लाइब्रेरी में QR डिज़ाइन सहेजने के लिए कृपया साइन इन करें या खाता बनाएं।",
  "confirm.clearAllScans": "क्या आप निश्चित रूप से सभी स्कैन लॉग साफ़ करना चाहते हैं? इसे वापस नहीं लिया जा सकता।",
  "confirm.deletePreset": "क्या आप निश्चित रूप से इस प्रीसेट को हटाना चाहते हैं?"
};

console.log("Registered direct translations:", Object.keys(translations).length);
