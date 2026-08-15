import React from 'react';
import { motion } from 'motion/react';
import { 
  Grid, 
  Zap, 
  FolderHeart, 
  Scan, 
  Settings,
  QrCode
} from 'lucide-react';
import { useTranslation } from '../utils/i18n';

export type MobileTabType = 'tools' | 'generator' | 'saved' | 'scanner' | 'settings';

interface MobileBottomNavProps {
  activeMobileTab: MobileTabType;
  onTabChange: (tab: MobileTabType) => void;
  savedCount?: number;
  isNative?: boolean;
}

export default function MobileBottomNav({
  activeMobileTab,
  onTabChange,
  savedCount = 0,
  isNative = false
}: MobileBottomNavProps) {
  const { t } = useTranslation();

  const tabs: {
    id: MobileTabType;
    label: string;
    icon: React.ElementType;
    isPrimaryAction?: boolean;
    badge?: number;
  }[] = [
    {
      id: 'tools',
      label: t('mobileNav.homeTools', 'Tools'),
      icon: Grid
    },
    {
      id: 'generator',
      label: t('mobileNav.generator', 'Generator'),
      icon: Zap
    },
    {
      id: 'saved',
      label: t('mobileNav.saved', 'Saved'),
      icon: FolderHeart,
      badge: savedCount > 0 ? savedCount : undefined
    },
    {
      id: 'scanner',
      label: t('mobileNav.scanner', 'Scanner'),
      icon: Scan,
      isPrimaryAction: true
    },
    {
      id: 'settings',
      label: t('mobileNav.settings', 'Settings'),
      icon: Settings
    }
  ];

  return (
    <nav
      id="mobile-bottom-nav"
      dir="ltr"
      aria-label="Mobile Navigation Bar"
      className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/80 shadow-2xl px-2 py-1.5 pb-safe"
      style={{
        paddingBottom: 'calc(env(safe-area-inset-bottom, 8px) + 4px)'
      }}
    >
      <div className="max-w-md mx-auto flex items-center justify-around relative">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeMobileTab === tab.id;

          if (tab.isPrimaryAction) {
            return (
              <div key={tab.id} className="relative -top-3 px-1">
                <button
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  aria-label={tab.label}
                  className={`relative flex items-center justify-center w-12 h-12 rounded-2xl shadow-lg transition-all duration-200 cursor-pointer active:scale-95 ${
                    isActive
                      ? 'bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white ring-4 ring-indigo-500/30 shadow-indigo-500/40'
                      : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-950/60'
                  }`}
                >
                  <Icon className="w-6 h-6 animate-pulse" />
                  <span className="sr-only">{tab.label}</span>
                </button>
                <span className="block text-[9px] font-extrabold text-center text-indigo-300 mt-1 uppercase tracking-wider font-mono">
                  {tab.label}
                </span>
              </div>
            );
          }

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 relative cursor-pointer active:scale-95 ${
                isActive
                  ? 'text-indigo-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabGlow"
                  className="absolute inset-0 bg-indigo-500/10 rounded-xl border border-indigo-500/20"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 text-indigo-400' : ''}`} />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-indigo-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center border border-slate-900 shadow-3xs">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>

              <span className={`text-[10px] mt-1 tracking-tight transition-colors ${isActive ? 'text-indigo-300 font-black' : 'text-slate-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
