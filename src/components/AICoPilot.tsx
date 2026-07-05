import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Palette, Zap, Cpu, Check, 
  HelpCircle, AlertCircle, Info, RefreshCw, BarChart, Eye, Search 
} from 'lucide-react';
import { api } from '../lib/api';
import { QRProject } from '../types';

interface AICoPilotProps {
  currentProject: Partial<QRProject>;
  onChange: (project: Partial<QRProject>) => void;
}

export default function AICoPilot({ currentProject, onChange }: AICoPilotProps) {
  const [activeSegment, setActiveSegment] = useState<'colors' | 'styles' | 'brand' | 'audit'>('audit');
  
  // Loading and feedback states
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Colors suggestions inputs and output
  const [industry, setIndustry] = useState('');
  const [promptVibe, setPromptVibe] = useState('');
  const [colorResult, setColorResult] = useState<any>(null);

  // Styles suggestions input/output
  const [styleVibe, setStyleVibe] = useState('');
  const [styleResult, setStyleResult] = useState<any>(null);

  // Brand Matcher inputs/output
  const [brandName, setBrandName] = useState('');
  const [brandDesc, setBrandDesc] = useState('');
  const [brandResult, setBrandResult] = useState<any>(null);

  // Live Audit Recommendations and Layout optimization results
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [optimizationLog, setOptimizationLog] = useState<string | null>(null);

  // Deconstruct content/design from project safely
  const qrContent = currentProject.content || 'https://google.com';
  const design = currentProject.design || {
    fgColor: '#0f172a',
    bgColor: '#ffffff',
    gradientType: 'none',
    gradientColor: '#4f46e5',
    dotStyle: 'square',
    eyeStyle: 'square',
    margin: 20,
    errorCorrectionLevel: 'H'
  };

  // Perform automatic readability audit whenever content or design updates
  useEffect(() => {
    let active = true;
    const fetchAudit = async () => {
      setIsAuditing(true);
      try {
        const res = await api.getDesignRecommendations(qrContent, design);
        if (active) {
          setRecommendations(res.recommendations || []);
        }
      } catch (err) {
        console.warn('Realtime design audit check skipped', err);
      } finally {
        if (active) setIsAuditing(false);
      }
    };

    const timer = setTimeout(() => {
      fetchAudit();
    }, 800); // Debounce typing adjustments

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [qrContent, design.fgColor, design.bgColor, design.gradientType, design.gradientColor, design.dotStyle, design.eyeStyle, design.margin, design.logoUrl]);

  // Apply a suggested palette to current QR code state
  const handleApplyPalette = (palette: any) => {
    onChange({
      ...currentProject,
      design: {
        ...design,
        fgColor: palette.primaryColor,
        bgColor: palette.bgColor,
        gradientType: palette.gradientType,
        gradientColor: palette.gradientColor
      }
    });
    setSuccessMessage('AI Palette applied successfully!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Apply suggested shape styles (eyes/dots) to state
  const handleApplyStyles = (styles: any) => {
    onChange({
      ...currentProject,
      design: {
        ...design,
        dotStyle: styles.dotStyle,
        eyeStyle: styles.eyeStyle,
        errorCorrectionLevel: styles.errorCorrectionLevel,
        logoScale: styles.logoScale || design.logoScale
      }
    });
    setSuccessMessage('AI Style preset loaded successfully!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Apply full brand-match suite
  const handleApplyBrandMatch = (brand: any) => {
    onChange({
      ...currentProject,
      design: {
        ...design,
        fgColor: brand.primaryColor,
        bgColor: brand.bgColor,
        gradientType: brand.gradientType,
        gradientColor: brand.gradientColor,
        dotStyle: brand.dotStyle,
        eyeStyle: brand.eyeStyle,
        logoScale: brand.logoScale
      }
    });
    setSuccessMessage('Full Brand Audit identity implemented!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // 1-Click Smart Layout Optimization trigger
  const handleOptimizeLayout = async () => {
    setLoading(true);
    setOptimizationLog(null);
    try {
      const opt = await api.getLayoutOptimization(qrContent, design);
      onChange({
        ...currentProject,
        design: {
          ...design,
          errorCorrectionLevel: opt.optimizedErrorCorrection,
          margin: opt.optimizedMargin,
          logoScale: opt.optimizedLogoScale
        }
      });
      setOptimizationLog(opt.vibe);
      setSuccessMessage('QR Code metrics optimized for max clarity!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setSuccessMessage('Could not initiate smart optimizer. Loading fallbacks...');
      setTimeout(() => setSuccessMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Query AI Color Suggestions API
  const handleGetColorSuggestions = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setColorResult(null);
    try {
      const res = await api.suggestColors(industry, promptVibe);
      setColorResult(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Query AI QR Style Suggestions API
  const handleGetStyleSuggestions = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStyleResult(null);
    try {
      const res = await api.suggestStyles(styleVibe);
      setStyleResult(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Query AI Brand Matcher API
  const handleGetBrandMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setBrandResult(null);
    try {
      const res = await api.brandMatch(brandName, brandDesc);
      setBrandResult(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 shadow-2xl relative overflow-hidden"
      id="gemini-ai-co-pilot"
    >
      {/* Decorative Aurora meshes */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full filter blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full filter blur-2xl pointer-events-none" />

      {/* Title block */}
      <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-tr from-indigo-500 to-purple-600 p-1.5 rounded-lg text-white">
            <Sparkles className="w-4 h-4 text-emerald-300 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-xs font-black tracking-widest uppercase text-white font-mono">Gemini AI Co-Pilot™</h3>
            <p className="text-[10px] text-slate-200 font-medium">Apple-Inspired Smart QR Analytics Suite</p>
          </div>
        </div>
        <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 font-bold uppercase tracking-wider font-mono">
          Model 3.5 Active
        </span>
      </div>

      {/* Segment Controllers (Glassmorphic Segment Controller) */}
      <div className="flex bg-slate-950/60 p-1 rounded-xl gap-1 border border-slate-850 select-none mb-4">
        {(['audit', 'colors', 'styles', 'brand'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setActiveSegment(tab);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeSegment === tab
                ? 'bg-slate-850 text-white border border-slate-800 shadow-xs'
                : 'text-slate-200 hover:text-white'
            }`}
          >
            {tab === 'audit' ? 'Live Audit' : tab === 'colors' ? 'Colors' : tab === 'styles' ? 'Styles' : 'Brand Match'}
          </button>
        ))}
      </div>

      {/* Feedback banner triggers */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 bg-indigo-950/80 border border-indigo-550/40 rounded-xl p-2.5 flex items-center gap-2 text-indigo-200 text-[10px] font-bold uppercase tracking-wider"
          >
            <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
            <span>{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Panels */}
      <div className="min-h-[160px]">
        {/* TAB 1: Live Audit & Smart layout Optimizer */}
        {activeSegment === 'audit' && (
          <div className="space-y-4">
            <div className="bg-slate-950/40 rounded-xl p-3.5 border border-slate-850/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase text-slate-300 tracking-wider">Scannability Assessment</span>
                {isAuditing && (
                  <span className="text-[9px] text-slate-500 animate-pulse font-mono block">auditing live...</span>
                )}
              </div>
              
              <ul className="space-y-2">
                {recommendations.map((tip, idx) => (
                  <li key={idx} className="text-[11px] text-slate-350 flex items-start gap-2 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Smart 1-Click Layout Optimizer button */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleOptimizeLayout}
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-950/40 flex items-center justify-center gap-2 border border-indigo-500/20 active:scale-[0.98] cursor-pointer"
              >
                {loading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                ) : (
                  <Cpu className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
                )}
                <span>Smart Layout Optimizer</span>
              </button>

              {optimizationLog && (
                <div className="p-3 bg-slate-950/80 border border-slate-850 rounded-xl text-[10px] text-slate-400 leading-relaxed font-sans">
                  <span className="font-extrabold text-white text-[9px] block uppercase tracking-wider mb-0.5">Optimization Report:</span>
                  {optimizationLog}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: AI Color Suggestions */}
        {activeSegment === 'colors' && (
          <div className="space-y-4">
            <form onSubmit={handleGetColorSuggestions} className="grid grid-cols-1 gap-2.5">
              <div>
                <label htmlFor="ai-industry-segment" className="text-[9px] font-extrabold uppercase text-slate-400 tracking-widest block mb-1">Your Industry Segment</label>
                <input
                  id="ai-industry-segment"
                  type="text"
                  placeholder="e.g. Finance, Eco Coffee, Tech Startup"
                  className="w-full text-xs bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="ai-aesthetic-vibe" className="text-[9px] font-extrabold uppercase text-slate-400 tracking-widest block mb-1">Aesthetic Vibe & Mood</label>
                <input
                  id="ai-aesthetic-vibe"
                  type="text"
                  placeholder="e.g. minimalist, futuristic, luxury, nature"
                  className="w-full text-xs bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={promptVibe}
                  onChange={(e) => setPromptVibe(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-[10px] uppercase font-black tracking-widest border border-slate-700 select-none transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Palette className="w-3.5 h-3.5" />}
                <span>Generate Vibe Palette</span>
              </button>
            </form>

            {/* Suggestions Results Display */}
            <AnimatePresence>
              {colorResult && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-slate-950 p-3.5 border border-slate-850 rounded-xl space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex rounded-lg overflow-hidden border border-slate-800 p-0.5 bg-slate-900">
                      <div className="w-6 h-6" style={{ backgroundColor: colorResult.primaryColor }} title="Primary module" />
                      <div className="w-6 h-6" style={{ backgroundColor: colorResult.gradientColor }} title="Gradient highlight" />
                      <div className="w-6 h-6" style={{ backgroundColor: colorResult.bgColor }} title="Canvas back" />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Generated Recommendation</span>
                      <span className="text-[10px] text-white font-mono">{colorResult.primaryColor} → {colorResult.gradientColor}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{colorResult.description}</p>

                  <button
                    type="button"
                    onClick={() => handleApplyPalette(colorResult)}
                    className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[9px] uppercase font-black tracking-wider transition-all cursor-pointer"
                  >
                    Apply Palette to QR Design
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* TAB 3: AI Style Generator */}
        {activeSegment === 'styles' && (
          <div className="space-y-4">
            <form onSubmit={handleGetStyleSuggestions} className="grid grid-cols-1 gap-2.5">
              <div>
                <label htmlFor="ai-target-design" className="text-[9px] font-extrabold uppercase text-slate-400 tracking-widest block mb-1">Target Design Aesthetic</label>
                <input
                  id="ai-target-design"
                  type="text"
                  placeholder="e.g. Luxury, Playful, Cyberpunk, Creative Studio"
                  className="w-full text-xs bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={styleVibe}
                  onChange={(e) => setStyleVibe(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-[10px] uppercase font-black tracking-widest border border-slate-700 select-none transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
                <span>Synthesize Shape Aesthetics</span>
              </button>
            </form>

            <AnimatePresence>
              {styleResult && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-slate-950 p-3.5 border border-slate-850 rounded-xl space-y-3"
                >
                  <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-mono font-bold bg-slate-900 p-2.5 rounded-lg border border-slate-850">
                    <div>
                      <span className="text-[8px] text-slate-500 block uppercase">Corners</span>
                      <span className="text-white uppercase">{styleResult.eyeStyle}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-500 block uppercase">Dots</span>
                      <span className="text-white uppercase">{styleResult.dotStyle}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{styleResult.description}</p>

                  <button
                    type="button"
                    onClick={() => handleApplyStyles(styleResult)}
                    className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[9px] uppercase font-black tracking-wider transition-all cursor-pointer"
                  >
                    Apply Layout Styles
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* TAB 4: Brand Matcher */}
        {activeSegment === 'brand' && (
          <div className="space-y-4">
            <form onSubmit={handleGetBrandMatch} className="grid grid-cols-1 gap-3">
              <div>
                <label htmlFor="ai-brand-name" className="text-[9px] font-extrabold uppercase text-slate-400 tracking-widest block mb-1">Company/Product Name</label>
                <input
                  id="ai-brand-name"
                  type="text"
                  placeholder="e.g. Acme SaaS"
                  className="w-full text-xs bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="ai-brand-desc" className="text-[9px] font-extrabold uppercase text-slate-400 tracking-widest block mb-1">What does your service do?</label>
                <textarea
                  id="ai-brand-desc"
                  placeholder="e.g. We develop secure data synchronization platforms for remote engineering teams."
                  className="w-full text-xs bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 h-16 resize-none"
                  value={brandDesc}
                  onChange={(e) => setBrandDesc(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-[10px] uppercase font-black tracking-widest border border-slate-700 select-none transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                <span>Complete Brand Audit</span>
              </button>
            </form>

            <AnimatePresence>
              {brandResult && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-slate-950 p-3.5 border border-slate-850 rounded-xl space-y-3"
                >
                  <div className="bg-slate-900 px-3 py-2.5 rounded-xl border border-slate-850 text-[11px] leading-relaxed text-slate-350">
                    <span className="text-[8px] font-extrabold text-indigo-400 block uppercase tracking-widest mb-1 font-mono">Auditor Notes</span>
                    {brandResult.explanation}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApplyBrandMatch(brandResult)}
                    className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white rounded-lg text-[9px] uppercase font-black tracking-wider transition-all cursor-pointer"
                  >
                    Implement Completed Brand Package
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
