import json
import re

# Let's construct the canonical 80 WiFi keys in English:

en_wifi_keys = {
    # SEO Basic (10 keys)
    "seo.landing.wifi-qr-generator.seoTitle": "Free WiFi QR Code Generator | Connect Without Typing the Password",
    "seo.landing.wifi-qr-generator.metaDescription": "Generate customized WiFi QR codes with our free WiFi QR code generator. Allow guests to scan and connect to your local network without typing the password.",
    "seo.landing.wifi-qr-generator.keyword": "free wifi qr code generator",
    "seo.landing.wifi-qr-generator.h1": "Free WiFi QR Code Generator",
    "seo.landing.wifi-qr-generator.intro.title": "Instant Wireless Network Pairing via Static WiFi QR Codes",
    "seo.landing.wifi-qr-generator.intro.text1": "Connecting to wireless networks by manually typing long alphanumeric passwords is slow and prone to typographical errors. Our free WiFi QR code generator compiles your network name (SSID), security protocol, and password into a standardized static QR string (such as WIFI:S:GuestLounge_5G;T:WPA;P:SamplePass789;H:false;;). When scanned by a compatible smartphone camera or barcode scanner, supported operating systems and apps can parse the payload and display a prompt to join the network.",
    "seo.landing.wifi-qr-generator.intro.text2": "Because static WiFi QR codes store fixed network parameters directly within the visual matrix, data processing occurs entirely in client memory during creation and locally on the scanning device—no network names or passwords are sent to or hosted on our servers. The code has no built-in expiry timer and remains usable as long as the router credentials match and the printed graphic remains legible.",
    "seo.landing.wifi-qr-generator.intro.highlight": "Static client-side encoding. Fixed network parameters stored directly in the matrix without intermediary servers.",
    "seo.landing.wifi-qr-generator.benefits.title": "Core Capabilities and Technical Specifications",
    "seo.landing.wifi-qr-generator.benefits.desc": "Understand the payload structure, supported encryption modes, and operational characteristics of static WiFi QR codes.",

    # Benefits Items (5 items = 10 keys)
    "seo.landing.wifi-qr-generator.benefits.items.0.title": "Frictionless Guest Network Onboarding",
    "seo.landing.wifi-qr-generator.benefits.items.0.desc": "Eliminates manual password entry and character confusion. Compatible devices and scanner applications parse the payload to display a local network join prompt.",
    "seo.landing.wifi-qr-generator.benefits.items.1.title": "Standardized Protocol Schemas",
    "seo.landing.wifi-qr-generator.benefits.items.1.desc": "Supports standard Wi-Fi syntax for WPA/WPA2/WPA3 Personal (T:WPA), legacy WEP (T:WEP), and Open unencrypted networks (T:nopass).",
    "seo.landing.wifi-qr-generator.benefits.items.2.title": "Local Client-Side Generation & Privacy",
    "seo.landing.wifi-qr-generator.benefits.items.2.desc": "Network credentials never leave your browser. The QR code matrix is calculated locally in memory without transmitting SSIDs or passwords to any backend service.",
    "seo.landing.wifi-qr-generator.benefits.items.3.title": "Custom Design & Vector Print Quality",
    "seo.landing.wifi-qr-generator.benefits.items.3.desc": "Personalize foreground dots, background colors, and corner markers. Export high-resolution PNG, SVG vector, or PDF files for clean printing at various dimensions.",
    "seo.landing.wifi-qr-generator.benefits.items.4.title": "Fixed Data with No Expiry Timer",
    "seo.landing.wifi-qr-generator.benefits.items.4.desc": "Static WiFi QR codes store fixed text data without built-in expiration timers or cloud redirect dependencies. They remain valid as long as physical legibility and router settings persist.",

    # Features (2 keys + 5 items = 12 keys)
    "seo.landing.wifi-qr-generator.features.title": "Technical Architecture, Security & Device Compatibility",
    "seo.landing.wifi-qr-generator.features.desc": "Technical considerations regarding scanner permissions, payload readability, and encryption standards.",
    "seo.landing.wifi-qr-generator.features.items.0.title": "Device- and App-Dependent Connection Prompts",
    "seo.landing.wifi-qr-generator.features.items.0.desc": "Native camera apps and operating systems (such as modern iOS and Android builds) typically present a confirmation banner before connecting to a network. However, exact prompt behavior and network configuration permissions vary across device vendors and third-party scanning apps.",
    "seo.landing.wifi-qr-generator.features.items.1.title": "WPA2/WPA3 Transition Network Compatibility",
    "seo.landing.wifi-qr-generator.features.items.1.desc": "The generator outputs standard T:WPA schema, which is widely recognized across WPA2-PSK and mixed WPA2/WPA3 Personal (Transition Mode) networks. Pure WPA3-SAE-only compatibility is not guaranteed by the T:WPA tag alone and depends on individual scanner implementations and OS network stacks.",
    "seo.landing.wifi-qr-generator.features.items.2.title": "Hidden SSID Flag (H:true)",
    "seo.landing.wifi-qr-generator.features.items.2.desc": "When configuring a non-broadcasting network, the generator appends H:true to the payload (e.g., WIFI:S:LabSecureOps;T:WPA;P:HiddenKey456;H:true;;). Compatible scanner software uses this flag when searching for the SSID.",
    "seo.landing.wifi-qr-generator.features.items.3.title": "Plain-Text Matrix vs. Over-the-Air Encryption",
    "seo.landing.wifi-qr-generator.features.items.3.desc": "The WiFi QR code payload stores credentials as unencrypted plain text within the 2D matrix, readable by anyone who scans the barcode. Over-the-air wireless encryption depends entirely on the router security configuration (WPA2/WPA3); unencrypted networks (T:nopass) do not gain encryption simply by using a QR code.",
    "seo.landing.wifi-qr-generator.features.items.4.title": "Fixed Payload Immutability",
    "seo.landing.wifi-qr-generator.features.items.4.desc": "WiFi credentials are baked directly into the printed 2D matrix. If you modify your router password or SSID, the existing static barcode cannot update itself and must be regenerated.",

    # FAQs (8 faqs = 16 keys)
    "seo.landing.wifi-qr-generator.faqs.0.q": "Is this free wifi qr code generator private and local?",
    "seo.landing.wifi-qr-generator.faqs.0.a": "Yes. Matrix calculation runs in your local browser memory. Your SSID and network password are not transmitted to, processed by, or stored on our servers.",
    "seo.landing.wifi-qr-generator.faqs.1.q": "Why does scanning not always connect automatically across all devices?",
    "seo.landing.wifi-qr-generator.faqs.1.a": "Connection behavior depends on operating system versions, device manufacturer configurations, and scanner app capabilities. Most native camera apps display a confirmation prompt before joining a network, while some third-party scanner apps without network configuration permissions may only display the raw text payload.",
    "seo.landing.wifi-qr-generator.faqs.2.q": "Are WiFi QR codes static or dynamic?",
    "seo.landing.wifi-qr-generator.faqs.2.a": "WiFi QR codes are static. The SSID, security protocol, and password are baked directly into the 2D pixel pattern. There is no intermediary server or built-in expiration timer, but changing router credentials requires generating a new code.",
    "seo.landing.wifi-qr-generator.faqs.3.q": "Is the Wi-Fi password protected inside the QR code?",
    "seo.landing.wifi-qr-generator.faqs.3.a": "No. Standard WiFi QR codes encode network credentials as unencrypted plain text (e.g., WIFI:S:SSID;T:WPA;P:PASSWORD;;) within the barcode matrix. Anyone who scans the visual pattern with a standard barcode reader can view the password string. Over-the-air Wi-Fi traffic encryption depends on the router security setting (WPA2/WPA3); unencrypted networks (T:nopass) remain unencrypted.",
    "seo.landing.wifi-qr-generator.faqs.4.q": "Does WPA3 work across all mobile scanners?",
    "seo.landing.wifi-qr-generator.faqs.4.a": "The generator outputs standard T:WPA syntax, which is widely supported on WPA2 and mixed WPA2/WPA3 Personal (Transition Mode) networks. Pure WPA3-SAE-only network parsing is not guaranteed by the T:WPA schema alone and varies across scanner apps and device firmware.",
    "seo.landing.wifi-qr-generator.faqs.5.q": "Will a QR code work for hidden SSIDs?",
    "seo.landing.wifi-qr-generator.faqs.5.a": "When the hidden network flag (H:true) is included, compatible scanner applications and mobile operating systems use this parameter to attempt connection to a non-broadcasting SSID.",
    "seo.landing.wifi-qr-generator.faqs.6.q": "Can a static WiFi QR code update if I change my router password?",
    "seo.landing.wifi-qr-generator.faqs.6.a": "No. Because the credentials are fixed directly in the visual matrix with no intermediary routing server, changing router settings invalidates existing printed codes and requires generating a new one.",
    "seo.landing.wifi-qr-generator.faqs.7.q": "Can I customize the visual styling of my WiFi QR code?",
    "seo.landing.wifi-qr-generator.faqs.7.a": "Yes. You can customize colors, corner markers, dot patterns, and frames, or place a centered icon, while maintaining error correction to support reliable optical scanning.",

    # CTA (3 keys)
    "seo.landing.wifi-qr-generator.cta.title": "Generate Your Custom WiFi QR Code in Real-Time Now",
    "seo.landing.wifi-qr-generator.cta.subtitle": "Create a customized, static wireless network barcode with client-side matrix calculation and vector exports.",
    "seo.landing.wifi-qr-generator.cta.buttonText": "Create WiFi Code",

    # AEO Subtree (29 keys)
    "aeo.landing.wifi-qr-generator.quickDefinition": "A Wi-Fi QR Code is a static 2D matrix barcode that encodes local wireless network configuration parameters (SSID, security protocol, password, and optional hidden flag) using the standard WIFI URI scheme.",
    "aeo.landing.wifi-qr-generator.aiSummary50": "A Wi-Fi QR code is a static 2D barcode storing SSID, security type (WPA/WEP/None), and password. When scanned by compatible devices, supported software can parse the credentials and display a prompt to join the local network.",
    "aeo.landing.wifi-qr-generator.whatIsIt": "A standardized static QR code that encodes wireless network credentials directly into an optical matrix following the WIFI: protocol specification.",
    "aeo.landing.wifi-qr-generator.whenToUse": "Use when onboarding guests, customers, or employees to a wireless network without requiring them to type network names or complex passwords manually.",

    "aeo.landing.wifi-qr-generator.benefits.0": "Allows compatible devices to parse credentials and prompt to join without manual typing.",
    "aeo.landing.wifi-qr-generator.benefits.1": "Encodes credentials locally using standardized WIFI: URI formatting.",
    "aeo.landing.wifi-qr-generator.benefits.2": "Processes credentials entirely in client memory without transmitting sensitive keys to a server.",
    "aeo.landing.wifi-qr-generator.benefits.3": "Exports in crisp vector formats (SVG, PDF) and raster PNG for physical signage reproduction.",

    "aeo.landing.wifi-qr-generator.commonMistakes.0": "Assuming the QR code encrypts the password; credentials are stored as readable plain text in the barcode matrix.",
    "aeo.landing.wifi-qr-generator.commonMistakes.1": "Expecting automatic background connection on every device without user confirmation prompts.",
    "aeo.landing.wifi-qr-generator.commonMistakes.2": "Assuming pure WPA3-SAE-only networks work identically on legacy scanners expecting WPA2 syntax.",
    "aeo.landing.wifi-qr-generator.commonMistakes.3": "Forgetting that changing the router password invalidates all previously printed static QR codes.",

    "aeo.landing.wifi-qr-generator.bestPractices.0": "Test scan with both iOS and Android native cameras before printing signage.",
    "aeo.landing.wifi-qr-generator.bestPractices.1": "Ensure high optical contrast (dark modules on light background) with Level M or Level Q error correction.",
    "aeo.landing.wifi-qr-generator.bestPractices.2": "Keep SSID and password reasonably concise to maintain a less dense, easily scannable QR matrix.",

    "aeo.landing.wifi-qr-generator.keyTakeaways.0": "WiFi QR codes are static and store credentials in plain text within the 2D matrix.",
    "aeo.landing.wifi-qr-generator.keyTakeaways.1": "Connection prompt behavior depends on device OS, scanner permissions, and manufacturer implementations.",
    "aeo.landing.wifi-qr-generator.keyTakeaways.2": "Changing router settings requires generating and printing a new QR code.",

    "aeo.landing.wifi-qr-generator.faqs.0.q": "Does scanning a WiFi QR code connect automatically?",
    "aeo.landing.wifi-qr-generator.faqs.0.a": "Most modern devices display a prompt asking the user to confirm joining the network. Automatic background connection is not universally guaranteed.",
    "aeo.landing.wifi-qr-generator.faqs.1.q": "Is the WiFi password hidden from people who scan?",
    "aeo.landing.wifi-qr-generator.faqs.1.a": "No. The barcode matrix stores the password as plain text. Anyone with a barcode reader can read the payload.",
    "aeo.landing.wifi-qr-generator.faqs.2.q": "What happens if I change my WiFi password?",
    "aeo.landing.wifi-qr-generator.faqs.2.a": "The existing static QR code will no longer work. You must generate and print a new QR code with the updated credentials.",

    "aeo.landing.wifi-qr-generator.aiSummaryBox.entityType": "Static 2D Barcode (ISO/IEC 18004 compliant)",
    "aeo.landing.wifi-qr-generator.aiSummaryBox.protocolStandard": "WIFI URI Scheme (WIFI:S:...;T:...;P:...;H:...;;)",
    "aeo.landing.wifi-qr-generator.aiSummaryBox.clientCompatibility": "iOS 11+, Android 10+, most modern barcode apps",
    "aeo.landing.wifi-qr-generator.aiSummaryBox.primaryUseCase": "Guest and customer wireless network onboarding without manual password typing",
    "aeo.landing.wifi-qr-generator.aiSummaryBox.offlineCapability": "100% Client-Side matrix calculation and local parsing"
}

print(f"Generated en_wifi_keys count: {len(en_wifi_keys)}")

with open('src/locales/en.json', 'r') as f:
    en_dict = json.load(f)

# Update en.json with all 80 keys
en_dict.update(en_wifi_keys)

with open('src/locales/en.json', 'w') as f:
    json.dump(en_dict, f, indent=2, ensure_ascii=False)

print("Updated en.json with all 80 canonical WiFi keys!")
