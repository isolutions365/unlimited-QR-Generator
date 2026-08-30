import fs from "fs";

const en = JSON.parse(fs.readFileSync("src/locales/en.json", "utf8"));
const hi = JSON.parse(fs.readFileSync("src/locales/hi.json", "utf8"));

const ALLOWED_ACRONYMS = new Set([
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

function isPureHindi(val) {
  if (typeof val !== "string") return false;
  const englishWords = val.match(/[a-zA-Z]+/g) || [];
  const nonTechWords = englishWords.filter(w => !ALLOWED_ACRONYMS.has(w.toUpperCase()));
  return nonTechWords.length === 0 && /[\u0900-\u097F]/.test(val);
}

// Comprehensive dictionary for replacing common English terms/phrases in Hindi translations
const replaceMap = [
  // Words & Phrases
  ["Please enter a value to जनरेट करें a बारकोड.", "बारकोड जनरेट करने के लिए कृपया एक मान दर्ज करें।"],
  ["Format validation passed! High physical contrast is ready to render.", "प्रारूप सत्यापन सफल! उच्च भौतिक कंट्रास्ट रेंडर के लिए तैयार है।"],
  ["EAN-13 requires numeric characters only (0-9).", "EAN-13 में केवल संख्यात्मक अंक (0-9) होने चाहिए।"],
  ["EAN-13 requires exactly 12 or 13 digits (Current: {count}). A 12-digit input automatically gets its checksum appended.", "EAN-13 में ठीक 12 या 13 अंक होने चाहिए (वर्तमान: {count})। 12-अंकों का इनपुट स्वतः चेकसम जोड़ता है।"],
  ["UPC-A requires numeric characters only (0-9).", "UPC-A में केवल संख्यात्मक अंक (0-9) होने चाहिए।"],
  ["UPC-A requires exactly 11 or 12 digits (Current: {count}). An 11-digit input automatically gets its checksum appended.", "UPC-A में ठीक 11 या 12 अंक होने चाहिए (वर्तमान: {count})। 11-अंकों का इनपुट स्वतः चेकसम जोड़ता है।"],
  ["CODE39 supports 0-9, A-Z (caps), space, and symbols: - . $ / + %", "CODE39 0-9, A-Z (बड़े अक्षर), स्पेस और प्रतीकों का समर्थन करता है: - . $ / + %"],
  ["CODE128 supports standard 128 ASCII characters only.", "CODE128 केवल मानक 128 ASCII वर्णों का समर्थन करता है।"],
  ["Valid बारकोड format.", "वैध बारकोड प्रारूप।"],
  ["Valid barcode format.", "वैध बारकोड प्रारूप।"],
  
  // Mixed words inside strings
  ["जनरेट करें", "जनरेट करें"],
  ["एनालिटिक्स", "विश्लेषण"],
  ["टेम्प्लेट", "टेम्प्लेट"],
  ["गाइड्स", "गाइड"],
  ["गाइड्ज़", "गाइड"],
  ["गाइड्स", "गाइड"],
  ["प्रोफ़ाइल", "प्रोफ़ाइल"],
  ["एंटरप्राइज", "एंटरप्राइज"],
  ["वेक्टर", "वेक्टर"],
  ["सुरक्षा", "सुरक्षा"],
  ["ज़ीरो-ट्रस्ट", "ज़ीरो-ट्रस्ट"],
  ["क्वाइट ज़ोन", "शांत क्षेत्र"],
  ["शांत क्षेत्र (क्वाइट ज़ोन)", "शांत क्षेत्र"],
  
  // English words to Hindi equivalents
  ["Analytics", "विश्लेषण"],
  ["Client Browser", "क्लाइंट ब्राउज़र"],
  ["Scan Datetime", "स्कैन तिथि एवं समय"],
  ["Approximate Location", "अनुमानित स्थान"],
  ["Platform OS", "ऑपरेटिंग सिस्टम"],
  ["Active & Secured", "सक्रिय और सुरक्षित"],
  ["ACTIVITY ALERTS", "गतिविधि अलर्ट"],
  ["UNREAD", "अपठित"],
  ["All Categories", "सभी श्रेणियां"],
  ["Academic Citations & Reference Papers", "अकादमिक उद्धरण और संदर्भ पत्र"],
  ["A4 Sheet", "A4 शीट"],
  ["A3 Sheet", "A3 शीट"],
  ["A5 Sheet", "A5 Sheet"],
  ["Active Cutlines & Alignment Marks — Hidden in print", "सक्रिय कटलाइन्स और संरेखण निशान — प्रिंट में छिपे हुए"],
  ["Close Modal Windows", "मॉडल विंडो बंद करें"],
  ["Activate Generator", "जनरेटर सक्रिय करें"],
  ["Apply Template Preset", "टेम्प्लेट प्रीसेट लागू करें"],
  ["Home", "मुख्य पृष्ठ"],
  ["Popular QR Code Tools", "लोकप्रिय QR कोड उपकरण"],
  ["WiFi Network Sharing", "वाई-फाई नेटवर्क साझाकरण"],
  ["Color Palette", "रंग पैलेट"],
  ["QR Scannability Checker", "QR स्कैन-क्षमता जांचकर्ता"],
  ["High Performance Directory", "उच्च प्रदर्शन डायरेक्टरी"],
  ["Live Usage Statistics and Trends", "लाइव उपयोग आंकड़े और रुझान"],
  ["Related Free QR Generation Guides", "संबंधित निःशुल्क QR जनरेशन गाइड"],
  ["Please sign in or create an account to save QR designs to your library.", "अपनी लाइब्रेरी में QR डिज़ाइन सहेजने के लिए कृपया साइन इन करें या खाता बनाएं।"],
  ["Are you sure you want to clear all scans logs? This is irreversible.", "क्या आप निश्चित रूप से सभी स्कैन लॉग साफ़ करना चाहते हैं? इसे वापस नहीं लिया जा सकता।"],
  ["None", "कोई नहीं"]
];

console.log("Loaded replace rules.");
