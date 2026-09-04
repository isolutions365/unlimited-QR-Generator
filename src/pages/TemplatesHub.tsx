import React, { useState, useEffect } from 'react';
import { useTranslation } from '../utils/i18n';
import ScrollableTabContainer from '../components/ScrollableTabContainer';
import BreadcrumbNav from '../components/BreadcrumbNav';

import { 
  ChevronRight, Home, Zap, ArrowRight, Check, HelpCircle, 
  ChevronDown, BookOpen, LayoutTemplate, Star, Info, Cpu, 
  ShieldCheck, AlertTriangle, FileText, Bot, Search, Tag, ExternalLink, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { templatePages, TemplatePage } from '../data/templatePagesData';

interface TemplatesHubProps {
  initialSlug: string | null;
  onNavigate: (path: string) => void;
  onInitiateGenerator: (preset: { type: any; content: string; name: string }) => void;
  locale?: string;
}

export default function TemplatesHub({
   
  initialSlug, 
  onNavigate, 
  onInitiateGenerator,
  locale = 'en' 
}: TemplatesHubProps) {
  const { t } = useTranslation();
  const [activeSlug, setActiveSlug] = useState<string | null>(initialSlug);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'hospitality' | 'professional' | 'seo' | 'social' | 'utilities' | 'retail' | 'creative'>('all');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Sync state with path changes
  useEffect(() => {
    setActiveSlug(initialSlug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [initialSlug]);

  const activeTemplate = templatePages.find(t => t.slug === activeSlug);

  // Group templates for filtering
  const getTemplateCategory = (slug: string): string => {
    if (['restaurant-menu-qr-code', 'hotel-qr-code', 'cafe-qr-code'].includes(slug)) return 'hospitality';
    if (['business-card-qr-code', 'resume-qr-code'].includes(slug)) return 'professional';
    if (['google-review-qr-code'].includes(slug)) return 'seo';
    if (['whatsapp-qr-code', 'instagram-qr-code', 'facebook-qr-code', 'youtube-qr-code'].includes(slug)) return 'social';
    if (['wifi-qr-code', 'pdf-qr-code', 'event-ticket-qr-code', 'medical-qr-code', 'product-packaging-qr-code'].includes(slug)) return 'utilities';
    if (['retail-qr-code'].includes(slug)) return 'retail';
    if (['portfolio-qr-code'].includes(slug)) return 'creative';
    return 'utilities';
  };

  const filteredTemplates = templatePages.filter(t => {
    const category = getTemplateCategory(t.slug);
    const matchesCategory = selectedCategory === 'all' || category === selectedCategory;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.subheading.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.badge.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Inject Schemas dynamically into the document head
  useEffect(() => {
    if (!activeTemplate) {
      // Root schemas
      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": t('templates.breadcrumbHome', 'Home'),
            "item": "https://www.freeqrbarcodes.com/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": t('templates.breadcrumbTemplates', 'Templates'),
            "item": "https://www.freeqrbarcodes.com/templates"
          }
        ]
      };

      const scriptId = 'templates-schema-root';
      let script = document.getElementById(scriptId) as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.text = JSON.stringify(breadcrumbSchema);

      return () => {
        const existing = document.getElementById(scriptId);
        if (existing) existing.remove();
      };
    }

    // Detail schemas: FAQ and HowTo
    const canonicalUrl = `https://www.freeqrbarcodes.com/templates/${activeTemplate.slug}`;
    
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": t('templates.breadcrumbHome', 'Home'),
          "item": "https://www.freeqrbarcodes.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": t('templates.breadcrumbTemplates', 'Templates'),
          "item": "https://www.freeqrbarcodes.com/templates"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": t('templates.item.' + activeTemplate.slug + '.title', activeTemplate.title),
          "item": canonicalUrl
        }
      ]
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": activeTemplate.faqs.map(f => ({
        "@type": "Question",
        "name": f.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": f.a
        }
      }))
    };

    const howToSchema = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": `${t('templates.howToCreateCustom', 'How to Create a Custom')} ${t('templates.item.' + activeTemplate.slug + '.title', activeTemplate.title)}`,
      "description": t('templates.item.' + activeTemplate.slug + '.desc', activeTemplate.metaDescription),
      "step": activeTemplate.steps.map(s => ({
        "@type": "HowToStep",
        "position": parseInt(s.step),
        "name": s.title,
        "text": s.desc
      }))
    };

    const scriptId = `templates-schema-${activeTemplate.slug}`;
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.text = JSON.stringify([breadcrumbSchema, faqSchema, howToSchema]);

    // Handle canonical and OG metadata
    let canonicalTag = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.rel = 'canonical';
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.href = canonicalUrl;

    return () => {
      const existing = document.getElementById(scriptId);
      if (existing) existing.remove();
    };
  }, [activeTemplate, t]);

  const handleTemplateClick = (slug: string) => {
    onNavigate(`/templates/${slug}`);
  };

  const handleBackToDirectory = () => {
    onNavigate('/templates');
  };

  const categoriesList = [
    { id: 'all', label: t('templates.catAll', 'All Templates') },
    { id: 'hospitality', label: t('templates.catHospitality', 'Hospitality & Dining') },
    { id: 'professional', label: t('templates.catProfessional', 'Professional vCards') },
    { id: 'seo', label: t('templates.catSeo', 'Local SEO Booster') },
    { id: 'social', label: t('templates.catSocial', 'Social Networks') },
    { id: 'utilities', label: t('templates.catUtilities', 'Office & Utilities') },
    { id: 'retail', label: t('templates.catRetail', 'Retail & Commerce') },
    { id: 'creative', label: t('templates.catCreative', 'Portfolios') }
  ] as const;

  // View individual template landing page
  if (activeTemplate) {
    return (
      <div className="bg-slate-50 min-h-screen pb-20 font-sans" id="template-detail-container">
        {/* Breadcrumb section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <BreadcrumbNav
            items={[
              { label: String(t('templates.breadcrumbTemplates', 'Templates')), onClick: handleBackToDirectory, href: '/templates' },
              { label: String(t('templates.item.' + activeTemplate.slug + '.title', activeTemplate.title)), active: true }
            ]}
            onNavigate={onNavigate}
            className="bg-white"
            schemaId="templates-detail-breadcrumb-schema"
          />
        </div>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-slate-800 relative">
            <div className="absolute inset-0 bg-radial from-slate-800/50 to-slate-950/90 pointer-events-none" />
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 sm:p-12 lg:p-16 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
                  <LayoutTemplate className="w-3.5 h-3.5" />
                  <span>{t('templates.badge.' + activeTemplate.badge.replace(/ & /g, '_and_').replace(/ /g, '_').toLowerCase(), activeTemplate.badge)}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  {t('templates.item.' + activeTemplate.slug + '.heading', t('templates.item.' + activeTemplate.slug + '.title', activeTemplate.heading))}
                </h1>
                <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                  {t('templates.item.' + activeTemplate.slug + '.subheading', t('templates.item.' + activeTemplate.slug + '.desc', activeTemplate.subheading))}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    onClick={() => onInitiateGenerator({
                      type: activeTemplate.qrType,
                      content: activeTemplate.qrContent,
                      name: activeTemplate.qrName
                    })}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 text-white font-bold text-sm tracking-wide shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all cursor-pointer group"
                  >
                    <span>{t('templates.useTemplateNow', 'Use This Template Now')}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                  <button
                    onClick={handleBackToDirectory}
                    className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-slate-800 text-slate-200 font-bold text-sm tracking-wide hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700"
                  >
                    {t('templates.browseDirectory', 'Browse Directory')}
                  </button>
                </div>
              </div>

              {/* Interactive Mock Preview Panel */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="bg-slate-800/80 backdrop-blur p-6 rounded-2xl border border-slate-700/50 shadow-2xl max-w-sm w-full text-center space-y-4">
                  <div className="bg-white p-4 rounded-xl inline-block shadow-md">
                    <div className="w-48 h-48 bg-slate-100 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 relative group overflow-hidden">
                      <div className="absolute inset-0 bg-indigo-600/5 group-hover:bg-indigo-600/10 transition-colors" />
                      <div className="w-40 h-40 bg-slate-950 rounded p-2 flex flex-col justify-between text-white text-left select-none shadow-inner">
                        <div className="flex items-center justify-between text-[10px] opacity-70">
                          <span>{t('templates.brandName', 'FreeQRBarcodes')}</span>
                          <span className="px-1 bg-white/20 rounded font-mono uppercase text-[8px] tracking-widest font-bold">{t('templates.twoD', '2D')}</span>
                        </div>
                        <div className="font-mono text-center text-xs font-bold my-2 tracking-widest break-all px-1 bg-white/10 py-1 rounded">
                          {activeTemplate.qrType.toUpperCase()} {t('templates.payload', 'PAYLOAD')}
                        </div>
                        <div className="flex justify-between items-end text-[9px]">
                          <span className="truncate max-w-[100px]">{activeTemplate.qrName}</span>
                          <span className="font-bold text-[8px] bg-indigo-50 text-white px-1.5 py-0.5 rounded uppercase">{t('templates.preset', 'PRESET')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-white font-bold text-sm">{t('templates.visualPrototype', 'Visual Live Prototype')}</h3>
                    <p className="text-xs text-slate-400 leading-snug">
                      {t('templates.prototypeDesc', "Click 'Use This Template' to load this verified standard configurations directly into the design board.")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Directory & Sections */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main detailed copy */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Intro */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Info className="w-5 h-5 text-indigo-500" />
                <span>{t('templates.authorityOverview', 'Authority Overview & Specs')}</span>
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                {t('templates.item.' + activeTemplate.slug + '.intro', activeTemplate.intro)}
              </p>
            </div>

            {/* Use Cases */}
            <div className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-500" />
                <span>{t('templates.standardUseCases', 'Standard Production Use Cases')}</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {activeTemplate.useCases.map((uc, i) => (
                  <div key={i} className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs hover:shadow transition-shadow space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                      {i + 1}
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {t('templates.item.' + activeTemplate.slug + '.useCases.' + i + '.title', uc.title)}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {t('templates.item.' + activeTemplate.slug + '.useCases.' + i + '.desc', uc.desc)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
                <span>{t('templates.businessBenefits', 'Strategic Business Benefits')}</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {activeTemplate.benefits.map((b, i) => (
                  <div key={i} className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs hover:shadow transition-shadow space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {t('templates.item.' + activeTemplate.slug + '.benefits.' + i + '.title', b.title)}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {t('templates.item.' + activeTemplate.slug + '.benefits.' + i + '.desc', b.desc)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* How-To Step Guide */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                <span>{t('templates.stepGuide', 'Step-by-Step Creation Guide')}</span>
              </h2>
              <div className="space-y-4">
                {activeTemplate.steps.map((s, i) => (
                  <div key={i} className="flex gap-4 items-start pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                    <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {s.step}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                        {t('templates.item.' + activeTemplate.slug + '.steps.' + i + '.title', s.title)}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                        {t('templates.item.' + activeTemplate.slug + '.steps.' + i + '.desc', s.desc)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Best Practices & Mistakes Dual Column */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100/50 space-y-4">
                <h3 className="font-bold text-emerald-900 text-base flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-600" />
                  <span>{t('templates.bestPractices', 'Best Practices')}</span>
                </h3>
                <ul className="space-y-3">
                  {activeTemplate.bestPractices.map((bp, i) => (
                    <li key={i} className="flex gap-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      <span className="text-emerald-600 font-bold shrink-0">•</span>
                      <span>{t('templates.item.' + activeTemplate.slug + '.bestPractices.' + i, bp)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-100/50 space-y-4">
                <h3 className="font-bold text-rose-900 text-base flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <span>{t('templates.commonMistakes', 'Common Mistakes')}</span>
                </h3>
                <ul className="space-y-3">
                  {activeTemplate.commonMistakes.map((cm, i) => (
                    <li key={i} className="flex gap-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      <span className="text-rose-600 font-bold shrink-0">•</span>
                      <span>{t('templates.item.' + activeTemplate.slug + '.commonMistakes.' + i, cm)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* FAQ Area */}
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-500" />
                <span>{t('templates.faqs', 'Frequently Asked Questions')}</span>
              </h2>
              <div className="space-y-2">
                {activeTemplate.faqs.map((f, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div key={idx} className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-xs">
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full text-left p-4 flex justify-between items-center font-bold text-slate-800 text-sm hover:bg-slate-50 transition-colors"
                      >
                        <span>{t('templates.item.' + activeTemplate.slug + '.faqs.' + idx + '.q', f.q)}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isOpen && (
                        <div className="p-4 pt-0 text-xs sm:text-sm text-slate-500 leading-relaxed border-t border-slate-50 bg-slate-50/20 text-slate-600">
                          {t('templates.item.' + activeTemplate.slug + '.faqs.' + idx + '.a', f.a)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Sidebar Area: AI Summary, Key Takeaways, Connections */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* AI Summary Box */}
            <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl border border-slate-800 shadow-md space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Bot className="w-5 h-5 text-indigo-400" />
                <h3 className="font-extrabold text-sm tracking-wide text-white uppercase">{t('templates.aiSearchSummary', 'AI Search Summary')}</h3>
              </div>
              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">{t('templates.entityCategory', 'Entity / Category')}</span>
                  <span className="font-mono text-indigo-300 font-bold">
                    {t('templates.item.' + activeTemplate.slug + '.aiSummaryBox.entityType', activeTemplate.aiSummaryBox.entityType)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">{t('templates.standardProtocol', 'Standard / Protocol')}</span>
                  <span className="font-mono text-slate-200">
                    {t('templates.item.' + activeTemplate.slug + '.aiSummaryBox.protocolStandard', activeTemplate.aiSummaryBox.protocolStandard)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">{t('templates.clientCompatibility', 'Client Compatibility')}</span>
                  <span className="text-slate-200 leading-relaxed">
                    {t('templates.item.' + activeTemplate.slug + '.aiSummaryBox.clientCompatibility', activeTemplate.aiSummaryBox.clientCompatibility)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">{t('templates.primaryTargetAction', 'Primary Target Action')}</span>
                  <span className="text-slate-200 leading-relaxed">
                    {t('templates.item.' + activeTemplate.slug + '.aiSummaryBox.primaryUseCase', activeTemplate.aiSummaryBox.primaryUseCase)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">{t('templates.offlineFunctionality', 'Offline Functionality')}</span>
                  <span className="font-semibold text-emerald-400">
                    {t('templates.item.' + activeTemplate.slug + '.aiSummaryBox.offlineCapability', activeTemplate.aiSummaryBox.offlineCapability)}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 leading-snug border-t border-slate-800 pt-3">
                {t('templates.aiNotice', 'Structured in compliance with Llama-3, Claude-3.5, and Gemini-Pro semantic retrieval constraints. Verified 100% factual.')}
              </p>
            </div>

            {/* Key Takeaways */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm tracking-wide uppercase flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-500" />
                <span>{t('templates.keyTakeawaysTitle', 'Key Takeaways')}</span>
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-500">
                {activeTemplate.keyTakeaways.map((kt, i) => (
                  <li key={i} className="flex gap-2 leading-relaxed">
                    <span className="text-indigo-500 font-bold">•</span>
                    <span>{t('templates.item.' + activeTemplate.slug + '.keyTakeaways.' + i, kt)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Direct Creator Access Button */}
            <div className="bg-gradient-to-br from-indigo-50 to-slate-50 p-6 rounded-2xl border border-indigo-100 space-y-4 text-center">
              <LayoutTemplate className="w-10 h-10 text-indigo-500 mx-auto" />
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">{t('templates.needCustomDesign', 'Need a Custom Design?')}</h4>
                <p className="text-xs text-slate-500 leading-normal">
                  {t('templates.needCustomDesignDesc', 'Initialize this specific preset template and configure pixel colors, logos, and frames instantly.')}
                </p>
              </div>
              <button
                onClick={() => onInitiateGenerator({
                  type: activeTemplate.qrType,
                  content: activeTemplate.qrContent,
                  name: activeTemplate.qrName
                })}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-indigo-500 transition-colors cursor-pointer"
              >
                <span>{t('templates.activateGenerator', 'Activate Generator')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Related Tools */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 text-sm tracking-wide uppercase">{t('templates.relatedQrTools', 'Related QR Tools')}</h3>
              <div className="space-y-1.5">
                <button 
                  onClick={() => onNavigate('/url-qr-generator')} 
                  className="w-full text-left p-2.5 rounded-lg text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors border border-dashed border-slate-100"
                >
                  {t('templates.toolUrl', '🌐 Standard URL QR Creator')}
                </button>
                <button 
                  onClick={() => onNavigate('/wifi-qr-generator')} 
                  className="w-full text-left p-2.5 rounded-lg text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors border border-dashed border-slate-100"
                >
                  {t('templates.toolWifi', '📶 Password-Free WiFi Creator')}
                </button>
                <button 
                  onClick={() => onNavigate('/vcard-qr-generator')} 
                  className="w-full text-left p-2.5 rounded-lg text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors border border-dashed border-slate-100"
                >
                  {t('templates.toolVcard', '📇 Executive vCard Exchange')}
                </button>
              </div>
            </div>

            {/* Related Templates */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 text-sm tracking-wide uppercase">{t('templates.relatedTemplates', 'Related Templates')}</h3>
              <div className="space-y-1.5">
                {activeTemplate.relatedTemplates.map((rt, i) => (
                  <button
                    key={i}
                    onClick={() => handleTemplateClick(rt.slug)}
                    className="w-full text-left p-2.5 rounded-lg text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors flex items-center justify-between border border-slate-50"
                  >
                    <span>{rt.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>

            {/* Related Articles */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 text-sm tracking-wide uppercase flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                <span>{t('templates.authorityLiterature', 'Authority Literature')}</span>
              </h3>
              <div className="space-y-1.5">
                {activeTemplate.relatedArticles.map((ra, i) => (
                  <button
                    key={i}
                    onClick={() => onNavigate(`/academy/${ra.slug}`)}
                    className="w-full text-left p-2.5 rounded-lg text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors flex items-center justify-between border border-slate-50"
                  >
                    <span className="truncate max-w-[220px]">{ra.name}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

          </div>
        </section>
      </div>
    );
  }

  // View main template directory
  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-sans" id="templates-hub-directory">
      
      {/* Directory Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <BreadcrumbNav
          items={[
            { label: String(t('templates.directoryBreadcrumb', 'Templates Directory')), active: true }
          ]}
          onNavigate={onNavigate}
          className="bg-white"
          schemaId="templates-directory-breadcrumb-schema"
        />
      </div>

      {/* Directory Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            {t('templates.highPerformance', 'High-Performance')} <span className="text-indigo-600">{t('templates.qrCodeTemplates', 'QR Code Templates')}</span>
          </h1>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            {t('templates.directorySubheading', 'Access our verified, schema-optimized 2D barcode templates designed to capture high-intent physical traffic. Jumpstart campaigns with pristine layouts.')}
          </p>
        </div>

        {/* Search and Filters Hub */}
        <div className="mt-8 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('templates.searchPlaceholder', 'Search high-intent templates (e.g. WiFi, menu, vcard...)')}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>
            
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="px-4 py-3 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {t('templates.clear', 'Clear')}
              </button>
            )}
          </div>

          {/* Categorization tabs */}
          <ScrollableTabContainer
            className="w-full"
            gradientColor="from-white"
            innerClassName="flex items-center gap-1.5 py-1"
          >
            <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
            {categoriesList.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all shrink-0 uppercase border ${
                  selectedCategory === cat.id 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                    : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </ScrollableTabContainer>
        </div>
      </section>

      {/* Grid Templates Catalog */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(tpl => (
              <div 
                key={tpl.slug}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-200 transition-all flex flex-col group justify-between"
              >
                <div className="p-6 space-y-4">
                  {/* Card Header Info */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100">
                      {t('templates.badge.' + tpl.badge.replace(/ & /g, '_and_').replace(/ /g, '_').toLowerCase(), tpl.badge)}
                    </span>
                    <span className="font-mono text-[9px] text-slate-400 uppercase">
                      {t('templates.cardType', 'Type:')} {tpl.qrType}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                    {t('templates.item.' + tpl.slug + '.title', tpl.title)}
                  </h3>

                  <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">
                    {t('templates.item.' + tpl.slug + '.desc', tpl.metaDescription)}
                  </p>
                </div>

                <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between gap-2 mt-auto">
                  <button
                    onClick={() => onInitiateGenerator({
                      type: tpl.qrType,
                      content: tpl.qrContent,
                      name: tpl.qrName
                    })}
                    className="text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-1"
                  >
                    <span>{t('templates.useTemplate', 'Use Template')}</span>
                  </button>

                  <button
                    onClick={() => handleTemplateClick(tpl.slug)}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 transition-colors cursor-pointer"
                  >
                    <span>{t('templates.readGuide', 'Read Guide')}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center bg-white p-12 rounded-3xl border border-slate-100 max-w-md mx-auto space-y-3">
            <LayoutTemplate className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-base">{t('templates.noTemplatesFound', 'No templates found')}</h3>
            <p className="text-xs text-slate-500">
              {t('templates.noTemplatesMatched', 'No templates matched your current filter criteria. Try clearing search or category filters.')}
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-500 transition-all"
            >
              {t('templates.resetFilters', 'Reset Filters')}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}