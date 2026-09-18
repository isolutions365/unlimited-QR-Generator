import faqEn from '../locales/faq/en.json';

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

const faqLoaders: Record<string, () => Promise<{ default: any }>> = {
  en: () => Promise.resolve({ default: faqEn }),
  ar: () => import('../locales/faq/ar.json'),
  ur: () => import('../locales/faq/ur.json'),
  de: () => import('../locales/faq/de.json'),
  fr: () => import('../locales/faq/fr.json'),
  es: () => import('../locales/faq/es.json'),
  pt: () => import('../locales/faq/pt.json'),
  it: () => import('../locales/faq/it.json'),
  tr: () => import('../locales/faq/tr.json'),
  id: () => import('../locales/faq/id.json'),
  hi: () => import('../locales/faq/hi.json'),
  zh: () => import('../locales/faq/zh.json'),
  ja: () => import('../locales/faq/ja.json'),
  ko: () => import('../locales/faq/ko.json'),
};

const faqDataCache: Record<string, FAQItem[]> = {
  en: faqEn as FAQItem[],
};

const pendingFaqLoads = new Map<string, Promise<FAQItem[]>>();

export const isFaqLocaleCached = (locale: string = 'en'): boolean => {
  return !!faqDataCache[locale];
};

export const loadFaqDataAsync = async (locale: string = 'en'): Promise<FAQItem[]> => {
  if (faqDataCache[locale]) {
    return faqDataCache[locale];
  }
  if (pendingFaqLoads.has(locale)) {
    return pendingFaqLoads.get(locale)!;
  }
  const loader = faqLoaders[locale] || faqLoaders['en'];
  const loadPromise = loader()
    .then((mod) => {
      const data = (mod.default || mod) as FAQItem[];
      if (Array.isArray(data) && data.length > 0) {
        faqDataCache[locale] = data;
      } else {
        faqDataCache[locale] = faqDataCache['en'];
      }
      pendingFaqLoads.delete(locale);
      return faqDataCache[locale];
    })
    .catch((err) => {
      pendingFaqLoads.delete(locale);
      console.warn(`[faqData] Error loading localized FAQ for "${locale}":`, err);
      return faqDataCache['en'] || (faqEn as FAQItem[]);
    });

  pendingFaqLoads.set(locale, loadPromise);
  return loadPromise;
};

export const getFaqData = (locale: string = 'en'): FAQItem[] => {
  if (faqDataCache[locale]) {
    return faqDataCache[locale];
  }
  loadFaqDataAsync(locale);
  return faqDataCache['en'] || (faqEn as FAQItem[]);
};
