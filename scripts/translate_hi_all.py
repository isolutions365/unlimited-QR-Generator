import json
import re

with open("src/locales/en.json", "r", encoding="utf-8") as f:
    en_data = json.load(f)

with open("src/locales/hi.json", "r", encoding="utf-8") as f:
    hi_data = json.load(f)

ALLOWED_EXACT = {
    "QR", "PNG", "SVG", "PDF", "JPEG", "JPG", "WEBP", "EPS", "CSS", "HTML",
    "URL", "URI", "API", "WIFI", "WI-FI", "VCARD", "VCARDS", "MECARD", "EPC",
    "EAN", "UPC", "EAN-13", "EAN-8", "UPC-A", "UPC-E", "CODE128", "CODE39", "CODE",
    "ITF", "ITF-14", "MSI", "PLESSEY", "DATAMATRIX", "PDF417", "AZTEC", "CODABAR",
    "ID", "UUID", "OS", "IOS", "ANDROID", "GOOGLE", "APPLE", "WALLET", "SMS",
    "EMAIL", "GPS", "SKU", "ASCII", "ISO", "GS1", "FREEQRBARCODES.COM",
    "FREEQRGEN.PRO", "WHATSAPP", "TWITTER", "FACEBOOK", "LINKEDIN", "INSTAGRAM",
    "YOUTUBE", "TIKTOK", "ZOOM", "SKYPE", "TELEGRAM", "VIBER", "PAYPAL", "STRIPE",
    "SEPA", "IBAN", "BIC", "SWIFT", "JSON", "CSV", "XLSX", "ZIP", "HTTP", "HTTPS",
    "WWW", "A4", "A3", "A5", "EPSON", "ZEBRA", "DPI", "CMYK", "RGB", "TLS", "SQL", "POS",
    "A", "B", "C", "D", "E", "F", "Z", "X", "Y"
}

def get_real_untranslated_words(val):
    if not isinstance(val, str):
        return []
    stripped = re.sub(r'\{\{[^}]+\}\}', '', val)
    stripped = re.sub(r'\{[^}]+\}', '', stripped)
    stripped = re.sub(r'<[^>]+>', '', stripped)
    words = re.findall(r'[a-zA-Z]+', stripped)
    return [w for w in words if w.upper() not in ALLOWED_EXACT]

