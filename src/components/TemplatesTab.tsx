import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from '../utils/i18n';
import { isRtlLocale } from '../utils/translations';
import { QRProject, FrameStyle } from '../types';
import { 
  Palette, 
  Check, 
  Search, 
  Sparkles, 
  Shuffle, 
  Info, 
  SlidersHorizontal, 
  Globe, 
  Wifi, 
  CreditCard, 
  Share2, 
  ArrowRight,
  RefreshCw,
  Layers,
  Sparkle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { renderStyledQR } from '../utils/qrRenderer';

interface TemplatesTabProps {
  currentProject: Partial<QRProject>;
  onChange: (project: Partial<QRProject>) => void;
  onNavigateToCustomize?: () => void;
}

export interface QRTemplate {
  id: string;
  name: string;
  category: 'business' | 'creative' | 'dark' | 'eco' | 'minimal';
  description: string;
  badge: string;
  badgeColor: string; // Tailwind styling
  design: {
    fgColor: string;
    bgColor: string;
    gradientType: 'none' | 'linear' | 'radial';
    gradientColor: string;
    dotStyle: 'square' | 'rounded' | 'dots' | 'classy' | 'leaf' | 'diamond';
    eyeStyle: 'square' | 'rounded' | 'circle' | 'leaf';
    eyeColorTopLeft?: string;
    eyeColorTopRight?: string;
    eyeColorBottomLeft?: string;
    margin?: number;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    frameStyle?: FrameStyle;
    frameText?: string;
    frameColor?: string;
    frameTextColor?: string;
  };
}

const TEMPLATES: QRTemplate[] = [
  // --- MINIMAL & CLEAN ---
  {
    id: 'minimalist',
    name: 'Classic Minimalist',
    category: 'minimal',
    description: 'Crisp deep slate pixels on a pure clean background. Ultimate readability and corporate modesty.',
    badge: 'Clean & Safe',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
    design: {
      fgColor: '#0f172a',
      bgColor: '#ffffff',
      gradientType: 'none',
      gradientColor: '',
      dotStyle: 'square',
      eyeStyle: 'square',
      eyeColorTopLeft: '#0f172a',
      eyeColorTopRight: '#0f172a',
      eyeColorBottomLeft: '#0f172a',
      margin: 20,
      errorCorrectionLevel: 'Q'
    }
  },
  {
    id: 'monochrome-classy',
    name: 'Monochrome Classy',
    category: 'minimal',
    description: 'Sculpted diamond-corner dots with high-density black framing on ultra-pure snow white.',
    badge: 'Editorial',
    badgeColor: 'bg-zinc-100 text-zinc-800 border-zinc-200',
    design: {
      fgColor: '#18181b',
      bgColor: '#ffffff',
      gradientType: 'none',
      gradientColor: '',
      dotStyle: 'classy',
      eyeStyle: 'circle',
      eyeColorTopLeft: '#18181b',
      eyeColorTopRight: '#18181b',
      eyeColorBottomLeft: '#18181b',
      margin: 20,
      errorCorrectionLevel: 'H'
    }
  },
  {
    id: 'nordic-slate',
    name: 'Nordic Slate',
    category: 'minimal',
    description: 'Understated cool graphite and ice-gray palette designed for clean architectural lookbooks.',
    badge: 'Scandinavian',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
    design: {
      fgColor: '#334155',
      bgColor: '#f8fafc',
      gradientType: 'linear',
      gradientColor: '#475569',
      dotStyle: 'rounded',
      eyeStyle: 'rounded',
      eyeColorTopLeft: '#1e293b',
      eyeColorTopRight: '#1e293b',
      eyeColorBottomLeft: '#1e293b',
      margin: 22,
      errorCorrectionLevel: 'M'
    }
  },

  // --- BUSINESS & CORPORATE ---
  {
    id: 'corporate',
    name: 'Charcoal Ice',
    category: 'business',
    description: 'Cold professional graphite gray on freeze-dry blue paper. Strictly tailored for formal B2B use.',
    badge: 'B2B Classic',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    design: {
      fgColor: '#334155',
      bgColor: '#f8fafc',
      gradientType: 'none',
      gradientColor: '',
      dotStyle: 'classy',
      eyeStyle: 'square',
      eyeColorTopLeft: '#1e3a8a',
      eyeColorTopRight: '#1e3a8a',
      eyeColorBottomLeft: '#1e3a8a',
      margin: 20,
      errorCorrectionLevel: 'Q'
    }
  },
  {
    id: 'enterprise-cobalt',
    name: 'Enterprise Cobalt',
    category: 'business',
    description: 'Deep cobalt blue with subtle indigo transitions and clean rounded corners for trusted corporate assets.',
    badge: 'High Trust',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    design: {
      fgColor: '#1e40af',
      bgColor: '#f0f9ff',
      gradientType: 'linear',
      gradientColor: '#4338ca',
      dotStyle: 'rounded',
      eyeStyle: 'rounded',
      eyeColorTopLeft: '#1e40af',
      eyeColorTopRight: '#4338ca',
      eyeColorBottomLeft: '#1e40af',
      margin: 20,
      errorCorrectionLevel: 'H'
    }
  },
  {
    id: 'fintech-emerald',
    name: 'Fintech Prestige',
    category: 'business',
    description: 'Deep forest spruce and polished emerald accents tailored for banking cards, invoices, and payment receipts.',
    badge: 'Financial',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    design: {
      fgColor: '#064e3b',
      bgColor: '#f0fdf4',
      gradientType: 'linear',
      gradientColor: '#047857',
      dotStyle: 'classy',
      eyeStyle: 'square',
      eyeColorTopLeft: '#064e3b',
      eyeColorTopRight: '#059669',
      eyeColorBottomLeft: '#064e3b',
      margin: 20,
      errorCorrectionLevel: 'H'
    }
  },

  // --- CREATIVE & MODERN ---
  {
    id: 'vibrant',
    name: 'Neon Vibrant',
    category: 'creative',
    description: 'Exciting candy pink-to-orange diagonal gradient dots resting on eye-friendly light blush canvas.',
    badge: 'Trending',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    design: {
      fgColor: '#db2777',
      bgColor: '#fff1f2',
      gradientType: 'linear',
      gradientColor: '#ea580c',
      dotStyle: 'rounded',
      eyeStyle: 'rounded',
      eyeColorTopLeft: '#db2777',
      eyeColorTopRight: '#db2777',
      eyeColorBottomLeft: '#db2777',
      margin: 15,
      errorCorrectionLevel: 'H'
    }
  },
  {
    id: 'cosmic',
    name: 'Cosmic Sunset',
    category: 'creative',
    description: 'Mesmerizing deep purple-to-pink space sunset on a soft white cloud quiet zone.',
    badge: 'Creative Art',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    design: {
      fgColor: '#4f46e5',
      bgColor: '#faf5ff',
      gradientType: 'linear',
      gradientColor: '#ec4899',
      dotStyle: 'classy',
      eyeStyle: 'rounded',
      eyeColorTopLeft: '#4f46e5',
      eyeColorTopRight: '#ec4899',
      eyeColorBottomLeft: '#4f46e5',
      margin: 20,
      errorCorrectionLevel: 'H'
    }
  },
  {
    id: 'sunset-flamingo',
    name: 'Sunset Flamingo',
    category: 'creative',
    description: 'Warm coral and solar gold gradient matrix with organic circle eyes for vibrant social campaigns.',
    badge: 'Warm Glow',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    design: {
      fgColor: '#e11d48',
      bgColor: '#fff7ed',
      gradientType: 'linear',
      gradientColor: '#d97706',
      dotStyle: 'dots',
      eyeStyle: 'circle',
      eyeColorTopLeft: '#e11d48',
      eyeColorTopRight: '#d97706',
      eyeColorBottomLeft: '#e11d48',
      margin: 18,
      errorCorrectionLevel: 'H'
    }
  },

  // --- DARK MODE & LUXURY ---
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Tech',
    category: 'dark',
    description: 'Luminous cyan-to-magenta radial matrix sitting on premium deep indigo. Perfect for tech cards.',
    badge: 'Sci-Fi Vibe',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    design: {
      fgColor: '#06b6d4',
      bgColor: '#0f172a',
      gradientType: 'radial',
      gradientColor: '#d946ef',
      dotStyle: 'dots',
      eyeStyle: 'circle',
      eyeColorTopLeft: '#3b82f6',
      eyeColorTopRight: '#ec4899',
      eyeColorBottomLeft: '#10b981',
      margin: 20,
      errorCorrectionLevel: 'H'
    }
  },
  {
    id: 'tokyo',
    name: 'Tokyo Arcade',
    category: 'dark',
    description: 'Dazzling violet-rose retro grid on deep indigo skies. Highly contrasted terminal elements.',
    badge: 'Synthesized',
    badgeColor: 'bg-violet-100 text-violet-800 border-violet-200',
    design: {
      fgColor: '#f43f5e',
      bgColor: '#1e1b4b',
      gradientType: 'linear',
      gradientColor: '#8b5cf6',
      dotStyle: 'rounded',
      eyeStyle: 'circle',
      eyeColorTopLeft: '#f43f5e',
      eyeColorTopRight: '#8b5cf6',
      eyeColorBottomLeft: '#f43f5e',
      margin: 20,
      errorCorrectionLevel: 'H'
    }
  },
  {
    id: 'midnight-gold',
    name: 'Midnight Gold',
    category: 'dark',
    description: 'Metallic champagne-gold matrix glowing over rich obsidian onyx. The gold standard for VIP invitations.',
    badge: 'VIP Luxury',
    badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    design: {
      fgColor: '#f59e0b',
      bgColor: '#18181b',
      gradientType: 'linear',
      gradientColor: '#fbbf24',
      dotStyle: 'classy',
      eyeStyle: 'leaf',
      eyeColorTopLeft: '#fbbf24',
      eyeColorTopRight: '#d97706',
      eyeColorBottomLeft: '#fbbf24',
      margin: 22,
      errorCorrectionLevel: 'H'
    }
  },
  {
    id: 'royal',
    name: 'Royal Champagne',
    category: 'dark',
    description: 'Majestic bronze-gold gradients and custom starburst dot style on premium ivory paper layout.',
    badge: 'Luxury Style',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    design: {
      fgColor: '#451a03',
      bgColor: '#fffbeb',
      gradientType: 'linear',
      gradientColor: '#b45309',
      dotStyle: 'classy',
      eyeStyle: 'leaf',
      eyeColorTopLeft: '#78350f',
      eyeColorTopRight: '#78350f',
      eyeColorBottomLeft: '#78350f',
      margin: 25,
      errorCorrectionLevel: 'H'
    }
  },

  // --- ECO & NATURE ---
  {
    id: 'emerald',
    name: 'Emerald Breeze',
    category: 'eco',
    description: 'Natural soothing green gradients with organic leafy corner eyes on soft garden mint.',
    badge: 'Eco & Bio',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    design: {
      fgColor: '#047857',
      bgColor: '#f0fdf4',
      gradientType: 'linear',
      gradientColor: '#10b981',
      dotStyle: 'rounded',
      eyeStyle: 'leaf',
      eyeColorTopLeft: '#047857',
      eyeColorTopRight: '#047857',
      eyeColorBottomLeft: '#047857',
      margin: 20,
      errorCorrectionLevel: 'Q'
    }
  },
  {
    id: 'matcha-mint',
    name: 'Matcha Blossom',
    category: 'eco',
    description: 'Organic olive-green and herbal tea tones with gentle rounded geometry for cafes, spas, and wellness products.',
    badge: 'Wellness',
    badgeColor: 'bg-lime-100 text-lime-800 border-lime-200',
    design: {
      fgColor: '#3f6212',
      bgColor: '#f7fee7',
      gradientType: 'linear',
      gradientColor: '#65a30d',
      dotStyle: 'dots',
      eyeStyle: 'rounded',
      eyeColorTopLeft: '#3f6212',
      eyeColorTopRight: '#4d7c0f',
      eyeColorBottomLeft: '#3f6212',
      margin: 20,
      errorCorrectionLevel: 'Q'
    }
  },
  {
    id: 'warm-terracotta',
    name: 'Warm Terracotta',
    category: 'eco',
    description: 'Earthy sun-baked clay and rustic sienna pigments paired with organic leaf finder patterns.',
    badge: 'Artisan',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
    design: {
      fgColor: '#9a3412',
      bgColor: '#fff7ed',
      gradientType: 'linear',
      gradientColor: '#c2410c',
      dotStyle: 'leaf',
      eyeStyle: 'leaf',
      eyeColorTopLeft: '#7c2d12',
      eyeColorTopRight: '#9a3412',
      eyeColorBottomLeft: '#7c2d12',
      margin: 20,
      errorCorrectionLevel: 'H'
    }
  }
];

