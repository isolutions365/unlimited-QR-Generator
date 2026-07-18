import blogEn from '../locales/blog/en.json';
import blogAr from '../locales/blog/ar.json';
import blogUr from '../locales/blog/ur.json';
import blogDe from '../locales/blog/de.json';
import blogFr from '../locales/blog/fr.json';
import blogEs from '../locales/blog/es.json';
import blogPt from '../locales/blog/pt.json';
import blogIt from '../locales/blog/it.json';
import blogTr from '../locales/blog/tr.json';
import blogId from '../locales/blog/id.json';
import blogHi from '../locales/blog/hi.json';
import blogZh from '../locales/blog/zh.json';
import blogJa from '../locales/blog/ja.json';
import blogKo from '../locales/blog/ko.json';

const blogDataMap: Record<string, any> = {
  en: blogEn,
  ar: blogAr,
  ur: blogUr,
  de: blogDe,
  fr: blogFr,
  es: blogEs,
  pt: blogPt,
  it: blogIt,
  tr: blogTr,
  id: blogId,
  hi: blogHi,
  zh: blogZh,
  ja: blogJa,
  ko: blogKo
};

export interface BlogArticle {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  category: string;
  date: string;
  readingTime: string;
  author: string;
  intro: string;
  contentMarkdown: string;
  relatedFAQs: { question: string; answer: string }[];
  internalLinks: { label: string; url: string }[];
}

export const getBlogArticles = (locale: string = 'en'): BlogArticle[] => {
  return (blogDataMap[locale] || blogDataMap['en']) as BlogArticle[];
};

export const blogCategories = [
  "QR Code Guides",
  "Business Marketing",
  "Digital Marketing",
  "Small Business Tools",
  "Technology",
  "Contactless Solutions",
  "Restaurant QR Menus",
  "Event QR Codes",
  "Education QR Codes",
  "Social Media Marketing"
] as const;
