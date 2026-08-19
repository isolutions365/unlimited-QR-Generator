import faqEn from '../locales/faq/en.json';
import faqAr from '../locales/faq/ar.json';
import faqUr from '../locales/faq/ur.json';
import faqDe from '../locales/faq/de.json';
import faqFr from '../locales/faq/fr.json';
import faqEs from '../locales/faq/es.json';
import faqPt from '../locales/faq/pt.json';
import faqIt from '../locales/faq/it.json';
import faqTr from '../locales/faq/tr.json';
import faqId from '../locales/faq/id.json';
import faqHi from '../locales/faq/hi.json';
import faqZh from '../locales/faq/zh.json';
import faqJa from '../locales/faq/ja.json';
import faqKo from '../locales/faq/ko.json';

const faqDataMap: Record<string, any> = {
  en: faqEn,
  ar: faqAr,
  ur: faqUr,
  de: faqDe,
  fr: faqFr,
  es: faqEs,
  pt: faqPt,
  it: faqIt,
  tr: faqTr,
  id: faqId,
  hi: faqHi,
  zh: faqZh,
  ja: faqJa,
  ko: faqKo
};

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

export const getFaqData = (locale: string = 'en'): FAQItem[] => {
  const data = faqDataMap[locale];
  if (Array.isArray(data) && data.length > 0) {
    return data as FAQItem[];
  }
  return (faqDataMap['en'] || []) as FAQItem[];
};
