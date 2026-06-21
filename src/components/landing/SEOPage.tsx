import React, { useState, useEffect } from 'react';
import { landingPages, LandingPageData } from './SEODatabase';
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
import QR3DExperience from '../QR3DExperience';

interface SEOPageProps {
  slug: string;
  onSelectRoute: (path: string) => void;
  onInitiateGenerator: (preset: {
    type: QRProject['type'];
    content: string;
    name: string;
  }) => void;
}

export default function SEOPage({ slug, onSelectRoute, onInitiateGenerator }: SEOPageProps) {
  const pageData = landingPages[slug];
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
    }
  }, [pageData]);

  if (!pageData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-xl font-bold text-gray-900">SEO Page Not Found</h1>
        <p className="text-xs text-gray-400 mt-2">The requested landing page route configuration could not be loaded.</p>
        <button 
          onClick={() => onSelectRoute('/')} 
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
        >
          Return to Dashboard
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
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": pageData.faqs.map(item => ({
        "@type": "Question",
        "name": item.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.a
        }
      }))
    };
  };

  const buildSoftwareApplicationSchema = () => {
    return {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "QR Code Analytics Hub - " + pageData.h1,
      "operatingSystem": "All Mobile, Tablet, and Desktop web browsers",
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
          "name": "Home",
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
              Home
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-slate-400">Generators</span>
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
              Back to Main Workshop
            </button>
          </div>

          {/* Core Intro Header Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center mt-2">
            <div className="md:col-span-8 flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100/50 px-3.5 py-1.5 rounded-full max-w-fit font-semibold text-indigo-700 text-xs">
                {getPageIcon()}
                <span className="text-[10px] tracking-wider uppercase font-black">100% Free Service</span>
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
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest">Aesthetic Optimization</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{pageData.intro.highlight}</p>
                </div>
              </div>
            </div>

            {/* Simulated Live Preview Card sidebar with Glassmorphism UI */}
            <div className="md:col-span-4 flex flex-col gap-4 bg-white/60 p-5 rounded-3xl border border-slate-200/50 shadow-xl relative overflow-hidden backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-indigo-150 pb-2 text-slate-400 select-none">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider font-mono">Live Preset Sandbox</span>
                <span className="text-[9px] bg-indigo-50/80 text-indigo-700 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">3D ACTIVE</span>
              </div>
              
              <QR3DExperience />

              <button 
                onClick={handleCtaInitiation}
                className="w-full py-3.5 px-4 bg-indigo-600 text-white hover:bg-slate-900 text-xs font-bold rounded-2xl transition-all shadow-md shadow-indigo-200/30 flex items-center justify-center gap-2 group active:scale-[0.98] cursor-pointer"
              >
                Launch Builder (Free)
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Core Layout: Content Details Block */}
      <div className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="md:col-span-8 flex flex-col gap-12">
          
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
                    <h5 className="text-xs font-bold text-slate-950 tracking-tight">{step.title}</h5>
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
                Questions About Our Free {pageData.h1}
              </h2>
            </div>
            <p className="text-xs text-slate-500 -mt-2">Review common queries from other digital marketers and developers regarding operations.</p>
            
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

          {/* Internal linking directory box */}
          <section className="bg-slate-900 text-white rounded-3xl p-6 shadow-md border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 select-none">
              <QrCode className="w-4 h-4 text-indigo-400" />
              <h4 className="text-[11px] uppercase tracking-widest font-black text-slate-200">
                SEO Authority and Authority Distribution Directories
              </h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Explore our separate high-performance QR code generator landing pages tailored for business promotions, wireless network setups, visual socials discovery, and contactless restaurant menu builders below:
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
                    🚀 {item.h1}
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
              Trusted by over 2490+ creative modern businesses, dining rooms, and local wifi managers globally for styling QR presets.
            </p>
            <div className="flex gap-3 text-[10px] text-slate-500 font-mono font-bold">
              <span>99.9% Up-rate</span>
              <span>•</span>
              <span>Ultra HD Scalable</span>
            </div>
          </div>

          {/* Sidebar convert widget */}
          <div className="bg-linear-to-br from-indigo-900 to-purple-950 text-white p-6 rounded-3xl shadow-xl flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full filter blur-2xl" />
            <h4 className="text-lg font-black tracking-tight">{pageData.cta.title}</h4>
            <p className="text-xs text-indigo-200 leading-relaxed">{pageData.cta.subtitle}</p>
            
            <button 
              onClick={handleCtaInitiation}
              className="py-3 px-4 bg-white text-indigo-950 hover:bg-slate-950 hover:text-white text-xs font-bold rounded-xl transition-all shadow-md mt-4 flex items-center justify-center gap-2 group cursor-pointer"
            >
              {pageData.cta.buttonText}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <span className="text-[9px] text-indigo-300 text-center uppercase tracking-widest font-mono select-none">No logins required to start</span>
          </div>

          {/* Secure Trust features badge */}
          <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-3xl space-y-3 font-mono">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-[10px] tracking-wider uppercase">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Prisine Security Standards</span>
            </div>
            <ul className="text-[10px] text-slate-500 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                No credentials are ever transmitted to any remote servers. Only you see standard details.
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                Error correction checks keep your codes parseable if scratched.
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                Supports PNG rasterizers, standard vector SVGs, and vector PDFs.
              </li>
            </ul>
          </div>

        </div>
      </div>

    </div>
  );
}
