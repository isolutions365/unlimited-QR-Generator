import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Download, Printer, HelpCircle, Keyboard, RefreshCw } from 'lucide-react';

interface ShortcutsHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShortcutsHelpModal({ isOpen, onClose }: ShortcutsHelpModalProps) {
  // Determine if user is on Mac
  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modifierKey = isMac ? '⌘' : 'Ctrl';

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
            <div className="px-6 pt-7 pb-4 flex justify-between items-start border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-3xs">
                  <Keyboard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 tracking-tight">
                    Keyboard Shortcuts
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium">
                    Boost your productivity with quick keyboard commands
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                aria-label="Close shortcuts help modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content List */}
            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Shortcut rows */}
              <div className="space-y-2.5">
                {/* Save Shortcut */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100/80 hover:bg-slate-100/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Save className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Save Styled QR Template</span>
                      <span className="text-[10px] text-slate-400 block">Saves your design configurations directly</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 text-[10px] font-mono font-bold bg-white border border-slate-200/80 rounded-md text-slate-700 shadow-3xs">{modifierKey}</kbd>
                    <span className="text-xs text-slate-400 font-bold">+</span>
                    <kbd className="px-2.5 py-1 text-[10px] font-mono font-bold bg-white border border-slate-200/80 rounded-md text-slate-700 shadow-3xs">S</kbd>
                  </div>
                </div>

                {/* Download Shortcut */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100/80 hover:bg-slate-100/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Download QR Code</span>
                      <span className="text-[10px] text-slate-400 block">Quickly downloads high-resolution format</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 text-[10px] font-mono font-bold bg-white border border-slate-200/80 rounded-md text-slate-700 shadow-3xs">{modifierKey}</kbd>
                    <span className="text-xs text-slate-400 font-bold">+</span>
                    <kbd className="px-2.5 py-1 text-[10px] font-mono font-bold bg-white border border-slate-200/80 rounded-md text-slate-700 shadow-3xs">D</kbd>
                  </div>
                </div>

                {/* Print Shortcut */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100/80 hover:bg-slate-100/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Printer className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Print & Export Options</span>
                      <span className="text-[10px] text-slate-400 block">Opens print settings overlay instantly</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 text-[10px] font-mono font-bold bg-white border border-slate-200/80 rounded-md text-slate-700 shadow-3xs">{modifierKey}</kbd>
                    <span className="text-xs text-slate-400 font-bold">+</span>
                    <kbd className="px-2.5 py-1 text-[10px] font-mono font-bold bg-white border border-slate-200/80 rounded-md text-slate-700 shadow-3xs">P</kbd>
                  </div>
                </div>

                {/* Open Help Guide */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100/80 hover:bg-slate-100/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Open Help Shortcuts</span>
                      <span className="text-[10px] text-slate-400 block">Displays this exact useful panel</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-2.5 py-1 text-[10px] font-mono font-bold bg-white border border-slate-200/80 rounded-md text-slate-700 shadow-3xs">?</kbd>
                  </div>
                </div>

                {/* Close Overlays / Escape */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100/80 hover:bg-slate-100/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                      <RefreshCw className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Close Modal Windows</span>
                      <span className="text-[10px] text-slate-400 block">Closes active overlays, dropdowns, & dialogs</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-2.5 py-1 text-[10px] font-mono font-bold bg-white border border-slate-200/80 rounded-md text-slate-700 shadow-3xs">Esc</kbd>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer with note */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                Shortcuts are disabled while focused inside text fields or editing inputs to prevent conflicts.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
