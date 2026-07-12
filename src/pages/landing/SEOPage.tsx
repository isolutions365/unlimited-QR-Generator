import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../utils/i18n';

import { landingPages, LandingPageData } from './SEODatabase';
import { aeoDatabase } from './AEOData';
import URLQRContent, { urlQrFaqs } from './URLQRContent';
import { 
  Wifi, 
  Mail, 
  Phone, 
  MessageSquare, 
  Share2, 
  Globe, 
  Utensils, 
  Facebook, 
  Instagram, 
  Youtube, 
  FileText, 
  Contact,
  CheckCircle, 
  Sparkles, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Home, 
  ArrowLeft, 
  ArrowRight, 
  Award, 
  Flame, 
  Play, 
  ShieldCheck, 
  Check,
  Star,
  Download,
  Activity,
  QrCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRProject } from '../../types';
import QR3DExperience from '../../components/QR3DExperience';

interface SEOPageProps {
  slug: string;
  onSelectRoute: (path: string) => void;
  onInitiateGenerator: (preset: {
    type: QRProject['type'];
    content: string;
    name: string;
  }) => void;
}

export default function SEOPage({
   slug, onSelectRoute, onInitiateGenerator }: SEOPageProps) {
  const { t } = useTranslation();
  const pageData = landingPages[slug];
  const aeoData = aeoDatabase[pageData?.slug || ''];
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    if (pageData) {
      // Direct update of the dynamic page head to maximize Google crawler parsing metadata
      document.title = pageData.seoTitle;
      
      // Update/Inject viewport-safe descriptions dynamically 
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', pageData.metaDescription);

      // Dynamic Canonical link injection
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', `https://www.freeqrgen.pro/${pageData.slug}`);

      // Robots meta tag injection for indexing optimization
      let metaRobots = document.querySelector('meta[name="robots"]');
      if (!metaRobots) {
        metaRobots = document.createElement('meta');
        metaRobots.setAttribute('name', 'robots');
        document.head.appendChild(metaRobots);
      }
      metaRobots.setAttribute('content', 'index, follow');

      // Open Graph URL
      let ogUrl = document.querySelector('meta[property="og:url"]');
      if (!ogUrl) {
        ogUrl = document.createElement('meta');
        ogUrl.setAttribute('property', 'og:url');
        document.head.appendChild(ogUrl);
      }
      ogUrl.setAttribute('content', `https://www.freeqrgen.pro/${pageData.slug}`);

      // Open Graph Title
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute('content', pageData.seoTitle);

      // Open Graph Description
      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (!ogDesc) {
        ogDesc = document.createElement('meta');
        ogDesc.setAttribute('property', 'og:description');
        document.head.appendChild(ogDesc);
      }
      ogDesc.setAttribute('content', pageData.metaDescription);
    }
  }, [pageData]);

  if (!pageData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-xl font-bold text-gray-900">{t('seo.pageNotFound', 'SEO Page Not Found')}</h1>
        <p className="text-xs text-gray-400 mt-2">{t('seo.pageNotFoundDesc', 'The requested landing page route configuration could not be loaded.')}</p>
        <button 
          onClick={() => onSelectRoute('/')} 
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
        >
          {t('seo.returnToDashboard', 'Return to Dashboard')}
        </button>
      </div>
    );
  }

  // Choose corresponding visual icon for headers based on active page categories
  const getPageIcon = () => {
    switch (pageData.slug) {
      case 'wifi-qr-generator': return <Wifi className="w-8 h-8 text-indigo-600" />;
      case 'whatsapp-qr-generator': return <MessageSquare className="w-8 h-8 text-emerald-600" />;
      case 'email-qr-generator': return <Mail className="w-8 h-8 text-indigo-600" />;
      case 'sms-qr-generator': return <Phone className="w-8 h-8 text-blue-600" />;
      case 'vcard-qr-generator': return <Contact className="w-8 h-8 text-purple-600" />;
      case 'url-qr-generator': return <Globe className="w-8 h-8 text-pink-600" />;
      case 'business-card-qr-generator': return <Contact className="w-8 h-8 text-indigo-600" />;
      case 'restaurant-qr-generator': return <Utensils className="w-8 h-8 text-amber-600" />;
      case 'facebook-qr-generator': return <Facebook className="w-8 h-8 text-blue-700" />;
      case 'instagram-qr-generator': return <Instagram className="w-8 h-8 text-pink-600" />;
      case 'youtube-qr-generator': return <Youtube className="w-8 h-8 text-red-600" />;
      case 'pdf-qr-generator': return <FileText className="w-8 h-8 text-emerald-600" />;
      default: return <Sparkles className="w-8 h-8 text-indigo-500" />;
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  // Build the complete JSON-LD Structured Schema definitions programmatically to optimize crawler crawling
  const buildFAQSchema = () => {
    const faqsToUse = slug === 'url-qr-generator' ? urlQrFaqs : pageData.faqs;
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqsToUse.map(item => ({
        "@type": "Question",
        "name": item.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.a
        }
      }))
    };
  };

  const buildHowToSchema = () => {
    if (slug !== 'url-qr-generator') return null;
    return {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": t('seo.schemaHowToName', 'How to Create a URL QR Code with FreeQRGen.pro'),
      "description": t('seo.schemaHowToDesc', 'Step-by-step instructions for creating a custom styled URL QR code with logos, colors, and scan counts.'),
      "step": [
        {
          "@type": "HowToStep",
          "name": t('seo.schemaStep1Name', 'Input Destination Link'),
          "text": t('seo.schemaStep1Text', 'Paste your complete target URL into the input field, including the http:// or https:// protocol.'),
          "url": "https://www.freeqrgen.pro/url-qr-generator"
        },
        {
          "@type": "HowToStep",
          "name": t('seo.schemaStep2Name', 'Select Branding & Colors'),
          "text": t('seo.schemaStep2Text', 'Choose a stylish linear gradient or solid color, custom eye shapes, and pixel patterns.'),
          "url": "https://www.freeqrgen.pro/url-qr-generator"
        },
        {
          "@type": "HowToStep",
          "name": t('seo.schemaStep3Name', 'Embed Centerpiece Logo'),
          "text": t('seo.schemaStep3Text', 'Upload your brand logo or select standard social icons with High error correction settings.'),
          "url": "https://www.freeqrgen.pro/url-qr-generator"
        },
        {
          "@type": "HowToStep",
          "name": t('seo.schemaStep4Name', 'Export & Print Layout'),
          "text": t('seo.schemaStep4Text', 'Download the code as high-resolution PNG, or scalable vector SVG/PDF.'),
          "url": "https://www.freeqrgen.pro/url-qr-generator"
        }
      ]
    };
  };

  const buildSoftwareApplicationSchema = () => {
    return {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": t('seo.schemaSoftwareAppName', 'QR Code Analytics Hub - ') + pageData.h1,
      "operatingSystem": t('seo.schemaSoftwareOS', 'All Mobile, Tablet, and Desktop web browsers'),
      "applicationCategory": "DesignApplication, BusinessApplication",
      "offers": {
        "@type": "Offer",
        "price": "0.00",
        "priceCurrency": "USD"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.95",
        "reviewCount": "2490"
      }
    };
  };

  const buildBreadcrumbSchema = () => {
    const rootUrl = typeof window !== 'undefined' ? window.location.origin : 'https://qrcodeps.com';
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": t('seo.breadcrumbHome', 'Home'),
          "item": rootUrl
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": pageData.h1,
          "item": `${rootUrl}/${pageData.slug}`
        }
      ]
    };
  };

  // Fast trigger helper to load the active generator parameters in Creative station
  const handleCtaInitiation = () => {
    onInitiateGenerator({
      type: pageData.cta.typePreset as QRProject['type'],
      content: pageData.cta.defaultContent,
      name: pageData.cta.defaultName
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans tracking-normal selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Script tag injection for schemas */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFAQSchema()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildSoftwareApplicationSchema()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbSchema()) }} />
      {slug === 'url-qr-generator' && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildHowToSchema()) }} />
      )}

      {/* Hero Header Area */}
      <div className="relative pt-6 pb-20 border-b border-slate-200/60 bg-linear-to-b from-white via-slate-50/50 to-slate-100/20 px-6 overflow-hidden">
        
        {/* Subtle Decorative Accents */}
        <div className="absolute top-0 left-1/4 w-[350px] h-[350px] bg-indigo-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-pulse pointer-events-none" />
        <div className="absolute right-1/4 bottom-0 w-[300px] h-[300px] bg-purple-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse-slow pointer-events-none" />

        <div className="max-w-5xl mx-auto flex flex-col gap-8 relative z-10">
          
          {/* Breadcrumb row */}
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-widest leading-none select-none">
            <button 
              onClick={() => onSelectRoute('/')} 
              className="hover:text-indigo-600 transition-colors flex items-center gap-1 cursor-pointer font-semibold"
            >
              <Home className="w-3.5 h-3.5" />
              {t('seo.home', 'Home')}
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-slate-400">{t('seo.generators', 'Generators')}</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-bold tracking-tight">{pageData.keyword}</span>
          </nav>

          {/* Dynamic Return Anchor */}
          <div>
            <button
              onClick={() => onSelectRoute('/')}
              className="inline-flex items-center gap-2 text-xs text-indigo-600 hover:text-indigo-800 font-bold group cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              {t('seo.backToMainWorkshop', 'Back to Main Workshop')}
            </button>
          </div>

          {/* Core Intro Header Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center mt-2">
            <div className="md:col-span-8 flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100/50 px-3.5 py-1.5 rounded-full max-w-fit font-semibold text-indigo-700 text-xs">
                {getPageIcon()}
                <span className="text-[10px] tracking-wider uppercase font-black">{t('seo.freeService', '100% Free Service')}</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950 font-sans">
                {pageData.h1}
              </h1>

              <p className="text-base text-slate-700 leading-relaxed max-w-3xl">
                {pageData.intro.text1}
              </p>

              <p className="text-sm text-slate-500 leading-relaxed max-w-3xl">
                {pageData.intro.text2}
              </p>

              {/* Dynamic conversion alert banner */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center gap-4 border border-slate-800 shadow-md max-w-xl mt-2 select-none">
                <div className="w-10 h-10 bg-indigo-500 text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                  <Flame className="w-5 h-5 text-yellow-300" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest">{t('seo.aestheticOptimization', 'Aesthetic Optimization')}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{pageData.intro.highlight}</p>
                </div>
              </div>
            </div>

            {/* Simulated Live Preview Card sidebar with Glassmorphism UI */}
            <div className="md:col-span-4 flex flex-col gap-4 bg-white/60 p-5 rounded-3xl border border-slate-200/50 shadow-xl relative overflow-hidden backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-indigo-150 pb-2 text-slate-400 select-none">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider font-mono">{t('seo.livePresetSandbox', 'Live Preset Sandbox')}</span>
                <span className="text-[9px] bg-indigo-50/80 text-indigo-700 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">{t('seo.threeDActive', '3D ACTIVE')}</span>
              </div>
              
              <QR3DExperience />

              <button 
                onClick={handleCtaInitiation}
                className="w-full py-3.5 px-4 bg-indigo-600 text-white hover:bg-slate-950 text-xs font-bold rounded-2xl transition-all shadow-md shadow-indigo-200/30 flex items-center justify-center gap-2 group active:scale-[0.98] cursor-pointer"
              >
                {t('seo.launchBuilderFree', 'Launch Builder (Free)')}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Core Layout: Content Details Block */}
      <div className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="md:col-span-8 flex flex-col gap-12">
          
          {slug === 'url-qr-generator' ? (
            <URLQRContent onSelectRoute={onSelectRoute} />
          ) : (
            <>
              {/* Target H2: Benefits */}
              <section className="space-y-6">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-950">
                    {pageData.benefits.title}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 -mt-2">{pageData.benefits.desc}</p>
                <div className="grid grid-cols-1 gap-4 mt-4">
                  {pageData.benefits.items.map((benefit, i) => (
                    <div key={i} className="flex gap-4 p-5 bg-white rounded-2xl border border-slate-150 shadow-xs">
                      <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-xl max-h-fit shrink-0 mt-0.5">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{benefit.title}</h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{benefit.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Features Grid */}
              <section className="space-y-6">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                  <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-950">
                    {pageData.features.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 -mt-2">{pageData.features.desc}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  {pageData.features.items.map((feat, i) => (
                    <div key={i} className="p-5 bg-slate-50 border border-slate-200/60 rounded-2xl relative overflow-hidden shadow-xs hover:bg-white transition-colors duration-200">
                      <div className="w-1.5 h-full bg-indigo-500 absolute left-0 top-0" />
                      <h4 className="text-xs font-bold text-slate-900 pl-1">{feat.title}</h4>
                      <p className="text-[11px] text-slate-600 mt-2 pl-1 leading-relaxed">{feat.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* How It Works Numbers */}
              <section className="space-y-6">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                  <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-950">
                    {pageData.howItWorks.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 -mt-2">{pageData.howItWorks.desc}</p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
                  {pageData.howItWorks.steps.map((step, i) => (
                    <div key={i} className="flex flex-col gap-3 p-4 bg-white border border-slate-150 rounded-2xl shadow-3xs relative">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs select-none">
                        {step.step}
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-955 tracking-tight">{step.title}</h5>
                        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Use Cases */}
              <section className="space-y-6">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                  <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-950">
                    {pageData.useCases.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 -mt-2">{pageData.useCases.desc}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  {pageData.useCases.items.map((use, i) => (
                    <div key={i} className="p-5 bg-white border border-slate-200/60 rounded-2xl shadow-xs">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                        <Activity className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{use.title}</h4>
                      <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">{use.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Target H2: FAQs (interactive accordion) */}
              <section className="space-y-6">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-950">
                    {t('seo.questionsAboutOur', 'Questions About Our')} {pageData.h1}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 -mt-2">{t('seo.faqDescription', 'Review common queries from other digital marketers and developers regarding operations.')}</p>
                
                <div className="flex flex-col gap-3 mt-6">
                  {pageData.faqs.map((faq, idx) => {
                    const isOpen = openFaqIndex === idx;
                    return (
                      <div 
                        key={idx} 
                        className="bg-white border rounded-2xl shadow-3xs transition-all overflow-hidden"
                        style={{ borderColor: isOpen ? '#6366f1' : '#e2e8f0' }}
                      >
                        <button
                          type="button"
                          onClick={() => toggleFaq(idx)}
                          className="w-full text-left py-4 px-5 flex items-center justify-between gap-4 font-semibold text-xs text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer select-none"
                        >
                          <span className="flex items-center gap-2">
                            <HelpCircle className={`w-4 h-4 shrink-0 transition-colors ${isOpen ? 'text-indigo-600' : 'text-slate-400'}`} />
                            {faq.q}
                          </span>
                          {isOpen ? (
                            <ChevronUp className="w-4 h-4 text-indigo-600 shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                        </button>
                        
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-slate-100"
                            >
                              <div className="p-5 text-xs text-slate-600 leading-relaxed bg-slate-50/50">
                                {faq.a}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          )}

          {/* AEO / GEO Search Engine Optimization Knowledge Base Node */}
          {aeoData && (
            <section id="aeo-optimization-node" className="space-y-10 border-t border-slate-200/80 pt-10">
              
              {/* Header */}
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full text-slate-800 text-[10px] font-bold font-mono">
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  <span>{t('seo.geoHub', 'GENERATIVE ENGINE OPTIMIZATION (GEO) HUB')}</span>
                </div>
                <h2 className="text-2xl font-black tracking-tight text-slate-950 font-sans">
                  {t('seo.aiReferenceTitle', 'AI Reference & Citation Guide for {{keyword}}s', { keyword: pageData.keyword })}
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                  {t('seo.aiReferenceDesc', 'Structured technical specifications, best practices, and verified answers optimized for ingestion by conversational AI engines including Gemini, ChatGPT, Perplexity, and Google AI Overviews.')}
                </p>
              </div>

              {/* 1. Quick Definition & 2. 50-word AI Summary Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div id="quick-definition" className="p-5 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3 shadow-md">
                  <div className="flex items-center gap-2 text-indigo-400 font-mono text-[10px] uppercase font-bold tracking-wider">
                    <QrCode className="w-4 h-4" />
                    <span>{t('seo.quickDefinition', 'Quick Definition')}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-200">
                    {aeoData.quickDefinition}
                  </p>
                </div>

                <div id="ai-summary-50" className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100/60 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-700 font-mono text-[10px] uppercase font-bold tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>{t('seo.aiSummaryTitle', '50-Word AI Summary')}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-700 font-medium">
                    {aeoData.aiSummary50}
                  </p>
                </div>
              </div>

              {/* 12. AI Summary Box (Structured Metadata Table) */}
              <div id="ai-structured-metadata" className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-3xs">
                <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-indigo-600" />
                    {t('seo.entityKnowledgeGraph', 'Entity Knowledge Graph Attributes')}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{t('seo.schemaCompliant', 'SCHEMA.ORG COMPLIANT')}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 text-center font-mono text-[10px]">
                  <div className="p-4 space-y-1">
                    <span className="text-slate-400 block font-bold uppercase tracking-wider text-[8px]">{t('seo.entityType', 'Entity Type')}</span>
                    <span className="text-slate-800 block font-semibold">{aeoData.aiSummaryBox.entityType}</span>
                  </div>
                  <div className="p-4 space-y-1">
                    <span className="text-slate-400 block font-bold uppercase tracking-wider text-[8px]">{t('seo.protocolStandard', 'Protocol/Standard')}</span>
                    <span className="text-slate-800 block font-semibold truncate px-1" title={aeoData.aiSummaryBox.protocolStandard}>
                      {aeoData.aiSummaryBox.protocolStandard}
                    </span>
                  </div>
                  <div className="p-4 space-y-1">
                    <span className="text-slate-400 block font-bold uppercase tracking-wider text-[8px]">{t('seo.compatibility', 'Compatibility')}</span>
                    <span className="text-slate-800 block font-semibold">{aeoData.aiSummaryBox.clientCompatibility}</span>
                  </div>
                  <div className="p-4 space-y-1">
                    <span className="text-slate-400 block font-bold uppercase tracking-wider text-[8px]">{t('seo.primaryUseCase', 'Primary Use Case')}</span>
                    <span className="text-slate-800 block font-semibold">{aeoData.aiSummaryBox.primaryUseCase}</span>
                  </div>
                  <div className="p-4 space-y-1">
                    <span className="text-slate-400 block font-bold uppercase tracking-wider text-[8px]">{t('seo.offlineMode', 'Offline Mode')}</span>
                    <span className="text-slate-800 block font-semibold">{aeoData.aiSummaryBox.offlineCapability}</span>
                  </div>
                </div>
              </div>

              {/* 3. What is this QR Code & 4. When should you use it */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div id="what-is-this-qr" className="space-y-3">
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                    {t('seo.whatIsA', 'What is a {{keyword}}?', { keyword: pageData.keyword })}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {aeoData.whatIsIt}
                  </p>
                </div>

                <div id="when-should-you-use-it" className="space-y-3">
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                    {t('seo.whenShouldYouUse', 'When should you use this format?')}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {aeoData.whenToUse}
                  </p>
                </div>
              </div>

              {/* 5. Benefits, 6. Common mistakes, 7. Best practices */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Benefits */}
                <div id="aeo-benefits" className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    {t('seo.keyBenefitsAdvantages', 'Key Benefits & Advantages')}
                  </h4>
                  <ul className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
                    {aeoData.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Common mistakes */}
                <div id="aeo-mistakes" className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-rose-500" />
                    {t('seo.commonMistakesToAvoid', 'Common Mistakes to Avoid')}
                  </h4>
                  <ul className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
                    {aeoData.commonMistakes.map((mistake, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-500 shrink-0 font-bold select-none">✕</span>
                        <span>{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Best practices */}
                <div id="aeo-best-practices" className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-indigo-500" />
                    {t('seo.proImplementationBestPractices', 'Pro Implementation Best Practices')}
                  </h4>
                  <ul className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
                    {aeoData.bestPractices.map((practice, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-indigo-500 shrink-0 font-bold select-none">✓</span>
                        <span>{practice}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* 11. Key Takeaways Card */}
              <div id="key-takeaways" className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-4">
                <h4 className="text-xs font-bold text-slate-955 uppercase tracking-widest font-mono">
                  {t('seo.essentialTakeaways', 'Essential Takeaways & Technical Summary')}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {aeoData.keyTakeaways.map((takeaway, i) => (
                    <div key={i} className="p-4 bg-white rounded-xl border border-slate-150/60 shadow-3xs">
                      <span className="text-indigo-600 font-extrabold text-xs block mb-1">0{i+1}</span>
                      <p className="text-[11px] font-medium text-slate-700 leading-relaxed">
                        {takeaway}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 8. FAQs (Independently citable answer boxes) */}
              <div id="citable-faqs" className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  {t('seo.technicalReferenceFaq', 'Technical Reference & FAQ')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {aeoData.faqs.map((faq, i) => (
                    <div key={i} className="p-5 bg-white border border-slate-200/60 rounded-2xl shadow-xs space-y-2">
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">
                        {faq.q}
                      </h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 9. Related Guides */}
              <div id="related-guides" className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  {t('seo.relatedGuidesTitle', 'Related Technical Guides & Publications')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {aeoData.relatedGuides.map((guide, i) => (
                    <div key={i} className="p-5 bg-slate-50 border border-slate-150 rounded-2xl shadow-3xs flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{guide.title}</h4>
                        <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">
                          {guide.desc}
                        </p>
                      </div>
                      <span className="text-[9px] text-indigo-600 font-bold uppercase mt-3 hover:underline cursor-pointer">
                        {t('seo.readPublication', 'Read Publication →')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 10. Related Tools */}
              <div id="related-tools" className="space-y-3">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest font-mono">
                  {t('seo.complementaryQrCodes', 'COMPLEMENTARY QR CODES & UTILITIES')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {aeoData.relatedTools.map((tool, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onSelectRoute(`/${tool.slug}`)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-indigo-600 font-medium text-[11px] rounded-lg transition-colors shadow-3xs cursor-pointer"
                    >
                      {t('seo.toolIcon', '🛠️ ')}{tool.name}
                    </button>
                  ))}
                </div>
              </div>

            </section>
          )}

          {/* Internal linking directory box */}
          <section className="bg-slate-900 text-white rounded-3xl p-6 shadow-md border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 select-none">
              <QrCode className="w-4 h-4 text-indigo-400" />
              <h4 className="text-[11px] uppercase tracking-widest font-black text-slate-200">
                {t('seo.seoAuthorityTitle', 'SEO Authority and Authority Distribution Directories')}
              </h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {t('seo.seoAuthorityDesc', 'Explore our separate high-performance QR code generator landing pages tailored for business promotions, wireless network setups, visual socials discovery, and contactless restaurant menu builders below:')}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 select-none">
              {(Object.keys(landingPages)).map((key) => {
                const item = landingPages[key];
                const isActive = item.slug === pageData.slug;
                return (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => onSelectRoute(`/${item.slug}`)}
                    className={`text-left text-[11px] p-2.5 rounded-xl border transition-all cursor-pointer truncate ${
                      isActive 
                        ? 'bg-indigo-600 text-white border-indigo-500 font-extrabold shadow-sm' 
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {t('seo.rocketIcon', '🚀 ')}{item.h1}
                  </button>
                );
              })}
            </div>
          </section>

        </div>

        {/* Sidebar Conversion Helper Panel */}
        <div className="md:col-span-4 flex flex-col gap-6">

          {/* Star Trust Banner */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col gap-4 select-none text-center items-center">
            <div className="flex gap-1 text-amber-500">
              <Star className="w-4 h-4 fill-amber-500" />
              <Star className="w-4 h-4 fill-amber-500" />
              <Star className="w-4 h-4 fill-amber-500" />
              <Star className="w-4 h-4 fill-amber-500" />
              <Star className="w-4 h-4 fill-amber-500" />
            </div>
            <p className="text-[11px] font-semibold text-slate-800 leading-normal">
              {t('seo.trustedBy', 'Trusted by over 2490+ creative modern businesses, dining rooms, and local wifi managers globally for styling QR presets.')}
            </p>
            <div className="flex gap-3 text-[10px] text-slate-500 font-mono font-bold">
              <span>{t('seo.uprate', '99.9% Up-rate')}</span>
              <span>•</span>
              <span>{t('seo.ultraHdScalable', 'Ultra HD Scalable')}</span>
            </div>
          </div>

          {/* Sidebar convert widget */}
          <div className="bg-linear-to-br from-indigo-900 to-purple-950 text-white p-6 rounded-3xl shadow-xl flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full filter blur-2xl" />
            <h4 className="text-lg font-black tracking-tight">{pageData.cta.title}</h4>
            <p className="text-xs text-indigo-200 leading-relaxed">{pageData.cta.subtitle}</p>
            
            <button 
              onClick={handleCtaInitiation}
              className="py-3 px-4 bg-white text-indigo-955 hover:bg-slate-950 hover:text-white text-xs font-bold rounded-xl transition-all shadow-md mt-4 flex items-center justify-center gap-2 group cursor-pointer"
            >
              {pageData.cta.buttonText}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <span className="text-[9px] text-indigo-300 text-center uppercase tracking-widest font-mono select-none">{t('seo.noLoginsRequired', 'No logins required to start')}</span>
          </div>

          {/* Secure Trust features badge */}
          <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-3xl space-y-3 font-mono">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-[10px] tracking-wider uppercase">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{t('seo.pristineSecurityStandards', 'Pristine Security Standards')}</span>
            </div>
            <ul className="text-[10px] text-slate-500 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                {t('seo.securityFeature1', 'No credentials are ever transmitted to any remote servers. Only you see standard details.')}
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                {t('seo.securityFeature2', 'Error correction checks keep your codes parseable if scratched.')}
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                {t('seo.securityFeature3', 'Supports PNG rasterizers, standard vector SVGs, and vector PDFs.')}
              </li>
            </ul>
          </div>

        </div>
      </div>

    </div>
  );
}