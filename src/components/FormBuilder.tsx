import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FormInput, Sliders, Settings, QrCode, Eye, ClipboardList, CheckCircle2, 
  Trash2, Copy, Plus, X, Download, LayoutGrid, FileText, Check, 
  ExternalLink, BarChart2, RefreshCw, FileUp, Send, Smartphone, 
  Share2, HelpCircle, Lock, Calendar, ChevronDown, ChevronUp, AlertCircle, Info
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { signInAnonymously } from 'firebase/auth';
import { collection, doc, setDoc, getDocs, query, where, deleteDoc, updateDoc } from 'firebase/firestore';
import { api } from '../lib/api';
import { playAudioSound } from '../utils/audioFeedback';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useTranslation } from '../utils/i18n';
import { buildProductionUrl } from '../config/siteConfig';

// Interfaces
interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'email' | 'phone' | 'select' | 'checkbox' | 'date' | 'file';
  label: string;
  placeholder: string;
  required: boolean;
  options?: string; // Comma-separated options for selects/checkboxes
}

interface CustomFormConfig {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: 'contact' | 'survey' | 'lead' | 'registration' | 'appointment' | 'rsvp' | 'feedback';
  fields: FormField[];
  createdAt: string;
  viewCount: number;
  submissionCount: number;
  status: 'active' | 'closed';
  themeColor: 'indigo' | 'emerald' | 'rose' | 'amber' | 'purple' | 'cyan';
}

interface FormSubmission {
  id: string;
  formId: string;
  submittedAt: string;
  answers: { [fieldId: string]: string | string[] };
  attachments?: { fileName: string; fileSize: string; fileData: string }[]; // Base64 simulated storage
}

// Preset Bootstrap Templates
const FORM_TEMPLATES: {
  [key in 'contact' | 'survey' | 'lead' | 'registration' | 'appointment' | 'rsvp' | 'feedback']: {
    title: string;
    description: string;
    fields: FormField[];
  }
} = {
  contact: {
    title: 'Standard Contact Form',
    description: 'Get in touch with your clients, collect feedback, and answer support queries.',
    fields: [
      { id: 'f-name', type: 'text', label: 'Full Name', placeholder: 'Enter your name...', required: true },
      { id: 'f-email', type: 'email', label: 'Email Address', placeholder: 'name@company.com', required: true },
      { id: 'f-phone', type: 'phone', label: 'Phone Number', placeholder: '+1 (555) 000-0000', required: false },
      { id: 'f-msg', type: 'textarea', label: 'How can we help?', placeholder: 'Describe your query here...', required: true }
    ]
  },
  survey: {
    title: 'Customer Satisfaction Survey',
    description: 'Understand client sentiment, product feedback, and net promoter score.',
    fields: [
      { id: 'f-name', type: 'text', label: 'Full Name', placeholder: 'Optional...', required: false },
      { id: 'f-hear', type: 'select', label: 'How did you hear about us?', placeholder: 'Please select...', required: true, options: 'Google Search, Social Media, Email, Friend Referral' },
      { id: 'f-rating', type: 'select', label: 'How would you rate our product?', placeholder: 'Select rating...', required: true, options: '5 - Excellent, 4 - Good, 3 - Average, 2 - Poor, 1 - Awful' },
      { id: 'f-improve', type: 'textarea', label: 'What is one thing we could improve?', placeholder: 'Enter feedback...', required: false }
    ]
  },
  lead: {
    title: 'B2B Lead Generation Form',
    description: 'Qualify outbound prospects and aggregate enterprise demo requests.',
    fields: [
      { id: 'f-name', type: 'text', label: 'Prospect Name', placeholder: 'Enter name...', required: true },
      { id: 'f-email', type: 'email', label: 'Work Email Address', placeholder: 'prospect@business.com', required: true },
      { id: 'f-company', type: 'text', label: 'Company Name', placeholder: 'e.g. Acme Corp', required: true },
      { id: 'f-service', type: 'select', label: 'Interested Solutions', placeholder: 'Choose services...', required: true, options: 'Enterprise Cloud Suite, Security Compliance Audit, Custom API Integration, Marketing Automation' }
    ]
  },
  registration: {
    title: 'Event Registration Ticket',
    description: 'Authorize attendees, VIPs, and media credentials for regional summits.',
    fields: [
      { id: 'f-name', type: 'text', label: 'Attendee Name', placeholder: 'Your name...', required: true },
      { id: 'f-email', type: 'email', label: 'Attendee Email', placeholder: 'attendee@event.com', required: true },
      { id: 'f-tier', type: 'select', label: 'Ticket Class', placeholder: 'Select tier...', required: true, options: 'General Admission ($99), Speaker Pass (Free), VIP Sponsor ($499)' },
      { id: 'f-size', type: 'select', label: 'T-Shirt Size', placeholder: 'Select size...', required: false, options: 'Unisex S, Unisex M, Unisex L, Unisex XL, Unisex XXL' }
    ]
  },
  appointment: {
    title: 'Calendar Appointment Booking',
    description: 'Schedule sales demos, technical consults, or personal client meetings.',
    fields: [
      { id: 'f-name', type: 'text', label: 'Client Name', placeholder: 'Your full name...', required: true },
      { id: 'f-email', type: 'email', label: 'Contact Email', placeholder: 'name@example.com', required: true },
      { id: 'f-date', type: 'date', label: 'Preferred Booking Date', placeholder: '', required: true },
      { id: 'f-slot', type: 'select', label: 'Available Window', placeholder: 'Select time...', required: true, options: 'Morning (9:00 AM - 12:00 PM), Afternoon (1:00 PM - 4:00 PM), Late Office (5:00 PM - 7:00 PM)' }
    ]
  },
  rsvp: {
    title: 'Celebration RSVP Handler',
    description: 'Coordinate wedding receptions, corporate dinners, or milestone anniversaries.',
    fields: [
      { id: 'f-name', type: 'text', label: 'Guest Name', placeholder: 'Enter name...', required: true },
      { id: 'f-attend', type: 'select', label: 'Will you be attending?', placeholder: 'RSVP choice...', required: true, options: 'Yes, absolutely!, Regretfully declining' },
      { id: 'f-diet', type: 'select', label: 'Dietary Restriction', placeholder: 'Select preference...', required: false, options: 'None, Vegetarian, Vegan, Gluten-Free' },
      { id: 'f-guests', type: 'select', label: 'Plus One / Accompanying Guests', placeholder: 'Number of guests...', required: false, options: '0, 1, 2, 3+' }
    ]
  },
  feedback: {
    title: 'Continuous Product Feedback',
    description: 'Aggregate software bug reports, feature suggestions, or user feedback.',
    fields: [
      { id: 'f-title', type: 'text', label: 'Short Summary', placeholder: 'e.g., Infinite loop on load', required: true },
      { id: 'f-cat', type: 'select', label: 'Feedback Category', placeholder: 'Choose category...', required: true, options: 'Bug Report, Feature Request, Documentation, UI/UX Polish, Other' },
      { id: 'f-desc', type: 'textarea', label: 'Additional context or repro steps', placeholder: 'Describe in detail...', required: true },
      { id: 'f-screenshot', type: 'file', label: 'Upload Screenshot / Log File', placeholder: 'Select file...', required: false }
    ]
  }
};

const PALETTES = {
  indigo: {
    hex: '4f46e5',
    accent: 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500',
    border: 'border-indigo-100 hover:border-indigo-200',
    ring: 'focus:border-indigo-500 focus:ring-indigo-500',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    light: 'bg-indigo-50/30',
    text: 'text-indigo-600',
    fillColor: '#6366f1'
  },
  emerald: {
    hex: '059669',
    accent: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500',
    border: 'border-emerald-100 hover:border-emerald-200',
    ring: 'focus:border-emerald-500 focus:ring-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    light: 'bg-emerald-50/30',
    text: 'text-emerald-600',
    fillColor: '#10b981'
  },
  rose: {
    hex: 'e11d48',
    accent: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500',
    border: 'border-rose-100 hover:border-rose-200',
    ring: 'focus:border-rose-500 focus:ring-rose-500',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    light: 'bg-rose-50/30',
    text: 'text-rose-600',
    fillColor: '#f43f5e'
  },
  amber: {
    hex: 'd97706',
    accent: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500',
    border: 'border-amber-100 hover:border-amber-200',
    ring: 'focus:border-amber-500 focus:ring-amber-500',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    light: 'bg-amber-50/30',
    text: 'text-amber-600',
    fillColor: '#f59e0b'
  },
  purple: {
    hex: '7c3aed',
    accent: 'bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500',
    border: 'border-purple-100 hover:border-purple-200',
    ring: 'focus:border-purple-500 focus:ring-purple-500',
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    light: 'bg-purple-50/30',
    text: 'text-purple-600',
    fillColor: '#8b5cf6'
  },
  cyan: {
    hex: '0891b2',
    accent: 'bg-cyan-600 hover:bg-cyan-700 text-white focus:ring-cyan-500',
    border: 'border-cyan-100 hover:border-cyan-200',
    ring: 'focus:border-cyan-500 focus:ring-cyan-500',
    badge: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    light: 'bg-cyan-50/30',
    text: 'text-cyan-600',
    fillColor: '#06b6d4'
  }
};

