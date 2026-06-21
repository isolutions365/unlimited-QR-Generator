import React, { useEffect, useState, useRef } from 'react';
import { QRProject } from '../types';
import { Palette, Check, Sparkles } from 'lucide-react';
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
    </div>
  );
}
