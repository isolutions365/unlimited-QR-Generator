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

# Comprehensive section translation maps
SECTION_TRANSLATIONS = {
    # ANALYTICS
    "analytics.platformsDesc": "डिज़ाइन को डिकोड करने के लिए उपयोग की जाने वाली डिवाइस प्रोफ़ाइल।",
    "analytics.platformsTitle": "क्लाइंट प्लेटफ़ॉर्म विवरण",
    "analytics.statDistinct": "विशिष्ट क्लाइंट यूज़र-एजेंट्स",
    "analytics.statGrade": "वैश्विक रूपांतरण ग्रेड",
    "analytics.statScans": "कुल अभियान स्कैन क्लिक्स",
    "analytics.streamDesc": "सफल क्लाइंट पुनर्निर्देशन का रियल-टाइम टेलीमेट्री डेटा।",
    "analytics.streamTitle": "स्कैन लॉग ट्रैकिंग स्ट्रीम",

    # ANIMATIONS
    "animations.canvasDesc": "सक्रिय फ्रैमर मोशन हार्डवेयर परतों के साथ लाइव सिमुलेशन।",
    "animations.canvasTitle": "डायनेमिक एनिमेटेड कैनवास",
    "animations.deploy.instore.desc": "कंटेनर के नीचे स्पष्ट निर्देशों के साथ कस्टम ब्रीथिंग स्केल जोड़ें।",
    "animations.deploy.instore.title": "इन-स्टोर स्क्रीन",
    "animations.deploy.stream.desc": "कोड की पठनीयता बनाए रखने के लिए कम घूर्णन मानों के साथ कोनों पर रखें।",
    "animations.deploy.stream.title": "स्ट्रीम ओवरले",
    "animations.deploy.tv.desc": "दर्शकों को आकर्षित करने के लिए उच्च रंग कंट्रास्ट और 10-सेकंड की पुनरावृत्ति पाश (लूप) सुनिश्चित करें।",
    "animations.deploy.tv.title": "टेलीविज़न विज्ञापन",
    "animations.title": "एनिमेशन और ट्रांज़िशन",
    "animations.desc": "अपने QR कोड के लिए सहज एनिमेशन और विज़ुअल प्रभाव चुनें।",

    # COMPANY
    "company.title": "हमारे बारे में और कंपनी मिशन",
    "company.subtitle": "बिना किसी सीमा के संपर्क रहित तकनीक और मुफ़्त QR बारकोड जनरेशन का भविष्य तैयार करना।",

    # CONTROL
    "control.title": "कंट्रोल पैनल और डिज़ाइन सेटिंग्स",
    "control.subtitle": "अपने QR कोड के रंगों, आकृतियों, लोगो और पेलोड को कस्टमाइज़ करें।",

    # ENTERPRISE
    "enterprise.title": "एंटरप्राइज समाधान और सुरक्षा",
    "enterprise.subtitle": "उच्च प्रदर्शन वाले व्यवसायों के लिए समर्पित अवसंरचना और कस्टम एकीकरण।"
}

print("Section translations initialized.")
