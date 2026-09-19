import React, { useState, useEffect } from 'react';
import { useTranslation } from '../utils/i18n';
import BreadcrumbNav from '../components/BreadcrumbNav';

import { 
  ChevronRight, Home, ArrowRight, Check, HelpCircle, 
  ChevronDown, BookOpen, LayoutTemplate, Star, Info, Cpu, 
  ShieldCheck, AlertTriangle, FileText, Bot, Search, Tag, ExternalLink, RefreshCw, BarChart2, Scale, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { comparisons, ComparePage } from '../data/compareData';

interface CompareHubProps {
  initialSlug: string | null;
  onNavigate: (path: string) => void;
  onInitiateGenerator: (preset: { type: any; content: string; name: string }) => void;
  locale?: string;
}

export default function CompareHub({
   
  initialSlug, 
  onNavigate, 
  onInitiateGenerator,
  locale = 'en' 
}: CompareHubProps) {
  const { t } = useTranslation();
  const [activeSlug, setActiveSlug] = useState<string | null>(initialSlug);
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Sync state with path changes
  useEffect(() => {
    setActiveSlug(initialSlug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [initialSlug]);

  const activeCompare = comparisons.find(c => c.slug === activeSlug);

  const filteredComparisons = comparisons.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.subheading.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.badge.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Inject Schemas dynamically into the document head
  useEffect(() => {
    if (!activeCompare) {
      // Root CollectionPage and Breadcrumb Schema
      const directorySchema = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "CollectionPage",
            "@id": "https://www.freeqrbarcodes.com/compare#webpage",
            "url": "https://www.freeqrbarcodes.com/compare",
            "name": "QR Code Technology Comparison Directory | FreeQRBarcodes.com",
            "description": "High-fidelity, professional analytical comparisons between diverse 2D barcode schemas, formats, error levels, and marketing strategies.",
            "isPartOf": {
              "@type": "WebSite",
              "@id": "https://www.freeqrbarcodes.com/#website"
            }
          },
          {
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://www.freeqrbarcodes.com/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Comparisons",
                "item": "https://www.freeqrbarcodes.com/compare"
              }
            ]
          }
        ]
      };

      const scriptId = 'compare-schema-root';
      let script = document.getElementById(scriptId) as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.text = JSON.stringify(directorySchema);

      return () => {
        const existing = document.getElementById(scriptId);
        if (existing) existing.remove();
      };
    }

    // Detail schemas: Article, FAQPage, HowTo, WebPage, and Breadcrumb
    const canonicalUrl = `https://www.freeqrbarcodes.com/compare/${activeCompare.slug}`;
    
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.freeqrbarcodes.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Comparisons",
          "item": "https://www.freeqrbarcodes.com/compare"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": activeCompare.title,
          "item": canonicalUrl
        }
      ]
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": activeCompare.faqs.map(f => ({
        "@type": "Question",
        "name": f.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": f.a
        }
      }))
    };

    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": activeCompare.heading,
      "description": activeCompare.metaDescription,
      "image": "https://www.freeqrbarcodes.com/og-image.jpg",
      "author": {
        "@type": "Organization",
        "name": "iSolutions Technical Team"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Free QR Code Generator Inc.",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.freeqrbarcodes.com/favicon-32x32.png"
        }
      },
      "mainEntityOfPage": canonicalUrl
    };

    const scriptId = `compare-schema-${activeCompare.slug}`;
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.text = JSON.stringify([breadcrumbSchema, faqSchema, articleSchema]);

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
  }, [activeCompare]);

  const handleCompareClick = (slug: string) => {
    onNavigate(`/compare/${slug}`);
  };

  const handleBackToDirectory = () => {
    onNavigate('/compare');
  };

  // Render individual Comparison detailed layout
  if (activeCompare) {
    return (
      <div className="bg-slate-50 min-h-screen pb-20 font-sans" id="compare-detail-container">
        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <BreadcrumbNav
            items={[
              { label: String(t('compare.directory', 'Comparisons Directory')), onClick: handleBackToDirectory, href: '/compare' },
              { label: activeCompare.title, active: true }
            ]}
            onNavigate={onNavigate}
            className="bg-white"
            schemaId="compare-detail-breadcrumb-schema"
          />
        </div>

        {/* Hero Banner Area */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-slate-800 relative">
            <div className="absolute inset-0 bg-radial from-slate-800/50 to-slate-950/90 pointer-events-none" />
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 sm:p-12 lg:p-16 items-center">
              <div className="lg:col-span-8 space-y-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
                  <Scale className="w-3.5 h-3.5" />
                  <span>{activeCompare.badge}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  {activeCompare.heading}
                </h1>
                <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                  {activeCompare.subheading}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    onClick={() => {
                      // Navigate to creator station
                      onNavigate('/');
                    }}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 text-white font-bold text-sm tracking-wide shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all cursor-pointer group"
                  >
                    <span>Design Custom QR Code</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                  <button
                    onClick={handleBackToDirectory}
                    className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-slate-800 text-slate-200 font-bold text-sm tracking-wide hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700"
                  >
                    Browse Comparisons
                  </button>
                </div>
              </div>

              {/* Graphical Visualizer */}
              <div className="lg:col-span-4 flex justify-center">
                <div className="bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 shadow-2xl max-w-sm w-full text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full blur-2xl" />
                  <Scale className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
                  <h3 className="text-white font-bold text-sm">Direct Architectural Face-Off</h3>
                  <div className="mt-4 flex items-center justify-between gap-2 px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-indigo-300 font-mono font-bold truncate max-w-[100px]">{activeCompare.optionA}</span>
                    <span className="text-[9px] font-black text-slate-500">VS</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold truncate max-w-[100px]">{activeCompare.optionB}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Content Grid Layout */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Comparison Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden space-y-4 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-indigo-500" />
                <span>Standard Feature Metrics Matrix</span>
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Evaluation Metric</th>
                      <th className="py-3 px-4 bg-slate-50/50">{activeCompare.optionA}</th>
                      <th className="py-3 px-4">{activeCompare.optionB}</th>
                      <th className="py-3 px-4 text-center">Winner</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs sm:text-sm text-slate-600 divide-y divide-slate-50">
                    {activeCompare.comparisonTable.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-800">{row.metric}</td>
                        <td className="py-3.5 px-4 bg-slate-50/30 text-slate-600 leading-snug">{row.optionA}</td>
                        <td className="py-3.5 px-4 text-slate-600 leading-snug">{row.optionB}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            row.winner === 'Tie' 
                              ? 'bg-slate-100 text-slate-600' 
                              : row.winner === 'Option A' 
                                ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' 
                                : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          }`}>
                            {row.winner === 'Tie' ? 'Tie' : row.winner === 'Option A' ? activeCompare.optionA : activeCompare.optionB}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pros and Cons Dual Column */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Option A Analysis */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest font-mono">Option A Evaluation</span>
                  <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">{activeCompare.optionA}</h3>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Distinct Pros</span>
                  </h4>
                  <ul className="space-y-2.5">
                    {activeCompare.prosA.map((p, idx) => (
                      <li key={idx} className="flex gap-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                        <span className="text-emerald-500 font-bold shrink-0">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-50">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <span>Inherent Cons</span>
                  </h4>
                  <ul className="space-y-2.5">
                    {activeCompare.consA.map((c, idx) => (
                      <li key={idx} className="flex gap-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                        <span className="text-rose-500 font-bold shrink-0">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Option B Analysis */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest font-mono">Option B Evaluation</span>
                  <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">{activeCompare.optionB}</h3>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Distinct Pros</span>
                  </h4>
                  <ul className="space-y-2.5">
                    {activeCompare.prosB.map((p, idx) => (
                      <li key={idx} className="flex gap-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                        <span className="text-emerald-500 font-bold shrink-0">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-50">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <span>Inherent Cons</span>
                  </h4>
                  <ul className="space-y-2.5">
                    {activeCompare.consB.map((c, idx) => (
                      <li key={idx} className="flex gap-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                        <span className="text-rose-500 font-bold shrink-0">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>

            {/* Best Use Cases */}
            <div className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-500" />
                <span>Best Use Cases Deployment</span>
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Use Cases Option A */}
                <div className="bg-slate-100/50 p-6 rounded-2xl border border-slate-200/50 space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase flex items-center gap-2">
                    <Zap className="w-4 h-4 text-indigo-500" />
                    <span>Recommended for {activeCompare.optionA}</span>
                  </h3>
                  <div className="space-y-3">
                    {activeCompare.bestUseCasesA.map((uc, i) => (
                      <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{uc.title}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed mt-1">{uc.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Use Cases Option B */}
                <div className="bg-slate-100/50 p-6 rounded-2xl border border-slate-200/50 space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-500" />
                    <span>Recommended for {activeCompare.optionB}</span>
                  </h3>
                  <div className="space-y-3">
                    {activeCompare.bestUseCasesB.map((uc, i) => (
                      <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{uc.title}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed mt-1">{uc.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Decision Guide Block */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/30 p-6 sm:p-8 rounded-2xl border border-indigo-100 space-y-3">
              <h3 className="font-bold text-indigo-950 text-base sm:text-lg flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-600" />
                <span>Expert Decision Guide</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {activeCompare.decisionGuide}
              </p>
            </div>

            {/* FAQs */}
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-500" />
                <span>Common Questions Answered</span>
              </h2>
              <div className="space-y-2">
                {activeCompare.faqs.map((f, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div key={idx} className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-xs">
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full text-left p-4 flex justify-between items-center font-bold text-slate-800 text-sm hover:bg-slate-50 transition-colors"
                      >
                        <span>{f.q}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isOpen && (
                        <div className="p-4 pt-0 text-xs sm:text-sm text-slate-500 leading-relaxed border-t border-slate-50 bg-slate-50/20">
                          {f.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Technical Summary Box */}
            <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl border border-slate-800 shadow-md space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Cpu className="w-5 h-5 text-indigo-400" />
                <h3 className="font-extrabold text-sm tracking-wide text-white uppercase">{t('compare.techSummary', 'Technical Comparison Summary')}</h3>
              </div>
              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">Technology Profile A</span>
                  <span className="font-mono text-indigo-300 font-bold leading-relaxed">{activeCompare.aiSummary.technologyA}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">Technology Profile B</span>
                  <span className="font-mono text-emerald-300 font-bold leading-relaxed">{activeCompare.aiSummary.technologyB}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">Data Density Matrix scaling</span>
                  <span className="text-slate-200 leading-relaxed">{activeCompare.aiSummary.dataDensity}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">Requires Active Web Redirection</span>
                  <span className="text-slate-200 leading-relaxed">{activeCompare.aiSummary.internetRequired}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">Consolidated Technical Verdict</span>
                  <span className="font-semibold text-amber-400 leading-relaxed block mt-1">{activeCompare.aiSummary.verdict}</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 leading-snug border-t border-slate-800 pt-3">
                {t('compare.specDisclaimer', 'Verified against ISO/IEC barcode standards and physical scanning specifications.')}
              </p>
            </div>

            {/* Key Takeaways */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm tracking-wide uppercase flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-500" />
                <span>Key Takeaways</span>
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-500">
                {activeCompare.keyTakeaways.map((kt, i) => (
                  <li key={i} className="flex gap-2 leading-relaxed">
                    <span className="text-indigo-500 font-bold">•</span>
                    <span>{kt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Related Tools */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 text-sm tracking-wide uppercase">Related QR Tools</h3>
              <div className="space-y-1.5">
                {activeCompare.relatedTools.map((rt, i) => (
                  <button 
                    key={i}
                    onClick={() => onNavigate(`/${rt.slug}`)} 
                    className="w-full text-left p-2.5 rounded-lg text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors border border-dashed border-slate-100 flex items-center justify-between"
                  >
                    <span>🛠️ {rt.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>

            {/* Related Templates */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 text-sm tracking-wide uppercase">Related Templates</h3>
              <div className="space-y-1.5">
                {activeCompare.relatedTemplates.map((rt, i) => (
                  <button
                    key={i}
                    onClick={() => onNavigate(`/templates/${rt.slug}`)}
                    className="w-full text-left p-2.5 rounded-lg text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors flex items-center justify-between border border-slate-50"
                  >
                    <span>{rt.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>

            {/* Related Guides */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 text-sm tracking-wide uppercase flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                <span>Authority Literature</span>
              </h3>
              <div className="space-y-1.5">
                {activeCompare.relatedGuides.map((ra, i) => (
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

  // Render directory comparison hub
  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-sans" id="compare-directory-container">
      
      {/* Directory Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <BreadcrumbNav
          items={[
            { label: String(t('compare.directory', 'Comparisons Directory')), active: true }
          ]}
          onNavigate={onNavigate}
          className="bg-white"
          schemaId="compare-directory-breadcrumb-schema"
        />
      </div>

      {/* Directory Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            {t('compare.comprehensive', 'Comprehensive')} <span className="text-indigo-600">{t('compare.qrFaceOffs', 'QR Technology Face-Offs')}</span>
          </h1>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            {t('compare.directorySubheading', 'Choose formats correctly. Compare 2D barcode schemas, compression layouts, physical materials, and integration protocols inside our expert technical database.')}
          </p>
        </div>

        {/* Search */}
        <div className="mt-8 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('compare.searchPlaceholder', 'Search technical comparisons (e.g. static vs dynamic, png vs svg...)')}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>
            
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="px-4 py-3 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {t('compare.clear', 'Clear')}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Comparisons Catalog Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {filteredComparisons.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredComparisons.map(c => (
              <div 
                key={c.slug}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-200 transition-all flex flex-col group justify-between"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100">
                      {t('compare.badge', c.badge)}
                    </span>
                    <span className="font-mono text-[9px] text-slate-400 uppercase">
                      {t('compare.faceOffProfile', 'Face-Off Profile')}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                    {t('compare.title.' + c.slug, c.title)}
                  </h3>

                  <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">
                    {t('compare.desc.' + c.slug, c.metaDescription)}
                  </p>
                </div>

                <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between gap-2 mt-auto">
                  <span className="text-[10px] text-slate-400 font-bold font-mono">
                    {c.optionA} {t('compare.vsLower', 'vs')} {c.optionB}
                  </span>

                  <button
                    onClick={() => handleCompareClick(c.slug)}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 transition-colors cursor-pointer"
                  >
                    <span>{t('compare.readAnalysis', 'Read Analysis')}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center bg-white p-12 rounded-3xl border border-slate-100 max-w-md mx-auto space-y-3">
            <Scale className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-base">{t('compare.noMatches', 'No matches found')}</h3>
            <p className="text-xs text-slate-500">
              {t('compare.noMatchesSub', 'No comparisons matched your query. Try clearing filters or search strings.')}
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-500 transition-all"
            >
              {t('compare.resetSearch', 'Reset Search')}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
