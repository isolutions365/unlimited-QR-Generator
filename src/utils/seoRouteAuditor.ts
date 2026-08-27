import { Locale, SUPPORTED_LOCALES } from './translations';
import { landingPages } from '../pages/landing/SEODatabase';
import { solutionsData, useCasesData, industriesData } from '../data/programmaticSEOData';
import { knowledgeArticles } from '../data/knowledgeData';
import { templatePages } from '../data/templatePagesData';
import { comparisons } from '../data/compareData';

export interface MissingSchemaRecommendation {
  type: string;
  importance: 'high' | 'medium' | 'low';
  reason: string;
  sampleSnippet: object;
}

export interface AuditedRouteInfo {
  path: string;
  category: 'Generators & Tools' | 'Core & Trust' | 'Knowledge & Blog' | 'Templates & Compare' | 'Solutions & Industries';
  title: string;
  titleLength: number;
  titleStatus: 'good' | 'too-short' | 'too-long';
  description: string;
  descriptionLength: number;
  descriptionStatus: 'good' | 'too-short' | 'too-long';
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogLocale: string;
  twitterCard: string;
  hreflangs: { lang: string; url: string }[];
  existingSchemas: string[];
  missingSchemas: MissingSchemaRecommendation[];
  healthScore: number;
  status: 'healthy' | 'warning' | 'critical';
  issues: string[];
  lastmod?: string;
  priority?: number;
}

export interface SEOAuditSummary {
  totalRoutes: number;
  avgHealthScore: number;
  healthyCount: number;
  warningCount: number;
  criticalCount: number;
  schemaCoverageRate: number; // Percentage of routes with > 1 schema
  canonicalHealthRate: number; // Percentage with valid canonical & 8 hreflangs
  metaCompletionRate: number; // Percentage with valid title & description lengths
}

const ROOT_DOMAIN = 'https://www.freeqrbarcodes.com';

const OG_LOCALE_MAP: Record<Locale, string> = {
  en: 'en_US',
  ar: 'ar_AR',
  ur: 'ur_PK',
  hi: 'hi_IN',
  fr: 'fr_FR',
  es: 'es_ES',
  tr: 'tr_TR',
  id: 'id_ID',
};

/**
 * Helper to compute localized canonical URL for a given path and locale
 */
export function getCanonicalForPath(path: string, locale: Locale): string {
  const cleanPath = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  const prefix = locale === 'en' ? '' : `/${locale}`;
  return `${ROOT_DOMAIN}${prefix}${cleanPath}`;
}

/**
 * Generate hreflang entries for all 8 supported locales
 */
export function getHreflangsForPath(path: string): { lang: string; url: string }[] {
  const cleanPath = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  const entries: { lang: string; url: string }[] = [];

  // x-default is English
  entries.push({ lang: 'x-default', url: `${ROOT_DOMAIN}${cleanPath}` });

  SUPPORTED_LOCALES.forEach((loc) => {
    const prefix = loc === 'en' ? '' : `/${loc}`;
    entries.push({ lang: loc, url: `${ROOT_DOMAIN}${prefix}${cleanPath}` });
  });

  return entries;
}

/**
 * Audits all routes in the system for a target locale
 */