const CATEGORIES = [
  { id: 'all', label: 'All Templates' },
  { id: 'business', label: 'Business & Trust' },
  { id: 'creative', label: 'Creative & Vibrant' },
  { id: 'dark', label: 'Dark Mode & Luxury' },
  { id: 'eco', label: 'Eco & Natural' },
  { id: 'minimal', label: 'Minimal & Clean' }
];

const SAMPLE_PAYLOADS = [
  { id: 'url', label: 'Website Link', icon: Globe, sample: 'https://www.freeqrbarcodes.com' },
  { id: 'wifi', label: 'WiFi Access', icon: Wifi, sample: 'WIFI:T:WPA;S:StudioNetwork;P:SecureKey99;;' },
  { id: 'card', label: 'vCard Contact', icon: CreditCard, sample: 'BEGIN:VCARD\nVERSION:3.0\nN:Smith;Alex\nFN:Alex Smith\nORG:iSolutions\nTEL:+15550199\nEND:VCARD' },
  { id: 'social', label: 'Social Profile', icon: Share2, sample: 'https://instagram.com/freeqrbarcodes' }
];

// Helper card to render small QR code previews for each template
function MiniQRPreview({ design, testText }: { design: QRTemplate['design']; testText: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      renderStyledQR(canvasRef.current, testText || 'https://www.freeqrbarcodes.com', {
        fgColor: design.fgColor,
        bgColor: design.bgColor,
        gradientType: design.gradientType,
        gradientColor: design.gradientColor,
        dotStyle: design.dotStyle,
        eyeStyle: design.eyeStyle,
        eyeColorTopLeft: design.eyeColorTopLeft,
        eyeColorTopRight: design.eyeColorTopRight,
        eyeColorBottomLeft: design.eyeColorBottomLeft,
        margin: design.margin || 20,
        errorCorrectionLevel: design.errorCorrectionLevel || 'H'
      }).catch(err => console.error("Error drawing mini QR preview:", err));
    }
  }, [design, testText]);

  return (
    <div 
      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center overflow-hidden border border-slate-200/80 shadow-xs shrink-0 self-center transition-transform group-hover:scale-105" 
      style={{ backgroundColor: design.bgColor }}
    >
      <canvas ref={canvasRef} className="w-14 h-14 sm:w-16 sm:h-16 object-contain" />
    </div>
  );
}