# Extensive phrase and word substitution dictionary
DICTIONARY = [
    # Multi-word phrases
    ("Real-time telemetry of successful clients redirections.", "सफल क्लाइंट पुनर्निर्देशन का रियल-टाइम टेलीमेट्री डेटा।"),
    ("Device profiles used to decode designs.", "डिज़ाइन को डिकोड करने के लिए उपयोग की जाने वाली डिवाइस प्रोफ़ाइल।"),
    ("Client Platform Breakdown", "क्लाइंट प्लेटफ़ॉर्म विवरण"),
    ("Distinct Client User-Agents", "विशिष्ट क्लाइंट यूज़र-एजेंट्स"),
    ("Global Conversion Grade", "वैश्विक रूपांतरण ग्रेड"),
    ("Total Campaign Scan Clicks", "कुल अभियान स्कैन क्लिक्स"),
    ("Scan Log Tracking Stream", "स्कैन लॉग ट्रैकिंग स्ट्रीम"),
    ("Live simulation with active Framer Motion hardware layers", "सक्रिय फ्रैमर मोशन हार्डवेयर परतों के साथ लाइव सिमुलेशन।"),
    ("Dynamic Animated Canvas", "डायनेमिक एनिमेटेड कैनवास"),
    ("Pair custom breathing scale with clear instructions below the container.", "कंटेनर के नीचे स्पष्ट निर्देशों के साथ कस्टम ब्रीथिंग स्केल जोड़ें।"),
    ("In-Store Screens", "इन-स्टोर स्क्रीन"),
    ("Position at corners with low rotation values to maintain code readability.", "कोड की पठनीयता बनाए रखने के लिए कम घूर्णन मानों के साथ कोनों पर रखें।"),
    ("Stream Overlays", "स्ट्रीम ओवरले"),
    ("Ensure high color contrast and a 10s repeat loop for viewer capture.", "दर्शकों को आकर्षित करने के लिए उच्च रंग कंट्रास्ट और 10-सेकंड का दोहराव पाश (लूप) सुनिश्चित करें।"),
    ("Television Ads", "टेलीविज़न विज्ञापन"),

    # Single words and small terms
    (r"\bDevice profiles\b", "डिवाइस प्रोफ़ाइल"),
    (r"\bused to decode designs\b", "डिज़ाइन डिकोड करने के लिए प्रयुक्त"),
    (r"\bClient Platform Breakdown\b", "क्लाइंट प्लेटफ़ॉर्म विवरण"),
    (r"\bDistinct Client\b", "विशिष्ट क्लाइंट"),
    (r"\bGlobal Conversion Grade\b", "वैश्विक रूपांतरण ग्रेड"),
    (r"\bTotal Campaign Scan Clicks\b", "कुल अभियान स्कैन क्लिक्स"),
    (r"\bReal-time telemetry\b", "रियल-टाइम टेलीमेट्री"),
    (r"\bsuccessful clients redirections\b", "सफल क्लाइंट पुनर्निर्देशन"),
    (r"\bScan Log Tracking Stream\b", "स्कैन लॉग ट्रैकिंग स्ट्रीम"),
    (r"\bLive simulation\b", "लाइव सिमुलेशन"),
    (r"\bhardware layers\b", "हार्डवेयर परतें"),
    (r"\bDynamic Animated Canvas\b", "डायनेमिक एनिमेटेड कैनवास"),
    (r"\bIn-Store Screens\b", "इन-स्टोर स्क्रीन"),
    (r"\bStream Overlays\b", "स्ट्रीम ओवरले"),
    (r"\bTelevision Ads\b", "टेलीविज़न विज्ञापन"),
    (r"\bcode readability\b", "कोड पठनीयता"),
    (r"\brepeat loop\b", "दोहराव लूप"),
    (r"\bviewer capture\b", "दर्शक सहभागिता"),
    (r"\bhigh color contrast\b", "उच्च रंग कंट्रास्ट"),

    # Common English words
    (r"\bactive\b", "सक्रिय"),
    (r"\bActive\b", "सक्रिय"),
    (r"\bcustom\b", "कस्टम"),
    (r"\bCustom\b", "कस्टम"),
    (r"\bclear\b", "स्पष्ट"),
    (r"\bClear\b", "स्पष्ट"),
    (r"\binstructions\b", "निर्देश"),
    (r"\bInstructions\b", "निर्देश"),
    (r"\bbelow\b", "नीचे"),
    (r"\bthe\b", "यह"),
    (r"\bcontainer\b", "कंटेनर"),
    (r"\bcorners\b", "कोने"),
    (r"\blow\b", "कम"),
    (r"\brotation\b", "घूर्णन"),
    (r"\bvalues\b", "मान"),
    (r"\bto\b", "को"),
    (r"\bmaintain\b", "बनाए रखें"),
    (r"\bEnsure\b", "सुनिश्चित करें"),
    (r"\bhigh\b", "उच्च"),
    (r"\bcolor\b", "रंग"),
    (r"\bcontrast\b", "कंट्रास्ट"),
    (r"\band\b", "और"),
    (r"\brepeat\b", "पुनरावृत्ति"),
    (r"\bloop\b", "पाश (लूप)"),
    (r"\bfor\b", "के लिए"),
    (r"\bviewer\b", "दर्शक")
]

def translate_str(s):
    if not isinstance(s, str):
        return s
    res = s
    for pat, repl in DICTIONARY:
        if pat.startswith(r"\b"):
            res = re.sub(pat, repl, res, flags=re.IGNORECASE)
        else:
            res = res.replace(pat, repl)
    return res

# Test on hi_data
test_count = 0
for k in en_data.keys():
    en_val = en_data[k]
    hi_val = hi_data.get(k, "")
    words = get_real_untranslated_words(hi_val)
    if len(words) > 0:
        new_val = translate_str(hi_val if hi_val else en_val)
        hi_data[k] = new_val
        test_count += 1

print(f"Applied translation fixes to {test_count} keys.")

with open("src/locales/hi.json", "w", encoding="utf-8") as f:
    json.dump(hi_data, f, ensure_ascii=False, indent=2)

print("Saved updated src/locales/hi.json!")
