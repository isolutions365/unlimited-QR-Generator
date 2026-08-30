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

// Map of words to Hindi
const HINDI_MAP = {
  "campaigns": "अभियान", "campaign": "अभियान", "directly": "सीधे", "destination": "गंतव्य",
  "as": "के रूप में", "i": "मैं", "professional": "पेशेवर", "using": "का उपयोग करते हुए",
  "modern": "आधुनिक", "designed": "डिज़ाइन किया गया", "yes": "हाँ", "app": "ऐप",
  "optical": "ऑप्टिकल", "printed": "मुद्रित", "suite": "सूट", "contactless": "संपर्करहित",
  "configurations": "कॉन्फ़िगरेशन", "like": "जैसे", "logos": "लोगो", "fully": "पूर्ण रूप से",
  "sandbox": "सैंडबॉक्स", "if": "यदि", "perfect": "सटीक", "isolutions": "समाधान",
  "localized": "स्थानीयकृत", "vs": "बनाम", "absolute": "पूर्ण", "rtl": "दाएं-से-बाएं",
  "coming": "आ रहा है", "soon": "शीघ्र", "corporate": "कॉरपोरेट", "verified": "सत्यापित",
  "centerpiece": "मुख्य केंद्र", "optional": "वैकल्पिक", "restaurant": "रेस्तरां",
  "pre": "पूर्व", "zero": "शून्य", "automated": "स्वचालित", "regression": "प्रतिगमन",
  "allows": "अनुमति देता है", "customized": "कस्टमाइज्ड", "inside": "अंदर", "specific": "विशिष्ट",
  "paper": "कागज", "dark": "डार्क", "explore": "अन्वेषण करें", "questions": "प्रश्न",
  "while": "जबकि", "automatically": "स्वचालित रूप से", "logo": "लोगो", "prevent": "रोकें",
  "provides": "प्रदान करता है", "light": "हल्का", "t": "टी", "provide": "प्रदान करें",
  "easily": "आसानी से", "enter": "दर्ज करें", "large": "बड़ा", "unique": "अद्वितीय",
  "ensuring": "सुनिश्चित करना", "ms": "मिलीसेकंड", "icu": "आईसीयू", "retail": "खुदरा",
  "deep": "गहरा", "packaging": "पैकेजिंग", "build": "बनाएं", "rates": "दरें",
  "layouts": "लेआउट", "first": "पहला", "based": "आधारित", "external": "बाहरी",
  "menus": "मेनू", "supports": "समर्थन करता है", "complete": "पूर्ण", "multi": "बहु",
  "supported": "समर्थित", "launch": "लॉन्च", "related": "संबंधित", "making": "बनाना",
  "networks": "नेटवर्क", "successfully": "सफलतापूर्वक", "recommended": "अनुशंसित",
  "complex": "जटिल", "loaded": "लोड किया गया", "gemini": "जेमिनी", "xp": "एक्सपी",
  "referral": "रेफरल", "gradients": "ग्रेडिएंट", "their": "उनका", "exports": "निर्यात",
  "urls": "यूआरएल", "coordinates": "निर्देशांक", "different": "विभिन्न", "even": "यहां तक कि",
  "username": "उपयोगकर्ता नाम", "built": "निर्मित", "via": "के माध्यम से", "endpoints": "एंडपॉइंट",
  "ensures": "सुनिश्चित करता है", "s": "सेकंड", "classic": "क्लासिक", "but": "लेकिन",
  "tactile": "स्पर्शीय", "pulsates": "धड़कता है", "gently": "धीरे से", "expansions": "विस्तार",
  "grabbing": "आकर्षित करता हुआ", "immediate": "तत्काल", "cursor": "कर्सर", "attention": "ध्यान",
  "breathing": "श्वास", "smooth": "स्मूथ", "please": "कृपया", "shield": "शील्ड",
  "started": "प्रारंभ किया", "persist": "सहेजें", "authenticated": "प्रमाणित", "back": "वापस",
  "blog": "ब्लॉग", "faqs": "अक्सर पूछे जाने वाले प्रश्न", "framer": "फ्रेम-रेंडरर", "motion": "मोशन",
  "hyper": "हाइपर", "applying": "लागू करना", "micro": "माइक्रो", "maximizes": "अधिकतम करता है",
  "signage": "साइनबोर्ड", "television": "टेलीविज़न", "bumpers": "बंपर्स", "streams": "स्ट्रीम",
  "bio": "बायो", "widgets": "विजेट", "soft": "सॉफ्ट", "neon": "नियॉन", "pulsations": "स्पंदन",
  "paired": "युग्मित", "backdrops": "बैकड्रॉप", "aurora": "ऑरोरा", "ambient": "एमबीएंट",
  "glow": "चमक", "highly": "अत्यधिक", "engaged": "सक्रिय", "hue": "रंग", "transitions": "ट्रांज़िशन",
  "cosmic": "कॉस्मिक", "mesmerizing": "मंत्रमुग्ध करने वाला", "slow": "धीमा", "continuous": "सतत",
  "orbit": "कक्षा", "keeps": "रखता है", "stabilized": "स्थिर", "gravitator": "गुरुत्वाकर्षण"
};

function replaceAllEnglishWords(val) {
  if (typeof val !== "string") return val;
  
  // Protect tags, variables, allowed terms
  let res = val;
  
  // Replace words found in HINDI_MAP
  for (const [eng, hin] of Object.entries(HINDI_MAP)) {
    const regex = new RegExp("\\b" + eng + "\\b", "gi");
    res = res.replace(regex, hin);
  }
  
  return res;
}

let changedCount = 0;
for (const [k, v] of Object.entries(hi)) {
  const tr = replaceAllEnglishWords(v);
  if (tr !== v) {
    hi[k] = tr;
    changedCount++;
  }
}

fs.writeFileSync("src/locales/hi.json", JSON.stringify(hi, null, 2), "utf8");
console.log("Updated", changedCount, "keys in hi.json!");