export default function TemplatesTab({ currentProject, onChange, onNavigateToCustomize }: TemplatesTabProps) {
  const { t, locale } = useTranslation();
  const isRtl = isRtlLocale(locale);

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSamplePayload, setActiveSamplePayload] = useState<string>('url');
  const [justAppliedId, setJustAppliedId] = useState<string | null>(null);

  // Active payload string
  const currentSampleText = useMemo(() => {
    if (currentProject.content && currentProject.content.trim().length > 0) {
      return currentProject.content;
    }
    const found = SAMPLE_PAYLOADS.find(p => p.id === activeSamplePayload);
    return found ? found.sample : 'https://www.freeqrbarcodes.com';
  }, [currentProject.content, activeSamplePayload]);

  const handleApplyTemplate = (template: QRTemplate) => {
    onChange({
      ...currentProject,
      design: {
        ...(currentProject.design || {}),
        fgColor: template.design.fgColor,
        bgColor: template.design.bgColor,
        gradientType: template.design.gradientType,
        gradientColor: template.design.gradientColor,
        dotStyle: template.design.dotStyle,
        eyeStyle: template.design.eyeStyle,
        eyeColorTopLeft: template.design.eyeColorTopLeft || '',
        eyeColorTopRight: template.design.eyeColorTopRight || '',
        eyeColorBottomLeft: template.design.eyeColorBottomLeft || '',
        margin: template.design.margin ?? 20,
        errorCorrectionLevel: template.design.errorCorrectionLevel || 'H',
        frameStyle: template.design.frameStyle || (currentProject.design?.frameStyle ?? 'none'),
        frameText: template.design.frameText || currentProject.design?.frameText,
        frameColor: template.design.frameColor || currentProject.design?.frameColor,
        frameTextColor: template.design.frameTextColor || currentProject.design?.frameTextColor
      }
    });

    setJustAppliedId(template.id);
    setTimeout(() => {
      setJustAppliedId(null);
    }, 2500);
  };

  const handleRandomInspire = () => {
    const randomIndex = Math.floor(Math.random() * TEMPLATES.length);
    const chosen = TEMPLATES[randomIndex];
    handleApplyTemplate(chosen);
  };

  const isTemplateApplied = (template: QRTemplate) => {
    const d = currentProject.design;
    if (!d) return false;
    
    return (
      d.fgColor?.toLowerCase() === template.design.fgColor?.toLowerCase() &&
      d.bgColor?.toLowerCase() === template.design.bgColor?.toLowerCase() &&
      d.gradientType === template.design.gradientType &&
      d.dotStyle === template.design.dotStyle &&
      d.eyeStyle === template.design.eyeStyle
    );
  };

  // Filter templates based on category & search query
  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter(tpl => {
      const matchCat = activeCategory === 'all' || tpl.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        tpl.name.toLowerCase().includes(q) || 
        tpl.description.toLowerCase().includes(q) ||
        tpl.badge.toLowerCase().includes(q) ||
        tpl.design.dotStyle.toLowerCase().includes(q) ||
        tpl.design.eyeStyle.toLowerCase().includes(q);
      
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.04 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 120, damping: 16 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs flex flex-col gap-6"
    >
      {/* Header section with Actions */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <Palette className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black tracking-tight text-slate-900">
              {t('templates.title', 'Design Templates')}
            </h2>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-indigo-100/80 text-indigo-700 rounded-full">
              {TEMPLATES.length} Presets
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            {t('templates.description', 'Instantly apply pre-styled visual palettes, dot geometries, and eye aesthetics with one click.')}
          </p>
        </div>

        {/* Random Inspiration Button */}
        <button
          type="button"
          onClick={handleRandomInspire}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl border border-slate-200 hover:border-indigo-200 transition-all shadow-3xs active:scale-95 shrink-0"
        >
          <Shuffle className="w-3.5 h-3.5 text-indigo-500" />
          <span>{t('templates.inspireMe', 'Inspire Me')}</span>
        </button>
      </motion.div>

      {/* Search and Category Filter Toolbar */}
      <motion.div variants={itemVariants} className="flex flex-col gap-3.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('templates.searchPlaceholder', 'Search styles, colors, dot shapes...')}
              className="w-full pl-9 pr-8 py-2 text-xs text-slate-900 bg-slate-50 hover:bg-slate-100/70 focus:bg-white rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sample Matrix Density Preview Switcher (if user hasn't typed custom payload yet) */}
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 self-start sm:self-auto overflow-x-auto max-w-full">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 select-none">
              {t('templates.testWith', 'Preview:')}
            </span>
            {SAMPLE_PAYLOADS.map(p => {
              const Icon = p.icon;
              const active = activeSamplePayload === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActiveSamplePayload(p.id)}
                  title={p.label}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    active 
                      ? 'bg-white text-indigo-600 shadow-3xs font-black' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{p.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {CATEGORIES.map(cat => {
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap border ${
                  active
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Templates Cards Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <AnimatePresence mode="popLayout">
          {filteredTemplates.map(template => {
            const active = isTemplateApplied(template);
            const isJustApplied = justAppliedId === template.id;

            return (
              <motion.div
                layout
                key={template.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                whileHover={{
                  y: -2,
                  boxShadow: '0 10px 20px -8px rgba(0, 0, 0, 0.08)'
                }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                onClick={() => handleApplyTemplate(template)}
                className={`group p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 relative overflow-hidden ${
                  isRtl ? 'rtl-active' : ''
                } ${
                  active
                    ? 'bg-gradient-to-r from-indigo-50/90 to-purple-50/50 border-indigo-400 shadow-xs ring-2 ring-indigo-400/30'
                    : 'bg-slate-50/50 border-slate-200/80 hover:bg-white hover:border-slate-300'
                }`}
              >
                {/* Active Indicator Top Accent Bar */}
                {active && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
                )}

                {/* Mini Interactive QR Code rendered live with actual matrix geometry */}
                <MiniQRPreview design={template.design} testText={currentSampleText} />

                {/* Template Meta Information */}
                <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                        {t('templates.name.' + template.id, template.name)}
                      </h3>
                      <span className={`text-[9px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full border ltr-lock ${template.badgeColor}`}>
                        {t('templates.badge.' + template.id, template.badge)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                      {t('templates.desc.' + template.id, template.description)}
                    </p>
                  </div>

                  {/* Technical Spec Chips */}
                  <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-150/60 text-[10px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5">
                        <span 
                          className="w-3 h-3 rounded-full border border-slate-200 shadow-3xs" 
                          style={{ backgroundColor: template.design.bgColor }} 
                          title={`Bg: ${template.design.bgColor}`} 
                        />
                        <span 
                          className="w-3 h-3 rounded-full border border-slate-200 shadow-3xs" 
                          style={{ backgroundColor: template.design.fgColor }} 
                          title={`Fg: ${template.design.fgColor}`} 
                        />
                        {template.design.gradientType !== 'none' && (
                          <span 
                            className="w-3 h-3 rounded-full border border-slate-200 shadow-3xs" 
                            style={{ backgroundColor: template.design.gradientColor }} 
                            title={`Gradient: ${template.design.gradientColor}`} 
                          />
                        )}
                      </div>
                      <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500 font-bold">
                        {template.design.dotStyle}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {active ? (
                        <span className="inline-flex items-center gap-1 text-xs font-black text-indigo-600 bg-indigo-100/70 px-2 py-0.5 rounded-md">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          {t('templates.applied', 'Applied')}
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-400 group-hover:text-indigo-600 group-hover:underline flex items-center gap-0.5 transition-colors">
                          {t('templates.apply', 'Apply')} <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Empty State if Search yield no matches */}
      {filteredTemplates.length === 0 && (
        <motion.div variants={itemVariants} className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <Palette className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">
            {t('templates.noMatches', 'No templates match your filter')}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {t('templates.noMatchesDesc', 'Try clearing your search query or selecting a different category.')}
          </p>
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
            className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-700 underline"
          >
            {t('templates.resetFilters', 'Reset filters')}
          </button>
        </motion.div>
      )}

      {/* Bottom Guidance & Workflow Callout */}
      <motion.div variants={itemVariants} className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong>{t('templates.tipLabel', 'Pro Tip:')}</strong> {t('templates.tipDescFull', 'Applying a template sets base colors and geometries. You can fine-tune finder eyes, embed custom company logos, or configure quiet zones in the Creative Station anytime.')}
          </p>
        </div>
        {onNavigateToCustomize && (
          <button
            type="button"
            onClick={onNavigateToCustomize}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors shrink-0 self-start sm:self-auto"
          >
            <span>{t('templates.goToCreativeStation', 'Creative Station')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
