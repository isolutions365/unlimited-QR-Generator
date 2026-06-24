import React, { useEffect, useState, useRef } from 'react';
import { QRProject } from '../types';
import { Palette, Check, Sparkles, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
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

export default function ColorPalette({ currentProject, onChange }: ColorPaletteProps) {
  // Extract values with default fallbacks
  const fgColor = currentProject.design?.fgColor || '#0f172a';
  const bgColor = currentProject.design?.bgColor || '#ffffff';
  const gradientType = currentProject.design?.gradientType || 'none';
  const gradientColor = currentProject.design?.gradientColor || '#4f46e5';

  // Local state for color pickers to prevent full-tree re-render on active dragging
  const [localFgColor, setLocalFgColor] = useState(fgColor);
  const [localBgColor, setLocalBgColor] = useState(bgColor);
  const [localGradientColor, setLocalGradientColor] = useState(gradientColor);

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
          <label className="text-xs font-semibold text-gray-700 tracking-wider uppercase block">
            Color Palette
          </label>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-slate-100 text-slate-500 font-mono">
            {activePalette}
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
                    <span className={isActive ? 'text-indigo-700 font-semibold' : 'text-gray-600'}>
                      {col.name}
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
                className={`relative z-10 px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 cursor-default transition-all ${
                  activePalette === 'Custom'
                    ? 'border-amber-300 text-amber-700 font-semibold shadow-3xs'
                    : 'bg-white/50 border-dashed border-gray-200 text-gray-400'
                }`}
                style={{
                  borderColor: activePalette === 'Custom' ? 'transparent' : undefined
                }}
              >
                <Palette className="w-3.5 h-3.5 text-amber-600" />
                <span>Custom</span>
              </button>
            </div>
          </div>

          {/* Color pickers selection */}
          <div className="grid grid-cols-2 gap-3 mt-1">
            <div className="relative">
              <span className="text-[10px] text-gray-500 font-medium block mb-1">Foreground Color</span>
              <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-xl border border-gray-200/80 hover:border-gray-300 transition-all duration-200">
                <input
                  type="color"
                  id="fg-color-picker"
                  className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent shrink-0 focus:ring-0 focus:outline-none transition-transform active:scale-95"
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
              <span className="text-[10px] text-gray-500 font-medium block mb-1">Background Color</span>
              <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-xl border border-gray-200/80 hover:border-gray-300 transition-all duration-200 font-sans">
                <input
                  type="color"
                  id="bg-color-picker"
                  className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent shrink-0 focus:ring-0 focus:outline-none transition-transform active:scale-95"
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
          <label className="text-xs font-semibold text-gray-700 tracking-wider uppercase block">
            Gradient Style
          </label>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-2">
          {(['none', 'linear', 'radial'] as const).map(g => (
            <button
              key={g}
              type="button"
              id={`gradient-btn-${g}`}
              className={`py-1.5 rounded-lg border text-xs capitalize transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                gradientType === g
                  ? 'bg-gray-900 text-white border-gray-900 font-semibold shadow-xs'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => updateDesignFields({ gradientType: g }, true)}
            >
              {g}
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
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                  <span className="text-[10px] text-gray-600 font-semibold">Gradient Destination:</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-gray-200 shrink-0">
                  <input
                    type="color"
                    id="gradient-color-picker"
                    className="w-5 h-5 rounded-md cursor-pointer border-0 bg-transparent select-none focus:outline-none focus:ring-0 transition-transform active:scale-90"
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

      {/* Real-time Scannability Checker */}
      <motion.div
        variants={itemVariants}
        className="p-4 bg-gray-50/40 rounded-xl border border-gray-200/40 hover:bg-white hover:border-gray-200/80 transition-all duration-300 shadow-sm flex flex-col gap-3"
      >
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-gray-700 tracking-wider uppercase block">
            QR Scannability Checker
          </label>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-slate-100 text-slate-500 font-mono">
            Contrast Status
          </span>
        </div>

        {/* Status card */}
        {(() => {
          let statusBg = 'bg-emerald-50/30';
          let statusBorder = 'border-emerald-200/60';
          let statusText = 'text-emerald-800';
          let statusIconColor = 'text-emerald-500';
          let statusTitle = 'Perfect Contrast';
          let statusDesc = `Excellent contrast ratio of ${finalContrast.toFixed(1)}:1. This QR code will scan flawlessly under any normal or dim lighting conditions on all mobile devices.`;
          let StatusIcon = CheckCircle2;

          if (finalContrast < 3) {
            statusBg = 'bg-rose-50/40';
            statusBorder = 'border-rose-200/60';
            statusText = 'text-rose-800';
            statusIconColor = 'text-rose-500';
            statusTitle = 'High Scan Failure Risk';
            statusDesc = `Critical warning! Very low contrast ratio of ${finalContrast.toFixed(1)}:1. Camera scanners will likely fail to read this QR code. Please increase the contrast between the foreground and background colors immediately.`;
            StatusIcon = XCircle;
          } else if (finalContrast < 4.5) {
            statusBg = 'bg-amber-50/40';
            statusBorder = 'border-amber-200/60';
            statusText = 'text-amber-800';
            statusIconColor = 'text-amber-500';
            statusTitle = 'Moderate Scan Risk';
            statusDesc = `Contrast ratio of ${finalContrast.toFixed(1)}:1 is below ideal levels. Some older devices or dim environments may struggle to decode this QR code. Consider making the foreground darker or background lighter.`;
            StatusIcon = AlertTriangle;
          } else if (finalContrast < 7) {
            statusBg = 'bg-blue-50/30';
            statusBorder = 'border-blue-200/60';
            statusText = 'text-blue-800';
            statusIconColor = 'text-blue-500';
            statusTitle = 'Good Scannability';
            statusDesc = `Good contrast ratio of ${finalContrast.toFixed(1)}:1. Highly readable by almost all modern smartphone camera scanners. Safe for production use.`;
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
              <span>Scannability Tips</span>
            </div>
            
            <div className="space-y-1.5">
              {isInverted && (
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  <strong className="text-slate-600">Inverted QR Code:</strong> You are using a light foreground on a dark background. While modern smartphones read this easily, some legacy barcode scanners and older scanner apps cannot process inverted codes. Consider using a dark foreground on a light background for maximum physical print safety.
                </p>
              )}
              {gradientType !== 'none' && gradientContrast < primaryContrast && (
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  <strong className="text-slate-600">Gradient Warning:</strong> Your secondary gradient color ({localGradientColor}) has lower contrast ({gradientContrast.toFixed(1)}:1) than the main color ({primaryContrast.toFixed(1)}:1). Make sure the gradient stays dark enough relative to the background across the entire code.
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
