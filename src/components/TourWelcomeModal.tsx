import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Compass, Lightbulb, Zap, Sparkles, Wand2, ShieldCheck, ExternalLink } from 'lucide-react';
import { useTranslation } from '../utils/i18n';

interface TourWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
  onOpenWelcomePage?: () => void;
}

export default function TourWelcomeModal({ isOpen, onClose, onStart, onOpenWelcomePage }: TourWelcomeModalProps) {
  const { t } = useTranslation();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const startButtonRef = useRef<HTMLButtonElement>(null);

  // Close on ESC key and trap focus
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        // Focus trap logic
        if (document.activeElement === closeButtonRef.current && e.shiftKey) {
          e.preventDefault();
          startButtonRef.current?.focus();
        } else if (document.activeElement === startButtonRef.current && !e.shiftKey) {
          e.preventDefault();
          closeButtonRef.current?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Auto focus start button for better user flow
    const timer = setTimeout(() => {
      startButtonRef.current?.focus();
    }, 100);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-10000 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="tour-welcome-title">
          {/* Backdrop with elegant fade & blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal Card with spring entrance */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="bg-slate-900 text-slate-100 rounded-3xl w-full max-w-lg border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top decorative gradient bar with Banana & Google Stitch colors */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-indigo-500 to-emerald-400" />

            {/* Header */}
            <div className="px-6 pt-7 pb-4 flex justify-between items-start border-b border-slate-800/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-400/10 text-amber-400 border border-amber-400/20 rounded-2xl flex items-center justify-center shadow-inner">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 id="tour-welcome-title" className="text-base font-bold text-white tracking-tight">
                      Google Nano Banana & Stitch Studio
                    </h3>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      v3.5 AI
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    {t('tour.welcomeSubtitle', "Let's quickly explore the FreeQRBarcodes.com features")}
                  </p>
                </div>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Close welcome tour modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content List */}
            <div className="px-6 py-5 space-y-4">
              <div className="text-sm text-slate-300 leading-relaxed">
                <p>
                  Welcome! Experience our AI-assisted matrix styling, Google Stitch design tokens, high-density vector exports, and real-time scan analytics.
                </p>
              </div>

              {/* Highlights */}
              <div className="grid grid-cols-1 gap-2.5 pt-1">
                <div className="flex gap-3 p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/20">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Google Nano AI Styler</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Auto-stitch eye borders, dot gradients, and centerpiece logos instantly.</p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
                    <Wand2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Google Stitch Architecture</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">30+ custom optical formats: WiFi, vCard, PDF, App Stores & Crypto.</p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">100% Client-Side Privacy</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Zero tracking logs — all matrix generations run securely in your browser.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              {onOpenWelcomePage ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenWelcomePage();
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Explore Full Welcome Page</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {t('tour.maybeLater', 'Maybe Later')}
                </button>
              )}
              
              <div className="flex items-center gap-2">
                <button
                  ref={startButtonRef}
                  type="button"
                  onClick={onStart}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-amber-500/10 active:scale-95 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{t('tour.startTour', 'Start Tour')}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
