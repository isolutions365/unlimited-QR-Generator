import { getFaqData, FAQItem, faqCategories } from '../data/faqData';
import { getBlogArticles, BlogArticle, blogCategories } from '../data/blogData';

export type Locale = 'en' | 'ar' | 'ur' | 'de' | 'fr' | 'es' | 'pt' | 'it' | 'tr' | 'id' | 'hi' | 'zh' | 'ja' | 'ko';

export const SUPPORTED_LOCALES: Locale[] = [
  'en', 'ar', 'ur', 'de', 'fr', 'es', 'pt', 'it', 'tr', 'id', 'hi', 'zh', 'ja', 'ko'
];

export function isRtlLocale(locale: Locale): boolean {
  return locale === 'ar' || locale === 'ur';
}

export function extractLocaleAndPath(pathname: string): { locale: Locale; cleanPath: string } {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length > 0 && (SUPPORTED_LOCALES as string[]).includes(parts[0])) {
    const locale = parts[0] as Locale;
    const cleanPath = '/' + parts.slice(1).join('/');
    return { locale, cleanPath };
  }
  return { locale: 'en', cleanPath: pathname };
}

export interface NavItem {
  name: string;
  desc: string;
  slug: string;
}

export const navTranslations: (Record<Locale, {
  creativeStation: string;
  freeQrTools: string;
  designStudio: string;
  workspaces: string;
  faqTitle: string;
  blogTitle: string;
  signIn: string;
  signUp: string;
  signOut: string;
  secureDatabox: string;
  expertPresets: string;
  channelsCount: string;
  backToCreative: string;
  aboutUs: string;
  privacyPolicy: string;
  contactSupport: string;
  termsConditions: string;
  backToBlogList: string;
  cookieConsentTitle: string;
  cookieConsentText: string;
  accept: string;
  decline: string;
}> & Record<string, any>) = {
  en: {
    creativeStation: "Creative Station",
    freeQrTools: "Free QR Tools",
    designStudio: "Design Studio",
    workspaces: "6 WORKSPACES",
    faqTitle: "FAQ",
    blogTitle: "Guides Blog",
    signIn: "Sign In / Sign Up",
    signUp: "Sign Up",
    signOut: "Sign Out",
    secureDatabox: "SECURE DATABOX",
    expertPresets: "Expert Presets & Converters",
    channelsCount: "10 CHANNELS AVAILABLE",
    backToCreative: "Back to Creative Station",
    aboutUs: "About Us",
    privacyPolicy: "Privacy Policy",
    contactSupport: "Contact & Support",
    termsConditions: "Terms & Conditions",
    backToBlogList: "Back to Article Hub",
    cookieConsentTitle: "Cookie Consent",
    cookieConsentText: "We use cookies to analyze scan counts, track campaign ROI, and improve your secure drawing station options.",
    accept: "Accept",
    decline: "Decline",
  },
  ar: {
    creativeStation: "المحطة الإبداعية",
    freeQrTools: "أدوات QR المجانية",
    designStudio: "استوديو التصميم",
    workspaces: "6 مساحات عمل",
    faqTitle: "الأسئلة الشائعة",
    blogTitle: "مدونة الأدلة",
    signIn: "تسجيل الدخول / الاشتراك",
    signUp: "الاشتراك",
    signOut: "تسجيل الخروج",
    secureDatabox: "صندوق البيانات الآمن",
    expertPresets: "إعدادات الخبراء والمحولات",
    channelsCount: "10 قنوات متاحة",
    backToCreative: "العودة إلى المحطة الإبداعية",
    aboutUs: "من نحن",
    privacyPolicy: "سياسة الخصوصية",
    contactSupport: "الاتصال والدعم",
    termsConditions: "الشروط والأحكام",
    backToBlogList: "العودة إلى مركز المقالات",
    cookieConsentTitle: "الموافقة على ملفات تعريف الارتباط",
    cookieConsentText: "نستخدم ملفات تعريف الارتباط لتحليل عدد مرات المسح، وتتبع عائد الاستثمار للحملات، وتحسين خيارات محطة الرسم الآمنة الخاصة بك.",
    accept: "قبول",
    decline: "رفض",
  },
  ur: {
    creativeStation: "تخلیقی اسٹیشن",
    freeQrTools: "مفت QR ٹولز",
    designStudio: "ڈیزائن اسٹوڈیو",
    workspaces: "6 کام کی جگہیں",
    faqTitle: "اکثر پوچھے گئے سوالات",
    blogTitle: "رہنما بلاگ",
    signIn: "سائن ان / سائن اپ",
    signUp: "سائن اپ کریں",
    signOut: "سائن آؤٹ کریں",
    secureDatabox: "محفوظ ڈیٹا باکس",
    expertPresets: "ماہرین کے پیش سیٹ اور کنورٹرز",
    channelsCount: "10 چینلز دستیاب ہیں",
    backToCreative: "تخلیقی اسٹیشن پر واپس جائیں",
    aboutUs: "ہمارے بارے میں",
    privacyPolicy: "رازداری کی پالیسی",
    contactSupport: "رابطہ اور مدد",
    termsConditions: "شرائط و ضوابط",
    backToBlogList: "آرٹیکل ہب پر واپس جائیں",
    cookieConsentTitle: "کوکی की رضامندی",
    cookieConsentText: "ہم اسکین کی تعداد کا تجزیہ کرنے، مہم کے ROI کو ٹریک کرنے، اور آپ کے محفوظ ڈرائنگ اسٹیشن کے اختیارات کو بہتر بنانے کے لیے کوکیز کا استعمال کرتے ہیں۔",
    accept: "قبول کریں",
    decline: "مسترد کریں",
  },
  es: {
    creativeStation: "Estación Creativa",
    freeQrTools: "Herramientas QR Gratis",
    designStudio: "Estudio de Diseño",
    workspaces: "6 ESPACIOS",
    faqTitle: "Preguntas Frecuentes",
    blogTitle: "Blog de Guías",
    signIn: "Iniciar Sesión",
    signUp: "Registrarse",
    signOut: "Cerrar Sesión",
    secureDatabox: "BANCO DE DATOS SEGURO",
    expertPresets: "Ajustes Preestablecidos y Convertidores",
    channelsCount: "10 CANALES DISPONIBLES",
    backToCreative: "Volver a la Estación Creativa",
    aboutUs: "Nosotros",
    privacyPolicy: "Política de Privacidad",
    contactSupport: "Contacto y Soporte",
    termsConditions: "Términos y Condiciones",
    backToBlogList: "Volver al Centro de Artículos",
    cookieConsentTitle: "Consentimiento de Cookies",
    cookieConsentText: "Utilizamos cookies para analizar estadísticas, rastrear el ROI de campañas y mejorar las opciones de su estación segura.",
    accept: "Aceptar",
    decline: "Rechazar",
  },
  fr: {
    creativeStation: "Station Créative",
    freeQrTools: "Outils QR Gratuits",
    designStudio: "Studio de Design",
    workspaces: "6 ESPACES",
    faqTitle: "FAQ",
    blogTitle: "Blog des Guides",
    signIn: "Connexion / Inscription",
    signUp: "S'inscrire",
    signOut: "Se déconnecter",
    secureDatabox: "BANQUE DE DONNÉES SÉCURISÉE",
    expertPresets: "Préréglages d'experts & Convertisseurs",
    channelsCount: "10 CANAUX DISPONIBLES",
    backToCreative: "Retour à la Station Créative",
    aboutUs: "À propos de nous",
    privacyPolicy: "Politique de confidentialité",
    contactSupport: "Contact & Support",
    termsConditions: "Conditions générales",
    backToBlogList: "Retour au pôle d'articles",
    cookieConsentTitle: "Consentement aux cookies",
    cookieConsentText: "Nous utilisons des cookies pour analyser les scans, suivre le ROI des campagnes et améliorer les options de votre station.",
    accept: "Accepter",
    decline: "Décliner",
  },
  de: {
    creativeStation: "Kreativstation",
    freeQrTools: "Kostenlose QR-Tools",
    designStudio: "Designstudio",
    workspaces: "6 ARBEITSBEREICHE",
    faqTitle: "FAQ",
    blogTitle: "Leitfaden-Blog",
    signIn: "Anmelden / Registrieren",
    signUp: "Registrieren",
    signOut: "Abmelden",
    secureDatabox: "SICHERE DATENBOX",
    expertPresets: "Experten-Presets & Konverter",
    channelsCount: "10 KANÄLE VERFÜGBAR",
    backToCreative: "Zurück zur Kreativstation",
    aboutUs: "Über uns",
    privacyPolicy: "Datenschutzerklärung",
    contactSupport: "Kontakt & Support",
    termsConditions: "Allgemeine Geschäftsbedingungen",
    backToBlogList: "Zurück zum Artikel-Hub",
    cookieConsentTitle: "Cookie-Einwilligung",
    cookieConsentText: "Wir verwenden Cookies, um Scanzahlen zu analysieren, den Kampagnen-ROI zu verfolgen und Ihre sicheren Optionen zu verbessern.",
    accept: "Akzeptieren",
    decline: "Ablehnen",
  },
  pt: {
    creativeStation: "Estação Criativa",
    freeQrTools: "Ferramentas QR Grátis",
    designStudio: "Estúdio de Design",
    workspaces: "6 ESPAÇOS DE TRABALHO",
    faqTitle: "FAQ",
    blogTitle: "Blog de Guias",
    signIn: "Entrar / Cadastrar-se",
    signUp: "Cadastrar-se",
    signOut: "Sair",
    secureDatabox: "CAIXA DE DADOS SEGURA",
    expertPresets: "Predefinições de Especialistas & Conversores",
    channelsCount: "10 CANAIS DISPONÍVEIS",
    backToCreative: "Voltar à Estação Criativa",
    aboutUs: "Sobre Nós",
    privacyPolicy: "Política de Privacidade",
    contactSupport: "Contato & Suporte",
    termsConditions: "Termos & Condições",
    backToBlogList: "Voltar ao Hub de Artigos",
    cookieConsentTitle: "Consentimento de Cookies",
    cookieConsentText: "Usamos cookies para analisar contagens de varredura, rastrear o ROI da campanha e melhorar suas opções de desenho seguro.",
    accept: "Aceitar",
    decline: "Recusar",
  },
  it: {
    creativeStation: "Stazione Creativa",
    freeQrTools: "Strumenti QR Gratuiti",
    designStudio: "Studio di Design",
    workspaces: "6 SPAZI DI LAVORO",
    faqTitle: "FAQ",
    blogTitle: "Blog delle Guide",
    signIn: "Accedi / Registrati",
    signUp: "Registrati",
    signOut: "Disconnetti",
    secureDatabox: "CASSAFORTE DATI SICURA",
    expertPresets: "Preimpostazioni per Esperti & Convertitori",
    channelsCount: "10 CANALI DISPONIBILI",
    backToCreative: "Torna alla Stazione Creativa",
    aboutUs: "Chi Siamo",
    privacyPolicy: "Informativa sulla Privacy",
    contactSupport: "Contatto & Supporto",
    termsConditions: "Termini & Condizioni",
    backToBlogList: "Torna all'Hub degli Articoli",
    cookieConsentTitle: "Consenso ai Cookie",
    cookieConsentText: "Utilizziamo i cookie per analizzare i conteggi di scansione, tracciare il ROI delle campagne e migliorare le opzioni di disegno sicuro.",
    accept: "Accetta",
    decline: "Rifiuta",
  },
  tr: {
    creativeStation: "Yaratıcı İstasyon",
    freeQrTools: "Ücretsiz QR Araçları",
    designStudio: "Tasarım Stüdyosu",
    workspaces: "6 ÇALIŞMA ALANI",
    faqTitle: "SSS",
    blogTitle: "Rehber Blogu",
    signIn: "Giriş Yap / Üye Ol",
    signUp: "Üye Ol",
    signOut: "Çıkış Yap",
    secureDatabox: "GÜVENLİ VERİ KUTUSU",
    expertPresets: "Uzman Hazır Ayarları & Dönüştürücüler",
    channelsCount: "10 KANAL MEVCUT",
    backToCreative: "Yaratıcı İstasyona Geri Dön",
    aboutUs: "Hakkımızda",
    privacyPolicy: "Gizlilik Politikası",
    contactSupport: "İletişim & Destek",
    termsConditions: "Şartlar & Koşullar",
    backToBlogList: "Makale Merkezine Geri Dön",
    cookieConsentTitle: "Çerez Onayı",
    cookieConsentText: "Tarama sayılarını analiz etmek, kampanya yatırım getirisini izlemek ve güvenli çizim istasyonu seçeneklerinizi iyileştirmek için çerezler kullanıyoruz.",
    accept: "Kabul Et",
    decline: "Reddet",
  },
  id: {
    creativeStation: "Stasiun Kreatif",
    freeQrTools: "Alat QR Gratis",
    designStudio: "Studio Desain",
    workspaces: "6 RUANG KERJA",
    faqTitle: "FAQ",
    blogTitle: "Blog Panduan",
    signIn: "Masuk / Daftar",
    signUp: "Daftar",
    signOut: "Keluar",
    secureDatabox: "KOTAK DATA AMAN",
    expertPresets: "Preset Ahli & Konverter",
    channelsCount: "10 SALURAN TERSEDIA",
    backToCreative: "Kembali ke Stasiun Kreatif",
    aboutUs: "Tentang Kami",
    privacyPolicy: "Kebijakan Privasi",
    contactSupport: "Kontak & Dukungan",
    termsConditions: "Syarat & Ketentuan",
    backToBlogList: "Kembali ke Pusat Artikel",
    cookieConsentTitle: "Persetujuan Cookie",
    cookieConsentText: "Kami menggunakan cookie untuk menganalisis jumlah pemindaian, melacak ROI kampanye, dan meningkatkan opsi stasiun gambar aman Anda.",
    accept: "Terima",
    decline: "Tolak",
  },
  hi: {
    creativeStation: "क्रिएटिव स्टेशन",
    freeQrTools: "मुफ़्त क्यूआर टूल्स",
    designStudio: "डिज़ाइन स्टूडियो",
    workspaces: "6 कार्यस्थान",
    faqTitle: "अक्सर पूछे जाने वाले प्रश्न",
    blogTitle: "मार्गदर्शिका ब्लॉग",
    signIn: "साइन इन / साइन अप",
    signUp: "साइन अप करें",
    signOut: "साइन आउट करें",
    secureDatabox: "सुरक्षित डेटाबॉक्स",
    expertPresets: "विशेषज्ञ प्रीसेट और कन्वर्टर्स",
    channelsCount: "10 चैनल उपलब्ध हैं",
    backToCreative: "क्रिएटिव स्टेशन पर वापस जाएं",
    aboutUs: "हमारे बारे में",
    privacyPolicy: "गोपनीयता नीति",
    contactSupport: "संपर्क और सहायता",
    termsConditions: "नियम और शर्तें",
    backToBlogList: "लेख केंद्र पर वापस जाएं",
    cookieConsentTitle: "कुकी सहमति",
    cookieConsentText: "हम स्कैन की संख्या का विश्लेषण करने, अभियान के आरओआई को ट्रैक करने और आपके सुरक्षित ड्राइंग स्टेशन विकल्पों को बेहतर बनाने के लिए कुकीज़ का उपयोग करते हैं।",
    accept: "स्वीकार करें",
    decline: "अस्वीकार करें",
  },
  ja: {
    creativeStation: "クリエイティブ・ステーション",
    freeQrTools: "無料QRツール",
    designStudio: "デザイン・スタジオ",
    workspaces: "6つのワークスペース",
    faqTitle: "よくある質問",
    blogTitle: "ガイドブログ",
    signIn: "サインイン / 新規登録",
    signUp: "新規登録",
    signOut: "サインアウト",
    secureDatabox: "セキュア・データボックス",
    expertPresets: "エキスパートプリセット＆コンバーター",
    channelsCount: "10種類のチャンネルが利用可能",
    backToCreative: "クリエイティブ・ステーションに戻る",
    aboutUs: "運営会社",
    privacyPolicy: "プライバシーポリシー",
    contactSupport: "お問い合わせ",
    termsConditions: "利用規約",
    backToBlogList: "記事ハブに戻る",
    cookieConsentTitle: "クッキー使用の同意",
    cookieConsentText: "スキャン回数の分析、キャンペーンのROI追跡、およびセキュアな描画ステーションの機能向上のためにクッキーを使用しています。",
    accept: "同意する",
    decline: "拒否する",
  },
  ko: {
    creativeStation: "크리에이티브 스테이션",
    freeQrTools: "무료 QR 도구",
    designStudio: "디자인 스튜디오",
    workspaces: "6개 작업 공간",
    faqTitle: "자주 묻는 질문",
    blogTitle: "가이드 블로그",
    signIn: "로그인 / 회원가입",
    signUp: "회원가입",
    signOut: "로그아웃",
    secureDatabox: "보안 데이터박스",
    expertPresets: "전문가 프리셋 & 변환기",
    channelsCount: "10개 채널 사용 가능",
    backToCreative: "크리에이티브 스테이션으로 돌아가기",
    aboutUs: "회사 소개",
    privacyPolicy: "개인정보처리방침",
    contactSupport: "문의 및 지원",
    termsConditions: "이용약관",
    backToBlogList: "아티클 허브로 돌아가기",
    cookieConsentTitle: "쿠키 수집 동의",
    cookieConsentText: "스캔 횟수 분석, 캠페인 ROI 추적 및 안전한 그리기 스테이션 옵션 개선을 위해 쿠키를 사용합니다.",
    accept: "동의",
    decline: "거부",
  },
  zh: {
    creativeStation: "创意空间",
    freeQrTools: "免费二维码工具",
    designStudio: "设计工作室",
    workspaces: "6 个工作区",
    faqTitle: "常见问题",
    blogTitle: "指南博客",
    signIn: "登录 / 注册",
    signUp: "注册",
    signOut: "退出登录",
    secureDatabox: "安全数据保险箱",
    expertPresets: "专家预设与转换器",
    channelsCount: "提供 10 个通道",
    backToCreative: "返回创意空间",
    aboutUs: "关于我们",
    privacyPolicy: "隐私政策",
    contactSupport: "联系与支持",
    termsConditions: "条款与条件",
    backToBlogList: "返回文章中心",
    cookieConsentTitle: "Cookie 同意",
    cookieConsentText: "我们使用 Cookie 来分析扫描次数、追踪营销活动投资回报率并改进安全制图方案。",
    accept: "接受",
    decline: "拒绝",
  }
};

