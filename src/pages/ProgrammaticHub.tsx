import React, { useState, useEffect } from 'react';
import ScrollableTabContainer from '../components/ScrollableTabContainer';
import { 
  ChevronRight, Home, Zap, ArrowRight, Check, HelpCircle, 
  ChevronDown, BookOpen, LayoutTemplate, Star, Info, Cpu, 
  ShieldCheck, AlertTriangle, FileText, Search, Printer, Palette, 
  ArrowUpRight, Share2, Eye, Award, CheckCircle2, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  industriesData, 
  solutionsData, 
  useCasesData, 
  fallbackIndustries, 
  getBespokeProfile, 
  getSeoIcon, 
  SEOProfile 
} from '../data/programmaticSEOData';
import { knowledgeArticles } from '../data/knowledgeData';
import { templatePages } from '../data/templatePagesData';
import { useTranslation } from '../utils/i18n';

interface ProgrammaticHubProps {
  section: 'solutions' | 'industries' | 'use-cases';
  initialSlug: string | null;
  onNavigate: (path: string) => void;
  onInitiateGenerator: (preset: { type: any; content: string; name: string }) => void;
  locale?: string;
}

export default function ProgrammaticHub({
  section,
  initialSlug,
  onNavigate,
  onInitiateGenerator,
  locale = 'en'
}: ProgrammaticHubProps) {
  const { t } = useTranslation();
  const [activeSlug, setActiveSlug] = useState<string | null>(initialSlug);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryTab, setActiveCategoryTab] = useState<'all' | 'hospitality' | 'medical' | 'education' | 'professional' | 'industrial'>('all');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Sync state when URL slug changes
  useEffect(() => {
    setActiveSlug(initialSlug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setOpenFaqIndex(null);
  }, [initialSlug, section]);

  // Load active profile data depending on current segment
  const getActiveProfile = (): SEOProfile | null => {
    if (!activeSlug) return null;

    if (section === 'industries') {
      const rawProfile = getBespokeProfile(activeSlug);
      return {
        ...rawProfile,
        name: t('programmatic.industry.' + rawProfile.slug + '.name', rawProfile.name),
        badge: t('programmatic.industry.' + rawProfile.slug + '.badge', rawProfile.badge),
        metaTitle: t('programmatic.industry.' + rawProfile.slug + '.metaTitle', rawProfile.metaTitle),
        metaDesc: t('programmatic.industry.' + rawProfile.slug + '.metaDesc', rawProfile.metaDesc),
        whyQRHelps: t('programmatic.industry.' + rawProfile.slug + '.whyQRHelps', rawProfile.whyQRHelps),
        challenges: rawProfile.challenges.map((c, i) => t('programmatic.industry.' + rawProfile.slug + '.challenges.' + i, c)),
        workflow: rawProfile.workflow.map((w, i) => t('programmatic.industry.' + rawProfile.slug + '.workflow.' + i, w)),
        practices: rawProfile.practices.map((p, i) => t('programmatic.industry.' + rawProfile.slug + '.practices.' + i, p)),
        mistakes: rawProfile.mistakes.map((m, i) => t('programmatic.industry.' + rawProfile.slug + '.mistakes.' + i, m)),
        faq: rawProfile.faq.map((f, i) => ({
          q: t('programmatic.industry.' + rawProfile.slug + '.faq.' + i + '.q', f.q),
          a: t('programmatic.industry.' + rawProfile.slug + '.faq.' + i + '.a', f.a)
        })),
        caseStudy: {
          title: t('programmatic.industry.' + rawProfile.slug + '.caseStudy.title', rawProfile.caseStudy.title),
          metric: t('programmatic.industry.' + rawProfile.slug + '.caseStudy.metric', rawProfile.caseStudy.metric),
          result: t('programmatic.industry.' + rawProfile.slug + '.caseStudy.result', rawProfile.caseStudy.result)
        }
      };
    }

    if (section === 'solutions') {
      const sol = solutionsData.find(s => s.slug === activeSlug);
      if (sol) {
        return {
          slug: sol.slug,
          name: sol.name,
          badge: sol.badge,
          iconName: 'Zap',
          metaTitle: sol.metaTitle,
          metaDesc: sol.metaDesc,
          heroGradient: 'from-indigo-600 to-purple-800',
          challenges: [
            t('programmatic.challenge1', 'Organizations struggle with manual process handovers, paper waste, and data transcription errors.'),
            t('programmatic.challenge2', 'Physical customer interaction barriers that slow down checkouts and digital sign-ups.'),
            t('programmatic.challenge3', 'Zero analytics coverage or user-consent triggers on physical print media.')
          ],
          whyQRHelps: t('programmatic.whyQRHelpsSolutions', 'Deploying our customized contactless {{name}} enables teams to instantly bridge physical touchpoints to secure online portals, elevating service velocity and capturing telemetry safely.', { name: sol.name }),
          workflow: [
            t('programmatic.workflowStep1', 'Diner, client, or attendee notices the labeled dynamic QR barcode.'),
            t('programmatic.workflowStep2', 'They scan with a native camera, opening direct portals or automated vCards.'),
            t('programmatic.workflowStep3', 'The administrator monitors scanning locations, browsers, and timeline graphs in the app dashboard.')
          ],
          practices: [
            t('programmatic.practicesStep1', 'Insert clear visual call-to-action rings around your QR code.'),
            t('programmatic.practicesStep2', 'Download vector formats like SVG or PDF to enable flawless high-resolution printing.'),
            t('programmatic.practicesStep3', 'Ensure the target destination URL is optimized for fast mobile rendering.')
          ],
          mistakes: [
            t('programmatic.mistakesStep1', 'Relying on direct heavy PDF files instead of smart dynamic redirects.'),
            t('programmatic.mistakesStep2', 'Using low-contrast light foreground colors like yellow or silver.'),
            t('programmatic.mistakesStep3', 'Placing printed codes in low-lighting or highly reflective areas.')
          ],
          faq: [
            { q: t('programmatic.faqQ1Solutions', 'What is the scanning limit for this {{name}} QR code?', { name: sol.name }), a: t('programmatic.faqA1Solutions', 'All QR codes generated on FreeQRGen.pro feature infinite scans and do not carry hidden expirations or click caps.') },
            { q: t('programmatic.faqQ2Solutions', 'Can I swap the target URL after printing the code?'), a: t('programmatic.faqA2Solutions', 'Yes. If you save the design with dynamic tracking active, you can redirect visitors to updated links instantly without changing the matrix layout.') }
          ],
          caseStudy: {
            title: t('programmatic.caseStudyTitleSolutions', '{{name}} Enterprise Deployment', { name: sol.name }),
            metric: t('programmatic.caseStudyMetricSolutions', '41% increase in visitor conversions'),
            result: t('programmatic.caseStudyResultSolutions', 'Replacing old offline friction steps with responsive barcode shortcuts automated onboarding, raising client metrics.')
          }
        };
      }
    }

    if (section === 'use-cases') {
      const uc = useCasesData.find(u => u.slug === activeSlug);
      if (uc) {
        return {
          slug: uc.slug,
          name: uc.name,
          badge: uc.badge,
          iconName: 'Cpu',
          metaTitle: uc.metaTitle,
          metaDesc: uc.metaDesc,
          heroGradient: 'from-violet-600 to-indigo-800',
          challenges: [
            t('programmatic.useCasesChallenge1', 'High friction steps that prevent users from manually typing complex web links.'),
            t('programmatic.useCasesChallenge2', 'Wasted paper print resources and high brochure printing overheads.'),
            t('programmatic.useCasesChallenge3', 'Lack of conversion metrics from standard offline displays.')
          ],
          whyQRHelps: t('programmatic.whyQRHelpsUseCases', 'Integrating our automated {{name}} barcode allows users to instantly connect in-store displays and outdoor signs directly to interactive menus, forms, or maps, with zero input delays.', { name: uc.name }),
          workflow: [
            t('programmatic.useCasesWorkflowStep1', 'Visitor views the high-contrast printed check-in QR decal on location.'),
            t('programmatic.useCasesWorkflowStep2', 'They capture the visual target, instantly launching local guest settings or PDF guides.'),
            t('programmatic.useCasesWorkflowStep3', 'Your backend monitors total scanners and traffic sources from a single workspace.')
          ],
          practices: [
            t('programmatic.useCasesPracticesStep1', 'Select a minimum size of 2cm x 2cm for small items, and scale up for banners.'),
            t('programmatic.useCasesPracticesStep2', 'Include high contrast colors like deep charcoal and crisp white backgrounds.'),
            t('programmatic.useCasesPracticesStep3', 'Preserve clean white borders around the outer edges of the code.')
          ],
          mistakes: [
            t('programmatic.useCasesMistakesStep1', 'Directing visitors to static web pages that do not match mobile viewports.'),
            t('programmatic.useCasesMistakesStep2', 'Using fuzzy, low-resolution PNG screenshots instead of clean vector files.'),
            t('programmatic.useCasesMistakesStep3', 'Not testing the printed code across different smartphone models before publishing.')
          ],
          faq: [
            { q: t('programmatic.useCasesFaqQ1', 'How do I print this QR code for this {{name}} setup?', { name: uc.name }), a: t('programmatic.useCasesFaqA1', 'We recommend exporting in SVG or PDF format, then sending the file directly to high-quality print services to prevent blurred details.') },
            { q: t('programmatic.useCasesFaqQ2', 'Is there any hidden cost or registration required?'), a: t('programmatic.useCasesFaqA2', 'No. FreeQRGen.pro is 100% free with unlimited generation and secure cloud options.') }
          ],
          caseStudy: {
            title: t('programmatic.useCasesCaseStudyTitle', '{{name}} Implementation', { name: uc.name }),
            metric: t('programmatic.useCasesCaseStudyMetric', '3.2x faster visitor onboarding'),
            result: t('programmatic.useCasesCaseStudyResult', 'Transitioning from physical spreadsheets to high-contrast mobile scanning shortened processing queues and improved user experiences.')
          }
        };
      }
    }

    return null;
  };

  const activeProfile = getActiveProfile();

  // Dynamic schema injection
  useEffect(() => {
    if (!activeProfile) {
      // General section schema
      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": t('programmatic.home', 'Home'), "item": "https://www.freeqrgen.pro/" },
          { "@type": "ListItem", "position": 2, "name": section === 'solutions' ? t('programmatic.solutions', 'Solutions') : section === 'use-cases' ? t('programmatic.useCases', 'Use Cases') : t('programmatic.industries', 'Industries'), "item": `https://www.freeqrgen.pro/${section}` }
        ]
      };

      const scriptId = `seo-schema-hub-${section}`;
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

    // Detail schemas: FAQPage, HowTo, Article, WebPage, and Organization
    const canonicalUrl = `https://www.freeqrgen.pro/${section}/${activeProfile.slug}`;
    
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": t('programmatic.home', 'Home'), "item": "https://www.freeqrgen.pro/" },
        { "@type": "ListItem", "position": 2, "name": section === 'solutions' ? t('programmatic.solutions', 'Solutions') : section === 'use-cases' ? t('programmatic.useCases', 'Use Cases') : t('programmatic.industries', 'Industries'), "item": `https://www.freeqrgen.pro/${section}` },
        { "@type": "ListItem", "position": 3, "name": activeProfile.name, "item": canonicalUrl }
      ]
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": activeProfile.faq.map(f => ({
        "@type": "Question",
        "name": f.q,
        "acceptedAnswer": { "@type": "Answer", "text": f.a }
      }))
    };

    const howToSchema = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": t('programmatic.howToSetupTitle', 'How to Setup a QR Code for {{name}}', { name: activeProfile.name }),
      "description": activeProfile.metaDesc,
      "step": activeProfile.workflow.map((step, idx) => ({
        "@type": "HowToStep",
        "position": idx + 1,
        "name": t('programmatic.stepNum', 'Step {{num}}: Implementation', { num: idx + 1 }),
        "text": step
      }))
    };

    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": activeProfile.metaTitle,
      "description": activeProfile.metaDesc,
      "image": "https://www.freeqrgen.pro/og-image.jpg",
      "author": {
        "@type": "Organization",
        "name": t('programmatic.authorName', 'FreeQRGen.pro Editorial Board')
      },
      "publisher": {
        "@type": "Organization",
        "name": t('programmatic.publisherName', 'Free QR Code Generator Inc.'),
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.freeqrgen.pro/favicon-32x32.png"
        }
      },
      "mainEntityOfPage": canonicalUrl
    };

    const scriptId = `seo-schema-profile-${activeProfile.slug}`;
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.text = JSON.stringify({
      "@graph": [breadcrumbSchema, faqSchema, howToSchema, articleSchema]
    });

    return () => {
      const existing = document.getElementById(scriptId);
      if (existing) existing.remove();
    };
  }, [activeProfile, section]);

  // Handle active preset triggers inside generator
  const handleActivatePreset = () => {
    if (!activeProfile) return;
    
    let typePreset: any = 'url';
    let defaultContent = `https://www.freeqrgen.pro/?ref=${activeProfile.slug}`;
    let defaultName = t('programmatic.presetDefaultName', '{{name}} Campaign QR', { name: activeProfile.name });

    if (activeProfile.slug === 'wifi-guest-onboarding' || activeProfile.slug === 'office-lobby-wifi') {
      typePreset = 'wifi';
      defaultContent = 'WIFI:S:GuestNetwork;T:WPA;P:GuestPassword123;;';
    } else if (activeProfile.slug === 'digital-business-card') {
      typePreset = 'card';
      defaultContent = 'BEGIN:VCARD\nFN:John Doe\nORG:Enterprise\nTEL:1234567\nEMAIL:john@example.com\nEND:VCARD';
    } else if (activeProfile.slug === 'app-download-marketing') {
      typePreset = 'app';
      defaultContent = JSON.stringify({ ios: 'https://apps.apple.com', android: 'https://play.google.com', fallback: 'https://www.freeqrgen.pro' });
    } else if (activeProfile.slug === 'restaurant' || activeProfile.slug === 'cafe') {
      typePreset = 'url';
      defaultContent = `https://www.freeqrgen.pro/menu-demo`;
    }

    onInitiateGenerator({
      type: typePreset,
      content: defaultContent,
      name: defaultName
    });

    // Scroll to the generator top slowly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get dynamic collections for directory view
  const getSectionItems = () => {
    if (section === 'solutions') return solutionsData;
    if (section === 'use-cases') return useCasesData;
    
    // For industries, merge predefined 6 structured industries with the remaining 34 fallback items
    const structuredSlugs = industriesData.map(i => i.slug);
    const combined = [...industriesData];
    
    fallbackIndustries.forEach(name => {
      const slug = name.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and');
      if (!structuredSlugs.includes(slug)) {
        combined.push(getBespokeProfile(slug));
      }
    });

    return combined;
  };

  const allItems = getSectionItems();

  const getCategoryClass = (itemBadge: string): string => {
    const b = itemBadge.toLowerCase();
    if (['hospitality', 'food'].includes(b)) return 'hospitality';
    if (['medical', 'wellness', 'health'].includes(b)) return 'medical';
    if (['education', 'school'].includes(b)) return 'education';
    if (['professional', 'corporate', 'seo', 'marketing'].includes(b)) return 'professional';
    if (['industrial', 'property', 'utilities', 'development'].includes(b)) return 'industrial';
    return 'professional';
  };

  const filteredItems = allItems.filter(item => {
    const matchesCategory = activeCategoryTab === 'all' || getCategoryClass(item.badge) === activeCategoryTab;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.badge.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'all': return t('programmatic.tabAll', 'All');
      case 'hospitality': return t('programmatic.tabHospitality', 'Hospitality');
      case 'medical': return t('programmatic.tabMedical', 'Medical');
      case 'education': return t('programmatic.tabEducation', 'Education');
      case 'professional': return t('programmatic.tabProfessional', 'Professional');
      case 'industrial': return t('programmatic.tabIndustrial', 'Industrial');
      default: return tab;
    }
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen text-slate-800 antialiased selection:bg-indigo-600 selection:text-white pb-24" id="programmatic-seo-hub">
      {/* Dynamic Subpage / Detail View */}
      {activeProfile ? (
        <div className="w-full">
          {/* Hero Banner Section */}
          <div className={`relative overflow-hidden bg-gradient-to-br ${activeProfile.heroGradient} text-white py-16 px-4 md:px-8 shadow-inner`}>
            {/* Background elements */}
            <div className="absolute inset-0 bg-grid-white/[0.04] mask-image-linear" />
            <div className="absolute top-1/4 right-10 w-96 h-96 bg-white/[0.07] rounded-full blur-3xl" />
            
            <div className="max-w-6xl mx-auto relative z-10">
              {/* Breadcrumbs */}
              <nav className="flex items-center gap-2 text-xs text-white/70 mb-6 font-medium">
                <button onClick={() => onNavigate('/')} className="hover:text-white transition-colors flex items-center gap-1">
                  <Home className="w-3.5 h-3.5" />
                  {t('programmatic.home', 'Home')}
                </button>
                <ChevronRight className="w-3 h-3 text-white/40" />
                <button onClick={() => onNavigate(`/${section}`)} className="hover:text-white transition-colors uppercase tracking-wider">
                  {section === 'solutions' ? t('programmatic.solutions', 'Solutions') : section === 'use-cases' ? t('programmatic.useCases', 'Use Cases') : t('programmatic.industries', 'Industries')}
                </button>
                <ChevronRight className="w-3 h-3 text-white/40" />
                <span className="text-white font-bold truncate">{activeProfile.name}</span>
              </nav>

              {/* Badges */}
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-white/10 backdrop-blur-md text-white border border-white/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  {activeProfile.badge}
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 animate-pulse">
                  <Star className="w-2.5 h-2.5 fill-emerald-300" />
                  {t('programmatic.topicalAuthorityVerified', 'Topical Authority verified')}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight uppercase font-sans mb-4 max-w-4xl">
                {t('programmatic.qrCodesFor', 'QR Codes for')}{' '}
                <span className="underline decoration-indigo-400 decoration-wavy underline-offset-4">{activeProfile.name}</span>
              </h1>
              
              <p className="text-base md:text-lg text-white/80 max-w-2xl leading-relaxed font-normal mb-8">
                {activeProfile.metaDesc}
              </p>

              {/* CTA Launcher */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  onClick={handleActivatePreset}
                  className="px-6 py-4 bg-white text-indigo-950 hover:bg-slate-100 active:scale-[0.98] transition-all rounded-xl font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-lg shadow-black/10 cursor-pointer"
                >
                  <Cpu className="w-4 h-4 text-indigo-600 animate-spin" />
                  {t('programmatic.launchCreator', 'Launch {{name}} Creator', { name: activeProfile.name })}
                </button>
                <button
                  onClick={() => onNavigate(`/${section}`)}
                  className="px-5 py-4 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl font-bold text-xs flex items-center justify-center gap-2 text-white transition-colors cursor-pointer"
                >
                  {t('programmatic.viewDirectory', 'View Directory')}
                </button>
              </div>
            </div>
          </div>

          {/* Core Content Grid */}
          <div className="max-w-6xl mx-auto px-4 md:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Content Column (Main body) */}
            <div className="lg:col-span-2 space-y-12">
              
              {/* Section 2: Industry Challenges */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-2xs">
                <h3 className="text-xs uppercase tracking-widest text-indigo-600 font-black mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  {t('programmatic.keyOperationalBottlenecks', 'Key Operational Bottlenecks')}
                </h3>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mb-4">
                  {t('programmatic.challengesFacedBy', 'The Challenges Faced by Modern {{name}} Administrations', { name: activeProfile.name })}
                </h2>
                <ul className="space-y-4">
                  {activeProfile.challenges.map((challenge, idx) => (
                    <li key={idx} className="flex gap-3 text-slate-600 leading-relaxed text-sm">
                      <span className="w-6 h-6 rounded-full bg-red-50 text-red-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-red-100">
                        {idx + 1}
                      </span>
                      <span>{challenge}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section 3: Why QR Codes Help */}
              <div className="bg-indigo-900 text-white rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.03]" />
                <h3 className="text-xs uppercase tracking-widest text-indigo-300 font-black mb-3 flex items-center gap-1.5 relative z-10">
                  <Zap className="w-4 h-4 text-indigo-300" />
                  {t('programmatic.theDigitalBridgeSolution', 'The Digital Bridge solution')}
                </h3>
                <h2 className="text-xl md:text-2xl font-black tracking-tight mb-4 relative z-10">
                  {t('programmatic.whyQrCodesAreTransforming', 'Why QR Codes are Transforming {{name}}', { name: activeProfile.name })}
                </h2>
                <p className="text-slate-200 text-sm md:text-base leading-relaxed relative z-10">
                  {activeProfile.whyQRHelps}
                </p>
              </div>

              {/* Section 4: Workflow Diagram */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-2xs">
                <h3 className="text-xs uppercase tracking-widest text-indigo-600 font-black mb-6 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-indigo-600" />
                  {t('programmatic.interactiveWorkflowDiagram', 'Interactive Workflow Diagram')}
                </h3>
                
                {/* Visual steps connection line */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                  {activeProfile.workflow.map((step, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-100 rounded-xl p-5 relative flex flex-col gap-3 group hover:border-indigo-100 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md">
                        {idx + 1}
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                        {idx === 0 ? t('programmatic.discoveryPhase', 'Discovery Phase') : idx === 1 ? t('programmatic.opticalScan', 'Optical Scan') : t('programmatic.instantAction', 'Instant Action')}
                      </h4>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 5: Best Practices vs Mistakes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-6">
                  <h3 className="text-xs uppercase tracking-widest text-emerald-700 font-black mb-4 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {t('programmatic.bestPracticesDoThis', 'Best Practices (Do This)')}
                  </h3>
                  <ul className="space-y-3">
                    {activeProfile.practices.map((item, idx) => (
                      <li key={idx} className="flex gap-2.5 text-slate-600 text-xs leading-relaxed">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-red-50/40 border border-red-100 rounded-2xl p-6">
                  <h3 className="text-xs uppercase tracking-widest text-red-700 font-black mb-4 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    {t('programmatic.commonPitfallsAvoid', 'Common Pitfalls (Avoid)')}
                  </h3>
                  <ul className="space-y-3">
                    {activeProfile.mistakes.map((item, idx) => (
                      <li key={idx} className="flex gap-2.5 text-slate-600 text-xs leading-relaxed">
                        <span className="text-red-500 font-black text-xs select-none shrink-0 mt-0.5">✕</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Section 6: Printable Guide & Checklist */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.02]" />
                <div className="absolute top-0 right-0 p-4 bg-indigo-600/25 border-b border-l border-white/10 text-[9px] font-black uppercase tracking-widest font-mono">
                  {t('programmatic.printersGuidelines', 'Printers Guidelines')}
                </div>
                
                <h3 className="text-xs uppercase tracking-widest text-indigo-400 font-black mb-4 flex items-center gap-1.5">
                  <Printer className="w-4 h-4 text-indigo-400" />
                  {t('programmatic.physicalPrintingAndMediaGuidelines', 'Physical Printing & Media Guidelines')}
                </h3>
                <h2 className="text-lg md:text-xl font-bold tracking-tight mb-4">
                  {t('programmatic.technicalChecklistFor', 'Technical Checklist for physical {{name}} decals', { name: activeProfile.name })}
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
                  <div className="flex gap-2 items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-1.5" />
                    <span><strong>{t('programmatic.scaleBounds', 'Scale bounds')}</strong>: {t('programmatic.scaleBoundsDesc', 'Ensure a minimum printable size of 20mm x 20mm for menu sheets, and over 1.2m width for outdoor banners.')}</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-1.5" />
                    <span><strong>{t('programmatic.redundancySelection', 'Redundancy selection')}</strong>: {t('programmatic.redundancySelectionDesc', 'Prefer Error Correction Level Q (25%) or H (30%) to resist grease spills and scratch damage.')}</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-1.5" />
                    <span><strong>{t('programmatic.colorContrastRules', 'Color Contrast rules')}</strong>: {t('programmatic.colorContrastRulesDesc', 'Keep the barcode module dark (#000000 or deep indigo) printed on pristine white backdrops.')}</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-1.5" />
                    <span><strong>{t('programmatic.textureFinish', 'Texture finish')}</strong>: {t('programmatic.textureFinishDesc', 'Print with non-glare matte finishes. Avoid highly reflective glass laminations.')}</span>
                  </div>
                </div>
              </div>

              {/* Section 7: FAQs Accordion */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-2xs">
                <h3 className="text-xs uppercase tracking-widest text-indigo-600 font-black mb-6 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-indigo-600" />
                  {t('programmatic.frequentlyAskedQuestions', 'Frequently Asked Questions')}
                </h3>
                
                <div className="space-y-4">
                  {activeProfile.faq.map((faq, idx) => {
                    const isOpen = openFaqIndex === idx;
                    return (
                      <div key={idx} className="border-b border-slate-100 pb-4">
                        <button
                          onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                          className="w-full flex items-center justify-between gap-4 text-left font-bold text-slate-900 text-sm hover:text-indigo-600 transition-colors py-1 cursor-pointer"
                        >
                          <span>{faq.q}</span>
                          <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-600' : 'text-slate-400'}`} />
                        </button>
                        
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1, transition: { duration: 0.25 } }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <p className="text-xs text-slate-500 leading-relaxed mt-2 pl-1 border-l-2 border-indigo-100">
                                {faq.a}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Right Side Column (SEO & Metrics Sidebar) */}
            <div className="space-y-6">
              
              {/* Case Study Card */}
              <div className="bg-gradient-to-br from-indigo-950 to-slate-950 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl" />
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-indigo-500/20 text-indigo-300 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-indigo-500/30">
                    {t('programmatic.realCaseStudy', 'Real Case Study')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">{t('programmatic.sector', '{{name}} sector', { name: activeProfile.name })}</span>
                </div>
                
                <h3 className="font-extrabold text-sm text-slate-100 mb-2">
                  {activeProfile.caseStudy.title}
                </h3>
                
                <div className="text-3xl font-black text-emerald-400 tracking-tight mb-2 font-mono">
                  {activeProfile.caseStudy.metric}
                </div>
                
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeProfile.caseStudy.result}
                </p>
              </div>

              {/* Recommended QR Type Box */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
                <h3 className="font-black text-xs text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                  {t('programmatic.recommendedQrConfigurations', 'Recommended QR configurations')}
                </h3>
                
                <div className="space-y-4">
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs uppercase tracking-tight">{t('programmatic.dynamicUrlBarcode', 'Dynamic URL Barcode')}</h4>
                      <p className="text-slate-500 text-[10px] leading-relaxed mt-0.5">
                        {t('programmatic.dynamicUrlBarcodeDesc', 'Enables price editing, metrics telemetry tracking, and dynamic link expirations instantly.')}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Palette className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs uppercase tracking-tight">{t('programmatic.customCenterpieceLogo', 'Custom Centerpiece Logo')}</h4>
                      <p className="text-slate-500 text-[10px] leading-relaxed mt-0.5">
                        {t('programmatic.customCenterpieceLogoDesc', 'Build user-trust by overlaying a branded logo inside the center of the barcode grid layout.')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Related Internal Articles / Templates */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
                <h3 className="font-black text-xs text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                  {t('programmatic.relatedKnowledgeGuides', 'Related Knowledge guides')}
                </h3>
                
                <div className="space-y-3">
                  {knowledgeArticles.slice(0, 3).map((article) => (
                    <button
                      key={article.slug}
                      onClick={() => onNavigate(`/guides?slug=${article.slug}`)}
                      className="w-full text-left group flex items-start justify-between gap-3 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="min-w-0">
                        <span className="block text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                          {article.title}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5 font-mono">
                          {t('programmatic.guidesTagWithTime', 'GUIDES // {{time}}', { time: article.readingTime })}
                        </span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5 mt-0.5 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Related Templates List */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
                <h3 className="font-black text-xs text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <LayoutTemplate className="w-3.5 h-3.5 text-slate-500" />
                  {t('programmatic.printableTemplates', 'Printable Templates')}
                </h3>
                
                <div className="space-y-3">
                  {templatePages.slice(0, 3).map((tpl) => (
                    <button
                      key={tpl.slug}
                      onClick={() => onNavigate(`/templates/${tpl.slug}`)}
                      className="w-full text-left group flex items-start justify-between gap-3 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="min-w-0">
                        <span className="block text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                          {t('templates.item.' + tpl.slug + '.title', tpl.title)}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5 uppercase font-bold text-[9px]">
                          {t('templates.badge.' + tpl.badge.replace(/ & /g, '_and_').replace(/ /g, '_').toLowerCase(), tpl.badge)}
                        </span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5 mt-0.5 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      ) : (
        /* Dynamic Directory / List View */
        <div className="max-w-6xl mx-auto px-4 md:px-8 pt-12">
          {/* Breadcrumb List */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6 font-medium">
            <button onClick={() => onNavigate('/')} className="hover:text-indigo-600 transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              {t('programmatic.home', 'Home')}
            </button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-700 font-bold uppercase tracking-wider">
              {section === 'solutions' ? t('programmatic.solutionsDirectory', 'Solutions Directory') : section === 'use-cases' ? t('programmatic.useCasesDirectory', 'Use Cases Directory') : t('programmatic.industriesDirectory', 'Industries Directory')}
            </span>
          </nav>

          {/* Directory Title */}
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-indigo-100 shadow-3xs inline-block mb-3">
              {t('programmatic.hubBadge', 'Programmatic Hub // Topical Network')}
            </span>
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight uppercase mb-3">
              {t('programmatic.professionalQrCodeTitle', 'Professional QR Code {{type}}', { type: section === 'solutions' ? t('programmatic.solutions', 'Solutions') : section === 'use-cases' ? t('programmatic.useCases', 'Use Cases') : t('programmatic.industries', 'Industries') })}
            </h1>
            <p className="text-slate-500 text-xs md:text-sm leading-relaxed font-medium">
              {t('programmatic.directorySubtitle', 'Browse highly authoritative, technical frameworks and physical printing guides designed to eliminate contactless service friction.')}
            </p>
          </div>

          {/* Search and Category Filtering Section */}
          <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Custom styled search bar */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={t('programmatic.searchPlaceholder', 'Search {{section}}...', { section: section })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl text-xs font-medium placeholder-slate-400 text-slate-800 transition-all outline-none"
              />
            </div>

            {/* Category tabs filters */}
            <ScrollableTabContainer
              className="w-full md:w-auto bg-slate-100 p-1 rounded-xl"
              gradientColor="from-slate-100"
              innerClassName="flex items-center gap-1 whitespace-nowrap"
            >
              {(['all', 'hospitality', 'medical', 'education', 'professional', 'industrial'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveCategoryTab(tab)}
                  className={`px-3.5 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 ${activeCategoryTab === tab ? 'bg-white text-indigo-950 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  {getTabLabel(tab)}
                </button>
              ))}
            </ScrollableTabContainer>
          </div>

          {/* Bento-style Listing Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => {
                const IconComp = getSeoIcon((item as any).iconName || 'FileText');
                const path = `/${section}/${item.slug}`;
                const hasBespoke = industriesData.some(i => i.slug === item.slug) || section !== 'industries';
                
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    key={item.slug}
                    onClick={() => onNavigate(path)}
                    className="group bg-white border border-slate-200/90 rounded-2xl p-5 hover:shadow-lg hover:border-indigo-200 hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header Info */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 flex items-center justify-center transition-all shadow-3xs">
                          <IconComp className="w-4 h-4" />
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-extrabold text-slate-400 bg-slate-100 border border-slate-150 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {t('programmatic.badge.' + item.badge.toLowerCase(), item.badge)}
                          </span>
                          {!hasBespoke && (
                            <span className="text-[8px] bg-indigo-50 text-indigo-600 font-bold px-1.5 py-0.5 rounded border border-indigo-100 uppercase tracking-widest font-mono">
                              {t('programmatic.auto', 'AUTO')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Content Title & Info */}
                      <h3 className="font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight text-sm mb-2 flex items-center gap-1.5">
                        {t('programmatic.item.' + item.slug + '.title', item.name)}
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                      </h3>

                      <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">
                        {t('programmatic.item.' + item.slug + '.desc', item.metaDesc || (item as any).desc)}
                      </p>
                    </div>

                    {/* Card Footer Tagline */}
                    <div className="mt-5 pt-3 border-t border-slate-50 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400 group-hover:text-indigo-600 transition-colors">
                      <span>{t('programmatic.exploreAuthorityFile', 'Explore Authority File')}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Empty Search Fallback */}
            {filteredItems.length === 0 && (
              <div className="col-span-full py-16 bg-white border border-slate-150 rounded-2xl text-center">
                <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">{t('programmatic.noDirectoryItemFound', 'No directory item found')}</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  {t('programmatic.noMatchesFound', 'We couldn\'t find matches for "{{query}}". Try searching general keywords like "Hospitality" or "Retail".', { query: searchQuery })}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}