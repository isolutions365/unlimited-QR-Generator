import blogEn from '../locales/blog/en.json';

export interface BlogArticle {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  category: string;
  date: string;
  dateModified?: string;
  readingTime: string;
  author: string;
  intro: string;
  contentMarkdown: string;
  relatedFAQs: { question: string; answer: string }[];
  internalLinks: { label: string; url: string }[];
}

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

const blogLoaders: Record<string, () => Promise<{ default: any }>> = {
  en: () => Promise.resolve({ default: blogEn }),
  ar: () => import('../locales/blog/ar.json'),
  ur: () => import('../locales/blog/ur.json'),
  de: () => import('../locales/blog/de.json'),
  fr: () => import('../locales/blog/fr.json'),
  es: () => import('../locales/blog/es.json'),
  pt: () => import('../locales/blog/pt.json'),
  it: () => import('../locales/blog/it.json'),
  tr: () => import('../locales/blog/tr.json'),
  id: () => import('../locales/blog/id.json'),
  hi: () => import('../locales/blog/hi.json'),
  zh: () => import('../locales/blog/zh.json'),
  ja: () => import('../locales/blog/ja.json'),
  ko: () => import('../locales/blog/ko.json'),
};

const blogDataCache: Record<string, BlogArticle[]> = {
  en: blogEn as BlogArticle[],
};

const pendingBlogLoads = new Map<string, Promise<BlogArticle[]>>();

export const isBlogLocaleCached = (locale: string = 'en'): boolean => {
  return !!blogDataCache[locale];
};

export const loadBlogArticlesAsync = async (locale: string = 'en'): Promise<BlogArticle[]> => {
  if (blogDataCache[locale]) {
    return blogDataCache[locale];
  }
  if (pendingBlogLoads.has(locale)) {
    return pendingBlogLoads.get(locale)!;
  }
  const loader = blogLoaders[locale] || blogLoaders['en'];
  const loadPromise = loader()
    .then((mod) => {
      const articles = (mod.default || mod) as BlogArticle[];
      if (Array.isArray(articles) && articles.length > 0) {
        // Check if articles contain placeholder markers
        const hasPlaceholders = articles.some((art: any) => {
          const text = `${art.title || ''} ${art.metaDescription || ''} ${art.intro || ''} ${art.contentMarkdown || ''}`;
          return text.includes('[ترجمہ شدہ]') || text.includes('Translation]') || text.includes('[UR Translation]') || text.includes('[PT Translation]') || text.includes('[FR Translation]') || text.includes('[ES Translation]');
        });

        if (hasPlaceholders && locale !== 'en') {
          blogDataCache[locale] = blogDataCache['en'];
        } else {
          blogDataCache[locale] = articles;
        }
      } else {
        blogDataCache[locale] = blogDataCache['en'];
      }
      pendingBlogLoads.delete(locale);
      return blogDataCache[locale];
    })
    .catch((err) => {
      pendingBlogLoads.delete(locale);
      console.warn(`[blogData] Error loading localized blog articles for "${locale}":`, err);
      return blogDataCache['en'] || (blogEn as BlogArticle[]);
    });

  pendingBlogLoads.set(locale, loadPromise);
  return loadPromise;
};

export const getBlogArticles = (locale: string = 'en'): BlogArticle[] => {
  if (blogDataCache[locale]) {
    return blogDataCache[locale];
  }
  loadBlogArticlesAsync(locale);
  return blogDataCache['en'] || (blogEn as BlogArticle[]);
};

export function checkArticleTranslationStatus(article: BlogArticle, locale: string = 'en'): { isComplete: boolean; isFallback: boolean } {
  if (locale === 'en') {
    return { isComplete: true, isFallback: false };
  }

  const rawLocalizedArray = blogDataCache[locale];
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
