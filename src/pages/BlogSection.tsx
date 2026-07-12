import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, Calendar, Clock, User, Tag, ArrowRight, Share2, Copy, Check,
  BookOpen, ChevronRight, MessageSquare, AlertCircle, Sparkles, Filter 
} from 'lucide-react';
import { blogCategories, BlogArticle } from '../data/blogData';
import { getLocalizedBlog, Locale } from '../utils/translations';
import { useTranslation } from '../utils/i18n';

interface BlogSectionProps {
  initialSlug?: string | null;
  onNavigate: (path: string) => void;
  locale?: Locale;
}

const blogCategoryLabelsEs: Record<string, string> = {
  "QR Code Guides": "Guías de Códigos QR",
  "Business Marketing": "Marketing de Negocios",
  "Digital Marketing": "Marketing Digital",
  "Small Business Tools": "Herramientas para PYMEs",
  "Technology": "Tecnología",
  "Contactless Solutions": "Soluciones sin Contacto",
  "Restaurant QR Menus": "Menús QR de Restaurantes",
  "Event QR Codes": "Códigos QR de Eventos",
  "Education QR Codes": "Códigos QR de Educación",
  "Social Media Marketing": "Marketing de Redes Sociales"
};

export default function BlogSection({ initialSlug, onNavigate, locale: propLocale }: BlogSectionProps) {
  const { t, locale: hookLocale } = useTranslation();
  const locale = propLocale || hookLocale;

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeArticleSlug, setActiveArticleSlug] = useState<string | null>(initialSlug || null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

  const localizedArticles = useMemo(() => {
    return getLocalizedBlog(locale);
  }, [locale]);

  // Synchronize active slug if initialSlug changes
  useEffect(() => {
    if (initialSlug) {
      setActiveArticleSlug(initialSlug);
    }
  }, [initialSlug]);

  const activeArticle = useMemo(() => {
    if (!activeArticleSlug) return null;
    return localizedArticles.find(art => art.slug === activeArticleSlug) || null;
  }, [activeArticleSlug, localizedArticles]);

  // Filter articles based on category selection
  const filteredArticles = useMemo(() => {
    if (selectedCategory === 'all') return localizedArticles;
    return localizedArticles.filter(art => art.category === selectedCategory);
  }, [localizedArticles, selectedCategory]);

  const handleReadArticle = (slug: string) => {
    setActiveArticleSlug(slug);
    onNavigate(`/blog/${slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setActiveArticleSlug(null);
    onNavigate('/blog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setExpandedFaqIndex(null);
  };

  const copyArticleLink = (slug: string) => {
    const url = `${window.location.origin}/blog/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  // Assign subtle gradients to categories for cover page aesthetics
  const getCategoryGradient = (category: string) => {
    switch (category) {
      case 'QR Code Guides':
        return 'from-indigo-500 to-blue-500';
      case 'Business Marketing':
        return 'from-emerald-500 to-teal-500';
      case 'Digital Marketing':
        return 'from-violet-500 to-purple-500';
      case 'Small Business Tools':
        return 'from-cyan-500 to-blue-500';
      case 'Contactless Solutions':
        return 'from-rose-500 to-pink-500';
      case 'Restaurant QR Menus':
        return 'from-amber-500 to-orange-500';
      case 'Event QR Codes':
        return 'from-fuchsia-500 to-pink-500';
      case 'Education QR Codes':
        return 'from-sky-500 to-indigo-500';
      default:
        return 'from-slate-500 to-indigo-500';
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 animate-fade-in text-slate-800">
      {activeArticle ? (
        /* Detailed Article View */
        <article className="space-y-8">
          {/* Header Schema navigation */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <button
              onClick={handleBackToList}
              className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors group cursor-pointer focus:outline-hidden"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              {t('blog.backToHub', 'Back to Article Hub')}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
                {locale === 'es' ? (blogCategoryLabelsEs[activeArticle.category] || activeArticle.category) : activeArticle.category}
              </span>
              <button
                onClick={() => copyArticleLink(activeArticle.slug)}
                className="p-1 px-2.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span className="text-emerald-500 text-[10px]">{t('blog.copied', 'Copied!')}</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3 h-3" />
                    <span className="text-[10px]">{t('blog.share', 'Share')}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Title and Meta Description Area */}
          <div className="space-y-4">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {activeArticle.title}
            </h1>
            
            {/* Meta Tags Details for AdSense approval */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-mono font-bold text-slate-400">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {activeArticle.date}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {activeArticle.readingTime}</span>
              <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {activeArticle.author}</span>
            </div>
          </div>

          {/* Visual Divider cover pattern */}
          <div className={`h-2.5 w-full bg-gradient-to-r ${getCategoryGradient(activeArticle.category)} rounded-full shadow-xs`} />

          {/* Intro paragraph with clean display styling */}
          <div id="article-intro-text" className="p-5 bg-indigo-50/40 rounded-2xl border border-indigo-100/50 text-slate-700 text-xs sm:text-sm font-semibold leading-relaxed font-sans">
            "{activeArticle.intro}"
          </div>

          {/* Process raw text rendering or structured HTML headers */}
          <div id="article-main-body" className="prose max-w-none text-slate-700 text-xs sm:text-sm leading-relaxed space-y-6">
            {activeArticle.contentMarkdown.split('\n\n').map((para, idx) => {
              if (para.startsWith('## ')) {
                return (
                  <h2 key={idx} className="text-lg sm:text-xl font-extrabold text-slate-900 pt-4 border-b border-slate-100 pb-2">
                    {para.substring(3)}
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
              if (para.startsWith('* ')) {
                return (
                  <ul key={idx} className="list-disc pl-5 space-y-1.5 text-slate-650">
                    {para.split('\n').map((li, lIdx) => (
                      <li key={lIdx}>{li.substring(2)}</li>
                    ))}
                  </ul>
                );
              }
              if (para.includes('WIFI:S:')) {
                return (
                  <pre key={idx} className="bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-[10px] sm:text-xs overflow-x-auto whitespace-pre border border-slate-800">
                    <code>{para}</code>
                  </pre>
                );
              }
              return (
                <p key={idx} className="font-sans text-slate-650">
                  {para}
                </p>
              );
            })}
          </div>

          {/* Dynamic Article FAQ Accordion Area */}
          {activeArticle.relatedFAQs && activeArticle.relatedFAQs.length > 0 && (
            <div id="article-faq-container" className="pt-8 border-t border-slate-100 space-y-4">
              <h3 className="text-sm font-extrabold text-slate-950 uppercase tracking-widest font-mono">
                {t('blog.coreFaqs', 'Article Core FAQs')}
              </h3>
              <div className="space-y-3">
                {activeArticle.relatedFAQs.map((faq, index) => {
                  const isExpanded = expandedFaqIndex === index;
                  return (
                    <div key={index} className="bg-slate-50 rounded-xl border border-slate-200/60 transition-all">
                      <button
                        onClick={() => setExpandedFaqIndex(isExpanded ? null : index)}
                        className="w-full text-left p-4 flex justify-between items-center text-xs font-bold text-slate-900 cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                          {faq.question}
                        </span>
                        <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isExpanded ? 'rotate-90 text-indigo-600 ' : ''}`} />
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-4 text-xs text-slate-500 leading-relaxed font-sans">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recommendation internal linking triggers */}
          {activeArticle.internalLinks && activeArticle.internalLinks.length > 0 && (
            <div id="article-recommendations" className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                {t('blog.relatedTools', 'Related Workspace Tools')}
              </span>
              <div className="flex flex-wrap gap-2">
                {activeArticle.internalLinks.map((link, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (link.url === '/') {
                        onNavigate('/');
                      } else {
                        onNavigate(link.url);
                      }
                    }}
                    className="text-[10px] font-extrabold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3.5 py-1.5 rounded-full transition-all cursor-pointer inline-flex items-center gap-1"
                  >
                    {link.label} <ArrowRight className="w-3 h-3" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </article>
      ) : (
        /* Blog Post Homepage Hub View */
        <div className="space-y-8">
          {/* Header introduction */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-3 py-1 bg-opacity-70 border border-indigo-100 rounded-full font-extrabold uppercase tracking-widest inline-block">
                {t('blog.blogTitle', 'Unlimited QR Generator Blog')}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-none">
                {t('blog.marketingGuides', 'Marketing & Tech Guides')}
              </h1>
              <p className="text-sm text-slate-500 max-w-xl leading-relaxed">
                {t('blog.marketingGuidesDesc', 'Stay updated with strategic marketing guidelines, contactless hospitality systems, error correction, and standard design configurations.')}
              </p>
            </div>
          </div>

          {/* Category Filter list */}
          <div className="relative">
            <div className="flex items-center gap-2 mb-3 text-[10px] font-mono font-bold text-indigo-500 uppercase">
              <Filter className="w-3.5 h-3.5" />
              <span>{t('blog.filterTopic', 'Filter articles by topic')}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pb-2 overflow-x-auto border-b border-slate-100 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${ selectedCategory === 'all' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-transparent hover:border-slate-200 ' }`}
              >
                {t('blog.allCategories', 'All Categories')}
              </button>
              {blogCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${ selectedCategory === cat ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-transparent hover:border-slate-200 ' }`}
                >
                  {locale === 'es' ? (blogCategoryLabelsEs[cat] || cat) : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Articles Render Matrix Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {filteredArticles.map((art) => (
              <div
                key={art.slug}
                id={`blog-card-${art.slug}`}
                onClick={() => handleReadArticle(art.slug)}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden flex flex-col justify-between hover:shadow-xl hover:border-indigo-400/40 transition-all duration-300 group cursor-pointer"
              >
                <div>
                  {/* Category Gradient strip */}
                  <div className={`h-2.5 w-full bg-gradient-to-r ${getCategoryGradient(art.category)}`} />
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500">
                      <span className="text-indigo-600">
                        {locale === 'es' ? (blogCategoryLabelsEs[art.category] || art.category) : art.category}
                      </span>
                      <span>{art.readingTime}</span>
                    </div>

                    <h2 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                      {art.title}
                    </h2>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 font-sans">
                      {art.intro}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-3 flex items-center justify-between border-t border-slate-100 text-[10px] font-mono font-bold text-slate-500">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {art.date}</span>
                  <span className="text-indigo-600 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    {t('blog.readArticle', 'Read article')} <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