// Creative Station Sub-items
export const creativeSubItems: (Record<Locale, { name: string; desc: string }[]> & Record<string, any>) = {
  en: [
    { name: 'AI QR Generator', desc: 'Design beautiful prompt-to-artwork QR templates' },
    { name: 'QR Designer', desc: 'Customize eye grids, gradients and quiet spaces' },
    { name: 'QR Templates', desc: 'Apply readymade premium business templates' },
    { name: 'QR Animations', desc: 'Apply sleek scanning indicators and sweep transitions' },
    { name: 'Brand Assets', desc: 'Upload centerpiece logos and corporate symbols' },
    { name: 'Marketing Materials', desc: 'Scale print formats, cards, flyers and media packs' }
  ],
  ar: [
    { name: 'مولد الـ QR بالذكاء الاصطناعي', desc: 'تصميم قوالب QR جميلة ومحولة من نصوص إلى أعمال فنية' },
    { name: 'مصمم الـ QR', desc: 'تخصيص شبكات العيون، التدرجات والمساحات الهادئة' },
    { name: 'قوالب الـ QR', desc: 'تطبيق قوالب أعمال ممتازة جاهزة للاستخدام' },
    { name: 'رسوم الـ QR المتحركة', desc: 'تطبيق مؤشرات مسح أنيقة وانتقالات المسح' },
    { name: 'أصول العلامة التجارية', desc: 'تحميل الشعارات المركزية والرموز المؤسسية' },
    { name: 'مواد التسويق', desc: 'توسيع تنسيقات الطباعة، البطاقات، المنشورات والحزم الإعلامية' }
  ],
  ur: [
    { name: 'AI QR جنریٹر', desc: 'خوبصورت پرامپٹ سے آرٹ ورک والے QR ٹیمپلیٹس ڈیزائن کریں' },
    { name: 'QR ڈیزائنر', desc: 'آئی گرڈز، گریڈینٹس اور پرسکون جگہوں کو اپنی مرضی کے مطابق بنائیں' },
    { name: 'QR ٹیمپلیٹس', desc: 'پہلے سے تیار شدہ پریمیم کاروباری ٹیمپلیٹس لاگو کریں' },
    { name: 'QR اینیمیشنز', desc: 'چمکدار اسکیننگ اشارے اور سوئپ ٹرانزیشن لاگو کریں' },
    { name: 'برانڈ کے اثاثے', desc: 'مرکزی لوگو اور کارپوریٹ علامات اپ لوڈ کریں' },
    { name: 'مارکیٹنگ کا مواد', desc: 'پرنٹ فارمیٹس، کارڈز، فلائرز اور میڈیا پیک کو وسعت دیں' }
  ],
  es: [
    { name: 'Generador de QR con IA', desc: 'Diseñe hermosas plantillas de arte mediante descripciones de texto' },
    { name: 'Diseñador de QR', desc: 'Personalice marcos de ojos, degradados y márgenes silenciosos' },
    { name: 'Plantillas de QR', desc: 'Aplique plantillas comerciales listas para usar' },
    { name: 'Animaciones de QR', desc: 'Aplique indicadores de escaneo y transiciones elegantes' },
    { name: 'Activos de Marca', desc: 'Cargue logotipos centrales y símbolos corporativos' },
    { name: 'Material de Marketing', desc: 'Escale formatos impresos, tarjetas, folletos y paquetes promocionales' }
  ],
  fr: [
    { name: 'Générateur QR IA', desc: 'Concevez de superbes modèles d\'art par commandes textuelles' },
    { name: 'Créateur de QR', desc: 'Personnalisez les grilles d\'yeux, dégradés et marges d\'espace' },
    { name: 'Modèles de QR', desc: 'Appliquez des modèles d\'affaires premium prêts à l\'emploi' },
    { name: 'Animations de QR', desc: 'Appliquez des indicateurs de balayage et transitions élégantes' },
    { name: 'Actifs de Marque', desc: 'Téléchargez des logos centraux et symboles d\'entreprise' },
    { name: 'Matériel Marketing', desc: 'Adaptez formats imprimés, cartes, flyers et packs médias' }
  ],
  de: [
    { name: 'KI QR-Generator', desc: 'Gestalten Sie Kunstvorlagen direkt aus Text-Prompts' },
    { name: 'QR-Designer', desc: 'Passen Sie Augengitter, Farbverläufe und Ruhezonen an' },
    { name: 'QR-Vorlagen', desc: 'Wenden Sie fertige Premium-Businessvorlagen an' },
    { name: 'QR-Animationen', desc: 'Fügen Sie elegante Scananzeigen und Übergänge hinzu' },
    { name: 'Markenwerte', desc: 'Laden Sie zentrale Logos und Unternehmenssymbole hoch' },
    { name: 'Marketingmaterialien', desc: 'Skalieren Sie Druckformate, Visitenkarten, Flyer und Medienpakete' }
  ],
  pt: [
    { name: 'Gerador QR com IA', desc: 'Crie belos modelos de QR a partir de comandos de texto' },
    { name: 'Designer de QR', desc: 'Personalize grades oculares, gradientes e margens silenciosas' },
    { name: 'Modelos de QR', desc: 'Aplique modelos comerciais premium prontos para usar' },
    { name: 'Animações de QR', desc: 'Aplique indicadores de digitalização e transições elegantes' },
    { name: 'Ativos de Marca', desc: 'Faça upload de logotipos centrais e símbolos corporativos' },
    { name: 'Materiais de Marketing', desc: 'Dimensione formatos de impressão, cartões, panfletos e pacotes de mídia' }
  ],
  it: [
    { name: 'Generatore QR con IA', desc: 'Progetta fantastici modelli di QR da descrizioni testuali' },
    { name: 'Designer di QR', desc: 'Personalizza griglie degli occhi, sfumature e aree di rispetto' },
    { name: 'Modelli di QR', desc: 'Applica modelli commerciali premium già pronti' },
    { name: 'Animazioni di QR', desc: 'Applica eleganti indicatori di scansione e transizioni di scorrimento' },
    { name: 'Risorse del Brand', desc: 'Carica loghi centrali e simboli aziendali' },
    { name: 'Materiale di Marketing', desc: 'Adatta formati di stampa, biglietti, volantini e pacchetti media' }
  ],
  tr: [
    { name: 'Yapay Zeka QR Üretici', desc: 'Metinden sanata harika QR şablonları tasarlayın' },
    { name: 'QR Tasarımcı', desc: 'Göz ızgaralarını, gradyanları ve boşlukları özelleştirin' },
    { name: 'QR Şablonları', desc: 'Hazır premium iş şablonlarını uygulayın' },
    { name: 'QR Animasyonları', desc: 'Şık tarama göstergeleri ve geçiş efektleri ekleyin' },
    { name: 'Marka Varlıkları', desc: 'Merkezi logoları ve kurumsal sembolleri yükleyin' },
    { name: 'Pazarlama Materyalleri', desc: 'Baskı formatlarını, kartları, broşürleri ve medya paketlerini ölçeklendirin' }
  ],
  id: [
    { name: 'Generator QR AI', desc: 'Rancang templat seni QR yang indah dari deskripsi teks' },
    { name: 'Desainer QR', desc: 'Sesuaikan kisi mata, gradien, dan margin sunyi' },
    { name: 'Templat QR', desc: 'Terapkan templat bisnis premium siap pakai' },
    { name: 'Animasi QR', desc: 'Terapkan indikator pemindaian ramping dan transisi sapuan' },
    { name: 'Aset Merek', desc: 'Unggah logo pusat dan simbol perusahaan' },
    { name: 'Materi Pemasaran', desc: 'Skalakan format cetak, kartu, selebaran, dan paket media' }
  ],
  hi: [
    { name: 'एआई क्यूआर जनरेटर', desc: 'सुंदर टेक्स्ट-टू-आर्टवर्क क्यूआर टेम्प्लेट डिज़ाइन करें' },
    { name: 'क्यूआर डिजाइनर', desc: 'आई ग्रिड, ग्रेडिएंट और शांत स्थानों को अनुकूलित करें' },
    { name: 'क्यूआर टेम्प्लेट', desc: 'पहले से तैयार प्रीमियम व्यावसायिक टेम्प्लेट लागू करें' },
    { name: 'क्यूआर एनिमेशन', desc: 'चिकने स्कैनिंग संकेतक और स्वीप ट्रांज़िशन लागू करें' },
    { name: 'ब्रांड संपत्तियां', desc: 'केंद्रीय लोगो और कॉर्पोरेट प्रतीक अपलोड करें' },
    { name: 'विपणन सामग्री', desc: 'प्रिंट प्रारूपों, कार्डों, फ़्लायर्स और मीडिया पैकों को स्केल करें' }
  ],
  ja: [
    { name: 'AI QRジェネレーター', desc: 'テキスト記述から美しいアート風QRテンプレートを生成' },
    { name: 'QRデザイナー', desc: 'アイ・グリッド、グラデーション、余白スペースをカスタマイズ' },
    { name: 'QRテンプレート', desc: '作成済みのプレミアムビジネス用テンプレートを適用' },
    { name: 'QRアニメーション', desc: '洗練されたスキャンインジケーターとスイープ遷移を適用' },
    { name: 'ブランドアセット', desc: '中央のロゴやコーポレートシンボルをアップロード' },
    { name: 'マーケティング素材', desc: '印刷フォーマット、カード、チラシ、メディアパックの調整' }
  ],
  ko: [
    { name: 'AI QR 생성기', desc: '텍스트 프롬프트 기반의 아름다운 예술적 QR 템플릿 디자인' },
    { name: 'QR 디자이너', desc: '아이 그리드, 그라데이션 및 정적 마진 맞춤 설정' },
    { name: 'QR 템플릿', desc: '기존의 프리미엄 비즈니스 템플릿 즉시 적용' },
    { name: 'QR 애니메이션', desc: '세련된 스캔 표시기 및 스윕 전환 효과 적용' },
    { name: '브랜드 자산', desc: '중앙 로고 및 기업 상징 기호 업로드' },
    { name: '마케팅 자료', desc: '인쇄 포맷, 카드, 리플릿 및 미디어 팩 스케일링' }
  ],
  zh: [
    { name: 'AI 二维码生成器', desc: '设计精美的内容至艺术二维码模板' },
    { name: '二维码设计师', desc: '自定义定位点网格、渐变与空白保护区' },
    { name: '二维码模板', desc: '应用现成的优质商业模版' },
    { name: '二维码动画', desc: '使用流线型扫描指示器与拂扫过渡' },
    { name: '品牌资产', desc: '上传核心徽标及企业标识' },
    { name: '营销物料', desc: '缩放印刷格式、卡片、传单与宣传包' }
  ]
};

