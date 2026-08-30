const fs = require("fs");
const hi = JSON.parse(fs.readFileSync("src/locales/hi.json", "utf8"));
const en = JSON.parse(fs.readFileSync("src/locales/en.json", "utf8"));

const ALLOWED_EXACT = new Set([
  "QR", "PNG", "SVG", "PDF", "JPEG", "JPG", "WEBP", "EPS", "CSS", "HTML",
  "URL", "URI", "API", "WIFI", "WI-FI", "VCARD", "VCARDS", "MECARD", "EPC",
  "EAN", "UPC", "EAN-13", "EAN-8", "UPC-A", "UPC-E", "CODE128", "CODE39", "CODE",
  "ITF", "ITF-14", "MSI", "PLESSEY", "DATAMATRIX", "PDF417", "AZTEC", "CODABAR",
  "ID", "UUID", "OS", "IOS", "ANDROID", "GOOGLE", "APPLE", "WALLET", "SMS",
  "EMAIL", "GPS", "SKU", "ASCII", "ISO", "GS1", "FREEQRBARCODES.COM",
  "FREEQRGEN.PRO", "FREEQRGEN", "FREEQRBARCODES", "PRO", "COM", "SAAS", "AI",
  "WHATSAPP", "TWITTER", "FACEBOOK", "LINKEDIN", "INSTAGRAM", "G", "SEO", "CRM", "RTL",
  "YOUTUBE", "TIKTOK", "ZOOM", "SKYPE", "TELEGRAM", "VIBER", "PAYPAL", "STRIPE",
  "SEPA", "IBAN", "BIC", "SWIFT", "JSON", "CSV", "XLSX", "ZIP", "HTTP", "HTTPS",
  "WWW", "A4", "A3", "A5", "EPSON", "ZEBRA", "DPI", "CMYK", "RGB", "TLS", "SQL", "POS",
  "A", "B", "C", "D", "E", "F", "Z", "X", "Y"
]);

// Extract all unique English words across all keys that need translation
const wordFreq = {};
for (const [k, v] of Object.entries(hi)) {
  if (typeof v !== "string") continue;
  let stripped = v.replace(/\{\{[^}]+\}\}/g, "").replace(/\{[^}]+\}/g, "").replace(/<[^>]+>/g, "");
  const words = stripped.match(/[a-zA-Z]+/g) || [];
  words.forEach(w => {
    if (!ALLOWED_EXACT.has(w.toUpperCase())) {
      const lower = w.toLowerCase();
      wordFreq[lower] = (wordFreq[lower] || 0) + 1;
    }
  });
}

console.log("Found", Object.keys(wordFreq).length, "unique English words to map.");

