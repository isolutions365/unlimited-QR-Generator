const fs = require("fs");
const hi = JSON.parse(fs.readFileSync("src/locales/hi.json", "utf8"));

const ALLOWED_EXACT = new Set([
  "QR", "PNG", "SVG", "PDF", "JPEG", "JPG", "WEBP", "EPS", "CSS", "HTML",
  "URL", "URI", "API", "WIFI", "WI-FI", "VCARD", "VCARDS", "MECARD", "EPC",
  "EAN", "UPC", "EAN-13", "EAN-8", "UPC-A", "UPC-E", "CODE128", "CODE39", "CODE",
  "ITF", "ITF-14", "MSI", "PLESSEY", "DATAMATRIX", "PDF417", "AZTEC", "CODABAR",
  "ID", "UUID", "OS", "IOS", "ANDROID", "GOOGLE", "APPLE", "WALLET", "SMS", "G",
  "EMAIL", "GPS", "SKU", "ASCII", "ISO", "GS1", "FREEQRBARCODES.COM", "SEO", "CRM", "RTL",
  "FREEQRGEN.PRO", "FREEQRGEN", "FREEQRBARCODES", "PRO", "COM", "SAAS", "AI",
  "WHATSAPP", "TWITTER", "FACEBOOK", "LINKEDIN", "INSTAGRAM", "LOCALSTORAGE",
  "YOUTUBE", "TIKTOK", "ZOOM", "SKYPE", "TELEGRAM", "VIBER", "PAYPAL", "STRIPE",
  "SEPA", "IBAN", "BIC", "SWIFT", "JSON", "CSV", "XLSX", "ZIP", "HTTP", "HTTPS",
  "WWW", "A4", "A3", "A5", "EPSON", "ZEBRA", "DPI", "CMYK", "RGB", "TLS", "SQL", "POS",
  "A", "B", "C", "D", "E", "F", "Z", "X", "Y"
]);

