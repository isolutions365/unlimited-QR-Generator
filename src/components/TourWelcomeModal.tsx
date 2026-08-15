import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Compass, Lightbulb, Zap } from 'lucide-react';
import { useTranslation } from '../utils/i18n';

interface TourWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
}

export default function TourWelcomeModal({ isOpen, onClose, onStart }: TourWelcomeModalProps) {
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
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Modal Card with spring entrance */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="bg-white rounded-3xl w-full max-w-lg border border-slate-100 shadow-2xl relative overflow-hidden flex flex-col z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top decorative gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />

            {/* Header */}
            <div className="px-6 pt-7 pb-4 flex justify-between items-start">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-3xs">
                  <Zap className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 id="tour-welcome-title" className="text-base font-bold text-gray-900 tracking-tight">
                    {t('tour.welcomeTitle', 'Interactive Workspace Tour')}
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium">
                    {t('tour.welcomeSubtitle', "Let's quickly explore the Free QR Generator features")}
                  </p>
                </div>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                aria-label="Close welcome tour modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content List */}
            <div className="px-6 py-4 space-y-4">
              <div className="text-sm text-slate-600 leading-relaxed space-y-3">
                <p>
                  {t('tour.welcomeBody', 'Welcome! In this 1-minute guided tour, we will walk you through the custom design, tracking, and folder management capabilities of our modern QR station.')}
                </p>
              </div>

              {/* Highlights */}
              <div className="grid grid-cols-1 gap-2.5 pt-2">
                <div className="flex gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100/80">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{t('tour.highlight1Title', 'Learn Visual Branding')}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{t('tour.highlight1Desc', 'Custom eye borders, gradients, dot styles, and centerpiece logo overlays.')}</p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100/80">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{t('tour.highlight2Title', 'Meet Gemini AI Design Co-Pilot')}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{t('tour.highlight2Desc', 'Let our AI instantly style QR grids perfectly tailored to your business description.')}</p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100/80">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{t('tour.highlight3Title', 'Analytics & Tracking')}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{t('tour.highlight3Desc', 'Configure link shortener tracking, scan logs, and custom redirects.')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                {t('tour.maybeLater', 'Maybe Later')}
              </button>
              
              <button
                ref={startButtonRef}
                type="button"
                onClick={onStart}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-md shadow-indigo-500/10 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{t('tour.startTour', 'Start Tour')}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