// Translated Expert Preset Tools List
export const presetToolsTranslations: (Record<Locale, { name: string; desc: string; slug: string }[]> & Record<string, any>) = {
  en: [
    { name: 'URL QR', slug: 'url-qr-generator', desc: 'Secure web redirects with live trackable shortened links.' },
    { name: 'PDF QR', slug: 'pdf-qr-generator', desc: 'Contactless dynamic documents loading restaurant menus & guides.' },
    { name: 'WiFi QR', slug: 'wifi-qr-generator', desc: 'Auto-pair guests to local wireless routers with no password typed.' },
    { name: 'vCard QR', slug: 'vcard-qr-generator', desc: 'Share rich digital contact records immediately to scanners.' },
    { name: 'Email QR', slug: 'email-qr-generator', desc: 'Preconfigure receiver addresses with customized boilerplate body text.' },
    { name: 'SMS QR', slug: 'sms-qr-generator', desc: 'Compose direct-to-text messages with pre-allocated phone nodes.' },
    { name: 'WhatsApp QR', slug: 'whatsapp-qr-generator', desc: 'Trigger instant customized chat logs instantly with customer staff.' },
    { name: 'Social QR', slug: 'instagram-qr-generator', desc: 'Consolidate bio-links directly to Instagram, Facebook and Youtube.' },
    { name: 'Text QR', slug: 'text-qr', desc: 'Store raw text keys, offline copyable logs and secret key matrices.' },
    { name: 'App Store QR', slug: 'app-store-qr', desc: 'Direct visitors directly to App Store / Play Store download entries.' },
  ],
  ar: [
    { name: 'رابط ويب QR', slug: 'url-qr-generator', desc: 'توجيهات ويب آمنة مع روابط قصيرة قابلة للتتبع المباشر.' },
    { name: 'ملف PDF QR', slug: 'pdf-qr-generator', desc: 'مستندات ديناميكية دون تلامس لتحميل قوائم المطاعم والأدلة.' },
    { name: 'واي فاي QR', slug: 'wifi-qr-generator', desc: 'ربط الضيوف تلقائيًا بأجهزة التوجيه المحلية دون كتابة كلمة مرور.' },
    { name: 'بطاقة vCard QR', slug: 'vcard-qr-generator', desc: 'مشاركة سجلات اتصال رقمية غنية على الفور مع الماسحات الضوئية.' },
    { name: 'بريد إلكتروني QR', slug: 'email-qr-generator', desc: 'تكوين مسبق لعناوين المستلمين مع نصوص الرسائل المخصصة.' },
    { name: 'رسالة قصيرة SMS QR', slug: 'sms-qr-generator', desc: 'صياغة رسائل نصية مباشرة مع أرقام هواتف مخصصة.' },
    { name: 'واتساب QR', slug: 'whatsapp-qr-generator', desc: 'بدء دردشة واتساب فورية مخصصة مع موظفي الدعم.' },
    { name: 'قنوات التواصل QR', slug: 'instagram-qr-generator', desc: 'دمج روابط السيرة الذاتية لإنستغرام، فيسبوك ويوتيوب.' },
    { name: 'نص عادي QR', slug: 'text-qr', desc: 'تخزين النصوص الخام، السجلات غير المتصلة بالإنترنت وسلاسل المفاتيح السرية.' },
    { name: 'متجر التطبيقات QR', slug: 'app-store-qr', desc: 'توجيه الزوار مباشرة إلى روابط تنزيل متجر التطبيقات.' },
  ],
  ur: [
    { name: 'URL QR', slug: 'url-qr-generator', desc: 'براہ راست قابل ٹریک مختصر لنکس کے ساتھ محفوظ ویب ری ڈائریکٹس۔' },
    { name: 'PDF QR', slug: 'pdf-qr-generator', desc: 'بغیر چھوئے متحرک دستاویزات جو ریستوراں کے مینو اور رہنما لوڈ کریں۔' },
    { name: 'WiFi QR', slug: 'wifi-qr-generator', desc: 'بغیر پاس ورڈ ٹائپ کیے مہمانوں کو مقامی وائرلیس راؤٹرز سے جوڑیں۔' },
    { name: 'vCard QR', slug: 'vcard-qr-generator', desc: 'اسکینرز کے ساتھ فوری طور پر بھرپور ڈیجیٹل رابطہ ریکارڈ شیئر کریں۔' },
    { name: 'ای میل QR', slug: 'email-qr-generator', desc: 'اپنی مرضی کے مطابق باڈی ٹیکسٹ کے ساتھ وصول کنندہ کے پتے پہلے سے ترتیب دیں۔' },
    { name: 'SMS QR', slug: 'sms-qr-generator', desc: 'پہلے سے مختص کردہ فون نمبرز کے ساتھ براہ راست ٹیکسٹ پیغامات لکھیں۔' },
    { name: 'WhatsApp QR', slug: 'whatsapp-qr-generator', desc: 'سپورٹ اسٹاف کے ساتھ فوری طور پر اپنی مرضی کے مطابق چیٹ شروع کریں۔' },
    { name: 'سوشل QR', slug: 'instagram-qr-generator', desc: 'انسٹاگرام، فیس بک اور یوٹیوب کے بائیو لنکس کو یکجا کریں۔' },
    { name: 'ٹیکسٹ QR', slug: 'text-qr', desc: 'خام ٹیکسٹ کیز، آف لائن کاپی کے قابل لاگز اور خفیہ کیز کو اسٹور کریں۔' },
    { name: 'ایپ اسٹور QR', slug: 'app-store-qr', desc: 'وزیٹرز کو براہ راست ایپ اسٹور یا پلے اسٹور ڈاؤن لوڈز پر بھیجیں۔' },
  ],
  es: [
    { name: 'URL de QR', slug: 'url-qr-generator', desc: 'Redirecciones web seguras con enlaces cortos rastreables en vivo.' },
    { name: 'PDF de QR', slug: 'pdf-qr-generator', desc: 'Documentos dinámicos para menús de restaurantes y guías sin contacto.' },
    { name: 'WiFi de QR', slug: 'wifi-qr-generator', desc: 'Conecte invitados de forma automática sin ingresar contraseñas.' },
    { name: 'vCard de QR', slug: 'vcard-qr-generator', desc: 'Comparta tarjetas de contacto digitales de inmediato con escáneres.' },
    { name: 'Email de QR', slug: 'email-qr-generator', desc: 'Preconfigure direcciones de destino con plantillas de cuerpo de texto.' },
    { name: 'SMS de QR', slug: 'sms-qr-generator', desc: 'Redacte mensajes de texto directos con números de teléfono dedicados.' },
    { name: 'WhatsApp de QR', slug: 'whatsapp-qr-generator', desc: 'Inicie chats de WhatsApp instantáneos con soporte o agentes.' },
    { name: 'Redes de QR', slug: 'instagram-qr-generator', desc: 'Consolide enlaces múltiples para Instagram, Facebook y Youtube.' },
    { name: 'Texto de QR', slug: 'text-qr', desc: 'Guarde texto plano, registros sin conexión y matrices de claves secretas.' },
    { name: 'App Store de QR', slug: 'app-store-qr', desc: 'Dirija a sus clientes a las páginas de descarga de App Store.' },
  ],
  fr: [
    { name: 'URL QR', slug: 'url-qr-generator', desc: 'Redirections web sécurisées avec liens courts traçables en direct.' },
    { name: 'PDF QR', slug: 'pdf-qr-generator', desc: 'Documents dynamiques sans contact pour menus de restaurants et guides.' },
    { name: 'WiFi QR', slug: 'wifi-qr-generator', desc: 'Connectez automatiquement les invités sans saisir de mot de passe.' },
    { name: 'vCard QR', slug: 'vcard-qr-generator', desc: 'Partagez immédiatement des fiches de contact numériques complètes.' },
    { name: 'Email QR', slug: 'email-qr-generator', desc: 'Préconfigurez les adresses de réception avec des modèles de corps de texte.' },
    { name: 'SMS QR', slug: 'sms-qr-generator', desc: 'Rédigez des messages directs avec des numéros de téléphone pré-alloués.' },
    { name: 'WhatsApp QR', slug: 'whatsapp-qr-generator', desc: 'Lancez des discussions instantanées personnalisées avec le support.' },
    { name: 'Réseaux QR', slug: 'instagram-qr-generator', desc: 'Regroupez vos liens bio Instagram, Facebook et Youtube.' },
    { name: 'Texte QR', slug: 'text-qr', desc: 'Stockez du texte brut, des journaux hors ligne et des clés secrètes.' },
    { name: 'App Store QR', slug: 'app-store-qr', desc: 'Dirigez les visiteurs vers les fiches de téléchargement App Store / Play Store.' },
  ],
  de: [
    { name: 'URL-QR', slug: 'url-qr-generator', desc: 'Sichere Web-Weiterleitungen mit live verfolgbaren Kurzlinks.' },
    { name: 'PDF-QR', slug: 'pdf-qr-generator', desc: 'Kontaktlose dynamische Dokumente für Speisekarten und Leitfäden.' },
    { name: 'WLAN-QR', slug: 'wifi-qr-generator', desc: 'Gäste automatisch ohne Passworteingabe mit dem WLAN verbinden.' },
    { name: 'vCard-QR', slug: 'vcard-qr-generator', desc: 'Umfangreiche digitale Kontaktdaten sofort für Scanner freigeben.' },
    { name: 'E-Mail-QR', slug: 'email-qr-generator', desc: 'Empfängeradressen mit vorformuliertem Text im Nachrichtentext einrichten.' },
    { name: 'SMS-QR', slug: 'sms-qr-generator', desc: 'Direkt-SMS an vordefinierte Telefonnummern verfassen.' },
    { name: 'WhatsApp-QR', slug: 'whatsapp-qr-generator', desc: 'Sofortige personalisierte WhatsApp-Chats mit Support-Mitarbeitern starten.' },
    { name: 'Social-QR', slug: 'instagram-qr-generator', desc: 'Führen Sie Ihre Bio-Links für Instagram, Facebook und Youtube zusammen.' },
    { name: 'Text-QR', slug: 'text-qr', desc: 'Speichern Sie reinen Text, Offline-Protokolle und geheime Schlüsselmatrizen.' },
    { name: 'App-Store-QR', slug: 'app-store-qr', desc: 'Leiten Sie Besucher direkt zu den App Store / Play Store Download-Einträgen.' },
  ],
  pt: [
    { name: 'URL QR', slug: 'url-qr-generator', desc: 'Redirecionamentos web seguros com links encurtados rastreáveis.' },
    { name: 'PDF QR', slug: 'pdf-qr-generator', desc: 'Documentos dinâmicos sem contato para menus de restaurantes e guias.' },
    { name: 'WiFi QR', slug: 'wifi-qr-generator', desc: 'Conecte convidados automaticamente sem digitação de senha.' },
    { name: 'vCard QR', slug: 'vcard-qr-generator', desc: 'Compartilhe registros de contato digitais ricos instantaneamente.' },
    { name: 'E-mail QR', slug: 'email-qr-generator', desc: 'Configure endereços de destino com modelos de texto pré-definidos.' },
    { name: 'SMS QR', slug: 'sms-qr-generator', desc: 'Escreva mensagens SMS diretas com números de telefone pré-definidos.' },
    { name: 'WhatsApp QR', slug: 'whatsapp-qr-generator', desc: 'Inicie bate-papos personalizados instantâneos com nossa equipe.' },
    { name: 'Social QR', slug: 'instagram-qr-generator', desc: 'Consolide links de biografia para Instagram, Facebook e Youtube.' },
    { name: 'Texto QR', slug: 'text-qr', desc: 'Armazene texto simples, registros offline e chaves secretas.' },
    { name: 'App Store QR', slug: 'app-store-qr', desc: 'Direcione visitantes para download na App Store / Play Store.' },
  ],
  it: [
    { name: 'URL QR', slug: 'url-qr-generator', desc: 'Reindirizzamenti web sicuri con link brevi tracciabili in tempo reale.' },
    { name: 'PDF QR', slug: 'pdf-qr-generator', desc: 'Documenti dinamici contactless per menu di ristoranti e guide.' },
    { name: 'WiFi QR', slug: 'wifi-qr-generator', desc: 'Connetti automaticamente gli ospiti senza digitare la password.' },
    { name: 'vCard QR', slug: 'vcard-qr-generator', desc: 'Condividi contatti digitali ricchi di informazioni con gli scanner.' },
    { name: 'Email QR', slug: 'email-qr-generator', desc: 'Preconfigura indirizzi di ricezione con testi personalizzati.' },
    { name: 'SMS QR', slug: 'sms-qr-generator', desc: 'Componi messaggi di testo diretti con numeri pre-assegnati.' },
    { name: 'WhatsApp QR', slug: 'whatsapp-qr-generator', desc: 'Avvia istantaneamente chat WhatsApp personalizzate con lo staff.' },
    { name: 'Social QR', slug: 'instagram-qr-generator', desc: 'Consolida i tuoi link bio per Instagram, Facebook e Youtube.' },
    { name: 'Testo QR', slug: 'text-qr', desc: 'Memorizza testo normale, log offline e matrici di chiavi segrete.' },
    { name: 'App Store QR', slug: 'app-store-qr', desc: 'Indirizza i visitatori direttamente ai download su App Store / Play Store.' },
  ],
  tr: [
    { name: 'URL QR', slug: 'url-qr-generator', desc: 'Canlı izlenebilir kısa linklerle güvenli web yönlendirmeleri.' },
    { name: 'PDF QR', slug: 'pdf-qr-generator', desc: 'Restoran menüleri ve rehberler için temassız dinamik belgeler.' },
    { name: 'WiFi QR', slug: 'wifi-qr-generator', desc: 'Misafirleri şifre girmeden otomatik olarak yerel ağa bağlayın.' },
    { name: 'vCard QR', slug: 'vcard-qr-generator', desc: 'Kapsamlı dijital iletişim kayıtlarını anında tarayıcılarla paylaşın.' },
    { name: 'E-posta QR', slug: 'email-qr-generator', desc: 'Alıcı adreslerini hazır şablon gövde metinleriyle önceden ayarlayın.' },
    { name: 'SMS QR', slug: 'sms-qr-generator', desc: 'Önceden atanmış telefon numaraları ile doğrudan SMS yazın.' },
    { name: 'WhatsApp QR', slug: 'whatsapp-qr-generator', desc: 'Destek ekibimizle anında özelleştirilmiş WhatsApp sohbeti başlatın.' },
    { name: 'Sosyal QR', slug: 'instagram-qr-generator', desc: 'Instagram, Facebook ve Youtube biyografi linklerinizi tek yerde toplayın.' },
    { name: 'Metin QR', slug: 'text-qr', desc: 'Düz metinleri, çevrimdışı logları ve gizli anahtar matrislerini saklayın.' },
    { name: 'App Store QR', slug: 'app-store-qr', desc: 'Ziyaretçileri doğrudan App Store / Play Store indirme sayfalarına yönlendirin.' },
  ],
  id: [
    { name: 'URL QR', slug: 'url-qr-generator', desc: 'Pengalihan web aman dengan tautan pendek yang dapat dilacak secara langsung.' },
    { name: 'PDF QR', slug: 'pdf-qr-generator', desc: 'Dokumen dinamis tanpa kontak untuk menu restoran & panduan.' },
    { name: 'WiFi QR', slug: 'wifi-qr-generator', desc: 'Hubungkan tamu ke router nirkabel lokal secara otomatis tanpa mengetik sandi.' },
    { name: 'vCard QR', slug: 'vcard-qr-generator', desc: 'Bagikan catatan kontak digital lengkap langsung ke pemindai.' },
    { name: 'Email QR', slug: 'email-qr-generator', desc: 'Prekonfigurasi alamat penerima dengan teks isi pesan yang disesuaikan.' },
    { name: 'SMS QR', slug: 'sms-qr-generator', desc: 'Tulis pesan SMS langsung dengan nomor telepon yang ditentukan.' },
    { name: 'WhatsApp QR', slug: 'whatsapp-qr-generator', desc: 'Mulai obrolan WhatsApp instan yang disesuaikan dengan staf dukungan.' },
    { name: 'Sosial QR', slug: 'instagram-qr-generator', desc: 'Konsolidasikan tautan bio Anda untuk Instagram, Facebook, dan Youtube.' },
    { name: 'Teks QR', slug: 'text-qr', desc: 'Simpan teks biasa, log offline, dan matriks kunci rahasia.' },
    { name: 'App Store QR', slug: 'app-store-qr', desc: 'Arahkan pengunjung langsung ke unduhan App Store / Play Store.' },
  ],
  hi: [
    { name: 'यूआरएल क्यूआर', slug: 'url-qr-generator', desc: 'लाइव ट्रैक करने योग्य छोटे लिंक के साथ सुरक्षित वेब रीडायरेक्ट।' },
    { name: 'पीडीएफ क्यूआर', slug: 'pdf-qr-generator', desc: 'रेस्तरां मेनू और गाइड लोड करने वाले संपर्क रहित गतिशील दस्तावेज़।' },
    { name: 'वाईफाई क्यूआर', slug: 'wifi-qr-generator', desc: 'बिना पासवर्ड टाइप किए मेहमानों को स्थानीय वायरलेस राउटर से जोड़ें।' },
    { name: 'vCard क्यूआर', slug: 'vcard-qr-generator', desc: 'स्कैनर के साथ तुरंत डिजिटल संपर्क रिकॉर्ड साझा करें।' },
    { name: 'ईमेल क्यूआर', slug: 'email-qr-generator', desc: 'कस्टम संदेश के साथ प्राप्तकर्ता का ईमेल पता पहले से सेट करें।' },
    { name: 'एसएमएस क्यूआर', slug: 'sms-qr-generator', desc: 'पहले से निर्धारित फ़ोन नंबर के साथ सीधे टेक्स्ट संदेश लिखें।' },
    { name: 'व्हाट्सएप क्यूआर', slug: 'whatsapp-qr-generator', desc: 'सहायता टीम के साथ तुरंत अनुकूलित चैट शुरू करें।' },
    { name: 'सोशल क्यूआर', slug: 'instagram-qr-generator', desc: 'इंस्टाग्राम, फेसबुक और यूट्यूब बायो लिंक को एक साथ जोड़ें।' },
    { name: 'टेक्स्ट क्यूआर', slug: 'text-qr', desc: 'सामान्य टेक्स्ट, ऑफ़लाइन लॉग और सीक्रेट कीज़ स्टोर करें।' },
    { name: 'ऐप स्टोर क्यूआर', slug: 'app-store-qr', desc: 'विज़िटर्स को सीधे ऐप स्टोर या प्ले स्टोर डाउनलोड पर भेजें।' }
  ],
  ja: [
    { name: 'URL QR', slug: 'url-qr-generator', desc: '追跡可能な短縮リンクによる安全なWebリダイレクト。' },
    { name: 'PDF QR', slug: 'pdf-qr-generator', desc: 'メニューやガイドを読み込む非接触型ダイナミックドキュメント。' },
    { name: 'WiFi QR', slug: 'wifi-qr-generator', desc: 'パスワード入力なしでローカルルーターに自動接続。' },
    { name: 'vCard QR', slug: 'vcard-qr-generator', desc: '豊富なデジタル連絡先レコードをスキャナーに即座に共有。' },
    { name: 'メール QR', slug: 'email-qr-generator', desc: '件名や本文をカスタマイズしたメールアドレス의 사전 설정。' },
    { name: 'SMS QR', slug: 'sms-qr-generator', desc: '指定された電話番号への直接テキストメッセージ作成。' },
    { name: 'WhatsApp QR', slug: 'whatsapp-qr-generator', desc: 'サポートスタッフとのカスタマイズされたチャットを即座に開始。' },
    { name: 'ソーシャル QR', slug: 'instagram-qr-generator', desc: 'Instagram、Facebook、Youtubeのリンクを1つに統合。' },
    { name: 'テキスト QR', slug: 'text-qr', desc: 'プレーンテキスト、オフラインログ、秘密鍵マトリックスを保存。' },
    { name: 'アプリストア QR', slug: 'app-store-qr', desc: 'App Store / Play Storeのダウンロードページへ直接誘導。' }
  ],
  ko: [
    { name: 'URL QR', slug: 'url-qr-generator', desc: '실시간 추적 가능한 단축 링크로 안전한 웹 리디렉션.' },
    { name: 'PDF QR', slug: 'pdf-qr-generator', desc: '메뉴 및 가이드를 로드하는 비접촉식 다이내믹 문서.' },
    { name: 'WiFi QR', slug: 'wifi-qr-generator', desc: '비밀번호 입력 없이 로컬 무선 공유기에 자동 연결.' },
    { name: 'vCard QR', slug: 'vcard-qr-generator', desc: '풍부한 디지털 연락처 정보를 스캐너에 즉시 공유.' },
    { name: '이메일 QR', slug: 'email-qr-generator', desc: '사용자 지정 본문 템플릿과 수신 이메일 주소 사전 구성.' },
    { name: 'SMS QR', slug: 'sms-qr-generator', desc: '지정된 전화번호로 직접 전송할 텍스트 메시지 작성.' },
    { name: 'WhatsApp QR', slug: 'whatsapp-qr-generator', desc: '고객 지원팀과 실시간 맞춤형 채팅 즉시 시작.' },
    { name: '소셜 QR', slug: 'instagram-qr-generator', desc: '인스타그램, 페이스북, 유튜브 프로필 링크 통합.' },
    { name: '텍스트 QR', slug: 'text-qr', desc: '일반 텍스트, 오프라인 로그 및 비밀 키 매트릭스 저장.' },
    { name: '앱 스토어 QR', slug: 'app-store-qr', desc: '방문자를 앱 스토어 / 플레이 스토어 다운로드로 직접 유도.' }
  ],
  zh: [
    { name: 'URL 二维码', slug: 'url-qr-generator', desc: '安全网页重定向，配有实时可追踪的短链接。' },
    { name: 'PDF 二维码', slug: 'pdf-qr-generator', desc: '无接触动态文档，轻松加载餐厅菜单与指南。' },
    { name: 'WiFi 二维码', slug: 'wifi-qr-generator', desc: '无需输入密码，即可自动将访客连接至本地路由器。' },
    { name: 'vCard 二维码', slug: 'vcard-qr-generator', desc: '立即向扫描仪分享丰富的电子联系人名片。' },
    { name: '电子邮件 二维码', slug: 'email-qr-generator', desc: '预先配置收件人地址与自定义的正文模板。' },
    { name: '短信 二维码', slug: 'sms-qr-generator', desc: '编写带有预设电话号码的直接文本短信。' },
    { name: 'WhatsApp 二维码', slug: 'whatsapp-qr-generator', desc: '立即与客服人员启动自定义的即时聊天。' },
    { name: '社交 二维码', slug: 'instagram-qr-generator', desc: '将您的 Instagram、Facebook 和 Youtube 链接合并。' },
    { name: '文本 二维码', slug: 'text-qr', desc: '存储纯文本、离线日志及密钥矩阵。' },
    { name: '应用商店 二维码', slug: 'app-store-qr', desc: '引导访客直接访问 App Store / Play Store 下载页面。' }
  ]
};

