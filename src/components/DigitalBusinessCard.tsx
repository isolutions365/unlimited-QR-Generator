import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Contact, Mail, Phone, MapPin, Globe, Share2, Download, Save, 
  QrCode, ExternalLink, Trash2, Plus, CheckCircle2, Copy, 
  Zap, ShieldCheck, Smartphone, Eye, UploadCloud, ChevronRight, Check,
  Briefcase, Landmark, Info
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { signInAnonymously } from 'firebase/auth';
import { collection, doc, setDoc, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { api } from '../lib/api';
import { playAudioSound } from '../utils/audioFeedback';
import { useTranslation } from '../utils/i18n';
import { buildProductionUrl } from '../config/siteConfig';

// Interfaces
interface SocialLink {
  id: string;
  platform: 'LinkedIn' | 'Twitter/X' | 'Instagram' | 'GitHub' | 'Facebook' | 'YouTube' | 'Custom';
  url: string;
}

interface DigitalCardData {
  id: string;
  name: string;
  photoUrl: string; // Base64 or absolute image link
  logoUrl: string; // Base64 or absolute image link
  company: string;
  title: string;
  email: string;
  phone: string;
  whatsApp: string;
  address: string;
  website: string;
  socialLinks: SocialLink[];
  theme: 'executive' | 'obsidian' | 'tech' | 'terracotta';
  layout: 'standard' | 'minimal' | 'executive';
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
];

const PRESET_LOGOS = [
  '⚡ ApexCorp',
  '🍃 BioSphere',
  '🛡️ Sentinel',
  '🌌 NebulaTech'
];

export default function DigitalBusinessCard() {
  const { locale } = useTranslation();
  const isArabic = locale === 'ar';
  const isUrdu = locale === 'ur';
  const isRtl = isArabic || isUrdu;

  const tCard = (enText: string): string => {
    if (isArabic) {
      const arDict: Record<string, string> = {
        "Creative Contact Station": "محطة الاتصال الإبداعية",
        "Digital Business Cards": "بطاقات العمل الرقمية",
        "Design professional, contact-rich digital business cards (vCards) with customizable layouts, active preset logos, instant WhatsApp or social media links, Apple/Google Wallet simulations, and elegant dynamic QR codes.": "صمّم بطاقات عمل رقمية (vCard) احترافية وغنية ببيانات الاتصال مع تخطيطات قابلة للتخصيص، وشعارات مسبقة الضبط نشطة، وروابط WhatsApp أو وسائل التواصل الاجتماعي الفورية، ومحاكاة Apple/Google Wallet، ورموز QR ديناميكية أنيقة.",
        "1. Personal Information & Bio": "1. المعلومات الشخصية والنبذة",
        "Choose name, position title, and primary workplace context.": "اختر الاسم، والمسمى الوظيفي، وبيئة العمل الأساسية.",
        "Full Name": "الاسم الكامل",
        "Job Title": "المسمى الوظيفي",
        "Company": "الشركة",
        "Job Title / Designation": "المسمى الوظيفي / المنصب",
        "Company Name": "اسم الشركة",
        "Official Website": "الموقع الرسمي",
        "Email Address": "البريد الإلكتروني",
        "Phone Number": "رقم الهاتف",
        "WhatsApp Chat Link (Or Number)": "رابط أو رقم محادثة واتساب",
        "Office/Postal Address": "عنوان المكتب / البريد",
        "Profile Photo (Self-Contained)": "صورة الملف الشخصي",
        "Upload Image": "رفع صورة",
        "Presets:": "نماذج:",
        "Company Emblem / Brand Logo": "شعار الشركة أو العلامة التجارية",
        "Upload Brand Logo": "رفع شعار العلامة التجارية",
        "Texts:": "نصوص:",
        "Dynamic Social Integrations": "تكاملات التواصل الاجتماعي الديناميكية",
        "Append custom profiles links (LinkedIn, YouTube, X, etc.)": "أضف روابط الملفات الشخصية (LinkedIn, YouTube, X, إلخ)",
        "Add Link": "إضافة رابط",
        "No active social links. Click \"Add Link\" to integrate networks.": "لا توجد روابط تواصل اجتماعي مضافة. انقر فوق \"إضافة رابط\" لإدراج الشبكات.",
        "Visual Theme & Layout": "المظهر البصري والتخطيط",
        "Executive Minimal": "تنفيذي بسيط",
        "White & Blue": "أبيض وأزرق",
        "Sleek Obsidian": "سبجي أنيق",
        "Dark & Amber Gold": "داكن وذهبي عنبري",
        "Tech Slate": "تقني رمادي",
        "Sleek Cyan Neon": "سيان نيون أنيق",
        "Warm Craft": "حرفي دافئ",
        "Organic Clay Cream": "طمي كريمي عضوي",
        "Saved Cards on Account / Cache": "البطاقات المحفوظة في الحساب / الذاكرة",
        "No saved passes found. Click \"Save Pass\" above to register and secure your business card!": "لا توجد بطاقات محفوظة. انقر على \"حفظ البطاقة\" أعلاه لتسجيل وتأمين بطاقة عملك!",
        "Double-Sided Live Mockup": "معاينة حية تفاعلية ثنائية الجوانب",
        "Flip Card": "قلب البطاقة",
        "Flip Card (View Front)": "قلب البطاقة (عرض الوجه)",
        "Flip Card (View Back)": "قلب البطاقة (عرض الخلف)",
        "Front": "الوجه",
        "Back": "الخلف",
        "INDEPENDENT": "مستقل",
        "Anonymous User": "مستخدم غير محدد",
        "Product Developer": "مطور منتجات",
        "Logo": "شعار",
        "Contact Channels": "قنوات الاتصال",
        "Personal QR ID": "معرّف QR الشخصي",
        "Scan to Connect": "امسح للتواصل",
        "Interact & Share": "تفاعل ومشاركة",
        "Direct vCard": "vCard مباشر",
        "Web Profile": "الملف الشخصي عبر الويب",
        "VCARD GENERATOR DATA": "بيانات منشئ VCARD",
        "WEB REDIRECT MODULE": "وحدة إعادة التوجيه للويب",
        "Encodes Name, Address, Email, Phone, Logo & Website inside the QR matrix.": "يشفر الاسم والعنوان والبريد والهاتف والشعار والموقع داخل مصفوفة QR.",
        "Creates a simulated, interactive digital business profile on scan.": "ينشئ ملف تعريف رقمي تفاعلي لبطاقة العمل عند المسح.",
        "Save Contact (.vcf)": "حفظ جهة الاتصال (.vcf)",
        "Download QR (PNG)": "تنزيل رمز QR (PNG)",
        "Download QR (SVG)": "تنزيل رمز QR (SVG)",
        "Share Card Link": "مشاركة رابط البطاقة",
        "Copied!": "تم النسخ!",
        "Copied": "تم النسخ",
        "Mobile Wallet Pass Export": "تصدير بطاقة المحفظة الإلكترونية",
        "Save your contact card directly to smartphone wallets for quick tap-and-share access.": "احفظ بطاقة اتصالك مباشرة في محفظة الهاتف الذكي للوصول السريع والمشاركة بنقرة واحدة.",
        " Apple Wallet": " محفظة آبل (Apple Wallet)",
        "🤖 Google Wallet": "🤖 محفظة جوجل (Google Wallet)",
        "Apple Wallet Card": "بطاقة محفظة آبل",
        "MEMBER": "عضو",
        "Designation": "المنصب",
        "SMARTPASS INTEGRATION": "تكامل البطاقة الذكية",
        "✓ Ready to Install": "✓ جاهز للتثبيت",
        "Apple Wallet Digital Pass": "بطاقة محفظة آبل الرقمية",
        "Copy Pass Payload": "نسخ حمولة البطاقة",
        "Export your formatted wallet card to save or distribute directly to iOS devices.": "صدّر بطاقة محفظتك المنسقة لحفظها أو توزيعها مباشرة على أجهزة iOS.",
        "Download Apple Wallet Pass File": "تنزيل ملف بطاقة محفظة آبل",
        "Google Wallet Pass": "بطاقة محفظة جوجل",
        "AFFILIATE": "شريك",
        "Card Holder": "صاحب البطاقة",
        "Google Wallet Digital Pass": "بطاقة محفظة جوجل الرقمية",
        "Export your formatted wallet card payload for instant Android Google Wallet sync.": "صدّر حمولة بطاقة محفظتك للمزامنة الفورية مع محفظة جوجل على أجهزة أندرويد.",
        "Download Google Wallet File": "تنزيل ملف محفظة جوجل",
        "Create New Card": "إنشاء بطاقة جديدة",
        "Card Credentials & Info": "بيانات ومعلومات البطاقة",
        "Save Pass": "حفظ البطاقة",
        "Saving...": "جاري الحفظ...",
        "Custom": "مخصص",
        "2. High-Converting Contact Coordinates": "2. إحداثيات الاتصال عالية التحويل",
        "Fill details for live clickable buttons on the digital card.": "املأ التفاصيل للأزرار القابلة للنقر عليها مباشرة على البطاقة الرقمية.",
        "WhatsApp Number (International)": "رقم الواتساب (دولي)",
        "Office Address": "عنوان المكتب",
        "Personal/Company Website": "موقع الشركة أو الموقع الشخصي",
        "3. Social Links & Custom Networks": "3. روابط التواصل الاجتماعي والشبكات المخصصة",
        "Add responsive redirection channels with direct brand icons.": "أضف قنوات إعادة توجيه سريعة الاستجابة مع أيقونات العلامات التجارية المباشرة.",
        "4. Visual Aesthetic & Theme Customizer": "4. الجمالية البصرية ومخصص المظهر",
        "Choose premium typography palettes, custom avatars, logos, and responsive card templates.": "اختر لوحات الخطوط الفاخرة، والصور الرمزية المخصصة، والشعارات، وقوالب البطاقات سريعة الاستجابة.",
        "Select Layout Template": "اختر قالب التخطيط",
        "Choose Styling Theme": "اختر مظهر التنسيق",
        "Save & Publish Card": "حفظ ونشر البطاقة",
        "Publishing...": "جاري النشر...",
        "Load Creative Sample": "تحميل عينة إبداعية",
        "Live Smartphone Simulator": "محاكي الهاتف الذكي المباشر",
        "Add to Apple Wallet": "إضافة إلى Apple Wallet",
        "Add to Google Wallet": "إضافة إلى Google Wallet",
        "Active Live Preview & QR Scan": "المعاينة المباشرة ومسح QR النشط",
        "Scan this dynamic high-fidelity QR code with a phone to access this digital business card on any mobile device instantly.": "امسح رمز QR الديناميكي عالي الدقة هذا بهاتفك للوصول إلى بطاقة العمل الرقمية هذه على أي جهاز محمول على الفور.",
        "Publish card to activate live dynamic links!": "انشر البطاقة لتنشيط الروابط الديناميكية المباشرة!",
        "Bio / Brief Description": "النبذة / وصف قصير",
        "Profile Photo URL": "رابط صورة الملف الشخصي",
        "Or choose premium preset avatar": "أو اختر صورة رمزية مميزة مسبقة الضبط",
        "Corporate Logo text": "نص شعار الشركة",
        "Or choose preset tech symbol": "أو اختر رمزًا تقنيًا جاهزًا",
        "Card Theme Style": "نمط مظهر البطاقة",
        "Layout Orientation": "توجيه التخطيط",
        "Standard Portrait": "عمودي قياسي",
        "Minimal Centered": "بسيط ممركز",
        "Executive Split": "تنفيذي منقسم",
        "Add Social / Digital Channel": "إضافة قناة اجتماعية / رقمية",
        "Select Platform": "اختر المنصة",
        "Redirection URL": "رابط إعادة التوجيه",
        "Add Link Channel": "إضافة قناة الرابط",
        "Active Social & Web Channels": "القنوات الاجتماعية وقنوات الويب النشطة",
        "Trash Channel": "حذف القناة",
        "Card details saved successfully!": "تم حفظ تفاصيل البطاقة بنجاح!"
      };
      return arDict[enText] || enText;
    }

    if (isUrdu) {
      const urDict: Record<string, string> = {
        "Creative Contact Station": "تخلیقی رابطہ مرکز",
        "Digital Business Cards": "ڈیجیٹل بزنس کارڈز",
        "Design professional, contact-rich digital business cards (vCards) with customizable layouts, active preset logos, instant WhatsApp or social media links, Apple/Google Wallet simulations, and elegant dynamic QR codes.": "حسب ضرورت لے آؤٹ، فعال پری سیٹ لوگوز، فوری واٹس ایپ یا سوشل میڈیا لنکس، ایپل/گوگل والیٹ سمیلیشنز اور خوبصورت متحرک کیو آر کوڈز کے ساتھ پیشہ ورانہ اور رابطوں سے بھرپور ڈیجیٹل بزنس کارڈز (vCards) ڈیزائن کریں۔",
        "1. Personal Information & Bio": "1. ذاتی معلومات اور بائیو",
        "Choose name, position title, and primary workplace context.": "نام، عہدہ کا عنوان، اور بنیادی کام کی جگہ کا سیاق و سباق منتخب کریں۔",
        "Full Name": "پورا نام",
        "Job Title": "عہدہ / جاب ٹائٹل",
        "Company": "کمپنی",
        "Job Title / Designation": "عہدہ / منصب",
        "Company Name": "کمپنی کا نام",
        "Official Website": "سرکاری ویب سائٹ",
        "Email Address": "ای میل ایڈریس",
        "Phone Number": "رقم / فون نمبر",
        "WhatsApp Chat Link (Or Number)": "واٹس ایپ چیٹ لنک (یا نمبر)",
        "Office/Postal Address": "دفتر / ڈاک کا پتہ",
        "Profile Photo (Self-Contained)": "پروفائل تصویر",
        "Upload Image": "تصویر اپ لوڈ کریں",
        "Presets:": "پری سیٹس:",
        "Company Emblem / Brand Logo": "کمپنی کا مونوگرام / برانڈ لوگو",
        "Upload Brand Logo": "برانڈ لوگو اپ لوڈ کریں",
        "Texts:": "متن:",
        "Dynamic Social Integrations": "ڈائنامک سوشل لنکس انٹیگریشنز",
        "Append custom profiles links (LinkedIn, YouTube, X, etc.)": "کسٹم پروفائل لنکس شامل کریں (LinkedIn, YouTube, X, وغیرہ)",
        "Add Link": "لنک شامل کریں",
        "No active social links. Click \"Add Link\" to integrate networks.": "کوئی فعال سوشل لنکس نہیں ہیں۔ نیٹ ورکس شامل کرنے کے لیے \"لنک شامل کریں\" پر کلک کریں۔",
        "Visual Theme & Layout": "بصری تھیم اور لے آؤٹ",
        "Executive Minimal": "ایگزیکٹو منیمل",
        "White & Blue": "سفید اور نیلا",
        "Sleek Obsidian": "سلیک اوبسیڈین",
        "Dark & Amber Gold": "ڈارک اور عنبر گولڈ",
        "Tech Slate": "ٹیک سلیٹ",
        "Sleek Cyan Neon": "سلیک سیان نیون",
        "Warm Craft": "وارم کرافٹ",
        "Organic Clay Cream": "آرگینک کلے کریم",
        "Saved Cards on Account / Cache": "اکاؤنٹ / کیشے میں محفوظ شدہ کارڈز",
        "No saved passes found. Click \"Save Pass\" above to register and secure your business card!": "کوئی محفوظ شدہ کارڈ نہیں ملا۔ اپنے بزنس کارڈ کو محفوظ کرنے کے لیے اوپر \"پاس محفوظ کریں\" پر کلک کریں!",
        "Double-Sided Live Mockup": "ڈبل رخا لائیو ماک اپ",
        "Flip Card": "کارڈ پلٹیں",
        "Flip Card (View Front)": "کارڈ پلٹیں (سامنے کا رخ)",
        "Flip Card (View Back)": "کارڈ پلٹیں (پیچھے کا رخ)",
        "Front": "سامنے",
        "Back": "پیچھے",
        "INDEPENDENT": "خود مختار",
        "Anonymous User": "نامعلوم صارف",
        "Product Developer": "پروڈکٹ ڈویلپر",
        "Logo": "لوگو",
        "Contact Channels": "رابطے کے ذرائع",
        "Personal QR ID": "ذاتی QR شناخت",
        "Scan to Connect": "رابطے کے لیے اسکین کریں",
        "Interact & Share": "بات چیت اور اشتراک",
        "Direct vCard": "براہ راست vCard",
        "Web Profile": "ویب پروفائل",
        "VCARD GENERATOR DATA": "VCARD جنریٹر ڈیٹا",
        "WEB REDIRECT MODULE": "ویب ری ڈائریکٹ ماڈیول",
        "Encodes Name, Address, Email, Phone, Logo & Website inside the QR matrix.": "QR میٹرکس کے اندر نام، پتہ، ای میل، فون، لوگو اور ویب سائٹ کو انکوڈ کرتا ہے۔",
        "Creates a simulated, interactive digital business profile on scan.": "اسکین کرنے پر ایک انٹرایکٹو ڈیجیٹل بزنس پروفائل بناتا ہے۔",
        "Save Contact (.vcf)": "رابطہ محفوظ کریں (.vcf)",
        "Download QR (PNG)": "QR ڈاؤن لوڈ کریں (PNG)",
        "Download QR (SVG)": "QR ڈاؤن لوڈ کریں (SVG)",
        "Share Card Link": "کارڈ کا لنک شیئر کریں",
        "Copied!": "کاپی ہو گیا!",
        "Copied": "کاپی ہو گیا",
        "Mobile Wallet Pass Export": "موبائل والیٹ پاس ایکسپورٹ",
        "Save your contact card directly to smartphone wallets for quick tap-and-share access.": "فوری ٹیپ اور شیئر کے لیے اپنے رابطہ کارڈ کو براہ راست اسمارٹ فون والیٹس میں محفوظ کریں۔",
        " Apple Wallet": " ایپل والیٹ (Apple Wallet)",
        "🤖 Google Wallet": "🤖 گوگل والیٹ (Google Wallet)",
        "Apple Wallet Card": "ایپل والیٹ کارڈ",
        "MEMBER": "رکن",
        "Designation": "عہدہ",
        "SMARTPASS INTEGRATION": "اسمارٹ پاس انٹیگریشن",
        "✓ Ready to Install": "✓ انسٹال کے لیے تیار",
        "Apple Wallet Digital Pass": "ایپل والیٹ ڈیجیٹل پاس",
        "Copy Pass Payload": "پاس پے لوڈ کاپی کریں",
        "Export your formatted wallet card to save or distribute directly to iOS devices.": "iOS ڈیوائسز پر براہ راست محفوظ کرنے یا تقسیم کرنے کے لیے اپنا والیٹ کارڈ ایکسپورٹ کریں۔",
        "Download Apple Wallet Pass File": "ایپل والیٹ پاس فائل ڈاؤن لوڈ کریں",
        "Google Wallet Pass": "گوگل والیٹ پاس",
        "AFFILIATE": "ایفیلی ایٹ",
        "Card Holder": "کارڈ ہولڈر",
        "Google Wallet Digital Pass": "گوگل والیٹ ڈیجیٹل پاس",
        "Export your formatted wallet card payload for instant Android Google Wallet sync.": "اینڈرائیڈ گوگل والیٹ کے ساتھ فوری مطابقت پذیری کے لیے اپنے فارمیٹ شدہ کارڈ کا ڈیٹا برآمد کریں۔",
        "Download Google Wallet File": "گوگل والیٹ فائل ڈاؤن لوڈ کریں",
        "Create New Card": "نیا کارڈ بنائیں",
        "Card Credentials & Info": "کارڈ کی معلومات اور تفصیلات",
        "Save Pass": "پاس محفوظ کریں",
        "Saving...": "محفوظ ہو رہا ہے...",
        "Custom": "کسٹم",
        "2. High-Converting Contact Coordinates": "2. اعلیٰ تبدیلی والے رابطہ ذرائع",
        "Fill details for live clickable buttons on the digital card.": "ڈیجیٹل کارڈ پر براہ راست کلک کے قابل بٹنوں کے لیے تفصیلات بھریں۔",
        "WhatsApp Number (International)" : "واٹس ایپ نمبر (بین الاقوامی)",
        "Office Address": "دفتر کا پتہ",
        "Personal/Company Website": "ذاتی/کمپنی کی ویب سائٹ",
        "3. Social Links & Custom Networks": "3. سوشل لنکس اور کسٹم نیٹ ورکس",
        "Add responsive redirection channels with direct brand icons.": "براہ راست برانڈ شبیہیں کے ساتھ ریسپانسیو ری ڈائریکشن چینلز شامل کریں۔",
        "4. Visual Aesthetic & Theme Customizer": "4. بصری جمالیات اور تھیم کسٹمائزر",
        "Choose premium typography palettes, custom avatars, logos, and responsive card templates.": "پریمیم ٹائپوگرافی پیلیٹس، کسٹم اوتار، لوگوز، اور ریسپانسیو کارڈ ٹیمپلیٹس منتخب کریں۔",
        "Select Layout Template": "لے آؤٹ ٹیمپلیٹ منتخب کریں",
        "Choose Styling Theme": "اسٹائلنگ تھیم منتخب کریں",
        "Save & Publish Card": "کارڈ محفوظ اور شائع کریں",
        "Publishing...": "شائع ہو رہا ہے...",
        "Load Creative Sample": "تخلیقی نمونہ لوڈ کریں",
        "Live Smartphone Simulator": "لائیو اسمارٹ فون سمیلیٹر",
        "Add to Apple Wallet": "ایپل والیٹ میں شامل کریں",
        "Add to Google Wallet": "گوگل والیٹ میں شامل کریں",
        "Active Live Preview & QR Scan": "لائیو پیش نظارہ اور کیو آر اسکین",
        "Scan this dynamic high-fidelity QR code with a phone to access this digital business card on any mobile device instantly.": "کسی بھی موبائل ڈیوائس پر فوری طور پر اس ڈیجیٹل بزنس کارڈ تک رسائی کے لیے فون کے ساتھ اس متحرک ہائی فیڈیلیٹی QR کوڈ کو اسکین کریں۔",
        "Publish card to activate live dynamic links!": "براہ راست متحرک لنکس کو فعال کرنے کے لیے کارڈ شائع کریں!",
        "Bio / Brief Description": "بائیو / مختصر تفصیل",
        "Profile Photo URL": "پروفائل تصویر کا URL",
        "Or choose premium preset avatar": "یا پریمیم پری سیٹ اوتار منتخب کریں",
        "Corporate Logo text": "کمپنی کا لوگو متن",
        "Or choose preset tech symbol": "یا پہلے سے طے شدہ ٹیک علامت منتخب کریں",
        "Card Theme Style": "کارڈ تھیم کا انداز",
        "Layout Orientation": "لے آؤٹ کی سمت",
        "Standard Portrait": "معیاری پورٹریٹ",
        "Minimal Centered": "کم سے کم مرکز",
        "Executive Split": "ایگزیکٹو اسپلٹ",
        "Add Social / Digital Channel": "سوشل / ڈیجیٹل چینل شامل کریں",
        "Select Platform": "پلیٹ فارم منتخب کریں",
        "Redirection URL": "ری ڈائریکشن یو آر ایل",
        "Add Link Channel": "لنک چینل شامل کریں",
        "Active Social & Web Channels": "فعال سوشل اور ویب چینلز",
        "Trash Channel": "چینل حذف کریں",
        "Card details saved successfully!": "کارڈ کی تفصیلات کامیابی سے محفوظ ہو گئیں!"
      };
      return urDict[enText] || enText;
    }

    return enText;
  };

  const [cardData, setCardData] = useState<DigitalCardData>({
    id: 'card-' + Math.random().toString(36).substring(2, 9),
    name: '',
    photoUrl: PRESET_AVATARS[0],
    logoUrl: '',
    company: '',
    title: '',
    email: '',
    phone: '',
    whatsApp: '',
    address: '',
    website: '',
    socialLinks: [],
    theme: 'executive',
    layout: 'standard'
  });

  const [savedCards, setSavedCards] = useState<DigitalCardData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [qrMode, setQrMode] = useState<'vcard' | 'web'>('vcard');
  const [selectedWalletTab, setSelectedWalletTab] = useState<'apple' | 'google'>('apple');
  const [activePresetLogoIndex, setActivePresetLogoIndex] = useState<number | null>(null);

  // Load Saved Cards
  useEffect(() => {
    loadSavedCards();
  }, []);

  const loadSavedCards = async () => {
    let userId = auth.currentUser?.uid;
    if (!userId) {
      try {
        const anon = await signInAnonymously(auth);
        userId = anon.user.uid;
      } catch (e) {
        console.warn('Anon auth notice:', e);
      }
    }
    if (userId) {
      try {
        const q = query(collection(db, 'business_cards'), where('userId', '==', userId));
        const snap = await getDocs(q);
        const list: DigitalCardData[] = [];
        snap.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as DigitalCardData);
        });
        setSavedCards(list);
      } catch (err) {
        console.error('Error fetching business cards from Firestore:', err);
      }
    }
  };

  // Base64 File Readers
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCardData(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCardData(prev => ({ ...prev, logoUrl: reader.result as string }));
        setActivePresetLogoIndex(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add & Delete Social Links
  const addSocialLink = () => {
    const newId = Math.random().toString(36).substring(2, 9);
    setCardData(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { id: newId, platform: 'LinkedIn', url: '' }]
    }));
  };

  const updateSocialLink = (id: string, field: keyof SocialLink, value: string) => {
    setCardData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map(link => 
        link.id === id ? { ...link, [field]: value } : link
      )
    }));
  };

  const removeSocialLink = (id: string) => {
    setCardData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter(link => link.id !== id)
    }));
  };

  // Generate vCard payload
  const generateVCard = () => {
    const socialText = cardData.socialLinks
      .map(link => `X-SOCIALPROFILE;type=${link.platform}:${link.url}`)
      .join('\n');

    return [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${cardData.name}`,
      `ORG:${cardData.company}`,
      `TITLE:${cardData.title}`,
      `EMAIL;TYPE=PREF,INTERNET:${cardData.email}`,
      `TEL;TYPE=CELL,VOICE:${cardData.phone}`,
      cardData.whatsApp ? `TEL;TYPE=WORK,MSG:${cardData.whatsApp}` : '',
      `ADR;TYPE=WORK,POSTAL:${cardData.address}`,
      `URL:${cardData.website}`,
      socialText,
      `REV:${new Date().toISOString()}`,
      'END:VCARD'
    ].filter(Boolean).join('\n');
  };

  // Download VCF Contact Card
  const downloadVCF = () => {
    const vcard = generateVCard();
    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${cardData.name.replace(/\s+/g, '_')}_contact.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    playAudioSound('preview');
  };

  // Save Card to Firestore
  const handleSaveCard = async () => {
    setIsSaving(true);
    let userId = auth.currentUser?.uid;
    if (!userId) {
      try {
        const anon = await signInAnonymously(auth);
        userId = anon.user.uid;
      } catch (e) {
        console.warn('Anon auth notice:', e);
      }
    }
    const currentCard = { ...cardData, updatedAt: new Date().toISOString() };

    if (userId) {
      try {
        await setDoc(doc(db, 'business_cards', currentCard.id), {
          ...currentCard,
          userId
        });
        await api.saveProject({
          id: currentCard.id,
          name: currentCard.name || 'Digital Business Card',
          type: 'vcard',
          content: buildProductionUrl(`/#card-${currentCard.id}`),
          userId: userId,
          trackingId: currentCard.id
        }).catch(() => {});
        playAudioSound('generate');
      } catch (err) {
        console.error('Firestore save failed', err);
      }
    }

    await loadSavedCards();
    setIsSaving(false);
  };

  const handleDeleteCard = async (id: string) => {
    let userId = auth.currentUser?.uid;
    if (!userId) {
      try {
        const anon = await signInAnonymously(auth);
        userId = anon.user.uid;
      } catch (e) {}
    }
    if (userId) {
      try {
        await deleteDoc(doc(db, 'business_cards', id));
        await api.deleteProject(id).catch(() => {});
        playAudioSound('preview');
      } catch (err) {
        console.error('Firestore delete failed', err);
      }
    }
    await loadSavedCards();
  };

  const handleSelectCard = (selected: DigitalCardData) => {
    setCardData(selected);
    playAudioSound('preview');
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedField(label);
    playAudioSound('generate');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleShare = async () => {
    const shareUrl = buildProductionUrl(`/card-preview?name=${encodeURIComponent(cardData.name)}&title=${encodeURIComponent(cardData.title)}&company=${encodeURIComponent(cardData.company)}&email=${encodeURIComponent(cardData.email)}&phone=${encodeURIComponent(cardData.phone)}&website=${encodeURIComponent(cardData.website)}`);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${cardData.name} - Digital Business Card`,
          text: `Connect with ${cardData.name} (${cardData.title} at ${cardData.company})`,
          url: shareUrl
        });
        playAudioSound('generate');
      } catch (err) {
        console.warn('Share cancelled or failed', err);
      }
    } else {
      copyToClipboard(shareUrl, 'Share Link');
    }
  };

  // QR Code Content URL (direct vcard download payload or public redirect link)
  const getQRContent = () => {
    if (qrMode === 'vcard') {
      return generateVCard();
    }
    // Web Mode link formulation
    return buildProductionUrl(`/card-preview?id=${cardData.id}&name=${encodeURIComponent(cardData.name)}&company=${encodeURIComponent(cardData.company)}`);
  };

  // QR Code Image Generator API Endpoint
  const getQRImageSrc = () => {
    const content = encodeURIComponent(getQRContent());
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${content}&color=0f172a&bgcolor=ffffff&margin=10`;
  };

  // Apple Wallet Ready Manifest Generator (pass.json)
  const getAppleWalletPassJSON = () => {
    return JSON.stringify({
      formatVersion: 1,
      passTypeIdentifier: "pass.com.freeqrgen.digitalcard",
      serialNumber: cardData.id,
      teamIdentifier: "ABC123XYZ7",
      organizationName: cardData.company || "FreeQRBarcodes.com Ltd",
      description: `Digital Business Card for ${cardData.name}`,
      foregroundColor: cardData.theme === 'obsidian' ? "rgb(245, 158, 11)" : "rgb(15, 23, 42)",
      backgroundColor: cardData.theme === 'obsidian' ? "rgb(15, 23, 42)" : "rgb(255, 255, 255)",
      labelColor: "rgb(100, 116, 139)",
      logoText: cardData.company || "Digital Pass",
      generic: {
        headerFields: [
          {
            key: "role",
            label: "DESIGNATION",
            value: cardData.title || "Consultant"
          }
        ],
        primaryFields: [
          {
            key: "name",
            label: "FULL NAME",
            value: cardData.name
          }
        ],
        secondaryFields: [
          {
            key: "company",
            label: "ORGANIZATION",
            value: cardData.company || "Independent"
          },
          {
            key: "email",
            label: "EMAIL ADDRESS",
            value: cardData.email
          }
        ],
        backFields: [
          {
            key: "phone",
            label: "Direct Phone",
            value: cardData.phone
          },
          {
            key: "address",
            label: "Work Address",
            value: cardData.address || "N/A"
          },
          {
            key: "website",
            label: "Official Website",
            value: cardData.website
          }
        ]
      },
      barcodes: [
        {
          format: "PKBarcodeFormatQR",
          message: getQRContent(),
          messageEncoding: "iso-8859-1"
        }
      ]
    }, null, 2);
  };

  // Google Wallet Ready Save JWT Generator (Class and Object definitions)
  const getGoogleWalletJSON = () => {
    return JSON.stringify({
      issuerId: "3388000000022345678",
      classId: "3388000000022345678.digital_business_card_class",
      objectPayload: {
        id: `3388000000022345678.${cardData.id}`,
        classId: "3388000000022345678.digital_business_card_class",
        state: "ACTIVE",
        cardTitle: {
          defaultValue: {
            language: "en-US",
            value: cardData.company || "Independent"
          }
        },
        subheader: {
          defaultValue: {
            language: "en-US",
            value: cardData.title || "Executive"
          }
        },
        header: {
          defaultValue: {
            language: "en-US",
            value: cardData.name
          }
        },
        textModulesData: [
          {
            header: "CONTACT EMAIL",
            body: cardData.email,
            id: "email"
          },
          {
            header: "PHONE NUMBER",
            body: cardData.phone,
            id: "phone"
          },
          {
            header: "OFFICIAL WEBSITE",
            body: cardData.website,
            id: "website"
          }
        ],
        barcode: {
          type: "QR_CODE",
          value: getQRContent(),
          alternateText: cardData.name
        }
      }
    }, null, 2);
  };

  const downloadWalletJSON = (walletType: 'apple' | 'google') => {
    const payload = walletType === 'apple' ? getAppleWalletPassJSON() : getGoogleWalletJSON();
    const filename = walletType === 'apple' ? 'pass.json' : 'google_wallet_payload.json';
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    playAudioSound('generate');
  };

  const downloadQRCode = (format: 'png' | 'svg' = 'png') => {
    const content = encodeURIComponent(getQRContent());
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${content}&color=0f172a&bgcolor=ffffff&margin=10${format === 'svg' ? '&format=svg' : ''}`;
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${cardData.name.replace(/\s+/g, '_')}_qr.${format}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    playAudioSound('preview');
  };

  // Color mappings for themes
  const themeStyles = {
    executive: {
      card: 'bg-white text-slate-900 border-gray-100 shadow-xl shadow-slate-200/50',
      badge: 'bg-indigo-50 text-indigo-700',
      accent: 'indigo-600',
      highlight: 'indigo'
    },
    obsidian: {
      card: 'bg-slate-950 text-amber-100 border-amber-900/40 shadow-2xl shadow-amber-950/20',
      badge: 'bg-amber-950/45 text-amber-400 border border-amber-900/30',
      accent: 'amber-500',
      highlight: 'amber'
    },
    tech: {
      card: 'bg-slate-900 text-cyan-100 border-cyan-500/20 shadow-xl shadow-cyan-950/10',
      badge: 'bg-cyan-950/50 text-cyan-400 border border-cyan-500/20',
      accent: 'cyan-500',
      highlight: 'cyan'
    },
    terracotta: {
      card: 'bg-[#faf6f0] text-amber-950 border-orange-100 shadow-xl shadow-orange-900/5',
      badge: 'bg-orange-50 text-orange-800',
      accent: 'orange-700',
      highlight: 'orange'
    }
  };

  const selectedTheme = themeStyles[cardData.theme];

  return (
    <div id="digital-business-card-module" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Intro Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Contact className="w-8 h-8 text-indigo-600 animate-pulse" />
            {tCard("Digital Business Cards")}
          </h2>
          <p className="text-slate-500 text-sm mt-1 max-w-xl">
            {tCard("Design professional, contact-rich digital business cards (vCards) with customizable layouts, active preset logos, instant WhatsApp or social media links, Apple/Google Wallet simulations, and elegant dynamic QR codes.")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCardData({
                id: 'card-' + Math.random().toString(36).substring(2, 9),
                name: '',
                photoUrl: PRESET_AVATARS[0],
                logoUrl: '',
                company: '',
                title: '',
                email: '',
                phone: '',
                whatsApp: '',
                address: '',
                website: '',
                socialLinks: [],
                theme: 'executive',
                layout: 'standard'
              });
              playAudioSound('preview');
            }}
            className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
          >
            {tCard("Create New Card")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Input form controls */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/60 shadow-xs p-6 sm:p-8 space-y-6">
          
          {/* Card Meta & Saving info */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-800">{tCard("Card Credentials & Info")}</h3>
            <button
              onClick={handleSaveCard}
              disabled={isSaving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? tCard("Saving...") : tCard("Save Pass")}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{tCard("Full Name")}</label>
              <input
                type="text"
                value={cardData.name}
                onChange={e => setCardData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={isArabic ? "مثال: سارة جينكينز" : isUrdu ? "مثال: سارہ جاوید" : "e.g. Sarah Jenkins"}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs placeholder:text-slate-400 placeholder:font-normal focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{tCard("Job Title / Designation")}</label>
              <input
                type="text"
                value={cardData.title}
                onChange={e => setCardData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={isArabic ? "مثال: رئيس قسم التصميم" : isUrdu ? "مثال: چیف ڈیزائن آفیسر" : "e.g. Chief Design Officer"}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs placeholder:text-slate-400 placeholder:font-normal focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{tCard("Company Name")}</label>
              <input
                type="text"
                value={cardData.company}
                onChange={e => setCardData(prev => ({ ...prev, company: e.target.value }))}
                placeholder={isArabic ? "مثال: أبيكس للحلول الرقمية" : isUrdu ? "مثال: ایپیکس ڈیجیٹل سلوشنز" : "e.g. Apex Digital Solutions"}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs placeholder:text-slate-400 placeholder:font-normal focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{tCard("Official Website")}</label>
              <input
                type="text"
                value={cardData.website}
                onChange={e => setCardData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="e.g. https://apexcorp.io"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs placeholder:text-slate-400 placeholder:font-normal focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{tCard("Email Address")}</label>
              <input
                type="email"
                value={cardData.email}
                onChange={e => setCardData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="e.g. sarah@apexcorp.io"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs placeholder:text-slate-400 placeholder:font-normal focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{tCard("Phone Number")}</label>
              <input
                type="text"
                value={cardData.phone}
                onChange={e => setCardData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="e.g. +1 (555) 234-5678"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs placeholder:text-slate-400 placeholder:font-normal focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{tCard("WhatsApp Chat Link (Or Number)")}</label>
              <input
                type="text"
                value={cardData.whatsApp}
                onChange={e => setCardData(prev => ({ ...prev, whatsApp: e.target.value }))}
                placeholder="e.g. +15552345678"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs placeholder:text-slate-400 placeholder:font-normal focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{tCard("Office/Postal Address")}</label>
              <input
                type="text"
                value={cardData.address}
                onChange={e => setCardData(prev => ({ ...prev, address: e.target.value }))}
                placeholder={isArabic ? "مثال: 100 شارع الصنوبر، سان فرانسيسكو، كاليفورنيا" : isUrdu ? "مثال: 100 پائن اسٹریٹ، سان فرانسسکو، کیلیفورنیا" : "e.g. 100 Pine Street, San Francisco, CA"}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs placeholder:text-slate-400 placeholder:font-normal focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Asset uploads: Photo & Logo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">{tCard("Profile Photo (Self-Contained)")}</label>
              
              <div className="flex items-center gap-3">
                <img
                  src={cardData.photoUrl || PRESET_AVATARS[1]}
                  alt="Profile Preview"
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0 bg-slate-50"
                />
                <div className="flex-1">
                  <label className="flex items-center justify-center border border-dashed border-slate-300 rounded-xl py-2 px-3 hover:bg-slate-50 transition-colors cursor-pointer text-center text-xs text-slate-600 gap-1.5 font-semibold">
                    <UploadCloud className="w-4 h-4 text-slate-400" />
                    {tCard("Upload Image")}
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Preset avatars choice */}
              <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
                <span className="text-[10px] text-slate-400 shrink-0 font-semibold">{tCard("Presets:")}</span>
                {PRESET_AVATARS.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCardData(prev => ({ ...prev, photoUrl: url }));
                      playAudioSound('preview');
                    }}
                    className={`w-7 h-7 rounded-full overflow-hidden border-2 shrink-0 ${cardData.photoUrl === url ? 'border-indigo-500 scale-105' : 'border-transparent opacity-85 hover:opacity-100'}`}
                  >
                    <img src={url} alt={`Avatar Preset ${i}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">{tCard("Company Emblem / Brand Logo")}</label>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 border border-slate-200 rounded-xl flex items-center justify-center shrink-0 bg-slate-50 overflow-hidden text-xs">
                  {cardData.logoUrl ? (
                    <img src={cardData.logoUrl} alt="Logo Preview" referrerPolicy="no-referrer" className="w-full h-full object-contain" />
                  ) : (
                    <Landmark className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="flex items-center justify-center border border-dashed border-slate-300 rounded-xl py-2 px-3 hover:bg-slate-50 transition-colors cursor-pointer text-center text-xs text-slate-600 gap-1.5 font-semibold">
                    <UploadCloud className="w-4 h-4 text-slate-400" />
                    {tCard("Upload Brand Logo")}
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Preset logo labels choice */}
              <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
                <span className="text-[10px] text-slate-400 shrink-0 font-semibold">{tCard("Texts:")}</span>
                {PRESET_LOGOS.map((emblem, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setActivePresetLogoIndex(i);
                      // Custom string-to-visual embedding placeholder
                      setCardData(prev => ({ ...prev, company: emblem.substring(3), logoUrl: '' }));
                      playAudioSound('preview');
                    }}
                    className={`text-[10px] px-2 py-1 rounded-md border shrink-0 transition-colors ${activePresetLogoIndex === i ? 'bg-indigo-50 border-indigo-400 text-indigo-700 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                  >
                    {emblem}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Social Links List */}
          <div className="border-t border-slate-100 pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800">{tCard("Dynamic Social Integrations")}</h4>
                <p className="text-[10px] text-slate-400">{tCard("Append custom profiles links (LinkedIn, YouTube, X, etc.)")}</p>
              </div>
              <button
                type="button"
                onClick={addSocialLink}
                className="py-1 px-3 border border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                {tCard("Add Link")}
              </button>
            </div>

            <div className="space-y-3">
              {cardData.socialLinks.map((link, idx) => (
                <div key={link.id} className="flex items-center gap-3">
                  <select
                    value={link.platform}
                    onChange={e => updateSocialLink(link.id, 'platform', e.target.value as any)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                  >
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Twitter/X">Twitter/X</option>
                    <option value="Instagram">Instagram</option>
                    <option value="GitHub">GitHub</option>
                    <option value="Facebook">Facebook</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Custom">{tCard("Custom")}</option>
                  </select>
                  <input
                    type="text"
                    value={link.url}
                    onChange={e => updateSocialLink(link.id, 'url', e.target.value)}
                    placeholder="e.g. https://linkedin.com/in/username"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-indigo-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeSocialLink(link.id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {cardData.socialLinks.length === 0 && (
                <div className="text-center py-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <p className="text-[11px] text-slate-400">{tCard("No active social links. Click \"Add Link\" to integrate networks.")}</p>
                </div>
              )}
            </div>
          </div>

          {/* Style Customizer */}
          <div className="border-t border-slate-100 pt-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-800">{tCard("Visual Theme & Layout")}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'executive', label: 'Executive Minimal', desc: 'White & Blue', bg: 'bg-white border-slate-200' },
                { id: 'obsidian', label: 'Sleek Obsidian', desc: 'Dark & Amber Gold', bg: 'bg-slate-900 border-amber-900/40 text-amber-200' },
                { id: 'tech', label: 'Tech Slate', desc: 'Sleek Cyan Neon', bg: 'bg-slate-800 border-cyan-500/30 text-cyan-200' },
                { id: 'terracotta', label: 'Warm Craft', desc: 'Organic Clay Cream', bg: 'bg-[#faf6f0] border-orange-200 text-amber-950' }
              ].map(themeItem => (
                <button
                  key={themeItem.id}
                  onClick={() => {
                    setCardData(prev => ({ ...prev, theme: themeItem.id as any }));
                    playAudioSound('preview');
                  }}
                  className={`p-3 rounded-xl border text-left rtl:text-right transition-all relative cursor-pointer ${cardData.theme === themeItem.id ? 'ring-2 ring-indigo-500 border-transparent shadow-sm scale-[1.02]' : 'hover:bg-slate-50 border-slate-200/80'}`}
                >
                  <div className={`w-4 h-4 rounded-full ${themeItem.bg} mb-2 border`} />
                  <p className="text-[10px] font-bold leading-tight truncate">{tCard(themeItem.label)}</p>
                  <p className="text-[8px] text-slate-400 mt-0.5">{tCard(themeItem.desc)}</p>
                  {cardData.theme === themeItem.id && (
                    <span className="absolute top-2 right-2 rtl:right-auto rtl:left-2 w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Database & saved cards listing */}
          <div className="border-t border-slate-100 pt-5">
            <h4 className="text-xs font-bold text-slate-800 mb-3">{tCard("Saved Cards on Account / Cache")}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {savedCards.map(saved => (
                <div
                  key={saved.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${cardData.id === saved.id ? 'bg-indigo-50/50 border-indigo-200' : 'bg-slate-50 border-slate-100 hover:bg-slate-100/70'}`}
                >
                  <button
                    type="button"
                    onClick={() => handleSelectCard(saved)}
                    className="flex-1 text-left rtl:text-right min-w-0"
                  >
                    <p className="text-xs font-bold text-slate-800 truncate">{saved.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{saved.title} | {saved.company}</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCard(saved.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {savedCards.length === 0 && (
                <div className="col-span-full py-6 text-center text-[11px] text-slate-400 bg-slate-50 border border-slate-100 rounded-xl">
                  {tCard("No saved passes found. Click \"Save Pass\" above to register and secure your business card!")}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Realtime visual mockup, flippable card, QR, Wallet Ready Architectures */}
        <div className="lg:col-span-5 space-y-8 sticky top-24">
          
          {/* Section 1: Visual Interactive 3D/Flippable Card Mockup */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{tCard("Double-Sided Live Mockup")}</span>
              <button
                onClick={() => {
                  setIsFlipped(!isFlipped);
                  playAudioSound('preview');
                }}
                className="py-1 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
              >
                <Smartphone className="w-3.5 h-3.5 text-indigo-500" />
                {isFlipped ? tCard("Flip Card (View Front)") : tCard("Flip Card (View Back)")}
              </button>
            </div>

            {/* Simulated 3D Card container */}
            <div className="relative w-full h-64 [perspective:1000px]">
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="w-full h-full relative [transform-style:preserve-3d] cursor-pointer"
                onClick={() => {
                  setIsFlipped(!isFlipped);
                  playAudioSound('preview');
                }}
              >
                {/* FRONT SIDE */}
                <div 
                  className={`absolute inset-0 w-full h-full p-6 sm:p-8 rounded-2xl border flex flex-col justify-between [backface-visibility:hidden] ${selectedTheme.card}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Visual header */}
                    <div>
                      <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${selectedTheme.badge}`}>
                        {cardData.company || (isArabic ? 'أبيكس للحلول الرقمية' : isUrdu ? 'ایپیکس ڈیجیٹل سلوشنز' : 'Apex Digital Solutions')}
                      </span>
                      <h4 className="text-xl sm:text-2xl font-black tracking-tight mt-2 leading-tight">
                        {cardData.name || (isArabic ? 'سارة جينكينز' : isUrdu ? 'سارہ جاوید' : 'Sarah Jenkins')}
                      </h4>
                      <p className="text-[11px] font-semibold text-slate-400 mt-1">
                        {cardData.title || (isArabic ? 'رئيس قسم التصميم' : isUrdu ? 'چیف ڈیزائن آفیسر' : 'Chief Design Officer')}
                      </p>
                    </div>

                    {/* Logo/Emblem placeholder */}
                    <div className="w-12 h-12 shrink-0 bg-slate-500/10 rounded-xl flex items-center justify-center overflow-hidden border border-slate-200/20 text-xs font-bold">
                      {cardData.logoUrl ? (
                        <img src={cardData.logoUrl} alt="Logo" referrerPolicy="no-referrer" className="w-full h-full object-contain" />
                      ) : (
                        <span>{tCard("Logo")}</span>
                      )}
                    </div>
                  </div>

                  {/* Front Footer */}
                  <div className="flex items-center gap-4 border-t border-slate-500/15 pt-4">
                    <img
                      src={cardData.photoUrl || PRESET_AVATARS[1]}
                      alt="Avatar Photo"
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500 bg-slate-100 shadow-sm shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">{tCard("Contact Channels")}</p>
                      <p className="text-xs font-bold truncate opacity-90">{cardData.email || 'sarah@apexcorp.io'}</p>
                      <p className="text-[11px] truncate opacity-85 mt-0.5">{cardData.phone || '+1 (555) 234-5678'}</p>
                    </div>
                  </div>
                </div>

                {/* BACK SIDE */}
                <div 
                  className={`absolute inset-0 w-full h-full p-6 rounded-2xl border flex flex-col justify-between [backface-visibility:hidden] [transform:rotateY(180deg)] ${selectedTheme.card}`}
                >
                  <div className="grid grid-cols-12 gap-3 items-center h-full">
                    {/* Info fields */}
                    <div className="col-span-8 space-y-2.5">
                      <div className="space-y-0.5">
                        <span className="text-[8px] font-bold text-slate-400 tracking-widest uppercase block">{tCard("Personal QR ID")}</span>
                        <p className="text-xs font-black truncate">{cardData.name || (isArabic ? 'سارة جينكينز' : isUrdu ? 'سارہ جاوید' : 'Sarah Jenkins')}</p>
                      </div>

                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3 h-3 text-indigo-500 shrink-0 mt-0.5" />
                        <p className="text-[9px] font-semibold opacity-90 leading-normal">{cardData.address || (isArabic ? '100 شارع الصنوبر، سان فرانسيسكو' : isUrdu ? '100 پائن اسٹریٹ، سان فرانسسکو' : '100 Pine Street, San Francisco, CA')}</p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Globe className="w-3 h-3 text-indigo-500 shrink-0" />
                        <p className="text-[9px] font-semibold opacity-90 truncate">{(cardData.website || 'https://apexcorp.io').replace(/^https?:\/\//i, '')}</p>
                      </div>

                      {/* Social chips list */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {(cardData.socialLinks.length > 0 ? cardData.socialLinks : [{ id: 'demo1', platform: 'LinkedIn' }, { id: 'demo2', platform: 'Twitter/X' }]).map(link => (
                          <span
                            key={link.id}
                            className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md ${selectedTheme.badge}`}
                          >
                            {link.platform}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* QR Code back-side preview */}
                    <div className="col-span-4 flex flex-col items-center justify-center gap-1">
                      <div className="bg-white p-1 rounded-lg border border-slate-100 shadow-xs max-w-[85px]">
                        <img
                          src={getQRImageSrc()}
                          alt="QR Code"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider text-center">{tCard("Scan to Connect")}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Section 2: QR Code Preview, Copy & Export Panel */}
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/50 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-indigo-600" />
                {tCard("Interact & Share")}
              </h4>
              <div className="bg-white border border-slate-200 rounded-lg p-0.5 flex">
                <button
                  onClick={() => {
                    setQrMode('vcard');
                    playAudioSound('preview');
                  }}
                  className={`px-2 py-1 text-[10px] font-bold rounded-md ${qrMode === 'vcard' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  {tCard("Direct vCard")}
                </button>
                <button
                  onClick={() => {
                    setQrMode('web');
                    playAudioSound('preview');
                  }}
                  className={`px-2 py-1 text-[10px] font-bold rounded-md ${qrMode === 'web' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  {tCard("Web Profile")}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
              <div className="w-28 h-28 shrink-0 bg-slate-50 p-1 rounded-xl border border-slate-100">
                <img
                  src={getQRImageSrc()}
                  alt="Full QR Preview"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex-1 space-y-3 w-full">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">
                    {qrMode === 'vcard' ? tCard('VCARD GENERATOR DATA') : tCard('WEB REDIRECT MODULE')}
                  </p>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5 leading-relaxed">
                    {qrMode === 'vcard' 
                      ? tCard('Encodes Name, Address, Email, Phone, Logo & Website inside the QR matrix.')
                      : tCard('Creates a simulated, interactive digital business profile on scan.')}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={downloadVCF}
                    className="py-1.5 px-3 bg-indigo-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-indigo-700 cursor-pointer shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {tCard("Save Contact (.vcf)")}
                  </button>
                  <button
                    onClick={() => downloadQRCode('png')}
                    className="py-1.5 px-3 bg-slate-900 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-slate-800 cursor-pointer shadow-xs transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5 text-indigo-400" />
                    {tCard("Download QR (PNG)")}
                  </button>
                  <button
                    onClick={() => downloadQRCode('svg')}
                    className="py-1.5 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-500" />
                    {tCard("Download QR (SVG)")}
                  </button>
                  <button
                    onClick={handleShare}
                    className="py-1.5 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5 text-indigo-500" />
                    {copiedField === 'Share Link' ? tCard('Copied!') : tCard('Share Card Link')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Mobile Wallet Pass Integration */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-xs space-y-5">
            <div>
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-indigo-600" />
                {tCard("Mobile Wallet Pass Export")}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {tCard("Save your contact card directly to smartphone wallets for quick tap-and-share access.")}
              </p>
            </div>

            {/* Tabs for choosing Apple / Google */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-1 flex">
              <button
                onClick={() => {
                  setSelectedWalletTab('apple');
                  playAudioSound('preview');
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${selectedWalletTab === 'apple' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-white/50'}`}
              >
                {tCard(" Apple Wallet")}
              </button>
              <button
                onClick={() => {
                  setSelectedWalletTab('google');
                  playAudioSound('preview');
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${selectedWalletTab === 'google' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-white/50'}`}
              >
                {tCard("🤖 Google Wallet")}
              </button>
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              {selectedWalletTab === 'apple' ? (
                <motion.div
                  key="apple-tab"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-4"
                >
                  {/* Apple Wallet visual pass mockup */}
                  <div className="bg-slate-950 text-white rounded-2xl p-5 border border-slate-800 space-y-4 relative overflow-hidden shadow-lg shadow-slate-950/10">
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-indigo-600" />
                    
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl"></span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{tCard("Apple Wallet Card")}</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">{cardData.company || (isArabic ? 'أبيكس للحلول الرقمية' : isUrdu ? 'ایپیکس ڈیجیٹل سلوشنز' : 'Apex Digital Solutions')}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest block">{tCard("Designation")}</span>
                        <span className="text-xs font-bold text-slate-200">{cardData.title || (isArabic ? 'رئيس قسم التصميم' : isUrdu ? 'چیف ڈیزائن آفیسر' : 'Chief Design Officer')}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest block">{tCard("Full Name")}</span>
                        <span className="text-xs font-bold text-slate-200">{cardData.name || (isArabic ? 'سارة جينكينز' : isUrdu ? 'سارہ جاوید' : 'Sarah Jenkins')}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                      <div className="space-y-1 text-left rtl:text-right">
                        <span className="text-[8px] text-slate-500 font-bold block">{tCard("SMARTPASS INTEGRATION")}</span>
                        <span className="text-[10px] text-emerald-400 font-semibold block">{tCard("✓ Ready to Install")}</span>
                      </div>
                      <div className="w-12 h-12 bg-white p-0.5 rounded-sm">
                        <img src={getQRImageSrc()} alt="Pass QR" className="w-full h-full" />
                      </div>
                    </div>
                  </div>

                  {/* Clean export card */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        {tCard("Apple Wallet Digital Pass")}
                      </span>
                      <button
                        onClick={() => copyToClipboard(getAppleWalletPassJSON(), 'Apple Pass Data')}
                        className="text-[10px] text-slate-500 hover:text-indigo-600 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        {copiedField === 'Apple Pass Data' ? tCard('Copied') : tCard('Copy Pass Payload')}
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-normal">
                      {tCard("Export your formatted wallet card to save or distribute directly to iOS devices.")}
                    </p>

                    <button
                      onClick={() => downloadWalletJSON('apple')}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
                    >
                      <Download className="w-4 h-4 text-indigo-400" />
                      {tCard("Download Apple Wallet Pass File")}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="google-tab"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-4"
                >
                  {/* Google Wallet visual pass mockup */}
                  <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 space-y-4 relative overflow-hidden shadow-lg shadow-slate-900/10">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Landmark className="w-4 h-4 text-blue-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{tCard("Google Wallet Pass")}</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">{cardData.company || (isArabic ? 'أبيكس للحلول الرقمية' : isUrdu ? 'ایپیکس ڈیجیٹل سلوشنز' : 'Apex Digital Solutions')}</span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="text-[7.5px] text-slate-400 font-bold uppercase block tracking-widest">{tCard("Card Holder")}</span>
                        <h5 className="text-base font-bold text-slate-100">{cardData.name || (isArabic ? 'سارة جينكينز' : isUrdu ? 'سارہ جاوید' : 'Sarah Jenkins')}</h5>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[7.5px] text-slate-400 font-bold uppercase block tracking-widest">{tCard("Email Address")}</span>
                          <span className="text-xs font-bold text-slate-200">{cardData.email || 'sarah@apexcorp.io'}</span>
                        </div>
                        <div className="w-14 h-14 bg-white p-0.5 rounded-sm">
                          <img src={getQRImageSrc()} alt="Pass QR" className="w-full h-full" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Clean export card */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        {tCard("Google Wallet Digital Pass")}
                      </span>
                      <button
                        onClick={() => copyToClipboard(getGoogleWalletJSON(), 'Google Pass Data')}
                        className="text-[10px] text-slate-500 hover:text-indigo-600 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        {copiedField === 'Google Pass Data' ? tCard('Copied') : tCard('Copy Pass Payload')}
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-normal">
                      {tCard("Export your formatted wallet card payload for instant Android Google Wallet sync.")}
                    </p>

                    <button
                      onClick={() => downloadWalletJSON('google')}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
                    >
                      <Download className="w-4 h-4 text-blue-400" />
                      {tCard("Download Google Wallet File")}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
