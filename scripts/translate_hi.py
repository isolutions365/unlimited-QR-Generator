import json
import re

with open("src/locales/en.json", "r", encoding="utf-8") as f:
    en_data = json.load(f)

with open("src/locales/hi.json", "r", encoding="utf-8") as f:
    hi_data = json.load(f)

ALLOWED_ACRONYMS = {
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
}

def get_english_words(val):
    if not isinstance(val, str):
        return []
    words = re.findall(r'[a-zA-Z]+', val)
    return [w for w in words if w.upper() not in ALLOWED_ACRONYMS]

def is_pure_hindi(val):
    if not isinstance(val, str):
        return False
    eng = get_english_words(val)
    return len(eng) == 0 and bool(re.search(r'[\u0900-\u097F]', val))

# Complete dictionary of direct translations for common & domain specific keys
TRANSLATION_MAP = {
    # NAV & GENERAL
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

    # FOOTER & UI
    "footer.aboutUs": "हमारे बारे में",
    "footer.whyUs": "हमें क्यों चुनें?",
    "footer.privacyPolicy": "गोपनीयता नीति",
    "footer.termsOfService": "सेवा की शर्तें",
    "footer.contactUs": "संपर्क करें",
    "footer.rights": "सभी अधिकार सुरक्षित हैं © {{year}} FreeQRGen.pro",
    "ui.back": "वापस जाएं",
    "common.none": "कोई नहीं",

    # BARCODE
    "barcode.valEmpty": "बारकोड जनरेट करने के लिए कृपया एक मान दर्ज करें।",
    "barcode.valEanDigits": "EAN-13 में केवल संख्यात्मक अंक (0-9) होना आवश्यक है।",
    "barcode.valEanLen": "EAN-13 में ठीक 12 या 13 अंक होने चाहिए (वर्तमान: {count})। 12-अंकों का इनपुट स्वतः ही अपनी चेकसम संख्या जोड़ लेता है।",
    "barcode.valUpcDigits": "UPC-A में केवल संख्यात्मक अंक (0-9) होना आवश्यक है।",
    "barcode.valUpcLen": "UPC-A में ठीक 11 या 12 अंक होने चाहिए (वर्तमान: {count})। 11-अंकों का इनपुट स्वतः ही अपनी चेकसम संख्या जोड़ लेता है।",
    "barcode.valCode39Chars": "CODE39 0-9, A-Z (बड़े अक्षर), स्पेस और प्रतीकों का समर्थन करता है: - . $ / + %",
    "barcode.valCode128Ascii": "CODE128 केवल मानक 128 ASCII वर्णों का समर्थन करता है।",
    "barcode.passedValidation": "प्रारूप सत्यापन सफल! उच्च भौतिक कंट्रास्ट रेंडर के लिए तैयार है।",
    "barcode.validFormat": "वैध बारकोड प्रारूप।",

    # BLOG
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

    # ANALYTICS
    "analytics.colBrowser": "क्लाइंट ब्राउज़र",
    "analytics.colDatetime": "स्कैन समय और तिथि",
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

    # AUTH
    "auth.accessRestrictedDesc": "कृपया इस सुविधा तक पहुँचने के लिए अपने खाते में लॉग इन करें।",
    "auth.signInSignUpButton": "साइन इन / खाता बनाएं",

    # CONTROL
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

    # ERRORS & CONFIRMS
    "error.signInToSave": "अपनी लाइब्रेरी में QR डिज़ाइन सहेजने के लिए कृपया साइन इन करें या खाता बनाएं।",
    "confirm.clearAllScans": "क्या आप निश्चित रूप से सभी स्कैन लॉग साफ़ करना चाहते हैं? इसे वापस नहीं लिया जा सकता।",
    "confirm.deletePreset": "क्या आप निश्चित रूप से इस प्रीसेट को हटाना चाहते हैं?",

    # SEARCH & HUB
    "kb.allCategories": "सभी श्रेणियां",
    "knowledge.aiSummaryTitle": "AI खोज इंजन कोर संश्लेषण बॉक्स",
    "mockup.activeScanning": "स्कैनिंग कैमरा सक्रिय",
    "tour.skip": "टूर छोड़ें",
    "status.connected": "कनेक्टेड",
    "palette.bgColorLabel": "बैकग्राउंड कैनवास का रंग",
    "preview.a4Sheet": "A4 शीट",
    "preview.a3Sheet": "A3 शीट",
    "preview.a5Sheet": "A5 शीट",
    "print.activeAlignmentMarks": "सक्रिय कटलाइन्स और संरेखण निशान — प्रिंट में छिपे हुए",
    "programmatic.authorName": "FreeQRGen.pro संपादकीय बोर्ड",
    "saved.allCount": "सभी ({count})",
    "seo.aestheticOptimization": "सौंदर्य अनुकूलन (एस्थेटिक ऑप्टिमाइज़ेशन)",
    "shortcuts.close": "मॉडल विंडो बंद करें",
    "templates.activateGenerator": "जनरेटर सक्रिय करें",
    "templatesHub.allCategories": "सभी श्रेणियां",
    "templatesTab.applyBtn": "टेम्प्लेट प्रीसेट लागू करें",
    "vision.ready": "तैयार",
    "landing.home": "मुख्य पृष्ठ",
    "home.popularQrTools": "लोकप्रिय QR कोड उपकरण",
    "tools.wifi.title": "वाई-फाई नेटवर्क साझाकरण",
    "colorPalette.title": "रंग पैलेट",
    "scannability.title": "QR स्कैन-क्षमता जांचकर्ता",
    "directory.badge": "उच्च प्रदर्शन डायरेक्टरी",
    "recent.badge": "लाइव उपयोग आंकड़े और रुझान",
    "guides.title": "संबंधित निःशुल्क QR जनरेशन गाइड"
}

