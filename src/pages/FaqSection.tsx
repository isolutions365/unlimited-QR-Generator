import React, { useState, useMemo } from 'react';
import { Search, HelpCircle, ChevronDown, ChevronUp, Copy, Check, ArrowLeft, ShieldAlert } from 'lucide-react';
import { faqCategories, FAQItem } from '../data/faqData';
import { getLocalizedFaq, faqCategoryLabels, Locale } from '../utils/translations';
import { useTranslation } from '../utils/i18n';
import { buildProductionUrl } from '../config/siteConfig';

interface FaqSectionProps {
  onNavigate: (path: string) => void;
  locale?: Locale;
}

export default function FaqSection({ onNavigate, locale: propLocale }: FaqSectionProps) {
  const { t, locale: hookLocale } = useTranslation();
  const locale = propLocale || hookLocale;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const localizedFaqData = useMemo(() => {
    return getLocalizedFaq(locale);
  }, [locale]);

  // Filter FAQs based on search and selected category
  const filteredFAQs = useMemo(() => {
    return localizedFaqData.filter((faq) => {
      const matchCategory = selectedCategory === 'all' || faq.category === selectedCategory;
      const matchSearch =
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [localizedFaqData, searchQuery, selectedCategory]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const copyShareLink = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = buildProductionUrl(`/faq?q=${id}`);
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Generate dynamic Google-adhering FAQ Rich Schema (JSON-LD) dynamically inside script headers
  const jsonLdSchema = useMemo(() => {
    const list = filteredFAQs.map((faq) => ({ 
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    }));
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": list,
    };
  }, [filteredFAQs]);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 animate-fade-in text-slate-800">
      {/* Schema-ready script tag injected dynamically into head */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLdSchema)}
      </script>

      {/* Back button */}
      <button
        onClick={() => onNavigate('/')}
        className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors mb-8 group cursor-pointer focus:outline-hidden"
      >
        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
        {t('faq.backToCreative', 'Back to Creative Station')}
      </button>

      {/* Hero Header section */}
      <div className="space-y-4 mb-10 text-center sm:text-left">
        <span className="text-[10px] bg-indigo-50 text-indigo-700 px-3 py-1 bg-opacity-70 border border-indigo-100 rounded-full font-extrabold uppercase tracking-widest inline-block">
          {t('faq.subTitle', 'Universal Knowledge Base')}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-none">
          {t('faq.title', 'Frequently Asked Questions')}
        </h1>
        <p className="text-sm text-slate-500 max-w-xl leading-relaxed">
          {t('faq.description', 'Unlock maximum scannability and build better brand experiences with our 25+ detailed guides, hardware compatibility logs, and legal disclaimers.')}
        </p>
      </div>

      {/* Search Input Custom Component */}
      <div className="relative mb-8 shadow-xs rounded-2xl h-12 w-full flex items-center bg-white border border-slate-200/80 focus-within:border-indigo-500 transition-all">
        <div className="pl-4 text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('faq.searchPlaceholder', 'Search standard questions, error corrections, vector scaling, format guidelines...') as string}
          className="w-full h-full text-xs px-3 bg-transparent outline-none text-slate-800 placeholder:text-slate-400 font-sans"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-slate-400 hover:text-slate-600 pr-4 font-mono font-bold cursor-pointer"
          >
            {t('faq.clear', 'Clear')}
          </button>
        )}
      </div>

      {/* Categorized Filter system */}
      <div className="flex flex-wrap gap-1.5 mb-10 pb-2 overflow-x-auto border-b border-slate-100 scrollbar-none">
        {faqCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              setExpandedId(null);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${ selectedCategory === cat.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-transparent hover:border-slate-200 ' }`}
          >
            {faqCategoryLabels[locale][cat.id] || cat.label}
          </button>
        ))} 
      </div>

      {/* Render FAQs Accordion system */}
      {filteredFAQs.length > 0 ? (
        <div className="space-y-4">
          {filteredFAQs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <div
                key={faq.id}
                id={`faq-item-${faq.id}`}
                className={`bg-white rounded-2xl border transition-all duration-300 ${ isExpanded ? 'border-indigo-500/40 shadow-lg ring-1 ring-indigo-500/10' : 'border-slate-200/80 hover:border-slate-350 hover:shadow-xs' }`}
              >
                <button
                  onClick={() => toggleExpand(faq.id)}
                  className="w-full text-left p-5 flex justify-between items-center gap-4 cursor-pointer focus:outline-hidden"
                >
                  <div className="flex items-start gap-3.5">
                    <span className="mt-0.5 w-5 h-5 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <HelpCircle className="w-3.5 h-3.5" />
                    </span>
                    <h2 className="text-sm font-extrabold text-slate-900 leading-tight">
                      {faq.question}
                    </h2>
                  </div>
                  <div className="text-slate-400 shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-indigo-600" />
                    ) : ( 
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 border-t border-slate-50 relative animate-fade-in">
                    <p className="text-xs text-slate-600 leading-relaxed font-sans max-w-3xl">
                      {faq.answer}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 pt-3 border-t border-slate-100">
                      <span className="uppercase text-indigo-500 bg-indigo-50/50 px-2 py-0.5 rounded-md">
                        {t('faq.categoryLabel', 'Category')}: {faqCategoryLabels[locale][faq.category] || faq.category}
                      </span>
                      <button
                        onClick={(e) => copyShareLink(faq.id, e)}
                        className="flex items-center gap-1 hover:text-indigo-600 transition-colors cursor-pointer"
                      >
                        {copiedId === faq.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-500">{t('faq.linkCopied', 'Link Copied!')}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>{t('faq.copyLinkId', 'Copy link ID')}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div id="faq-empty-state" className="text-center py-16 px-4 space-y-4 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-extrabold text-slate-900">
              {t('faq.noQuestions', 'No matching questions found')}
            </h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              {t('faq.noQuestionsDesc', 'We couldn\'t locate anything matching "{query}". Try searching general keywords like "expire", "printing", or "WiFi".', { query: searchQuery })}
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-slate-950 text-white text-xs font-bold rounded-xl transition-all shadow-md"
          >
            {t('faq.resetFilters', 'Reset All Filters')}
          </button>
        </div>
      )}
    </div>
  );
}