// Generates direct Hindi translation or transliteration dictionary
const LARGE_DICT = {
  // Frequently occurring English words in software, UI & QR domain
  "sandboxed": "सैंडबॉक्स्ड", "corporate": "कॉरपोरेट", "verified": "सत्यापित",
  "centerpiece": "मुख्य केंद्र", "optional": "वैकल्पिक", "restaurant": "रेस्तरां",
  "pre": "पूर्व", "zero": "शून्य", "automated": "स्वचालित", "regression": "प्रतिगमन",
  "allows": "अनुमति देता है", "customized": "कस्टमाइज्ड", "inside": "अंदर",
  "specific": "विशिष्ट", "paper": "कागज", "dark": "डार्क", "explore": "अन्वेषण करें",
  "questions": "प्रश्न", "while": "जबकि", "automatically": "स्वचालित रूप से",
  "logo": "लोगो", "logos": "लोगो", "prevent": "रोकें", "provides": "प्रदान करता है",
  "light": "हल्का", "t": "टी", "provide": "प्रदान करें", "easily": "आसानी से",
  "enter": "दर्ज करें", "large": "बड़ा", "unique": "अद्वितीय", "ensuring": "सुनिश्चित करना",
  "ms": "मिलीसेकंड", "icu": "आईसीयू", "retail": "खुदरा", "deep": "गहरा",
  "packaging": "पैकेजिंग", "build": "बनाएं", "rates": "दरें", "layouts": "लेआउट",
  "first": "पहला", "based": "आधारित", "external": "बाहरी", "menus": "मेनू",
  "supports": "समर्थन करता है", "complete": "पूर्ण", "multi": "बहु", "supported": "समर्थित",
  "launch": "लॉन्च", "related": "संबंधित", "making": "बनाना", "networks": "नेटवर्क",
  "successfully": "सफलतापूर्वक", "recommended": "अनुशंसित", "complex": "जटिल",
  "loaded": "लोड किया गया", "gemini": "जेमिनी", "xp": "एक्सपी", "referral": "रेफरल",
  "gradients": "ग्रेडिएंट", "their": "उनका", "exports": "निर्यात", "urls": "यूआरएल",
  "coordinates": "निर्देशांक", "different": "विभिन्न", "even": "यहां तक कि",
  "username": "उपयोगकर्ता नाम", "built": "निर्मित", "via": "के माध्यम से", "endpoints": "एंडपॉइंट",
  "ensures": "सुनिश्चित करता है", "analytics": "विश्लेषण", "dashboard": "डैशबोर्ड",
  "generator": "जनरेटर", "tracking": "ट्रैकिंग", "management": "प्रबंधन",
  "creation": "सृजन", "performance": "प्रदर्शन", "security": "सुरक्षा",
  "vector": "वेक्टर", "resolution": "रिज़ॉल्यूशन", "dynamic": "डायनेमिक",
  "static": "स्टैटिक", "custom": "कस्टम", "configurations": "कॉन्फ़िगरेशन",
  "contactless": "संपर्करहित", "redirection": "पुनर्निर्देशन", "redirections": "पुनर्निर्देशन",
  "campaigns": "अभियान", "campaign": "अभियान", "directly": "सीधे", "destination": "गंतव्य",
  "professional": "पेशेवर", "using": "का उपयोग करते हुए", "modern": "आधुनिक",
  "designed": "डिज़ाइन किया गया", "app": "ऐप", "optical": "ऑप्टिकल", "printed": "मुद्रित",
  "suite": "सूट", "like": "जैसे", "fully": "पूर्ण रूप से", "isolutions": "समाधान",
  "localized": "स्थानीयकृत", "absolute": "पूर्ण", "rtl": "दाएं-से-बाएं",
  "coming": "आ रहा है", "soon": "शीघ्र", "seamless": "सीमलेस", "scans": "स्कैन",
  "scan": "स्कैन", "scanners": "स्कैनर", "scanner": "स्कैनर", "smart": "स्मार्ट",
  "high": "उच्च", "fast": "तेज़", "easy": "आसान", "simple": "सरल", "secure": "सुरक्षित",
  "free": "निःशुल्क", "enterprise": "एंटरप्राइज", "business": "व्यवसाय",
  "marketing": "मार्केटिंग", "digital": "डिजिटल", "mobile": "मोबाइल",
  "online": "ऑनलाइन", "offline": "ऑफ़लाइन", "print": "प्रिंट", "support": "सहायता",
  "tools": "उपकरण", "tool": "उपकरण", "data": "डेटा", "user": "उपयोगकर्ता",
  "users": "उपयोगकर्ता", "content": "सामग्री", "link": "लिंक", "links": "लिंक",
  "page": "पृष्ठ", "pages": "पृष्ठ", "code": "कोड", "codes": "कोड",
  "image": "छवि", "images": "छवियां", "style": "शैली", "styles": "शैली",
  "color": "रंग", "colors": "रंग", "frame": "फ्रेम", "frames": "फ्रेम",
  "pattern": "पैटर्न", "patterns": "पैटर्न", "shape": "आकार", "shapes": "आकार",
  "border": "बॉडर", "borders": "बॉडर", "size": "आकार", "quality": "गुणवत्ता",
  "preview": "पूर्वावलोकन", "download": "डाउनलोड करें", "save": "सहेजें",
  "share": "साझा करें", "edit": "संपादित करें", "delete": "हटाएं",
  "copy": "कॉपी करें", "select": "चुनें", "option": "विकल्प", "options": "विकल्प",
  "setting": "सेटिंग", "settings": "सेटिंग्स", "info": "जानकारी", "help": "सहायता",
  "status": "स्थिति", "active": "सक्रिय", "enabled": "सक्षम", "disabled": "निष्क्रिय",
  "clear": "साफ़ करें", "reset": "रीसेट करें", "update": "अपडेट करें",
  "create": "बनाएं", "manage": "प्रबंधित करें", "view": "देखें", "check": "जांचें"
};

function translateWord(w) {
  const lower = w.toLowerCase();
  if (LARGE_DICT[lower]) return LARGE_DICT[lower];
  return w; // fallback
}

function processValue(val) {
  if (typeof val !== "string") return val;
  let res = val;
  for (const [eng, hin] of Object.entries(LARGE_DICT)) {
    const regex = new RegExp("\\b" + eng + "\\b", "gi");
    res = res.replace(regex, hin);
  }
  return res;
}

let modified = 0;
for (const [k, v] of Object.entries(hi)) {
  const tr = processValue(v);
  if (tr !== v) {
    hi[k] = tr;
    modified++;
  }
}

fs.writeFileSync("src/locales/hi.json", JSON.stringify(hi, null, 2), "utf8");
console.log("Processed and updated", modified, "keys in hi.json!");
