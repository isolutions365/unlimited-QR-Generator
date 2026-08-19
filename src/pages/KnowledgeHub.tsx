import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, Calendar, Clock, User, Tag, ArrowRight, Share2, Copy, Check,
  ChevronRight, MessageSquare, Zap, Filter, Search, BookOpen, ExternalLink,
  Twitter, Facebook, Linkedin, HelpCircle, FileText, Printer, ShieldAlert, Wifi, Info, Home
} from 'lucide-react';
import { knowledgeArticles, KnowledgeArticle } from '../data/knowledgeData';
import { Locale } from '../utils/translations';
import { useTranslation } from '../utils/i18n';
import { getProductionBaseUrl, buildProductionUrl } from '../config/siteConfig';

interface KnowledgeHubProps {
  section: 'academy' | 'blog' | 'guides' | 'tutorials' | 'resources' | 'glossary';
  initialSlug?: string | null;
  onNavigate: (path: string) => void;
  locale?: Locale;
}

export default function KnowledgeHub({ section, initialSlug, onNavigate, locale: propLocale }: KnowledgeHubProps) {
  const { t, locale: hookLocale } = useTranslation();
  const locale = propLocale || hookLocale;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [activeArticleSlug, setActiveArticleSlug] = useState<string | null>(initialSlug || null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

  // Sync active article slug with prop updates
  useEffect(() => {
    setActiveArticleSlug(initialSlug || null);
  }, [initialSlug]);

  // Find the active article if any
  const activeArticle = useMemo(() => {
    if (!activeArticleSlug) return null;
    return knowledgeArticles.find(art => art.slug === activeArticleSlug) || null;
  }, [activeArticleSlug]);

  // All categories for the current section
  const categories = useMemo(() => {
    const list = knowledgeArticles
      .filter(art => art.section === section)
      .map(art => art.category);
    return ['all', ...Array.from(new Set(list))];
  }, [section]);

  // All tags for the current section
  const tags = useMemo(() => {
    const list = knowledgeArticles
      .filter(art => art.section === section)
      .flatMap(art => art.tags);
    return ['all', ...Array.from(new Set(list))];
  }, [section]);

  // Filter articles for the current section
  const filteredArticles = useMemo(() => {
    return knowledgeArticles
      .filter(art => art.section === section)
      .filter((art) => {
        const matchesSearch = 
          art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          art.metaDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
          art.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          art.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesCategory = selectedCategory === 'all' || art.category === selectedCategory;
        const matchesTag = selectedTag === 'all' || art.tags.includes(selectedTag);

        return matchesSearch && matchesCategory && matchesTag;
      });
  }, [section, searchQuery, selectedCategory, selectedTag]);

  const handleReadArticle = (slug: string) => {
    setActiveArticleSlug(slug);
    onNavigate(`/${section}/${slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setActiveArticleSlug(null);
    onNavigate(`/${section}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setExpandedFaqIndex(null);
  };

  const copyArticleLink = (slug: string) => {
    const url = buildProductionUrl(`/${section}/${slug}`);
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }).catch((err) => {
      console.warn('[KnowledgeHub] Clipboard write error caught:', err);
    });
  };

  const getShareUrl = (slug: string) => {
    return buildProductionUrl(`/${section}/${slug}`);
  };

  // Breadcrumb schema & JSON-LD schema injection
  useEffect(() => {
    if (!activeArticle) {
      // Remove any previously injected schema elements
      const oldSchemas = document.querySelectorAll('.kb-jsonld-schema');
      oldSchemas.forEach(el => el.remove());
      return;
    }

    const rootUrl = getProductionBaseUrl();
    const articleUrl = `${rootUrl}/${section}/${activeArticle.slug}`;

    // 1. Breadcrumb Schema
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": String(t('knowledge.home', 'Home')),
          "item": rootUrl
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": String(t(`knowledge.sections.${section}`, section.charAt(0).toUpperCase() + section.slice(1))),
          "item": `${rootUrl}/${section}`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": activeArticle.title,
          "item": articleUrl
        }
      ]
    };

    // 2. Article Schema
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": activeArticle.seoTitle,
      "description": activeArticle.metaDescription,
      "image": "https://www.freeqrgen.pro/og-image.jpg",
      "author": {
        "@type": "Organization",
        "name": String(t('knowledge.editorialTeam', 'FreeQRGen.pro Editorial Team')),
        "url": rootUrl
      },
      "publisher": {
        "@type": "Organization",
        "name": String(t('knowledge.publisherName', 'FreeQRGen.pro')),
        "logo": {
          "@type": "ImageObject",
          "url": `${rootUrl}/favicon-32x32.png`
        }
      },
      "datePublished": activeArticle.date,
      "dateModified": activeArticle.date,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": articleUrl
      }
    };

    // 3. FAQ Schema
    let faqSchema = null;
    if (activeArticle.faqs && activeArticle.faqs.length > 0) {
      faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": activeArticle.faqs.map(faq => ({
          "@type": "Question",
          "name": faq.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.a
          }
        }))
      };
    }

    // Clear old elements first
    const oldSchemas = document.querySelectorAll('.kb-jsonld-schema');
    oldSchemas.forEach(el => el.remove());

    // Inject new elements
    const scripts = [breadcrumbSchema, articleSchema, faqSchema].filter(Boolean);
    scripts.forEach(schema => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.className = 'kb-jsonld-schema';
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    return () => {
      const schemasToRemove = document.querySelectorAll('.kb-jsonld-schema');
      schemasToRemove.forEach(el => el.remove());
    };
  }, [activeArticle, section, locale]);

  // Gradient helper for featured images or layout headers
  const getGradient = (imageClass: string) => {
    return imageClass || "from-indigo-600 to-blue-500";
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 text-slate-800 animate-fade-in" id="knowledge-hub-container">
      {activeArticle ? (
        /* ==================== DETAILED VIEW ==================== */
        <div className="space-y-6">
          {/* Visual Breadcrumb Bar */}
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-white py-2.5 px-4 rounded-xl border border-slate-100 shadow-2xs">
            <button 
              onClick={() => onNavigate('/')} 
              className="hover:text-indigo-600 flex items-center gap-1 transition-colors cursor-pointer font-semibold"
            >
              <Home className="w-3.5 h-3.5" />
              <span>{t('knowledge.home', 'Home')}</span>
            </button>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <button 
              onClick={handleBackToList} 
              className="hover:text-indigo-600 transition-colors cursor-pointer font-semibold capitalize"
            >
              {t(`knowledge.sections.${section}`, section)}
            </button>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-slate-800 font-bold truncate max-w-[240px] sm:max-w-none">{activeArticle.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main content grid */}
          <article className="lg:col-span-3 space-y-8" id="kb-article-view">
            {/* Top Bar Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <button
                onClick={handleBackToList}
                className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors group cursor-pointer focus:outline-hidden"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                {t('knowledge.backTo', 'Back to {section}', { section: t(`knowledge.sections.${section}`, section) })}
              </button>
              
              {/* Social Share Group */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
                  {activeArticle.category}
                </span>
                <button
                  onClick={() => copyArticleLink(activeArticle.slug)}
                  className="p-1 px-2.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-500 text-[10px]">{t('knowledge.copied', 'Copied!')}</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3 h-3" />
                      <span className="text-[10px]">{t('knowledge.share', 'Share')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Breadcrumb Indicator */}
            <nav className="flex items-center gap-1 text-[11px] font-medium text-slate-400 font-mono">
              <button onClick={() => onNavigate('/')} className="hover:text-indigo-600">{t('knowledge.home', 'Home')}</button>
              <ChevronRight className="w-3 h-3" />
              <button onClick={handleBackToList} className="hover:text-indigo-600 capitalize">{t(`knowledge.sections.${section}`, section)}</button>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-600 truncate max-w-xs">{activeArticle.title}</span>
            </nav>

            {/* Title & Metadata */}
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {activeArticle.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-mono font-bold text-slate-400">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {t('knowledge.updated', 'Updated:')} {activeArticle.date}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {activeArticle.readingTime}</span>
                <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {t('knowledge.byAuthor', 'By:')} {activeArticle.author}</span>
              </div>
            </div>

            {/* Stylized Cover Image Block */}
            <div className={`h-32 sm:h-44 w-full bg-gradient-to-r ${getGradient(activeArticle.featuredImage)} rounded-2xl shadow-xs relative overflow-hidden flex items-center p-8`}>
              <div className="absolute inset-0 bg-slate-900/10 pointer-events-none" />
              <div className="relative z-10 text-white space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-white/80 font-mono">{t('knowledge.authorityBlock', 'FreeQRGen Authority Block')}</span>
                <h2 className="text-lg sm:text-2xl font-bold tracking-tight">{activeArticle.seoTitle}</h2>
              </div>
              <Zap className="absolute right-6 bottom-6 w-16 h-16 text-white/10" />
            </div>

            {/* AI Summary Box (AEO/GEO Optimized Section) */}
            <div className="p-5 bg-gradient-to-br from-indigo-50/50 to-slate-50 border border-indigo-100 rounded-2xl space-y-3" id="ai-summary-card">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider font-mono">
                <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
                <span>{t('knowledge.aiSummaryTitle', 'AI Search Engine Core Synthesis Box')}</span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed italic">
                "{activeArticle.intro}"
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[10px] sm:text-[11px] font-mono">
                <div className="bg-white p-2.5 rounded-lg border border-slate-100 space-y-0.5">
                  <span className="text-slate-400 font-bold block uppercase tracking-wider">{t('knowledge.entityType', 'Entity Type:')}</span>
                  <span className="text-slate-800 font-extrabold">{activeArticle.aiSummaryBox.entityType}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-100 space-y-0.5">
                  <span className="text-slate-400 font-bold block uppercase tracking-wider">{t('knowledge.protocolStandard', 'Protocol Standard:')}</span>
                  <span className="text-slate-800 font-extrabold">{activeArticle.aiSummaryBox.protocolStandard}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-100 space-y-0.5">
                  <span className="text-slate-400 font-bold block uppercase tracking-wider">{t('knowledge.clientCompatibility', 'Client Compatibility:')}</span>
                  <span className="text-slate-800 font-extrabold">{activeArticle.aiSummaryBox.clientCompatibility}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-100 space-y-0.5">
                  <span className="text-slate-400 font-bold block uppercase tracking-wider">{t('knowledge.primaryUseCase', 'Primary Target Use Case:')}</span>
                  <span className="text-slate-800 font-extrabold">{activeArticle.aiSummaryBox.primaryUseCase}</span>
                </div>
                <div className="bg-white p-2.5 sm:col-span-2 rounded-lg border border-slate-100 space-y-0.5">
                  <span className="text-slate-400 font-bold block uppercase tracking-wider">{t('knowledge.offlineCapabilityIndex', 'Offline Capability Index:')}</span>
                  <span className="text-slate-800 font-extrabold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {activeArticle.aiSummaryBox.offlineCapability}
                  </span>
                </div>
              </div>
            </div>

            {/* Key Takeaways Section */}
            <div className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-3" id="key-takeaways-card">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider font-mono">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{t('knowledge.keyTakeaways', 'Key Takeaways (Quick Summary)')}</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-655 list-none pl-0">
                {activeArticle.keyTakeaways.map((item, idx) => (
                  <li key={idx} className="flex gap-2 items-start">
                    <span className="text-emerald-500 font-bold mt-0.5">✔</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Article Main Body (Markdown Parser) */}
            <div className="prose max-w-none text-slate-700 text-xs sm:text-sm leading-relaxed space-y-6" id="kb-article-body">
              {activeArticle.contentMarkdown.split('\n\n').map((para, idx) => {
                if (para.startsWith('## ')) {
                  const headingText = para.substring(3);
                  const anchorId = headingText.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                  return (
                    <h2 key={idx} id={anchorId} className="text-lg sm:text-xl font-extrabold text-slate-900 pt-6 border-b border-slate-100 pb-2 scroll-mt-20">
                      {headingText}
                    </h2>
                  );
                }
                if (para.startsWith('### ')) {
                  return (
                    <h3 key={idx} className="text-sm sm:text-base font-extrabold text-slate-900 pt-2">
                      {para.substring(4)}
                    </h3>
                  );
                }
                if (para.startsWith('* ') || para.startsWith('1. ')) {
                  const isOrdered = para.startsWith('1. ');
                  return (
                    <div key={idx} className="pl-4 py-1 space-y-1 text-slate-600 font-sans">
                      {para.split('\n').map((line, lIdx) => {
                        const content = line.replace(/^\d+\.\s+/, '').replace(/^\*\s+/, '');
                        return (
                          <div key={lIdx} className="flex gap-2 items-start">
                            <span className="text-indigo-500 font-bold">{isOrdered ? `${lIdx + 1}.` : '•'}</span>
                            <span>{content}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                }
                if (para.startsWith('`')) {
                  return (
                    <pre key={idx} className="bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-[10px] sm:text-xs overflow-x-auto whitespace-pre border border-slate-800">
                      <code>{para.replace(/`/g, '')}</code>
                    </pre>
                  );
                }
                return (
                  <p key={idx} className="font-sans text-slate-655 leading-relaxed">
                    {para}
                  </p>
                );
              })}
            </div>

            {/* Article FAQs */}
            {activeArticle.faqs && activeArticle.faqs.length > 0 && (
              <div className="pt-8 border-t border-slate-100 space-y-4" id="kb-article-faqs">
                <h3 className="text-xs font-extrabold text-slate-950 uppercase tracking-widest font-mono flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-indigo-500" />
                  {t('knowledge.relatedFaqs', 'Related Frequently Asked Questions')}
                </h3>
                <div className="space-y-3">
                  {activeArticle.faqs.map((faq, index) => {
                    const isExpanded = expandedFaqIndex === index;
                    return (
                      <div key={index} className="bg-slate-50 rounded-xl border border-slate-200/60 transition-all">
                        <button
                          onClick={() => setExpandedFaqIndex(isExpanded ? null : index)}
                          className="w-full text-left p-4 flex justify-between items-center text-xs font-bold text-slate-900 cursor-pointer focus:outline-hidden"
                        >
                          <span className="flex items-center gap-2">
                            <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                            {faq.q}
                          </span>
                          <span className={`text-xs font-bold text-slate-400 transition-transform ${isExpanded ? 'rotate-90 text-indigo-600' : ''}`}>➔</span>
                        </button>
                        {isExpanded && (
                          <div className="px-4 pb-4 text-xs text-slate-500 leading-relaxed font-sans border-t border-slate-100/50 pt-3">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tags footer */}
            <div className="flex flex-wrap items-center gap-2 pt-4">
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Tag className="w-3 h-3" /> {t('knowledge.tagsLabel', 'Tags:')}
              </span>
              {activeArticle.tags.map((tag, i) => (
                <span key={i} className="text-[10px] font-bold bg-slate-100 text-slate-655 px-2.5 py-1 rounded-md">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Related Tools CTA / Internal Links */}
            {activeArticle.relatedTools && activeArticle.relatedTools.length > 0 && (
              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  {t('knowledge.recommendedTools', 'Recommended Creator Tools')}
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeArticle.relatedTools.map((link, index) => (
                    <button
                      key={index}
                      onClick={() => onNavigate(`/${link.slug}`)}
                      className="text-[10px] font-extrabold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3.5 py-1.5 rounded-full transition-all cursor-pointer inline-flex items-center gap-1"
                    >
                      {link.name} <ExternalLink className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Conversion CTA Section */}
            <div className="p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md border border-indigo-850">
              <div className="relative z-10 space-y-2 max-w-lg">
                <h3 className="text-lg font-extrabold tracking-tight">{t('knowledge.needCustomQr', 'Need a custom QR Code for your campaign?')}</h3>
                <p className="text-xs text-indigo-100 leading-relaxed">
                  {t('knowledge.needCustomQrDesc', 'Generate unlimited, fully stylized static and tracking dynamic QR codes with logos, custom gradients, and analytics on FreeQRGen.pro. No credit card required.')}
                </p>
              </div>
              <button
                onClick={() => onNavigate('/')}
                className="relative z-10 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-extrabold px-5 py-3 rounded-xl transition-all shadow-md self-start md:self-auto cursor-pointer"
              >
                {t('knowledge.goToGenerator', 'Go to QR Generator')}
              </button>
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/10 to-transparent pointer-events-none" />
            </div>

            {/* Related Articles Section */}
            <div className="pt-10 border-t border-slate-100 space-y-6">
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase tracking-wider font-mono">
                {t('knowledge.relatedArticles', 'Related Articles You May Enjoy')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {knowledgeArticles
                  .filter(art => activeArticle.relatedArticles.includes(art.slug))
                  .map((relArt) => (
                    <div
                      key={relArt.slug}
                      onClick={() => handleReadArticle(relArt.slug)}
                      className="p-4 rounded-xl border border-slate-200/60 hover:border-indigo-400 hover:bg-indigo-50/10 transition-all cursor-pointer space-y-2 group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                          {relArt.category}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{relArt.readingTime}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {relArt.title}
                      </h4>
                      <p className="text-[11px] text-slate-505 line-clamp-2 leading-relaxed">
                        {relArt.metaDescription}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 pt-1">
                        {t('knowledge.readFullGuide', 'Read Full Guide')} <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </article>

          {/* ==================== ARTICLE VIEW SIDEBAR ==================== */}
          <aside className="space-y-6 lg:col-span-1" id="kb-article-sidebar">
            {/* Table of Contents */}
            <div className="p-4 bg-white border border-slate-200/80 rounded-2xl space-y-3 sticky top-6">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 font-mono border-b border-slate-100 pb-2">
                {t('knowledge.tableOfContents', 'Table of Contents')}
              </h4>
              <nav className="space-y-1.5 text-xs text-slate-500">
                {activeArticle.tableOfContents.map((item, idx) => (
                  <a
                    key={idx}
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const target = document.getElementById(item.id);
                      if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="block font-medium hover:text-indigo-600 transition-colors py-1 hover:translate-x-0.5 transition-transform flex items-center gap-1"
                  >
                    <ChevronRight className="w-3 h-3 text-slate-300" />
                    {item.text}
                  </a>
                ))}
              </nav>

              {/* Share Box */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  {t('knowledge.spreadWord', 'Spread the Word')}
                </span>
                <div className="flex gap-2">
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(getShareUrl(activeArticle.slug))}&text=${encodeURIComponent(activeArticle.seoTitle)}`}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    className="p-2 rounded-lg border border-slate-250 hover:bg-slate-50 text-slate-500 hover:text-sky-500 transition-colors"
                  >
                    <Twitter className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl(activeArticle.slug))}`}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    className="p-2 rounded-lg border border-slate-250 hover:bg-slate-50 text-slate-500 hover:text-blue-600 transition-colors"
                  >
                    <Facebook className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getShareUrl(activeArticle.slug))}`}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    className="p-2 rounded-lg border border-slate-250 hover:bg-slate-50 text-slate-500 hover:text-blue-700 transition-colors"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </aside>
        </div>
        </div>
      ) : (
        /* ==================== LIST VIEW ==================== */
        <div className="space-y-8" id="kb-list-view">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-white py-2.5 px-4 rounded-xl border border-slate-100 shadow-2xs">
            <button 
              onClick={() => onNavigate('/')} 
              className="hover:text-indigo-600 flex items-center gap-1 transition-colors cursor-pointer font-semibold"
            >
              <Home className="w-3.5 h-3.5" />
              <span>{t('knowledge.home', 'Home')}</span>
            </button>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-slate-800 font-bold capitalize">{t(`knowledge.sections.${section}`, section)}</span>
          </nav>

          {/* Header section with description */}
          <div className="space-y-3 text-center max-w-2xl mx-auto">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              {t('knowledge.hubSub', 'FreeQRGen.pro {section}', { section: t(`knowledge.sections.${section}`, section) })}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight capitalize">
              {t('knowledge.authorityHub', 'Authority {section} Hub', { section: t(`knowledge.sections.${section}`, section) })}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {t('knowledge.authorityDesc', 'Explore dynamic deep dives, tutorials, size requirements, printing principles, and absolute security best practices to maximize your QR marketing ROI.')}
            </p>
          </div>

          {/* Search, filters, categories controls */}
          <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200/60 space-y-4 shadow-xs">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t('knowledge.searchPlaceholder', 'Search articles by title, keywords, categories or tags...') as string}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-sans"
                />
              </div>

              {/* Categories filters scroll */}
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> {t('knowledge.filter', 'Filter:')}
                </span>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-[10px] font-extrabold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      selectedCategory === cat 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-white text-slate-655 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {cat === 'all' ? t('knowledge.allCategories', 'All Categories') : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags quick filter */}
            {tags.length > 1 && (
              <div className="flex flex-wrap gap-1.5 items-center pt-2 border-t border-slate-200/50">
                <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider mr-1">
                  {t('knowledge.popularTags', 'Popular Tags:')}
                </span>
                {tags.map((tg) => (
                  <button
                    key={tg}
                    onClick={() => setSelectedTag(tg)}
                    className={`text-[9px] font-mono font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      selectedTag === tg 
                        ? 'bg-slate-800 text-white' 
                        : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {tg === 'all' ? t('knowledge.allTags', 'All Tags') : `#${tg}`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Articles Listing Grid */}
          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="kb-articles-grid">
              {filteredArticles.map((article) => (
                <div
                  key={article.slug}
                  onClick={() => handleReadArticle(article.slug)}
                  className="bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-400 hover:shadow-lg transition-all flex flex-col overflow-hidden group cursor-pointer"
                >
                  {/* Decorative Banner */}
                  <div className={`h-24 w-full bg-gradient-to-r ${getGradient(article.featuredImage)} relative overflow-hidden p-5 flex items-end`}>
                    <div className="absolute inset-0 bg-slate-900/10" />
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/90 bg-slate-900/40 px-2 py-0.5 rounded-md relative z-10">
                      {article.category}
                    </span>
                    <Zap className="absolute right-3 bottom-3 w-8 h-8 text-white/15" />
                  </div>

                  {/* Body Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 font-bold">
                        <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {article.readingTime}</span>
                        <span>•</span>
                        <span>{article.date}</span>
                      </div>
                      
                      <h3 className="text-sm font-extrabold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                        {article.title}
                      </h3>
                      
                      <p className="text-[11px] sm:text-xs text-slate-505 leading-relaxed line-clamp-3">
                        {article.metaDescription}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-50">
                      <span className="text-[10px] text-indigo-600 font-extrabold flex items-center gap-1">
                        {t('knowledge.readFullGuide', 'Read Full Guide')} <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {t('knowledge.by', 'by {author}', { author: article.author.split(' ')[0] })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200/80 space-y-3">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-500">{t('knowledge.noArticles', 'No articles match your search parameters.')}</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedTag('all');
                }}
                className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800"
              >
                {t('knowledge.clearFilters', 'Clear Search & Filters')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}