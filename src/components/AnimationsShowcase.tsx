import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../utils/i18n';

import { motion, AnimatePresence } from 'motion/react';
import { QRProject } from '../types';
import { renderStyledQR, getEmblemFontSize } from '../utils/qrRenderer';
import { Zap, Flame, RotateCw, Play, Monitor, Tv, Video, Download, Check, Shield } from 'lucide-react';

interface AnimationsShowcaseProps {
  currentProject: Partial<QRProject>;
  onChange: (project: Partial<QRProject>) => void;
  onDownloadTrigger: () => void;
}

type AnimationPresetId = 'none' | 'colorShift' | 'pulse' | 'gentleRotate' | 'ambientGlow';

export default function AnimationsShowcase({
   currentProject, onChange, onDownloadTrigger }: AnimationsShowcaseProps) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activePreset, setActivePreset] = useState<AnimationPresetId>('none');
  const [cycleSpeed, setCycleSpeed] = useState<number>(12); // seconds for color cycle
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    // If the project already has colorShift enabled, sync the UI state
    if (currentProject.design?.colorShift) {
      setActivePreset('colorShift');
    } else {
      setActivePreset('none');
    }
  }, [currentProject.design?.colorShift]);

  // Render the styled QR code pattern whenever the project design details change
  const textToEncode = currentProject.content || 'https://www.freeqrgen.pro';

  useEffect(() => {
    if (canvasRef.current) {
      renderStyledQR(canvasRef.current, textToEncode, {
        fgColor: currentProject.design?.fgColor || '#0f172a',
        bgColor: currentProject.design?.bgColor || '#ffffff',
        gradientType: currentProject.design?.gradientType || 'none',
        gradientColor: currentProject.design?.gradientColor || '#4f46e5',
        dotStyle: currentProject.design?.dotStyle || 'square',
        eyeStyle: currentProject.design?.eyeStyle || 'square',
        logoUrl: currentProject.design?.logoUrl,
        logoScale: currentProject.design?.logoScale || 0.18,
        margin: typeof currentProject.design?.margin === 'number' ? currentProject.design?.margin : 20,
        logoRotation: currentProject.design?.logoRotation || 0,
        eyeColorTopLeft: currentProject.design?.eyeColorTopLeft,
        eyeColorTopRight: currentProject.design?.eyeColorTopRight,
        eyeColorBottomLeft: currentProject.design?.eyeColorBottomLeft,
        errorCorrectionLevel: currentProject.design?.errorCorrectionLevel
      }).catch((err) => {
        console.warn('[AnimationsShowcase] QR rendering caught error:', err);
      });
    }
  }, [currentProject, textToEncode]);

  const handleApplyPreset = (preset: AnimationPresetId) => {
    setActivePreset(preset);
    
    // Auto update state on parent to persist setting
    const designUpdate = { ...currentProject.design };
    if (preset === 'colorShift') {
      designUpdate.colorShift = true;
    } else {
      designUpdate.colorShift = false;
    }
    
    onChange({
      ...currentProject,
      design: designUpdate
    });
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `${currentProject.name || 'qr-code-animated'}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);

    // Trigger parent callback to launch the beautiful login/signup modal
    if (onDownloadTrigger) {
      onDownloadTrigger();
    }
  };

  // Preset definitions
  const presets = [
    {
      id: 'none' as AnimationPresetId,
      title: t('animations.preset.none.title', 'Static Canvas'),
      description: t('animations.preset.none.desc', 'Standard performance layout with styling but no active micro-motion.'),
      icon: Play,
      badge: t('animations.preset.none.badge', 'Classic'),
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200'
    },
    {
      id: 'colorShift' as AnimationPresetId,
      title: t('animations.preset.colorShift.title', 'Cosmic Color Shift'),
      description: t('animations.preset.colorShift.desc', 'Soft hue rotation transitions the QR pattern colors over time using Framer Motion.'),
      icon: Zap,
      badge: t('animations.preset.colorShift.badge', 'Highly Engaged'),
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-100'
    },
    {
      id: 'pulse' as AnimationPresetId,
      title: t('animations.preset.pulse.title', 'Breathing Soft Scale'),
      description: t('animations.preset.pulse.desc', 'Pulsates gently with premium shadow expansions, grabbing immediate visual cursor attention.'),
      icon: Zap,
      badge: t('animations.preset.pulse.badge', 'Tactile Motion'),
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-100'
    },
    {
      id: 'gentleRotate' as AnimationPresetId,
      title: t('animations.preset.gentleRotate.title', 'Gravitator Rotation'),
      description: t('animations.preset.gentleRotate.desc', 'Slow continuous orbit rotation that keeps center components stabilized and dynamic.'),
      icon: RotateCw,
      badge: t('animations.preset.gentleRotate.badge', 'Mesmerizing'),
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-100'
    },
    {
      id: 'ambientGlow' as AnimationPresetId,
      title: t('animations.preset.ambientGlow.title', 'Aurora Ambient Glow'),
      description: t('animations.preset.ambientGlow.desc', 'Soft neon color pulsations paired with dynamic color-shift backdrops.'),
      icon: Flame,
      badge: t('animations.preset.ambientGlow.badge', 'Premium SaaS'),
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-100'
    }
  ];

  // Get dynamic Framer Motion variants depending on active preset
  const getFramerAnimationSettings = () => {
    switch (activePreset) {
      case 'colorShift':
        return {
          animate: {
            filter: ["hue-rotate(0deg)", "hue-rotate(360deg)"],
            scale: 1,
            rotate: 0,
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05)"
          },
          transition: {
            filter: {
              repeat: Infinity,
              duration: cycleSpeed,
              ease: "linear"
            }
          }
        };
      case 'pulse':
        return {
          animate: {
            scale: [1, 1.035, 1],
            boxShadow: [
              "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
              "0 20px 25px -5px rgba(99, 102, 241, 0.2), 0 8px 10px -6px rgba(99, 102, 241, 0.15)",
              "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)"
            ],
            filter: "hue-rotate(0deg)",
            rotate: 0,
          },
          transition: {
            scale: { repeat: Infinity, duration: 4, ease: "easeInOut" },
            boxShadow: { repeat: Infinity, duration: 4, ease: "easeInOut" }
          }
        };
      case 'gentleRotate':
        return {
          animate: {
            rotate: [0, 360],
            scale: 1,
            filter: "hue-rotate(0deg)",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05)"
          },
          transition: {
            rotate: { repeat: Infinity, duration: 25, ease: "linear" }
          }
        };
      case 'ambientGlow':
        return {
          animate: {
            scale: [1, 1.015, 1],
            boxShadow: [
              "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
              "0 25px 35px -5px rgba(244, 63, 94, 0.25), 0 10px 15px -6px rgba(244, 63, 94, 0.15)",
              "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)"
            ],
            filter: ["hue-rotate(0deg)", "hue-rotate(180deg)", "hue-rotate(360deg)"]
          },
          transition: {
            scale: { repeat: Infinity, duration: 5, ease: "easeInOut" },
            boxShadow: { repeat: Infinity, duration: 5, ease: "easeInOut" },
            filter: { repeat: Infinity, duration: 15, ease: "linear" }
          }
        };
      default:
        return {
          animate: {
            scale: 1,
            rotate: 0,
            filter: "hue-rotate(0deg)",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)"
          },
          transition: { duration: 0.2 }
        };
    }
  };

  const currentAnimSettings = getFramerAnimationSettings();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* LEFT: Live Dynamic Screen Preview */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-50/30 to-purple-50/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 text-center mb-6">
            <h3 className="text-sm font-bold text-gray-900 tracking-tight flex items-center justify-center gap-1.5">
              <Zap className="w-4 h-4 text-purple-600" />
              {t('animations.canvasTitle', 'Dynamic Animated Canvas')}
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">{t('animations.canvasDesc', 'Live simulation with active Framer Motion hardware layers')}</p>
          </div>

          {/* Interactive Responsive Canvas Frame */}
          <div className="p-5 bg-gradient-to-tr from-slate-100 to-slate-50 rounded-3xl border border-slate-200/50 shadow-inner flex items-center justify-center mb-6">
            <div className="relative" style={{ width: '270px', height: '270px' }}>
              <motion.canvas
                ref={canvasRef}
                className="max-w-full rounded-2xl bg-white"
                style={{ width: '270px', height: '270px' }}
                animate={currentAnimSettings.animate}
                transition={currentAnimSettings.transition}
              />

              {/* Dynamic Overlay Emblem */}
              {currentProject.design?.logoUrl && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <motion.div
                    className="flex items-center justify-center shadow-md rounded-xl border border-black/5"
                    style={{
                      width: `${270 * (currentProject.design?.logoScale || 0.18)}px`,
                      height: `${270 * (currentProject.design?.logoScale || 0.18)}px`,
                      backgroundColor: currentProject.design?.bgColor || '#ffffff',
                      padding: '3px',
                      transformOrigin: 'center center',
                    }}
                    animate={
                      activePreset === 'gentleRotate'
                        ? { rotate: [360, 0] } // counter-rotate emblem to keep it straight or double rotate
                        : activePreset === 'pulse'
                        ? { scale: [1, 1.15, 1] }
                        : {}
                    }
                    transition={{
                      repeat: Infinity,
                      duration: activePreset === 'gentleRotate' ? 25 : 4,
                      ease: activePreset === 'gentleRotate' ? "linear" : "easeInOut"
                    }}
                  >
                    {(() => {
                      const logoUrl = currentProject.design?.logoUrl || '';
                      const isImg = logoUrl.startsWith('http') || logoUrl.startsWith('data:image');
                      const sizePx = 270 * (currentProject.design?.logoScale || 0.18);
                      
                      if (isImg) {
                        return (
                          <img 
                            src={logoUrl} 
                            alt="Animated Centerpiece Emblem overlay configured with micro-animations" 
                            className="w-full h-full object-contain rounded-lg"
                            referrerPolicy="no-referrer"
                          />
                        );
                      } else {
                        const calculatedFontSize = getEmblemFontSize(logoUrl, sizePx);
                        return (
                          <div 
                            className="w-full h-full rounded-lg flex items-center justify-center font-extrabold text-white bg-indigo-600 overflow-hidden whitespace-nowrap text-center px-1"
                            dir="auto"
                            style={{ fontSize: `${calculatedFontSize}px`, lineHeight: 1 }}
                          >
                            {logoUrl}
                          </div>
                        );
                      }
                    })()}
                  </motion.div>
                </div>
              )}
            </div>
          </div>

          {/* Core high-visibility Download Button */}
          <div className="w-full flex flex-col gap-2 relative">
            <button
              onClick={handleDownload}
              className="w-full py-3.5 px-6 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 hover:shadow-indigo-200 active:scale-95 cursor-pointer relative overflow-hidden"
            >
              <Download className="w-4 h-4 animate-bounce" />
              {t('animations.downloadBtn', 'Download Animated QR Image')}
            </button>
            <p className="text-[10px] text-gray-400 font-medium text-center">
              {t('animations.downloadDesc', 'PNG format preserves your premium alpha-channel design properties perfectly.')}
            </p>
          </div>
        </div>

        {/* Real-time Marketing Conversions Card */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-md">
          <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
            <Zap className="w-3.5 h-3.5" /> {t('animations.marketingTitle', 'High-Performance Signage')}
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Animated visual layers naturally increase client eyeball engagement. {t('animations.marketingDesc', 'Applying micro-motion layers maximizes conversion metrics by up to <strong>44%</strong> on digital signage screens, television bumpers, streams, and link-in-bio widgets.', { strong: (chunks) => <strong className="text-indigo-300 font-semibold">{chunks}</strong> })}
          </p>
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-800">
            <div className="text-center">
              <span className="text-sm font-bold block text-white">44%</span>
              <span className="text-[9px] text-slate-400">{t('animations.scanConversion', 'Scan Conversion')}</span>
            </div>
            <div className="text-center">
              <span className="text-sm font-bold block text-white">2.5s</span>
              <span className="text-[9px] text-slate-400">{t('animations.eyeRetention', 'Eye Retention')}</span>
            </div>
            <div className="text-center">
              <span className="text-sm font-bold block text-white">HD+</span>
              <span className="text-[9px] text-slate-400">{t('animations.readyResolution', 'Ready Resolution')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Animation Configuration Dashboard */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-base font-bold text-gray-900 tracking-tight">{t('animations.galleryTitle', 'Framer Motion Preset Gallery')}</h3>
            <p className="text-xs text-gray-400 mt-1">{t('animations.galleryDesc', 'Select an interactive layout profile to instantly update the drawing board settings.')}</p>
          </div>

          <div className="space-y-3">
            {presets.map((preset) => (
              <div
                key={preset.id}
                onClick={() => handleApplyPreset(preset.id)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 ${
                  activePreset === preset.id
                    ? 'border-indigo-600 bg-indigo-50/35 shadow-md shadow-indigo-50/50'
                    : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/30'
                }`}
              >
                <div className={`p-2.5 rounded-xl border ${
                  activePreset === preset.id 
                    ? 'bg-white border-indigo-200 text-indigo-600' 
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}>
                  <preset.icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                    <span className="text-xs font-bold text-slate-800">{preset.title}</span>
                    <span className={`text-[9px] font-semibold border px-2 py-0.5 rounded-full ${preset.badgeColor} shrink-0`}>
                      {preset.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{preset.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Hue cycle speed modifier (only show if applicable) */}
          <AnimatePresence>
            {(activePreset === 'colorShift' || activePreset === 'ambientGlow') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-5 border-t border-slate-100 space-y-4"
              >
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-gray-700">{t('animations.durationLabel', 'Transition Cycle Duration')}</label>
                    <span className="text-xs font-mono font-bold text-indigo-600">{t('animations.secondsCount', '{speed} seconds', { speed: cycleSpeed })}</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="30"
                    step="1"
                    className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    value={cycleSpeed}
                    onChange={(e) => setCycleSpeed(Number(e.target.value))}
                  />
                  <div className="flex justify-between text-[9px] text-gray-400 font-mono mt-1">
                    <span>{t('animations.hyperFast', '⚡ Hyper Fast (3s)')}</span>
                    <span>{t('animations.smoothLoop', 'Smooth Loop (30s)')}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Digital Signage Best Practices bento card */}
        <div className="bg-gradient-to-br from-indigo-50/30 to-purple-50/20 border border-indigo-100/50 rounded-3xl p-6 shadow-sm">
          <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-widest mb-3">{t('animations.deployTitle', "Where to Deploy Animated QR's")}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-indigo-100/40">
              <Tv className="w-5 h-5 text-indigo-600 mb-2" />
              <h5 className="text-[11px] font-bold text-gray-950">{t('animations.deploy.tv.title', 'Television Ads')}</h5>
              <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">{t('animations.deploy.tv.desc', 'Ensure high color contrast and a 10s repeat loop for viewer capture.')}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-indigo-100/40">
              <Monitor className="w-5 h-5 text-purple-600 mb-2" />
              <h5 className="text-[11px] font-bold text-gray-950">{t('animations.deploy.instore.title', 'In-Store Screens')}</h5>
              <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">{t('animations.deploy.instore.desc', 'Pair custom breathing scale with clear instructions below the container.')}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-indigo-100/40">
              <Video className="w-5 h-5 text-emerald-600 mb-2" />
              <h5 className="text-[11px] font-bold text-gray-950">{t('animations.deploy.stream.title', 'Stream Overlays')}</h5>
              <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">{t('animations.deploy.stream.desc', 'Position at corners with low rotation values to maintain code readability.')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