export default function FormBuilder() {
  const { locale } = useTranslation();
  const currentLocale = locale as string;
  const isArabic = currentLocale === 'ar';
  const isUrdu = currentLocale === 'ur';
  const isHindi = currentLocale === 'hi';
  const isSpanish = currentLocale === 'es';
  const isFrench = currentLocale === 'fr';
  const isGerman = currentLocale === 'de';
  const isRtl = isArabic || isUrdu;

  const tForm = (enText: string): string => {
    if (isArabic) {
      const arDict: Record<string, string> = {
        "Custom Form & Survey Engine": "منشئ النماذج والاستبيانات المخصصة",
        "Interactive Form Builder": "منشئ النماذج التفاعلي",
        "Dynamic Form Builder & QR Core": "منشئ النماذج الديناميكي ونواة QR",
        "Design contact lists, customer surveys, RSVPs, or feedback boards. Generate instant scannable QR codes, collect secure entries directly in your Submission Dashboard, and track complete metrics.": "صمّم قوائم اتصال، أو استطلاعات رأي العملاء، أو بطاقات RSVP، أو لوحات الملاحظات. أنشئ رموز QR فورية قابلة للمسح الضوئي، واجمع المدخلات بشكل آمن مباشرةً في لوحة معلومات الإرسال الخاصة بك، وتتبّع المقاييس الكاملة.",
        "TOTAL ACTIVE FORMS": "إجمالي النماذج النشطة",
        "Gated & authenticated with Firebase Firestore": "محمي وموثق بواسطة قاعدة بيانات فاخرة",
        "Configure & Build Form": "تكوين وبناء النموذج",
        "Submission Dashboard": "لوحة معلومات الإرسال",
        "Bootstrap Instant Form Templates": "قوالب النماذج الفورية الجاهزة",
        "Click any template below to pre-populate custom fields instantly.": "انقر على أي قالب أدناه لتعبئة الحقول المخصصة فوراً.",
        "Form Fields & Metadata Configuration": "إعدادات حقول النموذج والبيانات الوصفية",
        "Customize properties, append custom choices, and order field requirements.": "تخصيص الخصائص وإضافة خيارات مخصصة وترتيب متطلبات الحقول.",
        "Form Header Title": "عنوان ترويسة النموذج",
        "e.g. VIP Dinner Confirmation": "مثال: تأكيد عشاء كبار الشخصيات",
        "Form Color Theme": "سمة لون النموذج",
        "Classic Indigo": "نيلي كلاسيكي",
        "Organic Emerald": "زمردي طبيعي",
        "Elegant Rose": "وردي أنيق",
        "Autumn Amber": "كهرماني خريفي",
        "Cosmic Purple": "أرجواني كوني",
        "Coastal Cyan": "سماوي ساحلي",
        "Subtext / Explanatory Description": "نص فرعي / وصف توضيحي",
        "Provide supportive context for prospects scanning your code...": "قدم سياقاً توضيحياً للأشخاص الذين يمسحون الرمز الخاص بك...",
        "Active Fields": "الحقول النشطة",
        "Add Custom Field": "إضافة حقل مخصص",
        "Empty Label": "بدون تسمية",
        "Collapse": "طي",
        "Customize": "تخصيص",
        "Field Type": "نوع الحقل",
        "Question / Field Label": "السؤال / تسمية الحقل",
        "Placeholder Guide": "دليل التلميح (النائب)",
        "Response Required": "الإجابة مطلوبة",
        "Options (Comma separated list)": "الخيارات (قائمة مفصولة بفواصل)",
        "Short Text": "نص قصير",
        "Paragraph Block": "فقرة نصية",
        "Email Address": "البريد الإلكتروني",
        "Phone Number": "رقم الهاتف",
        "Dropdown Choice": "قائمة منسدلة",
        "Checkbox Option": "خيارات متعددة (مربعات اختيار)",
        "Date picker": "محدد التاريخ",
        "File Attachment": "مرفق ملف",
        "Deploying Firestore Schema...": "جاري نشر النموذج...",
        "Deploy Form & Activate QR": "نشر النموذج وتفعيل رمز QR",
        "My Created Forms": "نماذجي المنشأة",
        "customized fields": "حقول مخصصة",
        "Created": "تم الإنشاء",
        "Views": "مشاهدات",
        "Submissions": "إرسالات",
        "Delete Form Config": "حذف إعدادات النموذج",
        "No forms deployed yet. Create your first dynamic form schema above.": "لم يتم نشر أي نماذج بعد. أنشئ أول نموذج ديناميكي أعلاه.",
        "View to Conversion Analytics": "تحليلات المشاهدة مقابل التحويل",
        "Scans/Views": "المسح / المشاهدات",
        "Option Breakdown (Dropdowns)": "توزيع الخيارات (القوائم المنسدلة)",
        "Select field stats will render here once dropdown questions are populated with answers.": "ستظهر إحصائيات الحقول المحددة هنا بمجرد ملء أسئلة القوائم المنسدلة بالإجابات.",
        "Aggregated Submissions": "الإرسالات المجمعة",
        "Real-time database entries logged by your clients.": "سجلات قاعدة البيانات في الوقت الفعلي المسجلة بواسطة عملائك.",
        "Export to CSV": "تصدير إلى CSV",
        "Remove Entry": "حذف الإدخال",
        "Waiting for first scan submissions. Point your phone camera at the QR code on the right to test submission flow.": "في انتظار أول إرسال. وجه كاميرا هاتفك نحو رمز QR على اليمين لاختبار الإرسال.",
        "Dynamic Form QR": "رمز QR للنموذج الديناميكي",
        "Scanners are securely directed to fill form answers.": "يتم توجيه الماسحين ضوئياً بأمان لملء إجابات النموذج.",
        "● Open": "● مفتوح",
        "● Closed": "● مغلق",
        "Simulate Mobile Scan": "محاكاة مسح الهاتف",
        "Copy Form Link": "نسخ رابط النموذج",
        "Copied Link!": "تم نسخ الرابط!",
        "Connected to Firebase Auth & DB": "متصل بقاعدة بيانات وتوثيق فايربيس",
        "Live Builder Wireframe": "المخطط الهيكلي الحي للنموذج",
        "Sample Title": "عنوان تجريبي",
        "Sample description context...": "سياق الوصف التجريبي...",
        "Empty placeholder": "تلميح فارغ",
        "Create or select a form on the left to activate scannable QR redirections." : "أنشئ أو اختر نموذجاً من اليسار لتفعيل توجيهات رمز QR القابل للمسح.",
        "PHONE PORTAL VIEW": "معاينة بوابة الهاتف",
        "Close [X]": "إغلاق [X]",
        "Submission Received!": "تم استلام الإرسال!",
        "Thank you. Your answers have been safely written to our database collection.": "شكراً لك. تم حفظ إجاباتك بأمان في قاعدة البيانات الخاصة بنا.",
        "Submit Another Response": "إرسال رد آخر",
        "Form is Currently Closed": "النموذج مغلق حالياً",
        "Submissions are temporarily disabled by the publisher.": "تم تعطيل الإرسال مؤقتاً من قبل الناشر.",
        "Select choice...": "اختر الخيار...",
        "Attach screenshot or PDF file": "أرفق لقطة شاشة أو ملف PDF",
        "Submit Form": "إرسال النموذج",
        "This form has been closed by the host.": "تم إغلاق هذا النموذج من قبل المضيف.",
        "contact": "جهة اتصال",
        "survey": "استبيان",
        "lead": "عملاء محتملون",
        "registration": "تسجيل",
        "appointment": "موعد",
        "rsvp": "دعوة RSVP",
        "feedback": "ملاحظات",
        "Standard Contact Form": "نموذج الاتصال القياسي",
        "Get in touch with your clients, collect feedback, and answer support queries.": "تواصل مع عملائك واجمع الملاحظات وأجب عن استفسارات الدعم.",
        "Customer Satisfaction Survey": "استبيان رضا العملاء",
        "Understand client sentiment, product feedback, and net promoter score.": "فهم آراء العملاء وملاحظات المنتج ومعدل الترويج الصافي.",
        "B2B Lead Generation Form": "نموذج توليد العملاء المحتملين B2B",
        "Qualify outbound prospects and aggregate enterprise demo requests.": "تأهيل العملاء المتوقعين وجمع طلبات العروض التوضيحية للمؤسسات.",
        "Event Registration Ticket": "تذكرة تسجيل الفعالية",
        "Authorize attendees, VIPs, and media credentials for regional summits.": "اعتماد الحاضرين وكبار الشخصيات والإعلاميين للمؤتمرات الإقليمية.",
        "Calendar Appointment Booking": "حجز موعد التقويم",
        "Schedule sales demos, technical consults, or personal client meetings.": "جدولة عروض المبيعات والاستشارات الفنية أو اجتماعات العملاء الشخصية.",
        "Celebration RSVP Handler": "معالج دعوة RSVP للاحتفالات",
        "Coordinate wedding receptions, corporate dinners, or milestone anniversaries.": "تنسيق حفلات الزفاف أو عشاء الشركات أو الذكرى السنوية المميزة.",
        "Continuous Product Feedback": "ملاحظات المنتج المستمرة",
        "Aggregate software bug reports, feature suggestions, or user feedback.": "تجميع تقارير الأخطاء البرمجية واقتراحات الميزات وملاحظات المستخدمين."
      };
      if (arDict[enText]) return arDict[enText];
    } else if (isUrdu) {
      const urDict: Record<string, string> = {
        "Custom Form & Survey Engine": "کسٹم فارم اور سروے انجن",
        "Interactive Form Builder": "انٹرایکٹو فارم بلڈر",
        "Dynamic Form Builder & QR Core": "ڈائنامک فارم بلڈر اور کیو آر کور",
        "Design contact lists, customer surveys, RSVPs, or feedback boards. Generate instant scannable QR codes, collect secure entries directly in your Submission Dashboard, and track complete metrics.": "رابطہ کی فہرستیں، کسٹمر سروے، RSVP یا فیڈ بیک بورڈز ڈیزائن کریں۔ فوری اسکین کے قابل کیو آر کوڈز بنائیں، اپنے سبمشن ڈیش بورڈ میں محفوظ ڈیٹا اکٹھا کریں، اور مکمل اعداد و شمار دیکھیں۔",
        "TOTAL ACTIVE FORMS": "کل فعال فارمز",
        "Gated & authenticated with Firebase Firestore": "فائر بیس فائر اسٹور کے ساتھ محفوظ اور تصدیق شدہ",
        "Configure & Build Form": "فارم ترتیب دیں اور بنائیں",
        "Submission Dashboard": "سبمشن ڈیش بورڈ",
        "Bootstrap Instant Form Templates": "فوری فارم ٹیمپلیٹس منتخب کریں",
        "Click any template below to pre-populate custom fields instantly.": "حسب ضرورت فیلڈز خودکار طور پر بھرنے کے لیے نیچے دیے گئے کسی بھی ٹیمپلیٹ پر کلک کریں۔",
        "Form Fields & Metadata Configuration": "فارم فیلڈز اور میٹا ڈیٹا کی ترتیبات",
        "Customize properties, append custom choices, and order field requirements.": "خصوصیات کو حسب ضرورت بنائیں، نئے اختیارات شامل کریں اور فیلڈز کی ترتیب تبدیل کریں۔",
        "Form Header Title": "فارم کا بنیادی عنوان",
        "e.g. VIP Dinner Confirmation": "مثال: وی آئی پی ڈنر کی تصدیق",
        "Form Color Theme": "فارم کا رنگین تھیم",
        "Classic Indigo": "کلاسک انڈیگو",
        "Organic Emerald": "قدرتی زمرد",
        "Elegant Rose": "خوبصورت گلابی",
        "Autumn Amber": "خزاں عنبر",
        "Cosmic Purple": "کائناتی جامنی",
        "Coastal Cyan": "ساحلی نیلا",
        "Subtext / Explanatory Description": "ذیلی متن / وضاحتی تفصیل",
        "Provide supportive context for prospects scanning your code...": "کوڈ اسکین کرنے والوں کے لیے وضاحتی معلومات درج کریں...",
        "Active Fields": "فعال فیلڈز",
        "Add Custom Field": "کسٹم فیلڈ شامل کریں",
        "Empty Label": "خالی لیبل",
        "Collapse": "سمیٹیں",
        "Customize": "ترتیب دیں",
        "Field Type": "فیلڈ کی قسم",
        "Question / Field Label": "سوال / فیلڈ کا لیبل",
        "Placeholder Guide": "ہیلپ ٹیکسٹ (پلیس ہولڈر)",
        "Response Required": "لازمی فیلڈ",
        "Options (Comma separated list)": "اختیارات (کوما سے الگ فہرست)",
        "Short Text": "مختصر متن",
        "Paragraph Block": "پیراگراف بلاک",
        "Email Address": "ای میل ایڈریس",
        "Phone Number": "فون نمبر",
        "Dropdown Choice": "ڈراپ ڈاؤن انتخاب",
        "Checkbox Option": "چیک باکس آپشن",
        "Date picker": "تاریخ کا انتخاب",
        "File Attachment": "فائل منسلک کریں",
        "Deploying Firestore Schema...": "فارم شائع ہو رہا ہے...",
        "Deploy Form & Activate QR": "فارم شائع کریں اور کیو آر فعال کریں",
        "My Created Forms": "میرے بنائے گئے فارمز",
        "customized fields": "کسٹم فیلڈز",
        "Created": "تخلیق شدہ",
        "Views": "دیکھے گئے",
        "Submissions": "جمع کردہ",
        "Delete Form Config": "فارم ڈیلیٹ کریں",
        "No forms deployed yet. Create your first dynamic form schema above.": "ابھی تک کوئی فارم نہیں بنایا گیا۔ اوپر اپنا پہلا ڈائنامک فارم بنائیں۔",
        "View to Conversion Analytics": "ویوز اور کنورژن کے تجزیات",
        "Scans/Views": "اسکینز / ویوز",
        "Option Breakdown (Dropdowns)": "اختیارات کا تجزیہ (ڈراپ ڈاؤن)",
        "Select field stats will render here once dropdown questions are populated with answers.": "جب صارفین ڈراپ ڈاؤن سوالات کے جوابات دیں گے تو اعداد و شمار یہاں ظاہر ہوں گے۔",
        "Aggregated Submissions": "جمع کردہ جوابات",
        "Real-time database entries logged by your clients.": "صارفین کے جمع کردہ ریئل ٹائم ڈیٹا ریکارڈز۔",
        "Export to CSV": "CSV میں ایکسپورٹ کریں",
        "Remove Entry": "ریکارڈ حذف کریں",
        "Waiting for first scan submissions. Point your phone camera at the QR code on the right to test submission flow.": "پہلے رسپانس کا انتظار ہے۔ فارم ٹیسٹ کرنے کے لیے دائیں جانب والے QR کوڈ کو فون کیمرے سے اسکین کریں۔",
        "Dynamic Form QR": "ڈائنامک فارم کیو آر کوڈ",
        "Scanners are securely directed to fill form answers.": "اسکین کرنے والے صارفین کو محفوظ طریقے سے فارم پر پہنچایا جاتا ہے۔",
        "● Open": "● فعال",
        "● Closed": "● بند",
        "Simulate Mobile Scan": "موبائل اسکین کی مشق",
        "Copy Form Link": "فارم کا لنک کاپی کریں",
        "Copied Link!": "لنک کاپی ہو گیا!",
        "Connected to Firebase Auth & DB": "فائر بیس ڈیٹا بیس سے منسلک",
        "Live Builder Wireframe": "فارم کا لائیو لے آؤٹ پرویو",
        "Sample Title": "نمونہ عنوان",
        "Sample description context...": "نمونہ وضاحتی تفصیل...",
        "Empty placeholder": "خالی پلیس ہولڈر",
        "Create or select a form on the left to activate scannable QR redirections.": "کیو آر کوڈ کو فعال کرنے کے لیے بائیں جانب سے فارم منتخب کریں یا نیا بنائیں۔",
        "PHONE PORTAL VIEW": "موبائل پورٹل ویو",
        "Close [X]": "بند کریں [X]",
        "Submission Received!": "فارم کامیابی سے موصول ہو گیا!",
        "Thank you. Your answers have been safely written to our database collection.": "شکریہ! آپ کے جوابات ہمارے ڈیٹا بیس میں محفوظ کر لیے گئے ہیں۔",
        "Submit Another Response": "ایک اور رسپانس جمع کریں",
        "Form is Currently Closed": "فارم فی الوقت بند ہے",
        "Submissions are temporarily disabled by the publisher.": "ناشر نے فارم جمع کروانا عارضی طور پر روک دیا ہے۔",
        "Select choice...": "انتخاب کریں...",
        "Attach screenshot or PDF file": "اسکرین شاٹ یا پی ڈی ایف فائل منسلک کریں",
        "Submit Form": "فارم جمع کریں",
        "This form has been closed by the host.": "یہ فارم میزبان نے بند کر دیا ہے۔",
        "contact": "رابطہ",
        "survey": "سروے",
        "lead": "لیڈز",
        "registration": "رجسٹریشن",
        "appointment": "ملاقات کا وقت",
        "rsvp": "دعوت نامہ RSVP",
        "feedback": "فیڈ بیک",
        "Standard Contact Form": "معیاری رابطہ فارم",
        "Get in touch with your clients, collect feedback, and answer support queries.": "گاہکوں سے رابطہ کریں، آراء حاصل کریں اور سوالات کے جوابات دیں۔",
        "Customer Satisfaction Survey": "کسٹمر فیڈ بیک سروے",
        "Understand client sentiment, product feedback, and net promoter score.": "صارفین کے اطمینان اور پروڈکٹ کے بارے میں رائے جانیں۔",
        "B2B Lead Generation Form": "B2B لیڈ جنریشن فارم",
        "Qualify outbound prospects and aggregate enterprise demo requests.": "نئے تجارتی کسٹمرز اور ڈیمو درخواستوں کو رجسٹر کریں۔",
        "Event Registration Ticket": "ایونٹ رجسٹریشن ٹکٹ",
        "Authorize attendees, VIPs, and media credentials for regional summits.": "تقریبات کے لیے مہمانوں اور شرکاء کی تفصیلات رجسٹر کریں۔",
        "Calendar Appointment Booking": "کیلنڈر بکنگ فارم",
        "Schedule sales demos, technical consults, or personal client meetings.": "مشاورتی اور کاروباری میٹنگز کا وقت طے کریں۔",
        "Celebration RSVP Handler": "تقریب RSVP مینیجر",
        "Coordinate wedding receptions, corporate dinners, or milestone anniversaries.": "شادی، ڈنر اور تقریبات کے لیے شرکت کی تصدیق حاصل کریں۔",
        "Continuous Product Feedback": "پروڈکٹ فیڈ بیک فارم",
        "Aggregate software bug reports, feature suggestions, or user feedback.": "بگز کی رپورٹس اور نئی تجاویز اکٹھی کریں۔"
      };
      if (urDict[enText]) return urDict[enText];
    } else if (isHindi) {
      const hiDict: Record<string, string> = {
        "Custom Form & Survey Engine": "कस्टम फ़ॉर्म और सर्वेक्षण इंजन",
        "Interactive Form Builder": "इंटरैक्टिव फ़ॉर्म बिल्डर",
        "Dynamic Form Builder & QR Core": "डायनामिक फ़ॉर्म बिल्डर और क्यूआर कोर",
        "Design contact lists, customer surveys, RSVPs, or feedback boards. Generate instant scannable QR codes, collect secure entries directly in your Submission Dashboard, and track complete metrics.": "संपर्क सूचियां, ग्राहक सर्वेक्षण, आरएसवीपी या फीडबैक बोर्ड डिजाइन करें। तुरंत स्कैन करने योग्य क्यूआर कोड बनाएं और सबमिशन डैशबोर्ड में सुरक्षित डेटा एकत्र करें।",
        "TOTAL ACTIVE FORMS": "कुल सक्रिय फ़ॉर्म",
        "Gated & authenticated with Firebase Firestore": "फ़ायरबेस डेटाबेस द्वारा सुरक्षित एवं प्रमाणित",
        "Configure & Build Form": "फ़ॉर्म कॉन्फ़िगर करें और बनाएं",
        "Submission Dashboard": "सबमिशन डैशबोर्ड",
        "Bootstrap Instant Form Templates": "त्वरित फ़ॉर्म टेम्प्लेट चुनें",
        "Click any template below to pre-populate custom fields instantly.": "कस्टम फ़ील्ड्स को तुरंत भरने के लिए नीचे दिए गए किसी भी टेम्प्लेट पर क्लिक करें।",
        "Form Fields & Metadata Configuration": "फ़ॉर्म फ़ील्ड्स और मेटाडेटा सेटिंग्स",
        "Customize properties, append custom choices, and order field requirements.": "फ़ील्ड्स को कस्टमाइज़ करें, नए विकल्प जोड़ें और उनकी क्रम संख्या व्यवस्थित करें।",
        "Form Header Title": "फ़ॉर्म का मुख्य शीर्षक",
        "e.g. VIP Dinner Confirmation": "उदा. वीआईपी डिनर पुष्टि",
        "Form Color Theme": "फ़ॉर्म रंगीन थीम",
        "Classic Indigo": "क्लासिक इंडिगो",
        "Organic Emerald": "प्राकृतिक एमराल्ड",
        "Elegant Rose": "एलिगेंट रोज़",
        "Autumn Amber": "ऑटम एम्बर",
        "Cosmic Purple": "कॉस्मिक पर्पल",
        "Coastal Cyan": "कोस्टल सियान",
        "Subtext / Explanatory Description": "उप-शीर्षक / विवरणात्मक पाठ",
        "Provide supportive context for prospects scanning your code...": "क्यूआर कोड स्कैन करने वाले उपयोगकर्ताओं के लिए संदर्भ लिखें...",
        "Active Fields": "सक्रिय फ़ील्ड्स",
        "Add Custom Field": "कस्टम फ़ील्ड जोड़ें",
        "Empty Label": "खाली लेबल",
        "Collapse": "समेटें",
        "Customize": "कस्टमाइज़ करें",
        "Field Type": "फ़ील्ड का प्रकार",
        "Question / Field Label": "प्रश्न / फ़ील्ड लेबल",
        "Placeholder Guide": "प्लेसहोल्डर गाइड",
        "Response Required": "अनिवार्य फ़ील्ड",
        "Options (Comma separated list)": "विकल्प (अल्पविराम द्वारा अलग सूची)",
        "Short Text": "छोटा पाठ (Short Text)",
        "Paragraph Block": "पैराग्राफ ब्लॉक",
        "Email Address": "ईमेल पता",
        "Phone Number": "फ़ोन नंबर",
        "Dropdown Choice": "ड्रॉपडाउन विकल्प",
        "Checkbox Option": "चेकबॉक्स विकल्प",
        "Date picker": "तारीख चयनकर्ता",
        "File Attachment": "फ़ाइल संलग्नक",
        "Deploying Firestore Schema...": "फ़ॉर्म प्रकाशित हो रहा है...",
        "Deploy Form & Activate QR": "फ़ॉर्म प्रकाशित करें और क्यूआर सक्रिय करें",
        "My Created Forms": "मेरे बनाए गए फ़ॉर्म",
        "customized fields": "कस्टम फ़ील्ड्स",
        "Created": "बनाया गया",
        "Views": "देखे गए",
        "Submissions": "सबमिशन",
        "Delete Form Config": "फ़ॉर्म हटाएं",
        "No forms deployed yet. Create your first dynamic form schema above.": "अभी तक कोई फ़ॉर्म नहीं बनाया गया है। ऊपर अपना पहला फ़ॉर्म बनाएं।",
        "View to Conversion Analytics": "व्यूज और कन्वर्ज़न विश्लेषण",
        "Scans/Views": "स्कैन / व्यूज",
        "Option Breakdown (Dropdowns)": "विकल्प वितरण (ड्रॉपडाउन)",
        "Select field stats will render here once dropdown questions are populated with answers.": "जब उपयोगकर्ता प्रश्नों के उत्तर देंगे तो आंकड़े यहां दिखाई देंगे।",
        "Aggregated Submissions": "एकत्रित सबमिशन",
        "Real-time database entries logged by your clients.": "ग्राहकों द्वारा सबमिट किए गए रीयल-टाइम रिकॉर्ड।",
        "Export to CSV": "CSV में एक्सपोर्ट करें",
        "Remove Entry": "रिकॉर्ड हटाएं",
        "Waiting for first scan submissions. Point your phone camera at the QR code on the right to test submission flow.": "पहले सबमिशन की प्रतीक्षा है। फ़ॉर्म का परीक्षण करने के लिए दाईं ओर के क्यूआर कोड को स्कैन करें।",
        "Dynamic Form QR": "डायनामिक फ़ॉर्म क्यूआर",
        "Scanners are securely directed to fill form answers.": "स्कैनर्स को सुरक्षित रूप से फ़ॉर्म भरने के लिए निर्देशित किया जाता है।",
        "● Open": "● खुला",
        "● Closed": "● बंद",
        "Simulate Mobile Scan": "मोबाइल स्कैन सिम्युलेट करें",
        "Copy Form Link": "फ़ॉर्म लिंक कॉपी करें",
        "Copied Link!": "लिंक कॉपी हो गया!",
        "Connected to Firebase Auth & DB": "फ़ायरबेस डेटाबेस से कनेक्टेड",
        "Live Builder Wireframe": "फ़ॉर्म का लाइव वायरफ्रेम",
        "Sample Title": "नमूना शीर्षक",
        "Sample description context...": "नमूना विवरण...",
        "Empty placeholder": "खाली प्लेसहोल्डर",
        "Create or select a form on the left to activate scannable QR redirections.": "क्यूआर सक्रिय करने के लिए बाईं ओर से फ़ॉर्म चुनें या नया बनाएं।",
        "PHONE PORTAL VIEW": "मोबाइल पोर्टल व्यू",
        "Close [X]": "बंद करें [X]",
        "Submission Received!": "सबमिशन प्राप्त हुआ!",
        "Thank you. Your answers have been safely written to our database collection.": "धन्यवाद! आपके उत्तर हमारे डेटाबेस में सुरक्षित रूप से दर्ज कर लिए गए हैं।",
        "Submit Another Response": "एक और प्रतिक्रिया सबमिट करें",
        "Form is Currently Closed": "फ़ॉर्म वर्तमान में बंद है",
        "Submissions are temporarily disabled by the publisher.": "प्रकाशक द्वारा सबमिशन अस्थायी रूप से अक्षम कर दिया गया है।",
        "Select choice...": "विकल्प चुनें...",
        "Attach screenshot or PDF file": "स्क्रीनशॉट या पीडीएफ फाइल संलग्न करें",
        "Submit Form": "फ़ॉर्म सबमिट करें",
        "This form has been closed by the host.": "यह फ़ॉर्म होस्ट द्वारा बंद कर दिया गया है।",
        "contact": "संपर्क",
        "survey": "सर्वेक्षण",
        "lead": "लीड्स",
        "registration": "पंजीकरण",
        "appointment": "अपॉइंटमेंट",
        "rsvp": "निमंत्रण RSVP",
        "feedback": "प्रतिक्रिया",
        "Standard Contact Form": "मानक संपर्क फ़ॉर्म",
        "Get in touch with your clients, collect feedback, and answer support queries.": "ग्राहकों से संपर्क करें और सहायता प्रश्नों के उत्तर दें।",
        "Customer Satisfaction Survey": "ग्राहक संतुष्टि सर्वेक्षण",
        "Understand client sentiment, product feedback, and net promoter score.": "ग्राहकों की राय और उत्पाद फीडबैक समझें।",
        "B2B Lead Generation Form": "B2B लीड जनरेशन फ़ॉर्म",
        "Qualify outbound prospects and aggregate enterprise demo requests.": "संभावित ग्राहकों और डेमो अनुरोधों को एकत्रित करें।",
        "Event Registration Ticket": "इवेंट पंजीकरण टिकट",
        "Authorize attendees, VIPs, and media credentials for regional summits.": "प्रतिभागियों और वीआईपी के विवरण पंजीकृत करें।",
        "Calendar Appointment Booking": "कैलेंडर अपॉइंटमेंट बुकिंग",
        "Schedule sales demos, technical consults, or personal client meetings.": "मीटिंग और परामर्श का समय निर्धारित करें।",
        "Celebration RSVP Handler": "उत्सव RSVP हैंडलर",
        "Coordinate wedding receptions, corporate dinners, or milestone anniversaries.": "विवाह या कार्यक्रमों के लिए उपस्थिति की पुष्टि प्राप्त करें।",
        "Continuous Product Feedback": "उत्पाद प्रतिक्रिया फ़ॉर्म",
        "Aggregate software bug reports, feature suggestions, or user feedback.": "बग रिपोर्ट और नई सुविधाओं के सुझाव एकत्र करें।"
      };
      if (hiDict[enText]) return hiDict[enText];
    } else if (isSpanish) {
      const esDict: Record<string, string> = {
        "Custom Form & Survey Engine": "Motor de Formularios y Encuestas",
        "Interactive Form Builder": "Creador Interactivo de Formularios",
        "Dynamic Form Builder & QR Core": "Creador Dinámico de Formularios y Núcleo QR",
        "Design contact lists, customer surveys, RSVPs, or feedback boards. Generate instant scannable QR codes, collect secure entries directly in your Submission Dashboard, and track complete metrics.": "Diseñe formularios de contacto, encuestas de clientes, confirmaciones RSVP o comentarios. Genere códigos QR dinámicos y recopile respuestas seguras.",
        "TOTAL ACTIVE FORMS": "TOTAL DE FORMULARIOS ACTIVOS",
        "Gated & authenticated with Firebase Firestore": "Protegido y autenticado con Firebase Firestore",
        "Configure & Build Form": "Configurar y Crear Formulario",
        "Submission Dashboard": "Panel de Respuestas",
        "Bootstrap Instant Form Templates": "Plantillas Instantáneas de Formularios",
        "Click any template below to pre-populate custom fields instantly.": "Haga clic en una plantilla para precargar campos al instante.",
        "Form Fields & Metadata Configuration": "Campos del Formulario y Configuración",
        "Customize properties, append custom choices, and order field requirements.": "Personalice propiedades, agregue opciones y organice los campos requeridos.",
        "Form Header Title": "Título del Formulario",
        "e.g. VIP Dinner Confirmation": "ej. Confirmación de Cena VIP",
        "Form Color Theme": "Tema de Color",
        "Classic Indigo": "Índigo Clásico",
        "Organic Emerald": "Esmeralda Orgánico",
        "Elegant Rose": "Rosa Elegante",
        "Autumn Amber": "Ámbar Otoñal",
        "Cosmic Purple": "Púrpura Cósmico",
        "Coastal Cyan": "Cian Costero",
        "Subtext / Explanatory Description": "Subtítulo / Descripción Explicativa",
        "Provide supportive context for prospects scanning your code...": "Proporcione contexto para quienes escaneen su código...",
        "Active Fields": "Campos Activos",
        "Add Custom Field": "Agregar Campo Personalizado",
        "Empty Label": "Etiqueta vacía",
        "Collapse": "Plegar",
        "Customize": "Personalizar",
        "Field Type": "Tipo de Campo",
        "Question / Field Label": "Pregunta / Etiqueta del Campo",
        "Placeholder Guide": "Texto de Ayuda (Placeholder)",
        "Response Required": "Respuesta Obligatoria",
        "Options (Comma separated list)": "Opciones (separadas por comas)",
        "Short Text": "Texto Corto",
        "Paragraph Block": "Párrafo",
        "Email Address": "Correo Electrónico",
        "Phone Number": "Número de Teléfono",
        "Dropdown Choice": "Menú Desplegable",
        "Checkbox Option": "Casilla de Verificación",
        "Date picker": "Selector de Fecha",
        "File Attachment": "Archivo Adjunto",
        "Deploying Firestore Schema...": "Publicando Formulario...",
        "Deploy Form & Activate QR": "Publicar Formulario y Activar QR",
        "My Created Forms": "Mis Formularios Creados",
        "customized fields": "campos personalizados",
        "Created": "Creado",
        "Views": "Vistas",
        "Submissions": "Respuestas",
        "Delete Form Config": "Eliminar Formulario",
        "No forms deployed yet. Create your first dynamic form schema above.": "Aún no hay formularios publicados. Cree su primer formulario arriba.",
        "View to Conversion Analytics": "Analítica de Vistas a Conversión",
        "Scans/Views": "Escaneos / Vistas",
        "Option Breakdown (Dropdowns)": "Desglose de Opciones (Desplegables)",
        "Select field stats will render here once dropdown questions are populated with answers.": "Las estadísticas aparecerán aquí cuando los usuarios respondan.",
        "Aggregated Submissions": "Respuestas Recopiladas",
        "Real-time database entries logged by your clients.": "Registros en tiempo real enviados por sus clientes.",
        "Export to CSV": "Exportar a CSV",
        "Remove Entry": "Eliminar Registro",
        "Waiting for first scan submissions. Point your phone camera at the QR code on the right to test submission flow.": "Esperando el primer envío. Apunte la cámara de su teléfono al código QR para probar.",
        "Dynamic Form QR": "QR de Formulario Dinámico",
        "Scanners are securely directed to fill form answers.": "Los usuarios son dirigidos de forma segura a responder el formulario.",
        "● Open": "● Abierto",
        "● Closed": "● Cerrado",
        "Simulate Mobile Scan": "Simular Escaneo Móvil",
        "Copy Form Link": "Copiar Enlace del Formulario",
        "Copied Link!": "¡Enlace Copiado!",
        "Connected to Firebase Auth & DB": "Conectado a Base de Datos Firebase",
        "Live Builder Wireframe": "Vista Previa de Estructura",
        "Sample Title": "Título de Muestra",
        "Sample description context...": "Descripción de muestra...",
        "Empty placeholder": "Texto de ayuda vacío",
        "Create or select a form on the left to activate scannable QR redirections.": "Cree o elija un formulario a la izquierda para activar el código QR.",
        "PHONE PORTAL VIEW": "VISTA DE PORTAL MÓVIL",
        "Close [X]": "Cerrar [X]",
        "Submission Received!": "¡Respuesta Recibida!",
        "Thank you. Your answers have been safely written to our database collection.": "Gracias. Sus respuestas han sido guardadas de forma segura.",
        "Submit Another Response": "Enviar Otra Respuesta",
        "Form is Currently Closed": "El Formulario está Actualmente Cerrado",
        "Submissions are temporarily disabled by the publisher.": "Los envíos han sido desactivados temporalmente por el creador.",
        "Select choice...": "Seleccionar opción...",
        "Attach screenshot or PDF file": "Adjuntar captura o archivo PDF",
        "Submit Form": "Enviar Formulario",
        "This form has been closed by the host.": "Este formulario ha sido cerrado por el anfitrión."
      };
      if (esDict[enText]) return esDict[enText];
    } else if (isFrench) {
      const frDict: Record<string, string> = {
        "Custom Form & Survey Engine": "Moteur de Formulaires et Sondages",
        "Interactive Form Builder": "Générateur Interactif de Formulaires",
        "Dynamic Form Builder & QR Core": "Générateur Dynamique de Formulaires et QR",
        "TOTAL ACTIVE FORMS": "TOTAL DES FORMULAIRES ACTIFS",
        "Configure & Build Form": "Configurer et Créer un Formulaire",
        "Submission Dashboard": "Tableau des Réponses",
        "Bootstrap Instant Form Templates": "Modèles de Formulaires Instantanés",
        "Form Header Title": "Titre du Formulaire",
        "Form Color Theme": "Thème de Couleur",
        "Active Fields": "Champs Actifs",
        "Add Custom Field": "Ajouter un Champ",
        "Deploy Form & Activate QR": "Publier le Formulaire et Activer le QR",
        "My Created Forms": "Mes Formulaires Créés",
        "Simulate Mobile Scan": "Simuler le Scan Mobile",
        "Copy Form Link": "Copier le Lien",
        "Submit Form": "Envoyer le Formulaire"
      };
      if (frDict[enText]) return frDict[enText];
    } else if (isGerman) {
      const deDict: Record<string, string> = {
        "Custom Form & Survey Engine": "Formular- & Umfrage-Engine",
        "Interactive Form Builder": "Interaktiver Formular-Builder",
        "Dynamic Form Builder & QR Core": "Dynamischer Formular-Builder & QR-Kern",
        "TOTAL ACTIVE FORMS": "GESAMTE AKTIVE FORMULARE",
        "Configure & Build Form": "Formular konfigurieren & erstellen",
        "Submission Dashboard": "Einsendungs-Dashboard",
        "Bootstrap Instant Form Templates": "Sofortige Formular-Vorlagen",
        "Form Header Title": "Formular-Titel",
        "Form Color Theme": "Farbthema",
        "Active Fields": "Aktive Felder",
        "Add Custom Field": "Benutzerdefiniertes Feld hinzufügen",
        "Deploy Form & Activate QR": "Formular veröffentlichen & QR aktivieren",
        "My Created Forms": "Meine erstellten Formulare",
        "Simulate Mobile Scan": "Mobilen Scan simulieren",
        "Copy Form Link": "Formular-Link kopieren",
        "Submit Form": "Formular absenden"
      };
      if (deDict[enText]) return deDict[enText];
    }
    return enText;
  };

  const [forms, setForms] = useState<CustomFormConfig[]>([]);
  const [selectedForm, setSelectedForm] = useState<CustomFormConfig | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [viewingSubmissions, setViewingSubmissions] = useState(false);
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form Creation Draft
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formType, setFormType] = useState<keyof typeof FORM_TEMPLATES>('contact');
  const [formFields, setFormFields] = useState<FormField[]>(FORM_TEMPLATES.contact.fields);
  const [formTheme, setFormTheme] = useState<keyof typeof PALETTES>('indigo');

  // Interactive Simulator States
  const [simulatingForm, setSimulatingForm] = useState<CustomFormConfig | null>(null);
  const [simulatorAnswers, setSimulatorAnswers] = useState<{ [fieldId: string]: string | string[] }>({});
  const [uploadedSimFiles, setUploadedSimFiles] = useState<{ [fieldId: string]: { name: string; size: string; data: string } }>({});
  const [simulatorSubmitted, setSimulatorSubmitted] = useState(false);

  // Field Editing Draft Helper
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);

  useEffect(() => {
    loadForms();
  }, []);

  useEffect(() => {
    if (selectedForm) {
      loadSubmissions(selectedForm.id);
    } else {
      setSubmissions([]);
    }
  }, [selectedForm]);

  const loadForms = async () => {
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
        const q = query(collection(db, 'custom_forms'), where('userId', '==', userId));
        const snap = await getDocs(q);
        const list: CustomFormConfig[] = [];
        snap.forEach(d => {
          list.push({ id: d.id, ...d.data() } as CustomFormConfig);
        });
        setForms(list);
        if (list.length > 0 && !selectedForm) {
          setSelectedForm(list[0]);
        }
      } catch (err) {
        console.error('Error listing custom forms:', err);
      }
    }
  };

  const loadSubmissions = async (formId: string) => {
    try {
      const subSnap = await getDocs(collection(db, 'custom_forms', formId, 'submissions'));
      const list: FormSubmission[] = [];
      subSnap.forEach(d => {
        list.push({ id: d.id, ...d.data() } as FormSubmission);
      });
      // Sort by submission date desc
      list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      setSubmissions(list);
    } catch (err) {
      console.error('Error fetching submissions:', err);
    }
  };

  // Preset Template Quick Select
  const handleTemplateSelect = (type: keyof typeof FORM_TEMPLATES) => {
    setFormType(type);
    const template = FORM_TEMPLATES[type];
    setFormTitle(template.title);
    setFormDesc(template.description);
    setFormFields(JSON.parse(JSON.stringify(template.fields)));
    playAudioSound('preview');
  };

  // Field manipulation
  const addField = () => {
    const newField: FormField = {
      id: `f-${Math.random().toString(36).substring(2, 7)}`,
      type: 'text',
      label: 'New Question',
      placeholder: 'Enter answer...',
      required: false
    };
    setFormFields([...formFields, newField]);
    setEditingFieldId(newField.id);
    playAudioSound('generate');
  };

  const deleteField = (id: string) => {
    setFormFields(formFields.filter(f => f.id !== id));
    if (editingFieldId === id) setEditingFieldId(null);
    playAudioSound('preview');
  };

  const updateFieldProperty = (id: string, property: keyof FormField, value: any) => {
    setFormFields(formFields.map(f => f.id === id ? { ...f, [property]: value } : f));
  };

  // Save/Publish Custom Form Configuration
  const handlePublishForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    setIsSaving(true);
    let userId = auth.currentUser?.uid;
    if (!userId) {
      try {
        const anon = await signInAnonymously(auth);
        userId = anon.user.uid;
      } catch (err) {}
    }

    const formId = `form-${Math.random().toString(36).substring(2, 9)}`;

    const newForm: CustomFormConfig = {
      id: formId,
      userId: userId || 'anonymous',
      title: formTitle,
      description: formDesc || 'Scan the QR code to fill out this dynamic digital form.',
      type: formType,
      fields: formFields,
      createdAt: new Date().toISOString(),
      viewCount: 0,
      submissionCount: 0,
      status: 'active',
      themeColor: formTheme
    };

    if (userId) {
      try {
        await setDoc(doc(db, 'custom_forms', formId), newForm);
        await api.saveProject({
          id: formId,
          name: formTitle,
          type: 'form',
          content: buildProductionUrl(`/share-preview?type=form&id=${formId}`),
          userId: userId,
          trackingId: formId
        }).catch(() => {});
        playAudioSound('generate');
      } catch (err) {
        console.error('Firestore form save failed:', err);
      }
    }

    // Reset Form Building Screen
    setFormTitle('');
    setFormDesc('');
    setFormFields(FORM_TEMPLATES.contact.fields);
    setFormType('contact');
    setEditingFieldId(null);

    await loadForms();
    setSelectedForm(newForm);
    setIsSaving(false);
  };

  const handleDeleteForm = async (id: string) => {
    let userId = auth.currentUser?.uid;
    if (!userId) {
      try {
        const anon = await signInAnonymously(auth);
        userId = anon.user.uid;
      } catch (e) {}
    }

    if (userId) {
      try {
        await deleteDoc(doc(db, 'custom_forms', id));
        await api.deleteProject(id).catch(() => {});
        playAudioSound('preview');
      } catch (err) {
        console.error('Delete form failed:', err);
      }
    }

    const remaining = forms.filter(f => f.id !== id);
    if (remaining.length > 0) {
      setSelectedForm(remaining[0]);
    } else {
      setSelectedForm(null);
    }
    await loadForms();
  };

  // Toggle form status active/closed
  const handleToggleFormStatus = async (form: CustomFormConfig) => {
    const nextStatus: 'active' | 'closed' = form.status === 'active' ? 'closed' : 'active';
    const updated: CustomFormConfig = { ...form, status: nextStatus };

    try {
      await updateDoc(doc(db, 'custom_forms', form.id), { status: nextStatus });
    } catch (err) {
      console.error(err);
    }

    setSelectedForm(updated);
    await loadForms();
    playAudioSound('preview');
  };

  // Simulated Mobile Viewer Scan & View counter
  const openFormSimulator = async (form: CustomFormConfig) => {
    setSimulatingForm(form);
    setSimulatorAnswers({});
    setUploadedSimFiles({});
    setSimulatorSubmitted(false);
    playAudioSound('preview');

    // Register a View Event
    const nextViewCount = form.viewCount + 1;
    const updated = { ...form, viewCount: nextViewCount };

    try {
      await updateDoc(doc(db, 'custom_forms', form.id), { viewCount: nextViewCount });
    } catch (e) {
      console.error(e);
    }
    
    setSelectedForm(updated);
    await loadForms();
  };

  // Submit Answer from simulator
  const handleSimulatorFileChange = (fieldId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeStr = (file.size / 1024).toFixed(1) + ' KB';
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedSimFiles(prev => ({
          ...prev,
          [fieldId]: { name: file.name, size: sizeStr, data: reader.result as string }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSimulatorAnswerChange = (fieldId: string, val: string | string[]) => {
    setSimulatorAnswers(prev => ({ ...prev, [fieldId]: val }));
  };

  const submitSimulatedForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulatingForm) return;

    // Check if form is closed
    if (simulatingForm.status === 'closed') {
      playAudioSound('preview');
      alert('This form has been closed by the host.');
      return;
    }

    const subId = `sub-${Math.random().toString(36).substring(2, 9)}`;
    
    // Package any attachments
    const attachments = Object.keys(uploadedSimFiles).map(k => ({
      fileName: uploadedSimFiles[k].name,
      fileSize: uploadedSimFiles[k].size,
      fileData: uploadedSimFiles[k].data
    }));

    const newSub: FormSubmission = {
      id: subId,
      formId: simulatingForm.id,
      submittedAt: new Date().toISOString(),
      answers: simulatorAnswers,
      ...(attachments.length > 0 ? { attachments } : {})
    };

    const nextSubCount = simulatingForm.submissionCount + 1;
    const updatedForm = { ...simulatingForm, submissionCount: nextSubCount };

    try {
      // Save submission to collection
      await setDoc(doc(db, 'custom_forms', simulatingForm.id, 'submissions', subId), newSub);
      // Update custom form count
      await updateDoc(doc(db, 'custom_forms', simulatingForm.id), { submissionCount: nextSubCount });
    } catch (err) {
      console.error('Submission failed:', err);
    }

    setSimulatorSubmitted(true);
    playAudioSound('generate');
    
    setSelectedForm(updatedForm);
    await loadForms();
    await loadSubmissions(simulatingForm.id);
  };

  const handleDeleteSubmission = async (subId: string) => {
    if (!selectedForm) return;

    try {
      await deleteDoc(doc(db, 'custom_forms', selectedForm.id, 'submissions', subId));
      // Decrement count
      const nextSubCount = Math.max(0, selectedForm.submissionCount - 1);
      await updateDoc(doc(db, 'custom_forms', selectedForm.id), { submissionCount: nextSubCount });
      setSelectedForm({ ...selectedForm, submissionCount: nextSubCount });
    } catch (err) {
      console.error(err);
    }

    await loadForms();
    await loadSubmissions(selectedForm.id);
    playAudioSound('preview');
  };

  // Share URL & QR Code API
  const getFormVisitorLink = (id: string) => {
    return buildProductionUrl(`/share-preview?type=form&id=${id}`);
  };

  const getFormQRImageSrc = (form: CustomFormConfig) => {
    const link = encodeURIComponent(getFormVisitorLink(form.id));
    const qrColor = PALETTES[form.themeColor].hex;
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${link}&color=${qrColor}&bgcolor=ffffff&margin=12`;
  };

  const copyLink = (text: string, label: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedLabel(label);
    playAudioSound('generate');
    setTimeout(() => setCopiedLabel(null), 2000);
  };

  // CSV Export for Dashboard
  const exportToCSV = () => {
    if (!selectedForm || submissions.length === 0) return;

    const headers = ['Submission ID', 'Submitted At'];
    selectedForm.fields.forEach(f => headers.push(f.label));

    const rows = submissions.map(sub => {
      const rowData = [sub.id, new Date(sub.submittedAt).toLocaleString()];
      selectedForm.fields.forEach(f => {
        const ans = sub.answers[f.id];
        if (Array.isArray(ans)) {
          rowData.push(`"${ans.join(', ')}"`);
        } else if (ans) {
          rowData.push(`"${String(ans).replace(/"/g, '""')}"`);
        } else {
          rowData.push('');
        }
      });
      return rowData.join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${selectedForm.title.replace(/\s+/g, '_')}_submissions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    playAudioSound('generate');
  };

  // Recharts conversion analytics
  const getConversionData = () => {
    if (!selectedForm) return [];
    return [
      { name: 'Scans/Views', count: selectedForm.viewCount, fill: '#6366f1' },
      { name: 'Submissions', count: selectedForm.submissionCount, fill: PALETTES[selectedForm.themeColor].fillColor }
    ];
  };

  // Aggregated response statistics for first select/dropdown field in the form
  const getOptionDistribution = () => {
    if (!selectedForm || submissions.length === 0) return [];
    // Find first field with type 'select'
    const selectField = selectedForm.fields.find(f => f.type === 'select');
    if (!selectField) return [];

    const stats: { [key: string]: number } = {};
    // Initialize stats
    if (selectField.options) {
      selectField.options.split(',').forEach(o => {
        stats[o.trim()] = 0;
      });
    }

    submissions.forEach(sub => {
      const val = sub.answers[selectField.id];
      if (val && typeof val === 'string') {
        const trimmed = val.trim();
        stats[trimmed] = (stats[trimmed] || 0) + 1;
      }
    });

    const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#06b6d4'];

    return Object.keys(stats).map((key, index) => ({
      name: key,
      value: stats[key],
      color: COLORS[index % COLORS.length]
    })).filter(item => item.value > 0);
  };

  return (
    <div id="form-builder-module" dir={isRtl ? 'rtl' : 'ltr'} className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 ${isRtl ? 'font-arabic' : ''}`}>
      
      {/* Visual Identity Title Board */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-gradient-to-r from-slate-50 via-white to-blue-50 text-slate-900 p-6 sm:p-8 rounded-2xl relative overflow-hidden shadow-sm border border-slate-200/80">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-2 relative z-10 text-left rtl:text-right">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
              <ClipboardList className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              {tForm("Interactive Form Builder")}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            {tForm("Dynamic Form Builder & QR Core")}
          </h2>
          <p className="text-slate-600 text-sm max-w-xl leading-relaxed">
            {tForm("Design contact lists, customer surveys, RSVPs, or feedback boards. Generate instant scannable QR codes, collect secure entries directly in your Submission Dashboard, and track complete metrics.")}
          </p>
        </div>

        {/* Global summary count */}
        <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 p-4 rounded-2xl w-full md:w-56 shrink-0 z-10 flex flex-col justify-center shadow-xs text-left rtl:text-right">
          <div className="text-xs text-slate-500 font-bold mb-1 tracking-wider uppercase">{tForm("TOTAL ACTIVE FORMS")}</div>
          <div className="text-3xl font-black text-indigo-600">{forms.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">{tForm("Gated & authenticated with Firebase Firestore")}</div>
        </div>
      </div>

      {/* Main Area Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COMPONENT: Forms Dashboard / Builder Engine */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Main Navigation Toggles */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => { setViewingSubmissions(false); playAudioSound('preview'); }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${!viewingSubmissions ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <FormInput className="w-4 h-4" />
              {tForm("Configure & Build Form")}
            </button>
            <button
              disabled={!selectedForm}
              onClick={() => { setViewingSubmissions(true); playAudioSound('preview'); }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${viewingSubmissions ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800 disabled:opacity-50'}`}
            >
              <ClipboardList className="w-4 h-4" />
              {tForm("Submission Dashboard")} ({submissions.length})
            </button>
          </div>

          <AnimatePresence mode="wait">
            {!viewingSubmissions ? (
              // BUILDER AND SELECTION VIEWS
              <motion.div
                key="builder-pane"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Bootstrapped Templates selector */}
                <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xs p-6 space-y-4">
                  <div className="text-left rtl:text-right">
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                      <LayoutGrid className="w-4 h-4 text-indigo-600" />
                      {tForm("Bootstrap Instant Form Templates")}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{tForm("Click any template below to pre-populate custom fields instantly.")}</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                    {Object.keys(FORM_TEMPLATES).map(key => {
                      const isActive = formType === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleTemplateSelect(key as any)}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 min-h-[72px] ${isActive ? 'bg-indigo-50/50 border-indigo-400 text-indigo-700 font-bold ring-1 ring-indigo-400/30' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                        >
                          <span className="text-[10px] capitalize leading-none">{tForm(key)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Main Interactive Form Builder Core */}
                <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xs p-6 sm:p-8 space-y-6">
                  <div className="text-left rtl:text-right">
                    <h3 className="text-base font-black text-slate-800 flex items-center gap-1.5">
                      <Sliders className="w-5 h-5 text-indigo-600" />
                      {tForm("Form Fields & Metadata Configuration")}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{tForm("Customize properties, append custom choices, and order field requirements.")}</p>
                  </div>

                  <form onSubmit={handlePublishForm} className="space-y-6">
                    {/* Title & Desc Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left rtl:text-right">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">{tForm("Form Header Title")}</label>
                        <input
                          type="text"
                          value={formTitle}
                          onChange={e => setFormTitle(e.target.value)}
                          placeholder={tForm("e.g. VIP Dinner Confirmation")}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-indigo-400 outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">{tForm("Form Color Theme")}</label>
                        <select
                          value={formTheme}
                          onChange={e => setFormTheme(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs bg-white focus:ring-1 focus:ring-indigo-400 outline-none"
                        >
                          <option value="indigo">{tForm("Classic Indigo")}</option>
                          <option value="emerald">{tForm("Organic Emerald")}</option>
                          <option value="rose">{tForm("Elegant Rose")}</option>
                          <option value="amber">{tForm("Autumn Amber")}</option>
                          <option value="purple">{tForm("Cosmic Purple")}</option>
                          <option value="cyan">{tForm("Coastal Cyan")}</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">{tForm("Subtext / Explanatory Description")}</label>
                        <input
                          type="text"
                          value={formDesc}
                          onChange={e => setFormDesc(e.target.value)}
                          placeholder={tForm("Provide supportive context for prospects scanning your code...")}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-indigo-400 outline-none"
                        />
                      </div>
                    </div>

                    {/* Interactive Fields Builder Area */}
                    <div className="border border-slate-100 rounded-2xl overflow-hidden">
                      <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">{tForm("Active Fields")} ({formFields.length})</span>
                        <button
                          type="button"
                          onClick={addField}
                          className="text-[10px] text-indigo-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          {tForm("Add Custom Field")}
                        </button>
                      </div>

                      <div className="p-4 space-y-3 bg-white max-h-[350px] overflow-y-auto text-left rtl:text-right">
                        {formFields.map((field, idx) => {
                          const isEditing = editingFieldId === field.id;
                          return (
                            <div key={field.id} className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 space-y-2 relative">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] bg-slate-200 text-slate-600 w-5 h-5 rounded-md flex items-center justify-center font-bold">{idx + 1}</span>
                                  <p className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{field.label || tForm("Empty Label")}</p>
                                  <span className="text-[8px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase font-semibold">{tForm(field.type)}</span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setEditingFieldId(isEditing ? null : field.id)}
                                    className="text-[10px] text-slate-500 hover:text-indigo-600 font-bold cursor-pointer"
                                  >
                                    {isEditing ? tForm("Collapse") : tForm("Customize")}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteField(field.id)}
                                    className="text-slate-300 hover:text-rose-600 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Expanded Editing Panel */}
                              <AnimatePresence>
                                {isEditing && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden pt-2 border-t border-slate-150/50 mt-2 space-y-3"
                                  >
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">{tForm("Field Type")}</label>
                                        <select
                                          value={field.type}
                                          onChange={e => updateFieldProperty(field.id, 'type', e.target.value)}
                                          className="w-full p-1.5 rounded-lg border border-slate-200 bg-white text-slate-800"
                                        >
                                          <option value="text">{tForm("Short Text")}</option>
                                          <option value="textarea">{tForm("Paragraph Block")}</option>
                                          <option value="email">{tForm("Email Address")}</option>
                                          <option value="phone">{tForm("Phone Number")}</option>
                                          <option value="select">{tForm("Dropdown Choice")}</option>
                                          <option value="checkbox">{tForm("Checkbox Option")}</option>
                                          <option value="date">{tForm("Date picker")}</option>
                                          <option value="file">{tForm("File Attachment")}</option>
                                        </select>
                                      </div>

                                      <div className="sm:col-span-2">
                                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">{tForm("Question / Field Label")}</label>
                                        <input
                                          type="text"
                                          value={field.label}
                                          onChange={e => updateFieldProperty(field.id, 'label', e.target.value)}
                                          placeholder="e.g. Please enter your full name"
                                          className="w-full p-1.5 rounded-lg border border-slate-200 bg-white text-slate-800"
                                        />
                                      </div>

                                      <div className="sm:col-span-2">
                                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">{tForm("Placeholder Guide")}</label>
                                        <input
                                          type="text"
                                          value={field.placeholder}
                                          onChange={e => updateFieldProperty(field.id, 'placeholder', e.target.value)}
                                          placeholder="e.g. John Doe"
                                          className="w-full p-1.5 rounded-lg border border-slate-200 bg-white text-slate-800"
                                        />
                                      </div>

                                      <div className="flex items-center pt-4 pl-2 rtl:pr-2 rtl:pl-0">
                                        <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 cursor-pointer select-none">
                                          <input
                                            type="checkbox"
                                            checked={field.required}
                                            onChange={e => updateFieldProperty(field.id, 'required', e.target.checked)}
                                            className="rounded border-slate-300"
                                          />
                                          {tForm("Response Required")}
                                        </label>
                                      </div>

                                      {/* Dropdown Options Customizer */}
                                      {(field.type === 'select' || field.type === 'checkbox') && (
                                        <div className="sm:col-span-3">
                                          <label className="block text-[10px] font-bold text-indigo-600 mb-0.5">{tForm("Options (Comma separated list)")}</label>
                                          <input
                                            type="text"
                                            value={field.options || ''}
                                            onChange={e => updateFieldProperty(field.id, 'options', e.target.value)}
                                            placeholder="Standard Option 1, Option 2, Option 3"
                                            className="w-full p-1.5 rounded-lg border border-indigo-200 bg-white text-slate-800 outline-none focus:ring-1 focus:ring-indigo-400"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={isSaving || !formTitle.trim()}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl disabled:opacity-50 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        {isSaving ? tForm("Deploying Firestore Schema...") : tForm("Deploy Form & Activate QR")}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Created Custom Forms Listing */}
                <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xs p-6 space-y-4">
                  <h3 className="text-base font-black text-slate-800 flex items-center gap-1.5 text-left rtl:text-right">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                    {tForm("My Created Forms")} ({forms.length})
                  </h3>

                  <div className="space-y-3">
                    {forms.map(f => {
                      const isSelected = selectedForm?.id === f.id;
                      const palette = PALETTES[f.themeColor || 'indigo'];

                      return (
                        <div
                          key={f.id}
                          onClick={() => { setSelectedForm(f); playAudioSound('preview'); }}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isSelected ? 'bg-slate-50 border-indigo-400 shadow-xs ring-1 ring-indigo-400' : 'border-slate-200 hover:bg-slate-50/50'}`}
                        >
                          <div className="flex items-start gap-3 text-left rtl:text-right">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${palette.light} ${palette.border}`}>
                              <FormInput className={`w-5 h-5 ${palette.text}`} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="text-xs font-black text-slate-800 truncate">{f.title}</p>
                                <span className={`text-[8px] border px-1.5 py-0.5 rounded-md font-bold uppercase ${f.status === 'active' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'}`}>
                                  {f.status === 'active' ? tForm("● Open") : tForm("● Closed")}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 truncate max-w-xs">{f.description}</p>
                              <p className="text-[9px] text-slate-400 mt-1">
                                {f.fields.length} {tForm("customized fields")} • {tForm("Created")} {new Date(f.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 justify-end shrink-0">
                            {/* Visitor response metrics badge */}
                            <div className="flex items-center gap-2 bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200/40 text-[10px] text-slate-600 font-bold">
                              <span className="flex items-center gap-1" title={tForm("Views")}>
                                <Eye className="w-3.5 h-3.5 text-slate-400" />
                                {f.viewCount}
                              </span>
                              <span className="text-slate-300">|</span>
                              <span className="flex items-center gap-1" title={tForm("Submissions")}>
                                <ClipboardList className="w-3.5 h-3.5 text-slate-400" />
                                {f.submissionCount}
                              </span>
                            </div>

                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteForm(f.id); }}
                              className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                              title={tForm("Delete Form Config")}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {forms.length === 0 && (
                      <div className="text-center py-8 bg-slate-50 border border-slate-100 rounded-2xl">
                        <p className="text-xs text-slate-400">{tForm("No forms deployed yet. Create your first dynamic form schema above.")}</p>
                      </div>
                    )}
                  </div>
                </div>

              </motion.div>
            ) : (
              // SUBMISSIONS LISTING & ANALYTICS DASHBOARD
              <motion.div
                key="submissions-pane"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {selectedForm && (
                  <>
                    {/* Analytics Dashboard Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Metric Card 1: Conversion Rate */}
                      <div className="bg-white rounded-3xl border border-slate-200/60 p-6 space-y-4 shadow-xs text-left rtl:text-right">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <BarChart2 className="w-4 h-4 text-indigo-600" />
                          {tForm("View to Conversion Analytics")}
                        </h4>
                        
                        <div className="h-44 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getConversionData()}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                              <YAxis tick={{ fontSize: 10 }} />
                              <Tooltip />
                              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                                {getConversionData().map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Metric Card 2: Pie distribution of selected dropdown choice */}
                      <div className="bg-white rounded-3xl border border-slate-200/60 p-6 space-y-4 shadow-xs text-left rtl:text-right">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <BarChart2 className="w-4 h-4 text-emerald-600" />
                          {tForm("Option Breakdown (Dropdowns)")}
                        </h4>

                        {getOptionDistribution().length > 0 ? (
                          <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={getOptionDistribution()}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={40}
                                  outerRadius={65}
                                  paddingAngle={4}
                                  dataKey="value"
                                >
                                  {getOptionDistribution().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                            
                            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[9px] text-slate-500 font-bold">
                              {getOptionDistribution().map((item) => (
                                <span key={item.name} className="flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                  {item.name}: {item.value}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="h-44 flex flex-col items-center justify-center text-center text-xs text-slate-400">
                            <Info className="w-5 h-5 text-slate-300 mb-1" />
                            <p>{tForm("Select field stats will render here once dropdown questions are populated with answers.")}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Submissions Table / Grid list */}
                    <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xs p-6 sm:p-8 space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left rtl:text-right">
                        <div>
                          <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                            <ClipboardList className="w-5 h-5 text-indigo-600" />
                            {tForm("Aggregated Submissions")} ({submissions.length})
                          </h3>
                          <p className="text-[11px] text-slate-400 mt-0.5">{tForm("Real-time database entries logged by your clients.")}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={exportToCSV}
                            disabled={submissions.length === 0}
                            className="py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-black rounded-xl transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1 border border-indigo-100"
                          >
                            <Download className="w-3.5 h-3.5" />
                            {tForm("Export to CSV")}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4 text-left rtl:text-right">
                        {submissions.map((sub, idx) => {
                          const dateObj = new Date(sub.submittedAt);
                          return (
                            <div key={sub.id} className="border border-slate-150 rounded-2xl p-4 bg-slate-50/40 hover:bg-slate-50/80 transition-all space-y-3">
                              <div className="flex items-center justify-between border-b border-slate-100 pb-2 flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-black">#{submissions.length - idx}</span>
                                  <span className="text-[10px] text-slate-400 font-bold">{dateObj.toLocaleString()}</span>
                                </div>

                                <button
                                  onClick={() => handleDeleteSubmission(sub.id)}
                                  className="text-[10px] text-slate-400 hover:text-rose-600 cursor-pointer flex items-center gap-0.5"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  {tForm("Remove Entry")}
                                </button>
                              </div>

                              {/* Submission Answers Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                                {selectedForm.fields.map(f => {
                                  const ans = sub.answers[f.id];
                                  return (
                                    <div key={f.id} className="space-y-0.5 text-xs">
                                      <p className="font-extrabold text-slate-400 text-[10px] uppercase tracking-wider">{f.label}</p>
                                      {f.type === 'file' && sub.attachments ? (
                                        <div className="flex items-center gap-1.5 bg-indigo-50/50 p-1 px-2 rounded-lg border border-indigo-100 text-indigo-800 text-[11px] max-w-fit">
                                          <FileText className="w-3.5 h-3.5 shrink-0" />
                                          <span className="truncate max-w-[150px] font-bold">{sub.attachments[0]?.fileName}</span>
                                          <span className="text-[9px] text-indigo-500">({sub.attachments[0]?.fileSize})</span>
                                        </div>
                                      ) : (
                                        <p className="font-bold text-slate-800 break-words">
                                          {ans ? (Array.isArray(ans) ? ans.join(', ') : String(ans)) : <span className="text-slate-300">N/A</span>}
                                        </p>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}

                        {submissions.length === 0 && (
                          <div className="text-center py-12 bg-slate-50 border border-slate-100 rounded-2xl">
                            <Info className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs text-slate-400">{tForm("Waiting for first scan submissions. Point your phone camera at the QR code on the right to test submission flow.")}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* RIGHT COLUMN: QR Display frame & Phone Simulator View */}
        <div className="lg:col-span-5 space-y-8 sticky top-24">
          
          {selectedForm ? (
            <div className="space-y-6">
              
              {/* Box 1: Beautiful QR Frame */}
              <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xs p-6 sm:p-8 text-center space-y-5 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1.5 bg-linear-to-r from-indigo-500 to-cyan-400" />
                
                <div className="flex items-center justify-between text-left rtl:text-right">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-1">
                      <QrCode className="w-4.5 h-4.5 text-indigo-600" />
                      {tForm("Dynamic Form QR")}
                    </h3>
                    <p className="text-[10px] text-slate-400">{tForm("Scanners are securely directed to fill form answers.")}</p>
                  </div>

                  <button
                    onClick={() => handleToggleFormStatus(selectedForm)}
                    className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border cursor-pointer select-none transition-all ${selectedForm.status === 'active' ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-rose-50 hover:text-rose-800 hover:border-rose-200' : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200'}`}
                  >
                    {selectedForm.status === 'active' ? tForm("● Open") : tForm("● Closed")}
                  </button>
                </div>

                {/* QR Framing */}
                <div className="mx-auto w-48 h-48 bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-center shadow-xs">
                  <img
                    src={getFormQRImageSrc(selectedForm)}
                    alt="Form QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => openFormSimulator(selectedForm)}
                    className="py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-indigo-100"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    {tForm("Simulate Mobile Scan")}
                  </button>

                  <button
                    onClick={() => {
                      copyLink(getFormVisitorLink(selectedForm.id), 'form-link');
                    }}
                    className="py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-slate-200"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    {copiedLabel === 'form-link' ? tForm("Copied Link!") : tForm("Copy Form Link")}
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-[10px] text-slate-400">
                  <span>ID: {selectedForm.id}</span>
                  <span className="font-semibold text-slate-500 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    {tForm("Connected to Firebase Auth & DB")}
                  </span>
                </div>
              </div>

              {/* Box 2: Static Side Form Layout Visual preview */}
              <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 space-y-4 shadow-xl border border-slate-800 text-left rtl:text-right">
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-indigo-400" />
                  {tForm("Live Builder Wireframe")}
                </h4>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <p className="text-xs font-black text-white">{formTitle || tForm("Sample Title")}</p>
                  <p className="text-[10px] text-slate-400">{formDesc || tForm("Sample description context...")}</p>

                  <div className="space-y-2.5 pt-2">
                    {formFields.map(f => (
                      <div key={f.id} className="space-y-1">
                        <label className="block text-[10px] text-slate-400 font-bold">{f.label} {f.required && <span className="text-rose-500">*</span>}</label>
                        <div className="w-full h-8 bg-slate-900 border border-slate-800 rounded-lg flex items-center px-2 text-[10px] text-slate-500 italic">
                          {f.placeholder || tForm("Empty placeholder")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-slate-50/50 rounded-3xl border border-dashed border-slate-300 p-8 text-center space-y-3">
              <ClipboardList className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-400">{tForm("Create or select a form on the left to activate scannable QR redirections.")}</p>
            </div>
          )}

        </div>

      </div>

      {/* Visitor Mobile Simulation Frame Modal */}
      <AnimatePresence>
        {simulatingForm && (
          <div dir={isRtl ? 'rtl' : 'ltr'} className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-150 relative my-8"
            >
              {/* Simulated phone top header bar */}
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-[10px] font-black tracking-widest text-slate-400">{tForm("PHONE PORTAL VIEW")}</span>
                </div>
                <button
                  onClick={() => setSimulatingForm(null)}
                  className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
                >
                  {tForm("Close [X]")}
                </button>
              </div>

              {/* simulated phone content */}
              <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto text-left rtl:text-right">
                {simulatorSubmitted ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                      <Check className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-800">{tForm("Submission Received!")}</h4>
                      <p className="text-xs text-slate-400 mt-1">{tForm("Thank you. Your answers have been safely written to our database collection.")}</p>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => { setSimulatorSubmitted(false); setSimulatorAnswers({}); setUploadedSimFiles({}); }}
                        className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        {tForm("Submit Another Response")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={submitSimulatedForm} className="space-y-5">
                    
                    {/* Header Branding */}
                    <div className="text-center space-y-1.5 pb-2 border-b border-slate-100">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto border border-indigo-100">
                        <FormInput className="w-6 h-6 text-indigo-600" />
                      </div>
                      <h4 className="text-base font-black text-slate-800">{simulatingForm.title}</h4>
                      <p className="text-xs text-slate-400">{simulatingForm.description}</p>
                    </div>

                    {/* Check status block */}
                    {simulatingForm.status === 'closed' ? (
                      <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-center space-y-1">
                        <AlertCircle className="w-6 h-6 text-rose-600 mx-auto" />
                        <h5 className="text-xs font-bold text-rose-900">{tForm("Form is Currently Closed")}</h5>
                        <p className="text-[10px] text-rose-700">{tForm("Submissions are temporarily disabled by the publisher.")}</p>
                      </div>
                    ) : (
                      // Dynamic Inputs Render
                      <div className="space-y-4 text-xs">
                        {simulatingForm.fields.map(field => {
                          const palette = PALETTES[simulatingForm.themeColor || 'indigo'];
                          const isRequired = field.required;

                          return (
                            <div key={field.id} className="space-y-1.5">
                              <label className="block font-black text-slate-700">
                                {field.label} {isRequired && <span className="text-rose-500">*</span>}
                              </label>

                              {/* Input Type text */}
                              {field.type === 'text' && (
                                <input
                                  type="text"
                                  placeholder={field.placeholder}
                                  required={isRequired}
                                  value={(simulatorAnswers[field.id] as string) || ''}
                                  onChange={e => handleSimulatorAnswerChange(field.id, e.target.value)}
                                  className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-800 ${palette.ring}`}
                                />
                              )}

                              {/* Input Type Email */}
                              {field.type === 'email' && (
                                <input
                                  type="email"
                                  placeholder={field.placeholder}
                                  required={isRequired}
                                  value={(simulatorAnswers[field.id] as string) || ''}
                                  onChange={e => handleSimulatorAnswerChange(field.id, e.target.value)}
                                  className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-800 ${palette.ring}`}
                                />
                              )}

                              {/* Input Type Phone */}
                              {field.type === 'phone' && (
                                <input
                                  type="tel"
                                  placeholder={field.placeholder}
                                  required={isRequired}
                                  value={(simulatorAnswers[field.id] as string) || ''}
                                  onChange={e => handleSimulatorAnswerChange(field.id, e.target.value)}
                                  className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-800 ${palette.ring}`}
                                />
                              )}

                              {/* Input Type TextArea */}
                              {field.type === 'textarea' && (
                                <textarea
                                  placeholder={field.placeholder}
                                  required={isRequired}
                                  value={(simulatorAnswers[field.id] as string) || ''}
                                  onChange={e => handleSimulatorAnswerChange(field.id, e.target.value)}
                                  className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-800 min-h-[80px] ${palette.ring}`}
                                />
                              )}

                              {/* Input Type Select */}
                              {field.type === 'select' && (
                                <select
                                  required={isRequired}
                                  value={(simulatorAnswers[field.id] as string) || ''}
                                  onChange={e => handleSimulatorAnswerChange(field.id, e.target.value)}
                                  className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-800 ${palette.ring}`}
                                >
                                  <option value="">{field.placeholder || tForm("Select choice...")}</option>
                                  {field.options?.split(',').map(o => (
                                    <option key={o.trim()} value={o.trim()}>{o.trim()}</option>
                                  ))}
                                </select>
                              )}

                              {/* Input Type Checkbox option */}
                              {field.type === 'checkbox' && (
                                <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                                  {field.options?.split(',').map(o => {
                                    const opt = o.trim();
                                    const currAnswers = (simulatorAnswers[field.id] as string[]) || [];
                                    const isChecked = currAnswers.includes(opt);

                                    return (
                                      <label key={opt} className="flex items-center gap-2 cursor-pointer select-none py-0.5">
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          onChange={e => {
                                            if (e.target.checked) {
                                              handleSimulatorAnswerChange(field.id, [...currAnswers, opt]);
                                            } else {
                                              handleSimulatorAnswerChange(field.id, currAnswers.filter(a => a !== opt));
                                            }
                                          }}
                                          className="rounded border-slate-300"
                                        />
                                        <span>{opt}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Input Type Date */}
                              {field.type === 'date' && (
                                <input
                                  type="date"
                                  required={isRequired}
                                  value={(simulatorAnswers[field.id] as string) || ''}
                                  onChange={e => handleSimulatorAnswerChange(field.id, e.target.value)}
                                  className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-800 ${palette.ring}`}
                                />
                              )}

                              {/* Input Type File upload */}
                              {field.type === 'file' && (
                                <div className="space-y-1.5">
                                  <input
                                    type="file"
                                    accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                                    onChange={e => handleSimulatorFileChange(field.id, e)}
                                    className="hidden"
                                    id={`file-input-${field.id}`}
                                  />
                                  <label
                                    htmlFor={`file-input-${field.id}`}
                                    className="w-full py-2.5 px-3 border border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer flex flex-col items-center justify-center gap-1 text-[11px]"
                                  >
                                    <FileUp className="w-4 h-4 text-slate-400" />
                                    {uploadedSimFiles[field.id] ? (
                                      <span className="text-emerald-600 font-bold truncate max-w-[200px]">
                                        ✓ {uploadedSimFiles[field.id].name}
                                      </span>
                                    ) : (
                                      <span className="text-slate-500">{tForm("Attach screenshot or PDF file")}</span>
                                    )}
                                  </label>
                                </div>
                              )}

                            </div>
                          );
                        })}

                        <div className="pt-2">
                          <button
                            type="submit"
                            className={`w-full py-2.5 px-4 rounded-xl font-extrabold cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-xs ${PALETTES[simulatingForm.themeColor || 'indigo'].accent}`}
                          >
                            <Send className="w-3.5 h-3.5" />
                            {tForm("Submit Form")}
                          </button>
                        </div>
                      </div>
                    )}

                  </form>
                )}
              </div>

              {/* device mock home button decoration */}
              <div className="bg-slate-100 p-3 border-t border-slate-200 flex items-center justify-center">
                <button
                  onClick={() => setSimulatingForm(null)}
                  className="w-10 h-10 rounded-full border border-slate-300 bg-white hover:bg-slate-50 shadow-xs flex items-center justify-center text-xs font-bold cursor-pointer"
                >
                  O
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