// FAQ Category Translations Mapping
export const faqCategoryLabels: (Record<Locale, Record<string, string>> & Record<string, any>) = {
  en: {
    all: "All Questions",
    general: "General & Basics",
    creation: "QR Creation",
    customization: "Customization & Styling",
    security: "Security & Privacy",
    business: "Business & Commercial"
  },
  ar: {
    all: "كل الأسئلة",
    general: "العامة والأساسيات",
    creation: "إنشاء QR",
    customization: "التخصيص والتصميم",
    security: "الأمان والخصوصية",
    business: "الأعمال والتجارة"
  },
  ur: {
    all: "تمام سوالات",
    general: "عام اور بنیادی باتیں",
    creation: "QR تخلیق",
    customization: "تخصیص اور اسٹائلنگ",
    security: "سیکیورٹی اور رازداری",
    business: "کاروبار اور تجارتی"
  },
  es: {
    all: "Todas las preguntas",
    general: "General y básico",
    creation: "Creación de QR",
    customization: "Personalización y estilo",
    security: "Seguridad y privacidad",
    business: "Negocios y comercial"
  },
  fr: {
    all: "Toutes les questions",
    general: "Général & Essentiels",
    creation: "Création QR",
    customization: "Personnalisation & Style",
    security: "Sécurité & Confidentialité",
    business: "Affaires & Commercial"
  },
  de: {
    all: "Alle Fragen",
    general: "Allgemeines & Grundlagen",
    creation: "QR-Erstellung",
    customization: "Anpassung & Design",
    security: "Sicherheit & Datenschutz",
    business: "Geschäftlich & Kommerziell"
  },
  pt: {
    all: "Todas as perguntas",
    general: "Geral & Básicos",
    creation: "Criação de QR",
    customization: "Personalização & Estilo",
    security: "Segurança & Privacidade",
    business: "Negócios & Comercial"
  },
  it: {
    all: "Tutte le domande",
    general: "Generale & Base",
    creation: "Creazione QR",
    customization: "Personalizzazione & Stile",
    security: "Sicurezza & Privacy",
    business: "Business & Commerciale"
  },
  tr: {
    all: "Tüm Sorular",
    general: "Genel & Temeller",
    creation: "QR Oluşturma",
    customization: "Özelleştirme & Stil",
    security: "Güvenlik & Gizlilik",
    business: "İş & Ticari"
  },
  id: {
    all: "Semua Pertanyaan",
    general: "Umum & Dasar",
    creation: "Pembuatan QR",
    customization: "Kustomisasi & Gaya",
    security: "Keamanan & Privasi",
    business: "Bisnis & Komersial"
  },
  hi: {
    all: "सभी प्रश्न",
    general: "सामान्य और बुनियादी बातें",
    creation: "क्यूआर निर्माण",
    customization: "अनुकूलन और स्टाइलिंग",
    security: "सुरक्षा और गोपनीयता",
    business: "व्यापार और वाणिज्यिक"
  },
  ja: {
    all: "すべての質問",
    general: "一般と基本",
    creation: "QR作成",
    customization: "カスタマイズとスタイル",
    security: "セキュリティとプライバシー",
    business: "ビジネスと商業"
  },
  ko: {
    all: "모든 질문",
    general: "일반 및 기본",
    creation: "QR 생성",
    customization: "맞춤 설정 및 스타일",
    security: "보안 및 개인정보",
    business: "비즈니스 및 상업"
  },
  zh: {
    all: "所有问题",
    general: "通用与基础",
    creation: "二维码生成",
    customization: "定制与样式",
    security: "安全与隐私",
    business: "商业与企业"
  }
};

