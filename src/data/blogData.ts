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
  const articles = blogDataMap[locale];
  if (Array.isArray(articles) && articles.length > 0) {
    // Check if articles contain placeholder markers like '[ترجمہ شدہ]', 'Translation]', or bracketed tags
    const hasPlaceholders = articles.some((art: any) => {
      const text = `${art.title || ''} ${art.metaDescription || ''} ${art.intro || ''} ${art.contentMarkdown || ''}`;
      return text.includes('[ترجمہ شدہ]') || text.includes('Translation]') || text.includes('[UR Translation]') || text.includes('[PT Translation]') || text.includes('[FR Translation]') || text.includes('[ES Translation]');
    });

    if (hasPlaceholders && locale !== 'en') {
      // If incomplete or containing fake placeholder markers, fallback to English pristine articles per instructions
      return (blogDataMap['en'] || []) as BlogArticle[];
    }

    return articles as BlogArticle[];
  }
  return (blogDataMap['en'] || []) as BlogArticle[];
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

export function checkArticleTranslationStatus(article: BlogArticle, locale: string = 'en'): { isComplete: boolean; isFallback: boolean } {
  if (locale === 'en') {
    return { isComplete: true, isFallback: false };
  }

  const rawLocalizedArray = blogDataMap[locale];
  if (!Array.isArray(rawLocalizedArray) || rawLocalizedArray.length === 0) {
    return { isComplete: false, isFallback: true };
  }

  const rawArticle = rawLocalizedArray.find((art: any) => art.slug === article.slug);
  if (!rawArticle) {
    return { isComplete: false, isFallback: true };
  }

  const combinedText = `${rawArticle.title || ''} ${rawArticle.metaDescription || ''} ${rawArticle.intro || ''} ${rawArticle.contentMarkdown || ''}`;

  // Check for placeholder markers like [XX Translation], [ترجمہ شدہ], etc.
  const placeholderRegex = /\[.*?(Translation|ترجمہ|Draft|Placeholder).*?\]/i;
  const hasPlaceholders = placeholderRegex.test(combinedText) || combinedText.includes('Translation]');

  if (hasPlaceholders) {
    return { isComplete: false, isFallback: true };
  }

  if (!rawArticle.title || !rawArticle.contentMarkdown || rawArticle.contentMarkdown.trim().length < 50) {
    return { isComplete: false, isFallback: true };
  }

  return { isComplete: true, isFallback: false };
}