// Map of words to Hindi
const MAP = {
  "stay": "रहें", "strategic": "रणनीतिक", "hospitality": "आतिथ्य", "admin": "व्यवस्थापक (एडमिन)",
  "belief": "विश्वास", "don": "डॉन", "boring": "नीरस", "black": "काला", "grids": "ग्रिड",
  "artistic": "कलात्मक", "extensions": "एक्सटेंशन", "identity": "पहचान", "touch": "स्पर्श",
  "question": "प्रश्न", "reach": "पहुंचें", "us": "हमसे", "immediately": "तुरंत",
  "division": "प्रभाग", "inquiry": "पूछताछ", "area": "क्षेत्र", "incoming": "आगमन",
  "inquiries": "पूछताछ", "submissions": "सबमिशन", "kept": "रखा गया", "confidential": "गोपनीय",
  "encrypted": "एनक्रिप्टेड", "inboxes": "इनबॉक्स", "journey": "यात्रा", "body": "निकाय (बॉडी)",
  "subject": "विषय", "june": "जून", "agreements": "समझौते", "businesses": "व्यवसाय",
  "schemas": "स्कीमा", "robust": "मजबूत", "reed": "रीड", "solomon": "सोलोमन",
  "accuracy": "सटीकता", "safely": "सुरक्षित रूप से", "never": "कभी नहीं", "leave": "छोड़ें",
  "developed": "विकसित", "specialize": "विशेषज्ञता", "availability": "उपलब्धता",
  "responsive": "रेस्पॉन्सिव", "ux": "यूएक्स", "aimed": "लक्षित", "accessible": "सुलभ",
  "everyone": "हर कोई", "powered": "संचालित", "detail": "विवरण", "staff": "कर्मचारी",
  "guidance": "मार्गदर्शन", "john": "जॉन", "example": "उदाहरण", "doe": "डो",
  "partnership": "साझेदारी", "beautiful": "सुंदर", "sleek": "स्लीक", "tailored": "अनुकूलित",
  "dots": "डॉट्स", "pristine": "प्राचीन/स्वच्छ", "fit": "फिट", "decoupled": "डिकपल्ड",
  "sandboxes": "सैंडबॉक्स", "mentality": "मानसिकता", "executes": "निष्पादित करता है",
  "securely": "सुरक्षित रूप से", "handling": "हैंडलिंग", "uncompromising": "समझौता न करने वाला",
  "friction": "घर्षण", "triggers": "ट्रिगर", "hardware": "हार्डवेयर", "readers": "रीडर्स",
  "end": "अंत", "experience": "अनुभव", "principles": "सिद्धान्त", "compositions": "संरचनाएं",
  "selections": "चयन", "utilize": "उपयोग करें", "stored": "सहेजा गया", "permanently": "स्थायी रूप से",
  "arbitrary": "यादृच्छिक", "explicit": "स्पष्ट", "tracked": "ट्रैक किया गया", "databases": "डेटाबेस",
  "including": "शामिल है", "metadata": "मेटाडेटा", "timestamp": "समय-स्टाम्प", "etc": "इत्यादि",
  "purely": "शुद्ध रूप से", "compile": "कंपाइल करें", "charts": "चार्ट", "third": "तीसरा",
  "parties": "पक्ष", "s": "सेकंड", "stay": "रहें", "about": "के बारे में", "contact": "संपर्क",
  "faq": "सामान्य प्रश्न", "faqs": "अक्सर पूछे जाने वाले प्रश्न", "privacy": "गोपनीयता",
  "terms": "शर्तें", "policy": "नीति", "cookie": "कुकी", "cookies": "कुकीज़",
  "login": "लॉग इन", "register": "पंजीकरण", "signup": "साइन अप", "sign": "साइन",
  "account": "खाता", "profile": "प्रोफ़ाइल", "dashboard": "डैशबोर्ड", "analytics": "विश्लेषण",
  "history": "इतिहास", "logs": "लॉग", "report": "रिपोर्ट", "reports": "रिपोर्ट",
  "setting": "सेटिंग", "settings": "सेटिंग्स", "home": "मुख्य पृष्ठ", "features": "सुविधाएं",
  "pricing": "मूल्य निर्धारण", "blogs": "ब्लॉग", "blog": "ब्लॉग", "guide": "गाइड",
  "guides": "गाइड", "tools": "उपकरण", "tool": "उपकरण", "generator": "जनरेटर",
  "barcodes": "बारकोड", "barcode": "बारकोड", "scan": "स्कैन", "scans": "स्कैन",
  "scanner": "स्कैनर", "download": "डाउनलोड करें", "print": "प्रिंट करें", "share": "साझा करें",
  "copy": "कॉपी करें", "save": "सहेजें", "edit": "संपादित करें", "delete": "हटाएं",
  "create": "बनाएं", "generate": "जनरेट करें", "update": "अपडेट करें", "cancel": "रद्द करें",
  "close": "बंद करें", "open": "खोलें", "view": "देखें", "preview": "पूर्वावलोकन",
  "search": "खोजें", "filter": "फ़िल्टर", "sort": "क्रमबद्ध करें", "select": "चुनें",
  "apply": "लागू करें", "submit": "सबमिट करें", "send": "भेजें", "get": "प्राप्त करें"
};

function getRealUntranslatedWords(val) {
  if (typeof val !== "string") return [];
  let stripped = val.replace(/\{\{[^}]+\}\}/g, "").replace(/\{[^}]+\}/g, "").replace(/<[^>]+>/g, "");
  const words = stripped.match(/[a-zA-Z]+/g) || [];
  return words.filter(w => !ALLOWED_EXACT.has(w.toUpperCase()));
}

let modifiedCount = 0;
for (const [k, v] of Object.entries(hi)) {
  if (typeof v !== "string") continue;
  let newVal = v;
  const untranslated = getRealUntranslatedWords(v);
  
  if (untranslated.length > 0) {
    untranslated.forEach(word => {
      const lower = word.toLowerCase();
      if (MAP[lower]) {
        const regex = new RegExp("\\b" + word + "\\b", "gi");
        newVal = newVal.replace(regex, MAP[lower]);
      }
    });
  }
  
  if (newVal !== v) {
    hi[k] = newVal;
    modifiedCount++;
  }
}

fs.writeFileSync("src/locales/hi.json", JSON.stringify(hi, null, 2), "utf8");
console.log("Updated", modifiedCount, "keys in hi.json!");
