import faqDataJson from '../locales/data.json';

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
  const data = (faqDataJson as any).faq[locale] || (faqDataJson as any).faq['en'];
  return data;
};
