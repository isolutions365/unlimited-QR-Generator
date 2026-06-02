export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'creation' | 'customization' | 'security' | 'business';
}

export const faqCategories = [
  { id: 'all', label: 'All Questions' },
  { id: 'general', label: 'General & Basics' },
  { id: 'creation', label: 'QR Creation' },
  { id: 'customization', label: 'Customization & Styling' },
  { id: 'security', label: 'Security & Privacy' },
  { id: 'business', label: 'Business & Commercial' }
] as const;

export const faqData: FAQItem[] = [
  {
    id: "what-is-qr-code",
    category: "general",
    question: "What is a QR Code?",
    answer: "A QR Code (Quick Response Code) is a two-dimensional matrix barcode first designed in 1994 for the automotive industry in Japan. It consists of black squares arranged in a square grid on a white background, which can be read by imaging devices such as cameras, smartphones, and dedicated scanners. QR codes can store significantly more data than traditional linear barcodes, including URLs, plain text, contact information, geographic coordinates, and Wi-Fi credentials."
  },
  {
    id: "how-do-qr-codes-work",
    category: "general",
    question: "How do QR Codes work?",
    answer: "QR Codes operate by encoding information into binary data (ones and zeros) represented by dark (modules) and light squares on a grid. The three large squares in the corners (and sometimes smaller alignment markers) are finder patterns that help scanner software detect the code's boundaries, orientation, and perspective angle. Advanced error correction algorithms (like Reed-Solomon) are built into the code, letting scanner apps read the embedded information correctly even if up to 30% of the graphic is damaged, dirty, or covered by a custom logo."
  },
  {
    id: "is-unlimited-qr-free",
    category: "general",
    question: "Is Unlimited QR Generator free?",
    answer: "Yes, Unlimited QR Generator is 100% free to use. There are no hidden subscription fees, lockouts, or premium walls required to build, customize, or download high-resolution QR codes. All standard designs, custom color gradients, template frameworks, and local data persistence mechanisms are freely accessible to individuals, educational institutes, and registered companies alike."
  },
  {
    id: "can-i-create-unlimited",
    category: "general",
    question: "Can I create unlimited QR Codes?",
    answer: "Absolutely! There are no limits on the number of static or dynamic QR Codes you can create in our creative station. You are free to design and generate as many codes as your personal or enterprise needs demand. The underlying vector creation engine compiles everything locally in real-time within your active browser runtime."
  },
  {
    id: "do-qr-codes-expire",
    category: "general",
    question: "Do QR Codes expire?",
    answer: "No, static QR codes never expire. Because they encode the destination target (such as an exact URL, Wi-Fi password, or vCard details) directly into the visual dot grid, they will function persistently as long as the underlying destination parameters list remains unchanged. Dynamic tracked QR codes on our platform also remain permanent unless you manually delete or archived the respective campaign inside the tracker dashboard."
  },
  {
    id: "can-i-customize-colors",
    category: "customization",
    question: "Can I customize QR colors?",
    answer: "Yes, our creative customizer lets you fully tailor both the background and foreground grids. You can configure beautiful solid colors, smooth multi-directional gradients (linear or radial), and custom styles for the individual visual markers (the eyes and inner dots). When customizing colors, please ensure there is sufficient visual contrast between the foreground elements and background layers to maximize physical scannability across diverse camera hardware."
  },
  {
    id: "can-i-add-logos",
    category: "customization",
    question: "Can I add logos to QR Codes?",
    answer: "Yes, you can easily drag-and-drop or select any custom branding logo to embed at the absolute center of your QR Code. The generator utilizes high-grade error correction (such as level Q or H) to automatically allocate redundant data around the center, which offsets the pixels covered by your corporate logo and keeps the entire image 100% readable during real-time scans."
  },
  {
    id: "are-qr-codes-secure",
    category: "security",
    question: "Are QR Codes secure?",
    answer: "Strictly speaking, QR codes themselves are just visual containers for data and cannot contain active malware files directly. However, they can contain redirection URLs pointing to malicious, phishing, or spoofed web addresses or drive-by downloads. To protect your brand and audience, you should only scan QR codes from trusted, verified originators and always review the target URL preview in your camera scanner application before visiting the page."
  },
  {
    id: "can-businesses-use-them",
    category: "business",
    question: "Can businesses use QR Codes commercially?",
    answer: "Yes, QR codes are public-domain technology and can be used for commercial, advertising, packaging, and digital branding applications with zero royalty fees or licensing requirements worldwide. They are highly efficient tools for linking traditional print ads directly to interactive digital workflows, contactless mobile menus, customer satisfaction reviews, list opt-ins, and app store distributions."
  },
  {
    id: "wifi-qr-codes",
    category: "creation",
    question: "Can I create WiFi QR Codes?",
    answer: "Yes, our tool provides a dedicated WiFi pairing standard. You can input your network SSID, password, and security encryption protocol (such as WPA/WPA2, WEP, or Unsecured). When a visitor scans the generated layout on iOS or Android, a system popup will automatically appear prompting them to connect directly to the localized wireless network with a single tap, bypassing standard manual entry."
  },
  {
    id: "vcard-qr-codes",
    category: "creation",
    question: "Can I create vCard QR Codes?",
    answer: "Yes, you can build virtual contact cards (vCards) with our vCard template. Fill in your name, job title, phone numbers, email address, physical location, and company website. When scanned, modern mobile smartphones will immediately parser the vCard object and suggest saving the complete details straight to the device's address book without manual typing typos."
  },
  {
    id: "social-media-qr",
    category: "creation",
    question: "Can I create social media QR Codes?",
    answer: "Yes! Our Multi-Link Bio structure is designed precisely to present multi-platform landers targeting channels like Instagram, YouTube, Facebook, Twitch, LinkedIn, and Twitter/X inside a single elegant interface. You can assemble specific redirect links for content-rich channels and package them into a premium custom QR code built to elevate social engagement metrics."
  },
  {
    id: "can-qr-be-printed",
    category: "business",
    question: "Can QR Codes be printed?",
    answer: "Absolutely. In fact, QR codes are widely printed on physical flyers, billboards, business cards, restaurant tabletop stands, shipping packages, and product labels. When printing, we strongly recommend exporting your final custom design in high-resolution PNG or SVG vectors. Ensure the physical size is at least 2cm x 2cm, and test scans under diverse lightning environments before approving mass layouts."
  },
  {
    id: "why-not-scanning",
    category: "creation",
    question: "Why is my QR Code not scanning?",
    answer: "There are four typical factors that prevent standard scannability: first, insufficient color contrast between the dark grid dots and the background (such as dark gold on yellow); second, excessive custom styling that overwhelms the finder eyes or alignment blocks; third, blurry print results with bleeding inks or damaged layouts; and fourth, scanning from extreme angles or in low-light environments. Ensure contrasting ratios remain above 4:1 and test thoroughly with different camera apps."
  },
  {
    id: "formats-supported",
    category: "creation",
    question: "What image formats are supported?",
    answer: "Our creative generator lets you download your custom designs in high-quality PNG raster layouts for web or standard document publishing, as well as scalable SVG (Scalable Vector Graphics) vectors. SVG format is highly recommended for commercial print production because you can scale it to infinite dimensions without losing pixel-perfect clarity or creating awkward blurry grids."
  },
  {
    id: "no-account-needed",
    category: "general",
    question: "Do I need to sign up for an account?",
    answer: "No, you do not need an account to create, edit, customize, or download high-quality QR codes on our platform. The workspace is fully open and runs directly in your browser. However, registering a free account lets you unlock extra perks, such as cloud storage for your custom templates, dynamic tracking variables, and full access to our comprehensive Scan Analytics metrics suite."
  },
  {
    id: "are-qr-stored",
    category: "security",
    question: "Are my QR Codes stored on your servers?",
    answer: "Static QR codes are compiled purely client-side within your browser sandbox and are never sent or stored on our servers, ensuring absolute privacy for your custom data. Dynamic tracked QR codes are safely stored in our secure, cloud-hosted Firestore databases to enable campaign routing, dynamic editability, and detailed real-time scan analytics."
  },
  {
    id: "how-to-contact-support",
    category: "general",
    question: "How do I contact support?",
    answer: "You can easily reach out to our global consumer support team by emailing admin@isolutionsico.com or filling out our interactive contact form. The platform is operated by iSolutions ICo, and our technical staff aims to inspect feedback, partnerships, and bug reports within 24 business hours."
  },
  {
    id: "can-i-change-static-qr",
    category: "creation",
    question: "Can I change the content of a static QR code after printing?",
    answer: "No, the destination data of a static QR code is baked directly into the visual pixel design, meaning the code must be reprinted if the destination URL or SSID profile changes. If you need the flexibility to update destination parameters in the future without changing the printed image, you should use our Dynamic QR tracking option instead."
  },
  {
    id: "what-is-error-correction",
    category: "customization",
    question: "What is QR Code error correction?",
    answer: "Error correction (powered by Reed-Solomon algorithms) lets a QR code remain readable even if parts of it are damaged, dirty, or covered by a custom logo. There are four levels: Low (L) - up to 7% correction; Medium (M) - up to 15% correction; Quartile (Q) - up to 25% correction; and High (H) - up to 30% correction. Designing codes with central branding logos or custom graphics automatically sets error correction to level Q or H to guarantee robust scannability."
  },
  {
    id: "best-size-for-printing",
    category: "business",
    question: "What is the best size for printing QR codes?",
    answer: "The optimal size of a printed QR code depends on the scanning distance. As a general rule of thumb, the ratio of scanning distance to QR code size should be roughly 10:1. For example, a QR code scanned from 1 meter away should be at least 10cm x 10cm. For general business cards, flyers, and brochures, always aim for a minimum size of 2cm x 2cm (0.8 inches x 0.8 inches) to ensure quick, reliable scans on all smartphone models."
  },
  {
    id: "can-qr-record-gps",
    category: "security",
    question: "Can scanning a QR code track my GPS location?",
    answer: "No, scanning a QR code cannot automatically access your device's precise GPS coordinates without your explicit permission. However, dynamic tracking on our platform can determine high-level context, such as the country, region, or city of the scanner, based on the IP address used to lookup the dynamic redirect request."
  },
  {
    id: "how-many-characters",
    category: "general",
    question: "How much data can a QR code store?",
    answer: "A standard QR code can store a maximum of 7,089 numeric characters, 4,296 alphanumeric characters, or 2,953 binary bytes of data. When you input more data, the visual grid automatically dense up with more rows and columns (modules) to fit the payload. Keeping your destination URLs short and concise is highly recommended to maintain a clean, easily scanned grid layout."
  },
  {
    id: "are-there-hidden-scans",
    category: "business",
    question: "Is there a limit on scans for your QR codes?",
    answer: "No, there are absolutely no scan limits on our platform. Both static and dynamic QR codes generated through Unlimited QR Generator can be scanned an unlimited number of times by millions of distinct devices. We do not charge fees based on scan counts, nor do we throttle traffic or inject intermediate ads into your campaigns, ensuring a premium redirect experience."
  },
  {
    id: "do-qr-work-offline",
    category: "general",
    question: "Do QR Codes work offline?",
    answer: "Static QR codes encoding offline content (such as plain text, contact cards, calendar events, or WiFi network codes) can be fully processed and read by smartphones without an active internet connection. However, codes encoding links to websites, dynamic templates, or cloud assets will require status indicators or data plans on the scanner device to resolve and open the target web pages."
  }
];
