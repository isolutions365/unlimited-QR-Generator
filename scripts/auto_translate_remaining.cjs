const fs = require("fs");
const hi = JSON.parse(fs.readFileSync("src/locales/hi.json", "utf8"));
const en = JSON.parse(fs.readFileSync("src/locales/en.json", "utf8"));

const ALLOWED_EXACT = new Set([
  "QR", "PNG", "SVG", "PDF", "JPEG", "JPG", "WEBP", "EPS", "CSS", "HTML",
  "URL", "URI", "API", "WIFI", "WI-FI", "VCARD", "VCARDS", "MECARD", "EPC",
  "EAN", "UPC", "EAN-13", "EAN-8", "UPC-A", "UPC-E", "CODE128", "CODE39", "CODE",
  "ITF", "ITF-14", "MSI", "PLESSEY", "DATAMATRIX", "PDF417", "AZTEC", "CODABAR",
  "ID", "UUID", "OS", "IOS", "ANDROID", "GOOGLE", "APPLE", "WALLET", "SMS", "G",
  "EMAIL", "GPS", "SKU", "ASCII", "ISO", "GS1", "FREEQRBARCODES.COM", "SEO", "CRM", "RTL",
  "FREEQRGEN.PRO", "FREEQRGEN", "FREEQRBARCODES", "PRO", "COM", "SAAS", "AI",
  "WHATSAPP", "TWITTER", "FACEBOOK", "LINKEDIN", "INSTAGRAM", "LOCALSTORAGE", "ISOLUTIONSICO",
  "ISOLUTIONSICO.COM", "ICO", "K", "M", "B",
  "YOUTUBE", "TIKTOK", "ZOOM", "SKYPE", "TELEGRAM", "VIBER", "PAYPAL", "STRIPE",
  "SEPA", "IBAN", "BIC", "SWIFT", "JSON", "CSV", "XLSX", "ZIP", "HTTP", "HTTPS",
  "WWW", "A4", "A3", "A5", "EPSON", "ZEBRA", "DPI", "CMYK", "RGB", "TLS", "SQL", "POS",
  "A", "B", "C", "D", "E", "F", "Z", "X", "Y"
]);

// Special pattern replacements
function fixPatterns(val) {
  if (typeof val !== "string") return val;
  let res = val;
  res = res.replace(/(\d+)\s*s\b/g, "$1 सेकंड");
  res = res.replace(/(\d+)\s*ms\b/g, "$1 मिलीसेकंड");
  res = res.replace(/(\d+)\s*K\+/g, "$1 हज़ार+");
  res = res.replace(/\bimplement\b/gi, "लागू करें");
  res = res.replace(/\bICO\b/gi, "आईको");
  return res;
}

function getRealUntranslatedWords(val) {
  if (typeof val !== "string") return [];
  let stripped = val.replace(/\{\{[^}]+\}\}/g, "").replace(/\{[^}]+\}/g, "").replace(/<[^>]+>/g, "");
  const words = stripped.match(/[a-zA-Z]+/g) || [];
  return words.filter(w => !ALLOWED_EXACT.has(w.toUpperCase()));
}

let modified = 0;
for (const [k, v] of Object.entries(hi)) {
  if (typeof v !== "string") continue;
  let newVal = fixPatterns(v);
  if (newVal !== v) {
    hi[k] = newVal;
    modified++;
  }
}

fs.writeFileSync("src/locales/hi.json", JSON.stringify(hi, null, 2), "utf8");
console.log("Updated pattern fixes in", modified, "keys in hi.json!");