export function getLocalizedFaq(locale: Locale): FAQItem[] {
  return getFaqData(locale);
}

export function getLocalizedBlog(locale: Locale): BlogArticle[] {
  return getBlogArticles(locale);
}

/* pronunciación correctas al lado de listas de palabras extranjeras en folletos escolares de estudio.
* **Consultas de hojas de resultados**: Proporcione códigos de respuestas de exámenes en paneles públicos para promover la autoevaluación guiada.
* **Tutoriales de tareas complejas**: Agregue códigos que apunten a explicaciones en video sencillas de álgebra o ciencia junto a las actividades.
* **Informes de padres y apoderados**: Imprima códigos en informes escolares para abrir bitácoras de profesores de forma cómoda.`,
    relatedFAQs: [
      {
        question: "¿Los códigos estáticos son seguros frente a accesos infantiles?",
        answer: "Sí, puesto que el código únicamente contiene la dirección escrita. Siempre verifique que la URL de destino sea adecuada para los estudiantes antes de imprimir."
      }
    ],
    internalLinks: [
      { label: "Diseñar pases de estudio", url: "/" }
    ]
  },
  "common-qr-code-mistakes-avoid": {
    title: "Errores Comunes al Crear Códigos QR y cómo evitarlos",
    intro: "Evite fallas de lectura y pérdidas económicas en impresión. Aprenda sobre reglas de contraste, distancia de enfoque y tamaño físico.",
    contentMarkdown: `## Asegurando una Legibilidad de Lectura Perfecta en sus Impresos

Aunque el software genera gráficos en segundos, que estos se lean en condiciones de poca luz requiere cumplir con ciertos parámetros de diseño básicos.

### 8 Errores críticos de diseño a resolver

1. **Baja relación de contraste**: Evite el uso de colores con diferencias menores (por ejemplo, puntos naranja sobre fondo crema). Use relaciones mínimas de contraste superiores a 4:1.
2. **Textos excesivamente extensos en modo estático**: No cargue enlaces cargados de parámetros largos. La cuadrícula de puntos se volverá densa de leer. Use redirecciones de enlaces cortos.
3. **Ignorar el margen perimetral**: Mantenga vacío el espacio perimetral (Zona de Silencio). Si coloca texto o márgenes decorativos muy cerca, los lectores no decodificarán con éxito.
4. **Impresiones inferiores al tamaño recomendado**: Tamaños menores a 2x2 cm dificultan el enfoque en lentes de teléfonos antiguos de enfoque fijo.
5. **Cortar patrones de las esquinas**: Respete la integridad visual de los tres cuadrados de posicionamiento grandes. De lo contrario, los procesadores gráficos no orientarán la imagen.
6. **Error de corrección insuficiente**: Si añade imágenes o emojis personalizados en el centro del código sin configurar la corrección de errores en nivel Q u H, el QR quedará corrupto.
7. **Bajo brillo ambiental y reflejos**: Evite imprimir sobre materiales metálicos, plastificados excesivamente brillantes o pantallas expuestas al sol directo, ya que causan destellos.
8. **Vínculos dinámicos caídos o rotos**: Pruebe físicamente el escaneo en múltiples marcas de dispositivos móviles antes de autorizar tirajes masivos de publicidad en imprentas.`,
    relatedFAQs: [
      {
        question: "¿Cómo compruebo la seguridad de escaneo antes de imprimir?",
        answer: "Use formato vectorial de alta resolución SVG, mantenga un perfil de alto contraste de color y realice pruebas de muestra física."
      }
    ],
    internalLinks: [
      { label: "Conocer mejores prácticas en nuestra FAQ", url: "/faq" }
    ]
  },
  "how-qr-codes-improve-customer-experience": {
    title: "Cómo los Códigos QR mejoran la Experiencia del Cliente",
    intro: "El éxito de un negocio físico actual reside en retirar fricciones de compra. Conozca cómo agilizar los flujos de autoservicio y los reportes de opinión.",
    contentMarkdown: `## Acelerando el acceso al servicio mediante accesos rápidos en mesa

La comodidad es una ventaja competitiva fundamental en retail y restaurantes. El código QR ahorra tiempo de espera y agiliza las gestiones cotidianas.

### Ejemplos prácticos de experiencia de usuario

* **Manuales de instrucciones interactivos**: Sustituya los folletos de papel gruesos por un código en la caja del artículo que abra instructivos de montaje rápidos.
* **Procesamiento de ingresos hoteleros**: Ofrezca lecturas de reserva en recepción para dar de alta registros de entrada de manera rápida directamente en el teléfono del cliente.
* **Atención y soporte telefónico de inmediato**: Permita iniciar conversaciones de chat directo con asesores de venta en segundos resolviendo inquietudes posventa.
* **Repetición ágil de pedidos de insumos**: Instale códigos fijos en máquinas para facilitar reposiciones inmediatas de consumibles en el almacén del cliente.`,
    relatedFAQs: [
      {
        question: "¿Es posible usar códigos de barras 2D para reseñas en Google?",
        answer: "Sí, pegue su enlace de opinión comercial de Google My Business en nuestro diseñador para animar a sus clientes a valorarle tras el consumo."
      }
    ],
    internalLinks: [
      { label: "Explorar propuestas de diseño", url: "/" }
    ]
  },
  "future-of-qr-code-technology": {
    title: "El Futuro de la Tecnología de Códigos QR",
    intro: "Los códigos bidimensionales evolucionan constantemente hacia la Web3, redes neuronales creativas, realidad aumentada y autenticación segura.",
    contentMarkdown: `## La evolución inteligente del escaneo cotidiano

Los códigos de barras 2D continúan ganando espacio y protagonismo técnico integrándose en experiencias cotidianas digitales seguras.

### Tendencias tecnológicas próximas de los códigos de respuesta rápida

* **Gráficos estéticos con Inteligencia Artificial**: Las herramientas generativas permiten incrustar códigos QR completamente compatibles dentro de ilustraciones y pinturas artísticas de alta fidelidad, unificando marca y función.
* **Integraciones interactivas de Realidad Aumentada (AR)**: Proyecte visualizaciones de modelos y objetos en tres dimensiones sobre su entorno escaneando un código en cajas físicas o revistas.
* **Identidad Web3 e industrializada segura**: Asegure la trazabilidad de la cadena de frío, revise la procedencia y originalidad de bienes de lujo en blockchain y realice ingresos en plataformas web seguras.
* **Estándar Universal GS1 Digital Link**: El sistema mundial de retail planea transiciones de los códigos clásicos UPC a los de formato QR, lo que permitirá a un único código abastecer tanto la caja registradora como las especificaciones del fabricante para el cliente.`,
    relatedFAQs: [
      {
        question: "¿El diseño clásico va a cambiar radicalmente?",
        answer: "El motor Reed-Solomon y las bibliotecas gráficas nativas seguirán siendo plenamente funcionales. La diferencia radicará en estilos integrados creativos y mayor interactividad conectada."
      }
    ],
    internalLinks: [
      { label: "Crear un código QR de alta resolución", url: "/" }
    ]
  }
};
*/