export function auditAllRoutes(locale: Locale): { routes: AuditedRouteInfo[]; summary: SEOAuditSummary } {
  const routeList: { path: string; category: AuditedRouteInfo['category']; defaultTitle: string; defaultDesc: string; customType?: string }[] = [
    // Core & Generators
    { path: '/', category: 'Generators & Tools', defaultTitle: 'Free QR Code Generator - Dynamic QR Codes & Custom Creator', defaultDesc: 'Create free dynamic QR codes with logos, custom colors, gradients, and real-time scan analytics. Custom styled QR generator template for your brand.' },
    { path: '/url-qr-generator', category: 'Generators & Tools', defaultTitle: 'Free URL QR Code Generator | Custom Link QR Creator', defaultDesc: 'Convert web URLs into scannable dynamic QR codes with custom logo, colors, and scan analytics.' },
    { path: '/wifi-qr-generator', category: 'Generators & Tools', defaultTitle: 'Free WiFi QR Code Generator | Connect Instantly without Passwords', defaultDesc: 'Generate customized WiFi QR codes with our free WiFi QR code generator. Allow guests to scan and connect instantly.' },
    { path: '/pdf-qr-generator', category: 'Generators & Tools', defaultTitle: 'PDF QR Code Generator | Share Documents via Scan', defaultDesc: 'Upload and convert PDF files into scannable QR codes for menus, brochures, user guides, and presentations.' },
    { path: '/vcard-qr-generator', category: 'Generators & Tools', defaultTitle: 'vCard QR Code Generator | Digital Contact Card Creator', defaultDesc: 'Generate vCard QR codes to instantly share contact details, phone numbers, and email addresses.' },
    { path: '/email-qr-generator', category: 'Generators & Tools', defaultTitle: 'Email QR Code Generator | Pre-filled Email Scans', defaultDesc: 'Create email QR codes pre-populated with subject lines, body text, and recipient addresses.' },
    { path: '/sms-qr-generator', category: 'Generators & Tools', defaultTitle: 'SMS QR Code Generator | Instant Text Message Scanning', defaultDesc: 'Generate SMS QR codes that trigger pre-written text messages upon scanning.' },
    { path: '/whatsapp-qr-generator', category: 'Generators & Tools', defaultTitle: 'WhatsApp QR Code Generator | Direct Chat Links', defaultDesc: 'Create scannable WhatsApp QR codes to initiate direct customer service chats.' },
    { path: '/instagram-qr-generator', category: 'Generators & Tools', defaultTitle: 'Instagram QR Code Generator | Direct Profile Follows', defaultDesc: 'Generate custom Instagram QR codes to drive social followers and engagement.' },
    { path: '/business-card-qr-generator', category: 'Generators & Tools', defaultTitle: 'Business Card QR Code Generator | Professional Contact QR', defaultDesc: 'Create high-impact digital business card QR codes with custom branding.' },
    { path: '/restaurant-qr-generator', category: 'Generators & Tools', defaultTitle: 'Restaurant Menu QR Code Generator | Touchless Dining', defaultDesc: 'Design interactive digital menu QR codes for restaurants, cafes, and bars.' },
    { path: '/facebook-qr-generator', category: 'Generators & Tools', defaultTitle: 'Facebook Page QR Code Generator | Drive Page Likes', defaultDesc: 'Generate scannable Facebook QR codes to boost page likes and event RSVPs.' },
    { path: '/youtube-qr-generator', category: 'Generators & Tools', defaultTitle: 'YouTube Channel QR Code Generator | Video Subscriptions', defaultDesc: 'Create YouTube QR codes that open videos or channel subscription prompts directly.' },
    { path: '/restaurant-menu-qr-generator', category: 'Generators & Tools', defaultTitle: 'Digital Restaurant Menu Builder & QR Code Platform', defaultDesc: 'Interactive culinary menu builder with multi-currency, allergen badges, and QR table stands.' },
    { path: '/digital-card-qr-generator', category: 'Generators & Tools', defaultTitle: 'Enterprise Digital Business Card & Networking Suite', defaultDesc: 'Create modern mobile digital business cards with vCard downloads and analytics.' },
    { path: '/pdf-sharing-qr-generator', category: 'Generators & Tools', defaultTitle: 'Cloud PDF Document Host & Scan Hub | FreeQRGen.pro', defaultDesc: 'Host and share multi-page PDFs with instant QR scanning, password protection, and view metrics.' },
    { path: '/barcode-generator', category: 'Generators & Tools', defaultTitle: 'Free Universal Barcode Generator | EAN, UPC, Code 128', defaultDesc: 'Generate high-density linear barcodes and 2D matrix codes with vector SVG export.' },
    { path: '/bulk-qr-generator', category: 'Generators & Tools', defaultTitle: 'Bulk QR Code Generator | Batch Processing Engine', defaultDesc: 'Generate hundreds of custom dynamic or static QR codes simultaneously from CSV or Excel files.' },
    { path: '/animated-qr-generator', category: 'Generators & Tools', defaultTitle: 'Animated GIF QR Code Generator | Dynamic Visual Codes', defaultDesc: 'Create eye-catching animated QR codes with smooth movement loops and brand logos.' },
    { path: '/payment-qr-generator', category: 'Generators & Tools', defaultTitle: 'Payment QR Code Generator | Contactless Checkout QR', defaultDesc: 'Generate instant payment QR codes for Stripe, PayPal, Venmo, and bank transfers.' },
    { path: '/crypto-qr-generator', category: 'Generators & Tools', defaultTitle: 'Crypto Wallet QR Code Generator | Bitcoin & Ethereum', defaultDesc: 'Create scannable crypto address QR codes for instant multi-currency transfers.' },
    { path: '/app-store-qr-generator', category: 'Generators & Tools', defaultTitle: 'App Store Download QR Code Generator | iOS & Android Smart Routing', defaultDesc: 'Single QR code that auto-detects device OS and routes to Apple App Store or Google Play.' },
    { path: '/location-qr-generator', category: 'Generators & Tools', defaultTitle: 'Google Maps Location QR Code Generator | GPS Navigation QR', defaultDesc: 'Create location QR codes that open driving directions in Google Maps or Apple Maps.' },

    // Core & Trust
    { path: '/about', category: 'Core & Trust', defaultTitle: 'About Us | Free QR Code Generator Team', defaultDesc: 'Learn about FreeQRGen.pro and the technical team dedicated to building secure, offline-first QR utilities.' },
    { path: '/faq', category: 'Core & Trust', defaultTitle: 'Frequently Asked Questions | Free QR Code Generator FAQs', defaultDesc: 'Find answers to common questions about custom QR code options, dynamic vs static formats, design options, scan limits, logos, and tracking analytics.' },
    { path: '/privacy', category: 'Core & Trust', defaultTitle: 'Privacy Policy | FreeQRGen.pro - Secure Offline QR Generation', defaultDesc: 'Read the FreeQRGen.pro privacy commitment. Learn how offline browser rendering protects your network credentials and contact data.' },
    { path: '/contact', category: 'Core & Trust', defaultTitle: 'Contact Support & Corporate Inquiry | FreeQRGen.pro', defaultDesc: 'Get in touch with the technical team for enterprise licenses, custom templates, or support requests.' },
    { path: '/terms', category: 'Core & Trust', defaultTitle: 'Terms of Service & Usage Policy | FreeQRGen.pro', defaultDesc: 'Review usage agreements, security expectations, dynamic tracking short-link rules, and API policies.' },
    { path: '/why-freeqrgen', category: 'Core & Trust', defaultTitle: 'Why Choose FreeQRGen.pro | Enterprise QR Engine', defaultDesc: 'Discover why thousands of businesses choose FreeQRGen.pro for high-density matrix generation, privacy, and zero fees.' },
    { path: '/security', category: 'Core & Trust', defaultTitle: 'Security & Compliance Standards | FreeQRGen.pro', defaultDesc: 'Learn about our SOC2, GDPR, and client-side encryption protocols protecting sensitive scan data.' },
    { path: '/accessibility', category: 'Core & Trust', defaultTitle: 'Accessibility Commitment & WCAG Guidelines | FreeQRGen.pro', defaultDesc: 'Our accessibility standards ensuring high contrast, screen reader compatibility, and universal scannability.' },
    { path: '/system-status', category: 'Core & Trust', defaultTitle: 'System Status & Service Uptime | FreeQRGen.pro', defaultDesc: 'Real-time service health, server response latency, and network availability monitoring.' },
    { path: '/media-kit', category: 'Core & Trust', defaultTitle: 'Official Media Kit & Brand Press Assets | FreeQRGen.pro', defaultDesc: 'Download official high-resolution vector logos, brand color guidelines, and founder press profiles.' },

    // Knowledge & Blog
    { path: '/blog', category: 'Knowledge & Blog', defaultTitle: 'QR Code Technology & Marketing Blog | FreeQRGen.pro', defaultDesc: 'Explore modern design tips, tutorials, and advanced marketing strategies for dynamic and static QR codes.' },
    { path: '/academy', category: 'Knowledge & Blog', defaultTitle: 'Free QR Code Academy Hub | Educational Guides', defaultDesc: 'Master 2D barcode parameters, printing guidelines, sizing calculators, security rules, and marketing campaigns.' },
    { path: '/guides', category: 'Knowledge & Blog', defaultTitle: 'Authoritative Technical Guides & QR Best Practices', defaultDesc: 'Deep-dive technical guides on vector contrast ratio, error correction levels, and high-density printing.' },

    // Templates & Compare
    { path: '/templates', category: 'Templates & Compare', defaultTitle: 'Free High-Performance QR Code Templates Directory | FreeQRGen.pro', defaultDesc: 'Access verified, schema-optimized 2D barcode templates designed to capture high-intent physical traffic.' },
    { path: '/compare', category: 'Templates & Compare', defaultTitle: 'QR Code Technology Comparison Directory | FreeQRGen.pro', defaultDesc: 'High-fidelity analytical comparisons between diverse 2D barcode schemas, formats, error levels, and marketing strategies.' },

    // Solutions & Industries
    { path: '/solutions', category: 'Solutions & Industries', defaultTitle: 'Enterprise QR Code Solutions Directory | FreeQRGen.pro', defaultDesc: 'Explore professional contactless QR solutions custom-made for brands, managers, and designers.' },
    { path: '/industries', category: 'Solutions & Industries', defaultTitle: 'Custom QR Codes for Industries Directory | FreeQRGen.pro', defaultDesc: 'Browse specialized optical barcode solutions, printable guidelines, and checklists for commercial industries.' },
    { path: '/use-cases', category: 'Solutions & Industries', defaultTitle: 'High-Traffic QR Code Use Cases Hub | FreeQRGen.pro', defaultDesc: 'Review physical placement guidelines, best practices, common mistakes, and printable templates.' },

    // Enterprise & Platforms
    { path: '/ai-gateway', category: 'Core & Trust', defaultTitle: 'Enterprise AI Gateway & Gemini Intelligence Suite', defaultDesc: 'AI-assisted QR design, prompt-based code styling, and automated campaign recommendations.' },
    { path: '/marketing-platform', category: 'Core & Trust', defaultTitle: 'QR Campaign Management Portal & Dynamic Link Suite', defaultDesc: 'Central hub for tracking scan conversion, location heatmaps, device operating systems, and campaign ROI.' }
  ];

  // Dynamically attach SEO Landing pages
  Object.keys(landingPages).forEach((slug) => {
    const page = landingPages[slug];
    const path = `/${slug}`;
    if (!routeList.some(r => r.path === path)) {
      routeList.push({
        path,
        category: 'Generators & Tools',
        defaultTitle: page.seoTitle,
        defaultDesc: page.metaDescription
      });
    }
  });

  // Dynamically attach Comparisons
  comparisons.forEach((comp) => {
    const path = `/compare/${comp.slug}`;
    if (!routeList.some(r => r.path === path)) {
      routeList.push({
        path,
        category: 'Templates & Compare',
        defaultTitle: comp.seoTitle || `${comp.title} | QR Tech Comparison`,
        defaultDesc: comp.metaDescription || comp.subheading
      });
    }
  });

  // Dynamically attach Template pages
  templatePages.forEach((tpl) => {
    const path = `/templates/${tpl.slug}`;
    if (!routeList.some(r => r.path === path)) {
      routeList.push({
        path,
        category: 'Templates & Compare',
        defaultTitle: tpl.seoTitle || `${tpl.title} Template | FreeQRGen.pro`,
        defaultDesc: tpl.metaDescription || tpl.subheading
      });
    }
  });

  // Dynamically attach Knowledge Articles
  knowledgeArticles.slice(0, 10).forEach((art) => {
    const path = `/guides/${art.slug}`;
    if (!routeList.some(r => r.path === path)) {
      routeList.push({
        path,
        category: 'Knowledge & Blog',
        defaultTitle: art.seoTitle || `${art.title} | FreeQRGen.pro Guide`,
        defaultDesc: art.metaDescription || art.intro
      });
    }
  });

  // Dynamically attach Solutions
  solutionsData.forEach((sol) => {
    const path = `/solutions/${sol.slug}`;
    if (!routeList.some(r => r.path === path)) {
      routeList.push({
        path,
        category: 'Solutions & Industries',
        defaultTitle: sol.metaTitle || `${sol.name} Solution | FreeQRGen.pro`,
        defaultDesc: sol.metaDesc || sol.desc
      });
    }
  });

  // Dynamically attach Use Cases
  useCasesData.forEach((uc) => {
    const path = `/use-cases/${uc.slug}`;
    if (!routeList.some(r => r.path === path)) {
      routeList.push({
        path,
        category: 'Solutions & Industries',
        defaultTitle: uc.metaTitle || `${uc.name} Use Case | FreeQRGen.pro`,
        defaultDesc: uc.metaDesc || uc.desc
      });
    }
  });

  // Process all routes for audit
  const auditedRoutes: AuditedRouteInfo[] = routeList.map((item) => {
    const canonicalUrl = getCanonicalForPath(item.path, locale);
    const hreflangs = getHreflangsForPath(item.path);

    // Apply locale prefix representation to title/desc if needed
    let title = item.defaultTitle;
    let description = item.defaultDesc;

    if (locale !== 'en') {
      const localeUpper = locale.toUpperCase();
      title = `[${localeUpper}] ${title}`;
    }

    const titleLength = title.length;
    const titleStatus: AuditedRouteInfo['titleStatus'] = 
      titleLength < 30 ? 'too-short' : titleLength > 70 ? 'too-long' : 'good';

    const descriptionLength = description.length;
    const descriptionStatus: AuditedRouteInfo['descriptionStatus'] = 
      descriptionLength < 70 ? 'too-short' : descriptionLength > 170 ? 'too-long' : 'good';

    const ogLocale = OG_LOCALE_MAP[locale] || 'en_US';
    const ogTitle = title;
    const ogDescription = description;
    const ogImage = `${ROOT_DOMAIN}/og-banner.png`;
    const twitterCard = 'summary_large_image';

    // Existing Schemas Calculation
    const existingSchemas: string[] = ['WebSite', 'BreadcrumbList'];

    if (item.category === 'Generators & Tools' || item.path.includes('generator')) {
      existingSchemas.push('SoftwareApplication', 'Product');
    }
    if (item.path === '/faq' || item.path.includes('generator')) {
      existingSchemas.push('FAQPage');
    }
    if (item.category === 'Knowledge & Blog' || item.path.startsWith('/guides')) {
      existingSchemas.push('Article');
    }
    if (item.category === 'Core & Trust' || item.path === '/about' || item.path === '/contact') {
      existingSchemas.push('Organization');
    }

    // Detect Missing Schemas and build sample snippets
    const missingSchemas: MissingSchemaRecommendation[] = [];

    if (!existingSchemas.includes('FAQPage') && (item.category === 'Generators & Tools' || item.category === 'Solutions & Industries')) {
      missingSchemas.push({
        type: 'FAQPage',
        importance: 'high',
        reason: 'Adding FAQ structured data for tool pages enhances Google SERP impression height with expandable question drop-downs.',
        sampleSnippet: {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          'mainEntity': [
            {
              '@type': 'Question',
              'name': `How do I generate a free QR code for ${item.path.replace('/', '')}?`,
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': `Enter your details into the input field on ${item.path}, customize colors or brand logos, and instantly download high-resolution SVG or PNG vector formats.`
              }
            },
            {
              '@type': 'Question',
              'name': 'Do these generated QR codes ever expire?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'No, static QR codes generated on FreeQRGen.pro never expire and feature unlimited lifetime scans.'
              }
            }
          ]
        }
      });
    }

    if (!existingSchemas.includes('HowTo') && item.category === 'Generators & Tools') {
      missingSchemas.push({
        type: 'HowTo',
        importance: 'medium',
        reason: 'HowTo schema enables rich step-by-step visual snippet cards in Google Mobile search results.',
        sampleSnippet: {
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          'name': `How to Create a QR Code on ${item.path}`,
          'step': [
            { '@type': 'HowToStep', 'text': 'Select content type or enter target destination URL' },
            { '@type': 'HowToStep', 'text': 'Customize color palettes, matrix patterns, and brand logo' },
            { '@type': 'HowToStep', 'text': 'Click Download to export print-ready vector SVG or PNG graphics' }
          ]
        }
      });
    }

    if (!existingSchemas.includes('Organization') && item.path !== '/' && item.path !== '/about') {
      missingSchemas.push({
        type: 'Organization',
        importance: 'low',
        reason: 'Linking brand Knowledge Graph signals across all sub-pages improves E-E-A-T domain trust ratings.',
        sampleSnippet: {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          'name': 'FreeQRGen.pro',
          'url': ROOT_DOMAIN,
          'logo': `${ROOT_DOMAIN}/logo.png`,
          'sameAs': [
            'https://twitter.com/freeqrgen',
            'https://github.com/freeqrgen'
          ]
        }
      });
    }

    // Health Score calculation
    let healthPoints = 100;
    const issues: string[] = [];

    if (titleStatus === 'too-short') {
      healthPoints -= 15;
      issues.push(`Meta Title is too short (${titleLength} chars, recommended: 30-70).`);
    } else if (titleStatus === 'too-long') {
      healthPoints -= 10;
      issues.push(`Meta Title is slightly long (${titleLength} chars, may truncate on mobile SERPs).`);
    }

    if (descriptionStatus === 'too-short') {
      healthPoints -= 15;
      issues.push(`Meta Description is too short (${descriptionLength} chars, recommended: 70-160).`);
    } else if (descriptionStatus === 'too-long') {
      healthPoints -= 10;
      issues.push(`Meta Description exceeds 170 chars (${descriptionLength} chars).`);
    }

    if (missingSchemas.some(m => m.importance === 'high')) {
      healthPoints -= 10;
      issues.push('High importance schema snippet (FAQPage) missing for rich search result expansion.');
    }

    const requiredHreflangs = SUPPORTED_LOCALES.length + 1; // x-default + 8 locales = 9
    if (hreflangs.length !== requiredHreflangs) {
      healthPoints -= 20;
      issues.push(`Hreflang count mismatch (${hreflangs.length}/${requiredHreflangs} required tags).`);
    }

    const finalScore = Math.max(0, healthPoints);
    const status: AuditedRouteInfo['status'] = 
      finalScore >= 85 ? 'healthy' : finalScore >= 65 ? 'warning' : 'critical';

    return {
      path: item.path,
      category: item.category,
      title,
      titleLength,
      titleStatus,
      description,
      descriptionLength,
      descriptionStatus,
      canonicalUrl,
      ogTitle,
      ogDescription,
      ogImage,
      ogLocale,
      twitterCard,
      hreflangs,
      existingSchemas,
      missingSchemas,
      healthScore: finalScore,
      status,
      issues,
      lastmod: '2026-08-07',
      priority: item.path === '/' ? 1.0 : item.category === 'Generators & Tools' ? 0.8 : 0.6
    };
  });

  // Calculate summary statistics
  const totalRoutes = auditedRoutes.length;
  const avgHealthScore = Math.round(auditedRoutes.reduce((acc, r) => acc + r.healthScore, 0) / totalRoutes);
  const healthyCount = auditedRoutes.filter(r => r.status === 'healthy').length;
  const warningCount = auditedRoutes.filter(r => r.status === 'warning').length;
  const criticalCount = auditedRoutes.filter(r => r.status === 'critical').length;
  const schemaCoverageRate = Math.round((auditedRoutes.filter(r => r.existingSchemas.length >= 2).length / totalRoutes) * 100);
  const canonicalHealthRate = Math.round((auditedRoutes.filter(r => r.hreflangs.length === 15).length / totalRoutes) * 100);
  const metaCompletionRate = Math.round((auditedRoutes.filter(r => r.titleStatus === 'good' && r.descriptionStatus === 'good').length / totalRoutes) * 100);

  return {
    routes: auditedRoutes,
    summary: {
      totalRoutes,
      avgHealthScore,
      healthyCount,
      warningCount,
      criticalCount,
      schemaCoverageRate,
      canonicalHealthRate,
      metaCompletionRate
    }
  };
}
