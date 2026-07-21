import React, { useEffect, useRef } from 'react';
import { useTranslation } from '../utils/i18n';

import { QRProject } from '../types';
import { Sparkles, Check, Flame, Palette, Layers, Info, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { renderStyledQR } from '../utils/qrRenderer';

interface TemplatesTabProps {
  currentProject: Partial<QRProject>;
  onChange: (project: Partial<QRProject>) => void;
}

export interface QRTemplate {
  id: string;
  name: string;
  description: string;
  badge: string;
  badgeColor: string; // Tailwind bg & text colors
  design: {
    fgColor: string;
    bgColor: string;
    gradientType: 'none' | 'linear' | 'radial';
    gradientColor: string;
    dotStyle: 'square' | 'rounded' | 'dots' | 'classy';
    eyeStyle: 'square' | 'rounded' | 'circle' | 'leaf';
    eyeColorTopLeft?: string;
    eyeColorTopRight?: string;
    eyeColorBottomLeft?: string;
    margin?: number;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    logoUrl?: string;
  };
}

const TEMPLATES: QRTemplate[] = [
  {
    id: 'minimalist',
    name: 'Classic Minimalist',
    description: 'Crisp slate grey pixels on a pure clean background. Ultimate readability and corporate modesty.',
    badge: 'Clean & Safe',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
    design: {
      fgColor: '#0f172a',
      bgColor: '#ffffff',
      gradientType: 'none',
      gradientColor: '',
      dotStyle: 'square',
      eyeStyle: 'square',
      eyeColorTopLeft: '',
      eyeColorTopRight: '',
      eyeColorBottomLeft: '',
      margin: 20,
      errorCorrectionLevel: 'Q'
    }
  },
  {
    id: 'vibrant',
    name: 'Neon Vibrant',
    description: 'Exciting candy pink-to-orange diagonal gradient dots resting on eye-friendly light pink.',
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
    id: 'cyberpunk',
    name: 'Cyberpunk Tech',
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
    id: 'emerald',
    name: 'Emerald Breeze',
    description: 'Natural soothing green gradients with organic leafy corner eyes on soft garden mint.',
    badge: 'Eco & Eco',
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
    id: 'royal',
    name: 'Royal Champagne',
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
  {
    id: 'cosmic',
    name: 'Cosmic Sunset',
    description: 'Mesmerizing deep purple-to-pink space sunset on a soft white cloud quiet zone.',
    badge: 'Editorial',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    design: {
      fgColor: '#4f46e5',
      bgColor: '#faf5ff',
      gradientType: 'linear',
      gradientColor: '#ec4899',
      dotStyle: 'classy',
      eyeStyle: 'rounded',
      eyeColorTopLeft: '#4f46e5',
      eyeColorTopRight: '#4f46e5',
      eyeColorBottomLeft: '#4f46e5',
      margin: 20,
      errorCorrectionLevel: 'H'
    }
  },
  {
    id: 'tokyo',
    name: 'Tokyo Arcade',
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
    id: 'corporate',
    name: 'Charcoal Ice',
    description: 'Cold professional graphite grey on freeze-dry blue paper. Strictly tailored for formal use.',
    badge: 'B2B Classic',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    design: {
      fgColor: '#334155',
      bgColor: '#f8fafc',
      gradientType: 'none',
      gradientColor: '',
      dotStyle: 'classy',
      eyeStyle: 'square',
      eyeColorTopLeft: '#334155',
      eyeColorTopRight: '#334155',
      eyeColorBottomLeft: '#334155',
      margin: 20,
      errorCorrectionLevel: 'Q'
    }
  }
];

// Helper card to render small QR code previews for each template
function MiniQRPreview({ design, testText }: { design: QRTemplate['design']; testText: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      renderStyledQR(canvasRef.current, testText || 'https://freeqrgen.pro', {
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
    <div className="w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden border border-gray-100/80 shadow-3xs shrink-0 self-center" style={{ backgroundColor: design.bgColor }}>
      <canvas ref={canvasRef} className="w-14 h-14 object-contain" />
    </div>
  );
}

export default function TemplatesTab({ currentProject, onChange }: TemplatesTabProps) {
  const { t, locale } = useTranslation();
  const isRtl = locale === 'ar' || locale === 'ur';
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
        errorCorrectionLevel: template.design.errorCorrectionLevel || 'H'
      }
    });
  };

  const isTemplateApplied = (template: QRTemplate) => {
    const d = currentProject.design;
    if (!d) return false;
    
    return (
      d.fgColor === template.design.fgColor &&
      d.bgColor === template.design.bgColor &&
      d.gradientType === template.design.gradientType &&
      d.dotStyle === template.design.dotStyle &&
      d.eyeStyle === template.design.eyeStyle
    );
  };

  const sampleUrl = currentProject.content || 'https://freeqrgen.pro';

  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 110,
        damping: 15
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col gap-6"
    >
      {/* Title section */}
      <motion.div variants={itemVariants} className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-gray-900 flex items-center gap-2">
            <Palette className="w-5 h-5 text-indigo-600 animate-pulse" />
            {t('templates.title', 'Polished Design Templates')}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {t('templates.description', 'Instantly apply professional stylistic directions crafted by our design system in one click.')}
          </p>
        </div>
      </motion.div>
 
      {/* Templates Cards Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4">
        {TEMPLATES.map(template => {
          const active = isTemplateApplied(template);
          
          return (
            <motion.div
              key={template.id}
              whileHover={{
                scale: 1.015,
                y: -1,
                boxShadow: '0 8px 16px -6px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.02)'
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={() => handleApplyTemplate(template)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${isRtl ? 'rtl-active' : ''} ${ active ? 'bg-gradient-to-r from-indigo-50/70 to-purple-50/40 border-indigo-300 shadow-xs ring-1 ring-indigo-300 ' : 'bg-white/40 border-gray-150 hover:bg-white hover:border-gray-250 ' }`}
            >
              {/* Mini Interactive QR Code rendered live */}
              <MiniQRPreview design={template.design} testText={sampleUrl} />
 
              {/* Template Meta Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold text-gray-950 truncate">{t('templates.name.' + template.id, template.name)}</h3>
                  <span className={`text-[9px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full border ${template.badgeColor}`}>
                    {t('templates.badge.' + template.id, template.badge)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                  {t('templates.desc.' + template.id, template.description)}
                </p>
 
                {/* Styled Swatch previews */}
                <div className="flex items-center gap-1.5 mt-3">
                  <span className="text-[10px] text-gray-400 font-mono">{t('templates.palette', 'Palette:')}</span>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full border border-gray-100" style={{ backgroundColor: template.design.bgColor }} title={`Bg: ${template.design.bgColor}`} />
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: template.design.fgColor }} title={`Fg: ${template.design.fgColor}`} />
                    {template.design.gradientType !== 'none' && (
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: template.design.gradientColor }} title={`Gradient: ${template.design.gradientColor}`} />
                    )}
                  </div>
                  <span className="text-[9px] text-gray-400 font-mono capitalize ml-auto">
                    {t('templates.dotsLabel', 'Dots:')} {template.design.dotStyle} {t('templates.eyesLabel', '• Eyes:')} {template.design.eyeStyle}
                  </span>
                </div>
              </div>
 
              {/* Selection Checkmark Button */}
              <div className="shrink-0 self-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${ active ? 'bg-indigo-600 border-indigo-600 text-white scale-110 shadow-3xs ' : 'bg-white border-gray-200 text-transparent group-hover:border-gray-300 ' }`}>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
 
      {/* Bottom informational guidance */}
      <motion.div variants={itemVariants} className="bg-amber-50/60 rounded-xl p-3.5 border border-amber-100/80 flex items-start gap-2.5">
         <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
         <p className="text-[11px] text-amber-800 leading-relaxed">
           <strong>{t('templates.tipLabel', 'Tip:')}</strong> {t('templates.tipDesc', 'After applying any template, you can jump back to the Creative Station tab anytime to perform precision edits, add custom center logos, or adjust the quiet zone spacing to match your unique brand requirements.')}
         </p>
       </motion.div>
    </motion.div>
  );
}
