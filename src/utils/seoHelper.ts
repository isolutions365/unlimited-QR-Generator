import { Locale, SUPPORTED_LOCALES } from './translations';
import { getProductionBaseUrl } from '../config/siteConfig';

export interface LocalizedSEOConfig {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  authorName?: string;
  breadcrumbs?: { name: string; url: string }[];
}

/**
 * Enterprise SEO & Metatags Manager for Dynamic Localized Pages
 */
export function injectLocalizedSEO(config: LocalizedSEOConfig, locale: Locale) {
  if (typeof window === 'undefined') return;

  const doc = window.document;
  const canonicalUrl = getLocalizedCanonicalUrl(config.url, locale);

  // 1. Core Meta Tags
  updateTitle(config.title);
  updateMetaTag("description", config.description);

  // 2. Localized Hreflang Tags (Crucial for multi-regional SEO!)
  injectHreflangs(config.url, doc);

  // 3. OpenGraph Tags
  updateMetaTag("og:title", config.title, "property");
  updateMetaTag("og:description", config.description, "property");
  updateMetaTag("og:url", canonicalUrl, "property");
  updateMetaTag("og:type", config.type || "website", "property");
  updateMetaTag("og:locale", getLocaleOgString(locale), "property");
  
  if (config.image) {
    updateMetaTag("og:image", config.image, "property");
  }

  // 4. Twitter Cards
  updateMetaTag("twitter:card", "summary_large_image");
  updateMetaTag("twitter:title", config.title);
  updateMetaTag("twitter:description", config.description);
  if (config.image) {
    updateMetaTag("twitter:image", config.image);
  }

  // 5. JSON-LD Schema (WebSite & Breadcrumbs)
  injectJsonLd(config, locale, doc);
}

/**
 * Generate fully qualified localized sitemap URLs
 */
export function generateLocalSitemapUrls(baseDomain: string, paths: string[]): string[] {
  const urls: string[] = [];
  paths.forEach(path => {
    SUPPORTED_LOCALES.forEach(locale => {
      const prefix = locale === 'en' ? '' : `/${locale}`;
      urls.push(`${baseDomain}${prefix}${path}`);
    });
  });
  return urls;
}

/* --- Internal Helpers --- */

function updateTitle(title: string) {
  window.document.title = title;
}

function updateMetaTag(name: string, content: string, typeKey: 'name' | 'property' = 'name') {
  const doc = window.document;
  const selector = `meta[${typeKey}="${name}"]`;
  let element = doc.querySelector(selector);
  
  if (!element) {
    element = doc.createElement('meta');
    element.setAttribute(typeKey, name);
    doc.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function getLocalizedCanonicalUrl(rawUrl: string, locale: Locale): string {
  const urlObj = new URL(rawUrl, getProductionBaseUrl());
  const cleanPath = urlObj.pathname.replace(/^\/(ar|ur|es|fr|de|pt|it|tr|id|hi|ja|ko|zh)/, '');
  const prefix = locale === 'en' ? '' : `/${locale}`;
  return `${urlObj.origin}${prefix}${cleanPath === '/' ? '' : cleanPath}${urlObj.search}`;
}

function getLocaleOgString(locale: Locale): string {
  const mappings: Record<Locale, string> = {
    en: 'en_US',
    ar: 'ar_AR',
    ur: 'ur_PK',
    es: 'es_ES',
    fr: 'fr_FR',
    de: 'de_DE',
    pt: 'pt_PT',
    it: 'it_IT',
    tr: 'tr_TR',
    id: 'id_ID',
    hi: 'hi_IN',
    ja: 'ja_JP',
    ko: 'ko_KR',
    zh: 'zh_CN',
  };
  return mappings[locale] || 'en_US';
}

function injectHreflangs(rawUrl: string, doc: Document) {
  // Remove any existing hreflang tags to prevent duplicates
  doc.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());

  const urlObj = new URL(rawUrl, getProductionBaseUrl());
  const cleanPath = urlObj.pathname.replace(/^\/(ar|ur|es|fr|de|pt|it|tr|id|hi|ja|ko|zh)/, '');

  SUPPORTED_LOCALES.forEach((l) => {
    const link = doc.createElement('link');
    link.setAttribute('rel', 'alternate');
    link.setAttribute('hreflang', l === 'en' ? 'x-default' : l);
    
    const prefix = l === 'en' ? '' : `/${l}`;
    link.setAttribute('href', `${urlObj.origin}${prefix}${cleanPath === '/' ? '' : cleanPath}`);
    doc.head.appendChild(link);

    // Also inject specific language code alternate if it's not x-default
    if (l !== 'en') {
      const specificLink = doc.createElement('link');
      specificLink.setAttribute('rel', 'alternate');
      specificLink.setAttribute('hreflang', l);
      specificLink.setAttribute('href', `${urlObj.origin}${prefix}${cleanPath === '/' ? '' : cleanPath}`);
      doc.head.appendChild(specificLink);
    }
  });
}

function injectJsonLd(config: LocalizedSEOConfig, locale: Locale, doc: Document) {
  // Clear any old JSON-LD script injected by this helper
  doc.querySelectorAll('script[type="application/ld+json"][data-seo-ld]').forEach(el => el.remove());

  const canonicalUrl = getLocalizedCanonicalUrl(config.url, locale);

  // 1. WebSite Schema
  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "FreeQRGen.pro",
    "url": canonicalUrl,
    "description": config.description,
    "inLanguage": locale,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${getProductionBaseUrl()}${locale === 'en' ? '' : '/' + locale}/?search={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  const scripts: Record<string, any>[] = [webSiteSchema];

  // 2. Breadcrumbs Schema
  if (config.breadcrumbs && config.breadcrumbs.length > 0) {
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": config.breadcrumbs.map((crumb, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "name": crumb.name,
        "item": crumb.url.startsWith('http') ? crumb.url : `${getProductionBaseUrl()}${crumb.url}`
      }))
    };
    scripts.push(breadcrumbSchema);
  }

  // 3. Product / Tool Schema (for the QR Generator itself)
  if (config.type === 'product') {
    const productSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": config.title,
      "description": config.description,
      "image": config.image || `${getProductionBaseUrl()}/logo.png`,
      "offers": {
        "@type": "Offer",
        "price": "0.00",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      }
    };
    scripts.push(productSchema);
  }

  // Inject into document head
  scripts.forEach((schemaData) => {
    const script = doc.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute('data-seo-ld', 'true');
    script.textContent = JSON.stringify(schemaData);
    doc.head.appendChild(script);
  });
}
