import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from '../utils/i18n';

import { QRProject } from '../types';
import { Palette, Check, Zap, CheckCircle2, AlertTriangle, XCircle, Info, Compass, Eye, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const presetColors = [
  { name: 'Slate', main: '#0f172a', grad: '#3b82f6' },
  { name: 'Indigo', main: '#4f46e5', grad: '#ec4899' },
  { name: 'Emerald', main: '#059669', grad: '#10b981' },
  { name: 'Cherry', main: '#b91c1c', grad: '#f43f5e' },
  { name: 'Violet', main: '#6d28d9', grad: '#8b5cf6' },
  { name: 'Amber', main: '#b45309', grad: '#f59e0b' }
];

interface ColorPaletteProps {
  currentProject: Partial<QRProject>;
  onChange: (project: Partial<QRProject>) => void;
}

export default function ColorPalette({
   currentProject, onChange }: ColorPaletteProps) {
  const { t } = useTranslation();
  // Extract values with default fallbacks
  const fgColor = currentProject.design?.fgColor || '#0f172a';
  const bgColor = currentProject.design?.bgColor || '#ffffff';
  const gradientType = currentProject.design?.gradientType || 'none';
  const gradientColor = currentProject.design?.gradientColor || '#4f46e5';

  // Local state for color pickers to prevent full-tree re-render on active dragging
  const [localFgColor, setLocalFgColor] = useState(fgColor);
  const [localBgColor, setLocalBgColor] = useState(bgColor);
  const [localGradientColor, setLocalGradientColor] = useState(gradientColor);

  // Brand Harmony States
  const [harmonyType, setHarmonyType] = useState<'complementary' | 'analogous' | 'triadic' | 'monochromatic'>('complementary');
  const [selectedHarmonyColor, setSelectedHarmonyColor] = useState<string | null>(null);
  const [appliedField, setAppliedField] = useState<string | null>(null);

  // Keep selected suggested harmony color in bounds when input color or harmony mode changes
  const harmonySuggestions = generateHarmony(localFgColor, harmonyType);
  useEffect(() => {
    if (harmonySuggestions.length > 0) {
      const exists = harmonySuggestions.some(s => s.hex.toLowerCase() === selectedHarmonyColor?.toLowerCase());
      if (!exists) {
        setSelectedHarmonyColor(harmonySuggestions[0].hex);
      }
    }
  }, [localFgColor, harmonyType, selectedHarmonyColor]);

  // Real-time contrast and scannability calculations
  const primaryContrast = getContrastRatio(localFgColor, localBgColor);
  const gradientContrast = gradientType !== 'none' ? getContrastRatio(localGradientColor, localBgColor) : primaryContrast;
  const finalContrast = Math.min(primaryContrast, gradientContrast);
  const isInverted = isLightOnDark(localFgColor, localBgColor);

  // Sync local states if the parent project design properties change externally (e.g. loading another preset, custom template)
  useEffect(() => {
    setLocalFgColor(fgColor);
  }, [fgColor]);

  useEffect(() => {
    setLocalBgColor(bgColor);
  }, [bgColor]);

  useEffect(() => {
    setLocalGradientColor(gradientColor);
  }, [gradientColor]);

  // Determine active preset based on current values
  const matchedPreset = presetColors.find(
    col => col.main.toLowerCase() === fgColor.toLowerCase() &&
           col.grad.toLowerCase() === gradientColor.toLowerCase()
  );
  const activePalette = matchedPreset ? matchedPreset.name : 'Custom';

  // Save the currently active palette to localStorage whenever it changes
  useEffect(() => {
    try {
      console.log(`[ColorPalette] Syncing active palette with localStorage: "${activePalette}"`);
      localStorage.setItem('qr-active-palette', activePalette);
    } catch (err) {
      console.error('[ColorPalette] Error writing to localStorage:', err);
    }
  }, [activePalette]);

  // Sync local variables to CSS Custom Properties on the document root
  // This allows any element on the page (or inside active preview elements) to use var(--qr-dynamic-bg)
  // for smooth styling and real-time animation with zero React CPU re-renders.
  useEffect(() => {
    try {
      const root = document.documentElement;
      root.style.setProperty('--qr-dynamic-fg', localFgColor);
      root.style.setProperty('--qr-dynamic-bg', localBgColor);
      root.style.setProperty('--qr-dynamic-grad', localGradientColor);
    } catch (err) {
      console.warn('[ColorPalette] Error updating CSS variable properties:', err);
    }
  }, [localFgColor, localBgColor, localGradientColor]);

  // Debouncing timeout storage
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Unified function to update multiple design fields in a single change event
  const updateDesignFields = (fields: Partial<NonNullable<QRProject['design']>>, immediate = false) => {
    try {
      const mergedDesign = {
        fgColor: '#0f172a',
        bgColor: '#ffffff',
        gradientType: 'none' as const,
        gradientColor: '#4f46e5',
        dotStyle: 'square' as const,
        eyeStyle: 'square' as const,
        margin: 20,
        ...(currentProject.design || {}),
        ...fields
      };
      
      const fireUpdate = () => {
        console.log('[ColorPalette] Fire state update for QR render:', fields);
        onChange({
          ...currentProject,
          design: mergedDesign
        });
      };

      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      if (immediate) {
        fireUpdate();
      } else {
        // debounce to optimize real-time slider updates (e.g. palette dragging)
        updateTimeoutRef.current = setTimeout(fireUpdate, 120);
      }
    } catch (err) {
      console.error('[ColorPalette] Failed to update design fields:', err);
    }
  };

  const handlePresetSelect = (preset: typeof presetColors[0]) => {
    console.log(`[ColorPalette] Preset selected: "${preset.name}"`, preset);
    // Presets should trigger immediate updates
    setLocalFgColor(preset.main);
    setLocalGradientColor(preset.grad);
    updateDesignFields({
      fgColor: preset.main,
      gradientColor: preset.grad
    }, true);
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Preset Buttons section */}
      <motion.div
        variants={itemVariants}
        className="p-4 bg-gray-50/40 rounded-xl border border-gray-200/40 hover:bg-white hover:border-gray-200/80 transition-all duration-300 shadow-sm"
      >
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-semibold text-gray-900 tracking-wider uppercase block">
            {t('colorPalette.presetLabel')}
          </label>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-slate-100 text-slate-500 font-mono">
            {activePalette === 'Custom' ? t('colorPalette.custom') : t('colorPalette.' + activePalette.toLowerCase(), activePalette)}
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {/* Preset Swatches list */}
          <div className="flex items-center gap-2 flex-wrap" id="palette-presets-container">
            {presetColors.map(col => {
              const isActive = activePalette === col.name;
              return (
                <button
                  key={col.name}
                  type="button"
                  id={`palette-preset-${col.name.toLowerCase()}`}
                  onClick={() => handlePresetSelect(col)}
                  className="relative px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer overflow-hidden"
                  style={{
                    borderColor: isActive ? 'transparent' : undefined
                  }}
                >
                  {/* Framer motion selection background */}
                  {isActive && (
                    <motion.div
                      layoutId="activePaletteBackground"
                      className="absolute inset-0 bg-indigo-50/80"
                      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    />
                  )}

                  <span className="relative z-10 flex items-center gap-1.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-sm border border-black/5 flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${col.main} 0%, ${col.main} 50%, ${col.grad} 50%, ${col.grad} 100%)`
                      }}
                    />
                    <span className={isActive ? 'text-indigo-700  font-semibold' : 'text-gray-600 '}>
                      {t('colorPalette.' + col.name.toLowerCase(), col.name)}
                    </span>
                    {isActive && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-0.5 flex-shrink-0"
                      >
                        <Check className="w-3 h-3 text-indigo-600 stroke-[3px]" />
                      </motion.span>
                    )}
                  </span>
                </button>
              );
            })}

            {/* Custom Palette Button */}
            <div className="relative">
              {activePalette === 'Custom' && (
                <motion.div
                  layoutId="activePaletteBackground"
                  className="absolute inset-0 bg-amber-50 rounded-xl"
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                />
              )}
              <button
                type="button"
                id="palette-preset-custom"
                className={`relative z-10 px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 cursor-default transition-all ${ activePalette === 'Custom' ? 'border-amber-300 text-amber-700 font-semibold shadow-3xs' : 'bg-white/50 border-dashed border-gray-200 text-gray-400' }`}
                style={{
                  borderColor: activePalette === 'Custom' ? 'transparent' : undefined
                }}
              >
                <Palette className="w-3.5 h-3.5 text-amber-600" />
                <span>{t('colorPalette.custom')}</span>
              </button>
            </div>
          </div>

          {/* Color pickers selection */}
          <div className="grid grid-cols-2 gap-3 mt-1">
            <div className="relative">
              <label htmlFor="fg-color-picker" className="text-[10px] text-gray-600 font-medium block mb-1">{t('colorPalette.fgLabel')}</label>
              <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-xl border border-gray-200/80 hover:border-gray-300 transition-all duration-200">
                <input
                  type="color"
                  id="fg-color-picker"
                  aria-label="Foreground Color"
                  className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl cursor-pointer border-0 bg-transparent shrink-0 focus:ring-0 focus:outline-none transition-transform active:scale-95"
                  value={localFgColor}
                  onChange={e => {
                    const val = e.target.value;
                    setLocalFgColor(val);
                    updateDesignFields({ fgColor: val });
                  }}
                />
                <span className="text-xs font-mono text-gray-600 uppercase font-semibold block select-all">
                  {localFgColor}
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="bg-color-picker" className="text-[10px] text-gray-600 font-medium block mb-1">{t('colorPalette.bgLabel')}</label>
              <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-xl border border-gray-200/80 hover:border-gray-300 transition-all duration-200 font-sans">
                <input
                  type="color"
                  id="bg-color-picker"
                  aria-label="Background Color"
                  className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl cursor-pointer border-0 bg-transparent shrink-0 focus:ring-0 focus:outline-none transition-transform active:scale-95"
                  value={localBgColor}
                  onChange={e => {
                    const val = e.target.value;
                    setLocalBgColor(val);
                    updateDesignFields({ bgColor: val });
                  }}
                />
                <span className="text-xs font-mono text-gray-600 uppercase font-semibold block select-all">
                  {localBgColor}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Gradient Options Section */}
      <motion.div
        variants={itemVariants}
        className="p-4 bg-gray-50/40 rounded-xl border border-gray-200/40 hover:bg-white hover:border-gray-200/80 transition-all duration-300 shadow-sm"
      >
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-gray-900 tracking-wider uppercase block">
            {t('colorPalette.gradientTitle')}
          </label>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-2">
          {(['none', 'linear', 'radial'] as const).map(g => (
            <button
              key={g}
              type="button"
              id={`gradient-btn-${g}`}
              className={`py-1.5 rounded-lg border text-xs capitalize transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${ gradientType === g ? 'bg-gray-900 text-white border-gray-900 font-semibold shadow-xs' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50' }`}
              onClick={() => updateDesignFields({ gradientType: g }, true)}
            >
              {g === 'none' ? t('palette.solidFill', 'Solid Fill') : g === 'linear' ? t('palette.linearGradient', 'Linear Gradient') : t('palette.radialGradient', 'Radial Gradient')}
            </button>
          ))}
        </div>

        <AnimatePresence mode="popLayout">
          {gradientType !== 'none' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 26 }}
              className="overflow-hidden"
            >
              <div className="flex items-center justify-between gap-3 mt-2 bg-white/60 p-2 rounded-xl border border-gray-200/50">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                  <span className="text-[10px] text-gray-600 font-semibold">{t('colorPalette.gradientDestination')}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-gray-200 shrink-0">
                  <input
                    type="color"
                    id="gradient-color-picker"
                    className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl cursor-pointer border-0 bg-transparent select-none focus:outline-none focus:ring-0 transition-transform active:scale-90"
                    value={localGradientColor}
                    onChange={e => {
                      const val = e.target.value;
                      setLocalGradientColor(val);
                      updateDesignFields({ gradientColor: val });
                    }}
                  />
                  <span className="text-[10px] font-mono text-gray-600 uppercase font-bold">
                    {localGradientColor}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Brand Harmony Suggestions Section */}
      <motion.div
        variants={itemVariants}
        className="p-4 bg-gray-50/40 rounded-xl border border-gray-200/40 hover:bg-white hover:border-gray-200/80 transition-all duration-300 shadow-sm flex flex-col gap-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-indigo-500 animate-spin-slow" style={{ animationDuration: '8s' }} />
            <label className="text-xs font-semibold text-gray-900 tracking-wider uppercase block">
              {t('colorPalette.brandHarmony')}
            </label>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-indigo-50 text-indigo-600 font-mono">
            {t('colorPalette.colorTheory')}
          </span>
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed">
          {t('colorPalette.brandHarmonyDesc')}
        </p>

        {/* Harmony Mode Selector Buttons */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-lg">
          {(['complementary', 'analogous', 'triadic', 'monochromatic'] as const).map(mode => (
            <button
              key={mode}
              type="button"
              id={`harmony-tab-${mode}`}
              className={`py-1 rounded-md text-[10px] font-medium capitalize transition-all duration-150 cursor-pointer ${
                harmonyType === mode
                  ? 'bg-white text-slate-900 shadow-3xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              onClick={() => {
                setHarmonyType(mode);
                const newSwatches = generateHarmony(localFgColor, mode);
                if (newSwatches.length > 0) {
                  setSelectedHarmonyColor(newSwatches[0].hex);
                }
              }}
            >
              {mode === 'monochromatic' ? t('colorPalette.harmony.monochromatic') : t('colorPalette.harmony.' + mode)}
            </button>
          ))}
        </div>

        {/* Selected Mode Summary */}
        <div className="text-[10px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 italic leading-snug">
          {harmonyType === 'complementary' && t('colorPalette.harmony.desc.complementary')}
          {harmonyType === 'analogous' && t('colorPalette.harmony.desc.analogous')}
          {harmonyType === 'triadic' && t('colorPalette.harmony.desc.triadic')}
          {harmonyType === 'monochromatic' && t('colorPalette.harmony.desc.monochromatic')}
        </div>

        {/* Harmony Swatches Grid */}
        <div className="grid grid-cols-3 gap-2 mt-1">
          {harmonySuggestions.map((swatch, idx) => {
            const isSelected = selectedHarmonyColor?.toLowerCase() === swatch.hex.toLowerCase();
            return (
              <button
                key={idx}
                type="button"
                id={`harmony-swatch-${idx}`}
                className={`p-2.5 rounded-xl border text-left transition-all duration-200 flex flex-col items-center gap-1.5 cursor-pointer relative ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/20 ring-1 ring-indigo-400'
                    : 'border-slate-200/60 bg-white hover:border-slate-300 hover:bg-slate-50/30'
                }`}
                onClick={() => setSelectedHarmonyColor(swatch.hex)}
              >
                {/* Colored circle */}
                <div
                  className="w-8 h-8 rounded-full border border-black/10 shadow-sm relative shrink-0"
                  style={{ backgroundColor: swatch.hex }}
                >
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-full">
                      <Check className="w-4 h-4 text-white stroke-[3.5]" />
                    </div>
                  )}
                </div>

                <div className="text-center w-full">
                  <span className="text-[10px] font-bold text-slate-800 block truncate leading-tight">
                    {t('colorPalette.harmony.swatch.' + swatch.name.toLowerCase().replace(/ /g, '_'), swatch.name)}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 uppercase block font-semibold leading-none mt-0.5">
                    {swatch.hex}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Action Application Panel for Selected Color */}
        {selectedHarmonyColor && (() => {
          const activeSwatch = harmonySuggestions.find(s => s.hex.toLowerCase() === selectedHarmonyColor.toLowerCase());
          return (
            <div className="mt-1 p-3 bg-white rounded-xl border border-slate-200/80 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-700">
                    {t('colorPalette.applyAccent')} <span className="font-mono text-indigo-600 uppercase">{selectedHarmonyColor}</span>
                  </span>
                  {activeSwatch && (
                    <span className="text-[9px] text-slate-400 leading-tight">
                      {t('colorPalette.harmony.role.' + activeSwatch.name.toLowerCase().replace(/ /g, '_'), activeSwatch.role)}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5 mt-0.5">
                <button
                  type="button"
                  id="btn-apply-harmony-gradient"
                  className="py-1.5 px-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-700 text-[10px] font-bold rounded-lg border border-slate-200 transition-all flex flex-col items-center gap-1 cursor-pointer"
                  onClick={() => {
                    setLocalGradientColor(selectedHarmonyColor);
                    updateDesignFields({ gradientType: 'linear', gradientColor: selectedHarmonyColor }, true);
                    setAppliedField('gradient');
                    setTimeout(() => setAppliedField(null), 1500);
                  }}
                >
                  <Zap className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>
                    {appliedField === 'gradient' ? t('colorPalette.applied') : t('colorPalette.setGradient')}
                  </span>
                </button>

                <button
                  type="button"
                  id="btn-apply-harmony-frame"
                  className="py-1.5 px-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 text-slate-700 text-[10px] font-bold rounded-lg border border-slate-200 transition-all flex flex-col items-center gap-1 cursor-pointer"
                  onClick={() => {
                    updateDesignFields({ frameColor: selectedHarmonyColor }, true);
                    setAppliedField('frame');
                    setTimeout(() => setAppliedField(null), 1500);
                  }}
                >
                  <Layout className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>
                    {appliedField === 'frame' ? t('colorPalette.applied') : t('colorPalette.setFrame')}
                  </span>
                </button>

                <button
                  type="button"
                  id="btn-apply-harmony-eyes"
                  className="py-1.5 px-2 bg-slate-50 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 text-slate-700 text-[10px] font-bold rounded-lg border border-slate-200 transition-all flex flex-col items-center gap-1 cursor-pointer"
                  onClick={() => {
                    updateDesignFields({
                      eyeColorTopLeft: selectedHarmonyColor,
                      eyeColorTopRight: selectedHarmonyColor,
                      eyeColorBottomLeft: selectedHarmonyColor
                    }, true);
                    setAppliedField('eyes');
                    setTimeout(() => setAppliedField(null), 1500);
                  }}
                >
                  <Eye className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>
                    {appliedField === 'eyes' ? t('colorPalette.applied') : t('colorPalette.setEyes')}
                  </span>
                </button>
              </div>
            </div>
          );
        })()}
      </motion.div>

      {/* Real-time Scannability Checker */}
      <motion.div
        variants={itemVariants}
        className="p-4 bg-gray-50/40 rounded-xl border border-gray-200/40 hover:bg-white hover:border-gray-200/80 transition-all duration-300 shadow-sm flex flex-col gap-3"
      >
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-gray-900 tracking-wider uppercase block">
            {t('scannability.title')}
          </label>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-slate-100 text-slate-500 font-mono">
            {t('scannability.statusLabel')}
          </span>
        </div>

        {/* Status card */}
        {(() => {
          let statusBg = 'bg-emerald-50/30';
          let statusBorder = 'border-emerald-200/60';
          let statusText = 'text-emerald-800';
          let statusIconColor = 'text-emerald-500';
          let statusTitle = t('scannability.status.perfect.title');
          let statusDesc = t('scannability.status.perfect.desc', undefined, { ratio: finalContrast.toFixed(1) });
          let StatusIcon = CheckCircle2;

          if (finalContrast < 3) {
            statusBg = 'bg-rose-50/40';
            statusBorder = 'border-rose-200/60';
            statusText = 'text-rose-800';
            statusIconColor = 'text-rose-500';
            statusTitle = t('scannability.status.risk.title');
            statusDesc = t('scannability.status.risk.desc', undefined, { ratio: finalContrast.toFixed(1) });
            StatusIcon = XCircle;
          } else if (finalContrast < 4.5) {
            statusBg = 'bg-amber-50/40';
            statusBorder = 'border-amber-200/60';
            statusText = 'text-amber-800';
            statusIconColor = 'text-amber-500';
            statusTitle = t('scannability.status.moderate.title');
            statusDesc = t('scannability.status.moderate.desc', undefined, { ratio: finalContrast.toFixed(1) });
            StatusIcon = AlertTriangle;
          } else if (finalContrast < 7) {
            statusBg = 'bg-blue-50/30';
            statusBorder = 'border-blue-200/60';
            statusText = 'text-blue-800';
            statusIconColor = 'text-blue-500';
            statusTitle = t('scannability.status.good.title');
            statusDesc = t('scannability.status.good.desc', undefined, { ratio: finalContrast.toFixed(1) });
            StatusIcon = CheckCircle2;
          }

          return (
            <div className={`p-3.5 rounded-xl border ${statusBg} ${statusBorder} flex gap-3 transition-all duration-300`}>
              <StatusIcon className={`w-5 h-5 ${statusIconColor} shrink-0 mt-0.5`} />
              <div className="flex flex-col gap-1">
                <span className={`text-xs font-bold ${statusText} flex items-center gap-1.5`}>
                  {statusTitle}
                  <span className="font-mono text-[10px] opacity-75 font-normal">
                    ({finalContrast.toFixed(1)}:1)
                  </span>
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {statusDesc}
                </p>
              </div>
            </div>
          );
        })()}

        {/* Context-aware advice tips */}
        {(isInverted || (gradientType !== 'none' && gradientContrast < primaryContrast)) && (
          <div className="p-3 bg-slate-50/50 rounded-lg border border-slate-200/40 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>{t('scannability.tipsTitle')}</span>
            </div>
            
            <div className="space-y-1.5">
              {isInverted && (
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  <strong className="text-slate-600">{t('scannability.invertedTitle')}</strong> {t('scannability.invertedDesc')}
                </p>
              )}
              {gradientType !== 'none' && gradientContrast < primaryContrast && (
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  <strong className="text-slate-600">{t('scannability.gradientTitle')}</strong> {t('scannability.gradientDesc', undefined, { gradColor: localGradientColor, gradContrast: gradientContrast.toFixed(1), mainContrast: primaryContrast.toFixed(1) })}
                </p>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// Helper functions for real-time contrast checking
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
}

function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return 1;
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

function isLightOnDark(fgHex: string, bgHex: string): boolean {
  const rgb1 = hexToRgb(fgHex);
  const rgb2 = hexToRgb(bgHex);
  if (!rgb1 || !rgb2) return false;
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  return lum1 > lum2;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

function hexToHsl(hex: string): HSL {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  h /= 360;

  let r = l;
  let g = l;
  let b = l;

  if (s !== 0) {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' : '' + hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

interface HarmonySwatch {
  hex: string;
  name: string;
  role: string;
}

function generateHarmony(primaryHex: string, type: 'complementary' | 'analogous' | 'triadic' | 'monochromatic'): HarmonySwatch[] {
  const hsl = hexToHsl(primaryHex);
  const swatches: HarmonySwatch[] = [];

  switch (type) {
    case 'complementary': {
      const compHue = (hsl.h + 180) % 360;
      const split1 = (hsl.h + 150) % 360;
      const split2 = (hsl.h + 210) % 360;

      swatches.push({
        hex: hslToHex(compHue, hsl.s, hsl.l),
        name: 'Direct Opposite',
        role: 'Perfect eye-catching contrast for frames & accents'
      });
      swatches.push({
        hex: hslToHex(split1, Math.max(20, hsl.s - 10), Math.min(80, hsl.l + 10)),
        name: 'Split Warm',
        role: 'Softer vibrant pairing with warm undertones'
      });
      swatches.push({
        hex: hslToHex(split2, Math.max(20, hsl.s - 10), Math.max(20, hsl.l - 10)),
        name: 'Split Cool',
        role: 'Softer vibrant pairing with cool undertones'
      });
      break;
    }
    case 'analogous': {
      const h1 = (hsl.h - 30 + 360) % 360;
      const h2 = (hsl.h + 30) % 360;
      const h3 = (hsl.h + 60) % 360;

      swatches.push({
        hex: hslToHex(h1, hsl.s, hsl.l),
        name: 'Left Neighbor',
        role: 'Adjacent hue, provides a natural fluid blending gradient'
      });
      swatches.push({
        hex: hslToHex(h2, hsl.s, hsl.l),
        name: 'Right Neighbor',
        role: 'Adjacent hue, perfect for secondary eye colors'
      });
      swatches.push({
        hex: hslToHex(h3, Math.max(15, hsl.s - 15), Math.min(85, hsl.l + 15)),
        name: 'Extended Accent',
        role: 'Slightly further along the wheel for soft frame accents'
      });
      break;
    }
    case 'triadic': {
      const h1 = (hsl.h + 120) % 360;
      const h2 = (hsl.h + 240) % 360;
      const h3 = (hsl.h + 120) % 360;

      swatches.push({
        hex: hslToHex(h1, hsl.s, hsl.l),
        name: 'Triadic Pair A',
        role: 'High energy triad, incredible for custom QR gradients'
      });
      swatches.push({
        hex: hslToHex(h2, hsl.s, hsl.l),
        name: 'Triadic Pair B',
        role: 'Complementary triad balance, works great on finder frames'
      });
      swatches.push({
        hex: hslToHex(h3, Math.min(100, hsl.s + 15), Math.max(10, hsl.l - 20)),
        name: 'Deep Accent',
        role: 'Darkened triadic shade, perfect for subtle scan margins'
      });
      break;
    }
    case 'monochromatic': {
      const s1 = Math.min(100, hsl.s + 20);
      const l1 = Math.min(85, hsl.l + 25);

      const s2 = Math.max(10, hsl.s - 20);
      const l2 = Math.max(15, hsl.l - 25);

      const s3 = Math.max(20, hsl.s - 5);
      const l3 = Math.max(10, hsl.l - 12);

      swatches.push({
        hex: hslToHex(hsl.h, s1, l1),
        name: 'Bright Tint',
        role: 'Clean lighter shade of main color, great for backgrounds'
      });
      swatches.push({
        hex: hslToHex(hsl.h, s2, l2),
        name: 'Deep Shade',
        role: 'Elegant dark tone, perfect for high-contrast scanning'
      });
      swatches.push({
        hex: hslToHex(hsl.h, s3, l3),
        name: 'Active Middle',
        role: 'Balanced intermediate tone for seamless designs'
      });
      break;
    }
  }

  return swatches;
}