# Comprehensive dictionary mapping for words/phrases in English
WORD_MAP = {
    "Generator": "जनरेटर",
    "Station": "स्टेशन",
    "Analytics": "विश्लेषण",
    "Overview": "अवलोकन",
    "Dashboard": "डैशबोर्ड",
    "Settings": "सेटिंग्स",
    "Configuration": "कॉन्फ़िगरेशन",
    "Security": "सुरक्षा",
    "Verification": "सत्यापन",
    "Validation": "वैधता जाँच",
    "Resolution": "रिज़ॉल्यूशन",
    "High Contrast": "उच्च कंट्रास्ट",
    "Vector Quality": "वेक्टर गुणवत्ता",
    "Download": "डाउनलोड करें",
    "Export": "निर्यात करें",
    "Import": "आयात करें",
    "Enterprise": "एंटरप्राइज",
    "Solutions": "समाधान",
    "Template": "टेम्प्लेट",
    "Templates": "टेम्प्लेट",
    "Preview": "पूर्वावलोकन",
    "Active": "सक्रिय",
    "Disabled": "निष्क्रिय",
    "Enabled": "सक्षम",
    "Copy": "कॉपी करें",
    "Copied": "कॉपी किया गया",
    "Save": "सहेजें",
    "Delete": "हटाएं",
    "Edit": "संपादित करें",
    "Cancel": "रद्द करें",
    "Confirm": "पुष्टि करें",
    "Close": "बंद करें",
    "Back": "वापस",
    "Next": "आगे",
    "Submit": "सबमिट करें",
    "Search": "खोजें",
    "Category": "श्रेणी",
    "Categories": "श्रेणियां",
    "Description": "विवरण",
    "Title": "शीर्षक",
    "Name": "नाम",
    "Email": "ईमेल",
    "Phone": "फ़ोन",
    "Address": "पता",
    "Website": "वेबसाइट",
    "Logo": "लोगो",
    "Color": "रंग",
    "Background": "पृष्ठभूमि",
    "Foreground": "अग्रभूमि",
    "Frame": "फ्रेम",
    "Margin": "मार्जिन",
    "Height": "ऊंचाई",
    "Width": "चौड़ाई",
    "Thickness": "मोटाई",
    "Size": "आकार",
    "Quiet Zone": "शांत क्षेत्र",
    "Silent Zone": "शांत क्षेत्र",
    "Error Correction": "त्रुटि सुधार",
    "Correction": "सुधार",
    "Level": "स्तर",
    "Payload": "पेलोड",
    "Dynamic": "डायनेमिक",
    "Static": "स्टैटिक",
    "Customization": "कस्टमाइजेशन",
    "Scanning": "स्कैनिंग",
    "Scannability": "स्कैन-क्षमता",
    "Workspace": "कार्यस्थान",
    "Team": "टीम",
    "Collaboration": "सहयोग",
    "Integration": "एकीकरण",
    "Webhook": "वेबहुक",
    "Domain": "डोमेन",
    "Redirect": "पुनर्निर्देशन",
    "Logs": "लॉग्स",
    "Metrics": "मीट्रिक",
    "Subscription": "सदस्यता",
    "Plan": "योजना",
    "Unlimited": "असीमित",
    "Free": "निःशुल्क",
    "Guides": "गाइड",
    "Guide": "गाइड",
    "Directory": "डायरेक्टरी",
    "Recent": "हाल की",
    "Popular": "लोकप्रिय",
    "Tools": "उपकरण",
    "Tool": "उपकरण",
    "Preset": "प्रीसेट",
    "Presets": "प्रीसेट",
    "Sheet": "शीट",
    "Print": "प्रिंट",
    "Academic": "अकादमिक",
    "Citations": "उद्धरण",
    "Reference": "संदर्भ",
    "Papers": "कागजात",
    "Board": "बोर्ड",
    "Editorial": "संपादकीय",
    "System": "सिस्टम",
    "Architecture": "वास्तुकला",
    "Infrastructure": "अवसंरचना",
    "Network": "नेटवर्क",
    "Local": "स्थानीय",
    "Global": "वैश्विक",
    "Standard": "मानक",
    "Custom": "कस्टम",
    "Performance": "प्रदर्शन",
    "Optimization": "अनुकूलन",
    "Aesthetic": "सौंदर्य"
}

def translate_mixed_text(text):
    if not isinstance(text, str):
        return text
    result = text
    for eng, hin in WORD_MAP.items():
        pattern = r'\b' + re.escape(eng) + r'\b'
        result = re.sub(pattern, hin, result, flags=re.IGNORECASE)
    return result

# Function to clean and produce natural Hindi translation for key
def process_key(k, hi_val, en_val):
    if k in TRANSLATION_MAP:
        return TRANSLATION_MAP[k]
    
    if is_pure_hindi(hi_val):
        # Check if there are mixed words inside hi_val
        cleaned = translate_mixed_text(hi_val)
        return cleaned

    # Otherwise translate based on hi_val or en_val
    source = hi_val if hi_val else en_val
    cleaned = translate_mixed_text(source)
    return cleaned

print("Translation script processor initialized.")
