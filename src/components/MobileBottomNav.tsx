import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { 
  Grid, 
  Zap, 
  FolderHeart, 
  Scan, 
  Settings,
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
  const shouldReduceMotion = useReducedMotion();

  const tabs: {
    id: MobileTabType;
    label: string;
    icon: React.ElementType;
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
      id: 'scanner',
      label: t('mobileNav.scanner', 'Scanner'),
      icon: Scan
    },
    {
      id: 'saved',
      label: t('mobileNav.saved', 'Saved'),
      icon: FolderHeart,
      badge: savedCount > 0 ? savedCount : undefined
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
      aria-label="Mobile Navigation Dock"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-md px-2 pt-1.5 select-none"
      style={{
        paddingBottom: 'calc(env(safe-area-inset-bottom, 8px) + 4px)'
      }}
    >
      <div className="max-w-md mx-auto flex items-center justify-around gap-1 relative">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeMobileTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              id={`nav-item-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex-1 min-w-0 min-h-[48px] py-1 px-1 rounded-xl flex flex-col items-center justify-center transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isActive
                  ? 'text-blue-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {/* Restrained Active Background Indicator */}
              {isActive && (
                <motion.div
                  layoutId="mobileBottomNavIndicator"
                  className="absolute inset-0 bg-blue-50/80 border border-blue-100 rounded-xl"
                  transition={
                    shouldReduceMotion
                      ? { duration: 0.01 }
                      : { type: 'tween', ease: [0.4, 0, 0.2, 1], duration: 0.18 }
                  }
                />
              )}

              {/* Icon Container with Badge */}
              <div className="relative z-10 flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    isActive ? 'text-blue-600' : 'text-slate-500'
                  }`}
                />

                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -end-2 bg-blue-600 text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] px-1 flex items-center justify-center shadow-2xs">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>

              {/* Label: Clear 11px font size, no wrapping */}
              <span
                className={`relative z-10 text-[11px] mt-1 tracking-tight truncate max-w-full leading-none transition-colors ${
                  isActive
                    ? 'text-blue-700 font-semibold'
                    : 'text-slate-500 font-medium'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
